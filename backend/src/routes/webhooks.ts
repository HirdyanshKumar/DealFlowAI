import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { getPool } from '../db';
import { sendDiscordBookingAlert } from '../utils/notifications';

const router = Router();

// Webhook signature verification helper
function verifyCalSignature(req: Request): boolean {
  const secret = process.env.CALCOM_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('⚠️ CALCOM_WEBHOOK_SECRET is not configured. Webhook signature check skipped.');
    return true; // Bypass signature check if not configured in dev
  }

  const signature = req.headers['x-cal-signature-256'] as string;
  const rawBody = (req as any).rawBody;

  if (!signature || !rawBody) {
    console.warn('⚠️ Webhook missing x-cal-signature-256 header or rawBody.');
    return false;
  }

  try {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(rawBody);
    const digest = hmac.digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(digest, 'hex')
    );
  } catch (err) {
    console.error('❌ Signature verification failed:', err);
    return false;
  }
}

// POST /webhooks/cal
router.post('/cal', async (req: Request, res: Response): Promise<void> => {
  console.log('📬 Received webhook from Cal.com');

  if (!verifyCalSignature(req)) {
    res.status(401).json({ error: 'Invalid signature verification.' });
    return;
  }

  const body = req.body;
  const triggerEvent = body.triggerEvent;

  console.log(`📬 Cal.com Trigger Event: ${triggerEvent}`);

  if (triggerEvent !== 'BOOKING_CREATED') {
    res.status(200).json({ message: 'Event ignored.' });
    return;
  }

  const payload = body.payload;
  if (!payload) {
    res.status(400).json({ error: 'Missing payload object.' });
    return;
  }

  // Extract leadId from metadata or query parameters
  const leadId = payload.metadata?.leadId || payload.metadata?.lead_id || payload.responses?.leadId?.value;
  if (!leadId) {
    console.warn('⚠️ Cal.com booking webhook payload lacks leadId metadata. Skipping lead update.');
    res.status(200).json({ message: 'Booking created, but no matching leadId found.' });
    return;
  }

  // Extract meeting link and time
  const meetingLink = payload.videoCallData?.url || payload.location || '';
  const startTime = payload.startTime;
  const meetingScheduledAt = startTime ? new Date(startTime) : new Date();

  console.log(`📅 Match found. Lead ID: ${leadId}, Meeting Link: ${meetingLink}, Scheduled Time: ${meetingScheduledAt}`);

  const pool = getPool();
  try {
    // 1. Update lead columns in database
    const { rows } = await pool.query(
      `UPDATE leads 
       SET meeting_scheduled_at = $1,
           meeting_link = $2,
           meeting_status = 'scheduled',
           updated_at = now()
       WHERE id = $3
       RETURNING name`,
      [meetingScheduledAt, meetingLink, leadId]
    );

    if (rows.length === 0) {
      console.warn(`⚠️ Lead ID ${leadId} not found in database.`);
      res.status(404).json({ error: 'Lead not found in database.' });
      return;
    }

    const leadName = rows[0].name || 'Applicant';

    // 2. Post Discord alert
    await sendDiscordBookingAlert(
      leadName,
      meetingLink,
      meetingScheduledAt.toLocaleString(),
      leadId
    );

    res.json({ ok: true, message: 'Lead updated and Discord alert posted successfully.' });
  } catch (err: any) {
    console.error('❌ Failed to process Cal.com booking:', err.stack || err);
    res.status(500).json({ error: 'Internal server error processing booking.' });
  }
});

export default router;
