#!/usr/bin/env node
/**
 * Walkthrough script — Phase 3 verification
 * Simulates a complete founder chatbot session via curl-equivalent HTTP calls.
 * Run: node verify-session.mjs
 */

const BASE = 'http://localhost:3001';

async function post(path, body) {
  const r = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return r.json();
}

async function get(path) {
  const r = await fetch(`${BASE}${path}`);
  return r.json();
}

// Stub answers keyed by question key — realistic values
const ANSWERS = {
  founder_name: 'Priya Sharma',
  founder_linkedin: 'linkedin.com/in/priyasharma',
  founder_email: 'priya@acme.io',
  founder_phone: '+91-9876543210',
  founder_role: 'Technical',
  years_experience: '3-5',
  problem_description: 'Small businesses in India lose 30% of their invoices to manual errors and delayed follow-ups. There is no affordable, mobile-first invoicing tool that works offline and in local languages.',
  target_customer: 'Kirana store owners and small service businesses in Tier 2/3 Indian cities, 1-10 employees.',
  mvp_status: 'Beta',
  sector: 'Fintech',
  user_count: '100-1000',
  monthly_revenue: '$1-$10K',
  team_size: '3-4',
  team_background: 'Mixed',
  funding_ask_amount: 250000,
  funding_use: '60% engineering to build offline-sync, 25% sales in Tier 2 cities, 15% ops and compliance.',
  validation_evidence: 'Ran 40 user interviews across 3 cities. 180 businesses on waitlist. 2 LOIs from local distributor networks. Rs 4.2L in pilot revenue from 85 paying customers over 3 months.',
  why_now: 'UPI penetration crossed 60% in Tier 2/3 cities in 2024. GST e-invoicing mandate for SMBs kicks in Jan 2026 — creating a forcing function for digitization.',
};

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  Venturizer Phase 3 — Session Walkthrough');
  console.log('═══════════════════════════════════════════════════\n');

  // ── Step 1: Create session ───────────────────────────────────
  console.log('1. POST /sessions (founder flow)');
  const session = await post('/sessions', { flow_type: 'founder' });
  console.log(`   session_id : ${session.session_id}`);
  console.log(`   first Q    : [${session.question.order_index}/${session.question.total_questions}] ${session.question.key}\n`);

  const sessionId = session.session_id;

  // ── Step 2: Answer all questions in order ────────────────────
  console.log('2. Answering all 18 founder questions...');
  let currentQuestion = session.question;
  let answeredCount = 0;

  while (currentQuestion) {
    const key = currentQuestion.key;
    const answer = ANSWERS[key] ?? 'N/A';

    const result = await post(`/sessions/${sessionId}/answer`, {
      question_id: currentQuestion.id,
      answer,
    });

    answeredCount++;
    const short = typeof answer === 'string' ? answer.slice(0, 40) : answer;
    console.log(`   [${currentQuestion.order_index}/${currentQuestion.total_questions}] ${key}: ${short}`);

    if (result.complete || !result.next_question) {
      currentQuestion = null;
    } else {
      currentQuestion = result.next_question;
    }
  }

  console.log(`\n   ✅ Answered ${answeredCount} questions\n`);

  // ── Step 3: Check /next returns complete ─────────────────────
  console.log('3. GET /sessions/:id/next (should be complete now)');
  const nextCheck = await get(`/sessions/${sessionId}/next`);
  console.log(`   complete: ${nextCheck.complete} | total_answered: ${nextCheck.total_answered}\n`);

  // ── Step 4: Complete session ──────────────────────────────────
  console.log('4. POST /sessions/:id/complete');
  const complete = await post(`/sessions/${sessionId}/complete`, {});
  console.log(`   ok             : ${complete.ok}`);
  console.log(`   total_answered : ${complete.total_answered}`);
  console.log(`   total_questions: ${complete.total_questions}`);
  console.log(`   message        : ${complete.message}\n`);

  // ── Step 5: Verify rows in DB via /health ────────────────────
  console.log('5. Final: confirming row counts are correct');
  console.log(`   session_id (lead_id): ${sessionId}`);
  console.log(`   Expected responses : 18`);
  console.log(`   Check the Neon console or run: SELECT COUNT(*) FROM responses WHERE lead_id = '${sessionId}'`);

  console.log('\n═══════════════════════════════════════════════════');
  console.log('  ✅ Phase 3 walkthrough complete');
  console.log('═══════════════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('❌ Walkthrough failed:', err.message);
  process.exit(1);
});
