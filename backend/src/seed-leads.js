require('dotenv').config();
const { Pool } = require('pg');

async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set in .env!");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("🧹 Cleaning up leads, responses, and webhooks data...");
    await pool.query("DELETE FROM responses");
    await pool.query("DELETE FROM leads");
    console.log("✅ Cleaned up existing leads & responses.");

    // Fetch questions to map keys to IDs
    const qRes = await pool.query("SELECT id, key, flow_type FROM questions");
    const questionsMap = {};
    qRes.rows.forEach(q => {
      questionsMap[q.key] = q.id;
    });

    console.log("🌱 Inserting rich mock leads to test all filters and states...");

    const leads = [
      {
        id: '30ee3dcd-fd8c-4c17-8540-9f3bff5710b4', // Arjun Mehta (Hot, Scheduled, Contacted)
        flow_type: 'founder',
        name: 'Arjun Mehta',
        email: 'arjun@bioniclabs.ai',
        score: 94,
        bucket: 'hot',
        status: 'contacted',
        score_breakdown: {
          founder_background: 10,
          market_fit: 9,
          mvp_traction: 25,
          team: 18,
          funding_clarity: 14,
          problem_validation: 18
        },
        ai_summary: 'Deeptech founder raising $1.5M for building robotic exoskeleton suits. Strong technical team from IIT, live beta with 20 rehabilitation clinics, and solid IP protection. Weakest category is business model pricing strategy.',
        ai_tags: ['Deeptech', 'Robotics', 'Seed'],
        ai_flags: [],
        email_sent: true,
        alert_sent: true,
        meeting_status: 'scheduled',
        meeting_link: 'https://meet.google.com/xyz-1234-abc',
        meeting_scheduled_at: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(), // 5 days from now
        communication_logs: [
          { template: 'hot', timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), message: 'Sent hot template email with booking link' },
          { template: 'booking', timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString(), message: 'Meeting confirmed via Cal.com webhook' }
        ],
        answers: {
          founder_name: 'Arjun Mehta',
          founder_linkedin: 'linkedin.com/in/arjunmehta',
          founder_email: 'arjun@bioniclabs.ai',
          founder_phone: '+91-9988776655',
          founder_role: 'Technical',
          years_experience: '5+',
          problem_description: 'Stroke survivors and paraplegics lack affordable, lightweight, and adaptive walking assistance devices. Traditional clinics use heavy, $100K+ robotic machines.',
          target_customer: 'Rehabilitation clinics and private physical therapy practices looking to offer gait training at lower costs, plus home-use patients.',
          mvp_status: 'Live',
          sector: 'Healthtech',
          user_count: '100-1000',
          monthly_revenue: '$1-$10K',
          team_size: '5+',
          team_background: 'Technical',
          funding_ask_amount: 1500000,
          funding_use: 'Focusing on scaling medical certification, clinical trial validation, and expanding production capacity.',
          validation_evidence: '20 rehabilitation clinics have signed commercial pre-orders. 5 patients currently testing home prototype with 100% safety record.',
          why_now: 'Looking for VC partners who can introduce us to global distributors.'
        }
      },
      {
        id: '20be3dcd-fd8c-4c17-8540-9f3bff5710b4', // Sarah Jenkins (Hot, New)
        flow_type: 'founder',
        name: 'Sarah Jenkins',
        email: 'sarah@carbonledger.io',
        score: 88,
        bucket: 'hot',
        status: 'new',
        score_breakdown: {
          founder_background: 9,
          market_fit: 8,
          mvp_traction: 22,
          team: 17,
          funding_clarity: 13,
          problem_validation: 19
        },
        ai_summary: 'Fintech founder raising $500K for carbon accounting API. Experienced business lead, working prototype, signed LOIs with 5 enterprise clients. Strong validation evidence but pre-revenue.',
        ai_tags: ['Climatech', 'Fintech', 'Pre-seed'],
        ai_flags: [],
        email_sent: false,
        alert_sent: true,
        meeting_status: null,
        meeting_link: null,
        meeting_scheduled_at: null,
        communication_logs: [],
        answers: {
          founder_name: 'Sarah Jenkins',
          founder_linkedin: 'linkedin.com/in/sarahjenkins',
          founder_email: 'sarah@carbonledger.io',
          founder_phone: '+1-415-555-0199',
          founder_role: 'Business',
          years_experience: '3-5',
          problem_description: 'SMBs need a simple way to track Scope 3 emissions automatically from their accounting software without hiring expensive sustainability consultants.',
          target_customer: 'Mid-sized logistics and manufacturing companies who need to report carbon impact to their enterprise buyers.',
          mvp_status: 'Beta',
          sector: 'SaaS',
          user_count: '10-100',
          monthly_revenue: 'Pre-revenue',
          team_size: '3-4',
          team_background: 'Mixed',
          funding_ask_amount: 500000,
          funding_use: 'Expanding engineering capacity to integrate with QuickBooks and Xero, and running our first paid marketing campaigns.',
          validation_evidence: '5 signed LOIs from enterprise logistics providers ready to launch pilot once API integration is live.',
          why_now: 'Part of the YC startup school directory.'
        }
      },
      {
        id: '15be3dcd-fd8c-4c17-8540-9f3bff5710b4', // David Chen (Good, In Review)
        flow_type: 'founder',
        name: 'David Chen',
        email: 'david@fooddrop.delivery',
        score: 74,
        bucket: 'good',
        status: 'in_review',
        score_breakdown: {
          founder_background: 7,
          market_fit: 7,
          mvp_traction: 18,
          team: 15,
          funding_clarity: 12,
          problem_validation: 15
        },
        ai_summary: 'B2B SaaS founder raising $250K for food delivery orchestration platform. Mixed background team, live product with $8K MRR, growing 15% MoM. Solid traction but high competition risk.',
        ai_tags: ['SaaS', 'Logistics', 'Seed'],
        ai_flags: ['High competition in logistics sector'],
        email_sent: true,
        alert_sent: false,
        meeting_status: null,
        meeting_link: null,
        meeting_scheduled_at: null,
        communication_logs: [
          { template: 'good', timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), message: 'Sent good template email notifying active review' }
        ],
        answers: {
          founder_name: 'David Chen',
          founder_linkedin: 'linkedin.com/in/davidchen',
          founder_email: 'david@fooddrop.delivery',
          founder_phone: '+65-9876-5432',
          founder_role: 'Mixed',
          years_experience: '1-2',
          problem_description: 'Independent dark kitchens spend too much time managing 4 different food delivery delivery apps and aggregators. They lose orders due to manual tablet errors.',
          target_customer: 'Cloud kitchens, restaurant franchises, and local grocers handling local deliveries.',
          mvp_status: 'Live',
          sector: 'SaaS',
          user_count: '100-1000',
          monthly_revenue: '$1-$10K',
          team_size: '3-4',
          team_background: 'Mixed',
          funding_ask_amount: 250000,
          funding_use: 'Developing standard API endpoints and onboarding 50 additional cloud kitchens in Singapore.',
          validation_evidence: 'Currently processing 15,000 orders monthly across 40 cloud kitchens. Live product generating $8,200 MRR.',
          why_now: 'Profitable on a per-order basis.'
        }
      },
      {
        id: '12be3dcd-fd8c-4c17-8540-9f3bff5710b4', // Elena Rostova (Maybe, New)
        flow_type: 'founder',
        name: 'Elena Rostova',
        email: 'elena@mediscan.ru',
        score: 52,
        bucket: 'maybe',
        status: 'new',
        score_breakdown: {
          founder_background: 8,
          market_fit: 6,
          mvp_traction: 10,
          team: 10,
          funding_clarity: 10,
          problem_validation: 8
        },
        ai_summary: 'Healthtech founder raising $100K for AI radiology imaging diagnostics. Domain expert founder but sole founder, prototype stage, 0 users. Strong technology focus but weak commercial validation.',
        ai_tags: ['Healthtech', 'AI', 'Pre-seed'],
        ai_flags: ['Sole founder risk', 'No validation evidence'],
        email_sent: false,
        alert_sent: false,
        meeting_status: null,
        meeting_link: null,
        meeting_scheduled_at: null,
        communication_logs: [],
        answers: {
          founder_name: 'Elena Rostova',
          founder_linkedin: 'linkedin.com/in/elenarostova',
          founder_email: 'elena@mediscan.ru',
          founder_phone: '+7-911-222-3344',
          founder_role: 'Technical',
          years_experience: '3-5',
          problem_description: 'Radiologists are overworked, leading to a 3% error rate in lung scan interpretations. AI diagnostic tools can cut processing time by 60%.',
          target_customer: 'Public and private hospitals, diagnostic centers, and telehealth companies.',
          mvp_status: 'Prototype',
          sector: 'Healthtech',
          user_count: '0',
          monthly_revenue: 'Pre-revenue',
          team_size: 'Just me',
          team_background: 'Domain expert',
          funding_ask_amount: 100000,
          funding_use: 'Hiring a full-stack engineer, getting initial medical compliance clearance, and starting clinical database training.',
          validation_evidence: 'Trained model on 5,000 public datasets. No clinical trials or hospital partners signed yet.',
          why_now: 'PhD in Medical Imaging Diagnostics.'
        }
      },
      {
        id: '10be3dcd-fd8c-4c17-8540-9f3bff5710b4', // Ramesh Kumar (Low, Closed)
        flow_type: 'founder',
        name: 'Ramesh Kumar',
        email: 'ramesh@kiranaonline.co',
        score: 32,
        bucket: 'low',
        status: 'closed',
        score_breakdown: {
          founder_background: 5,
          market_fit: 4,
          mvp_traction: 5,
          team: 5,
          funding_clarity: 8,
          problem_validation: 5
        },
        ai_summary: 'E-commerce founder raising $50K for neighborhood grocery delivery app. Business background, idea stage, no team, no prototype. High execution risk and low market differentiation.',
        ai_tags: ['E-commerce', 'Local', 'Pre-seed'],
        ai_flags: ['No team', 'No MVP', 'Highly commoditized market'],
        email_sent: true,
        alert_sent: false,
        meeting_status: null,
        meeting_link: null,
        meeting_scheduled_at: null,
        communication_logs: [
          { template: 'low', timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), message: 'Sent low template rejection email' }
        ],
        answers: {
          founder_name: 'Ramesh Kumar',
          founder_linkedin: 'linkedin.com/in/rameshkumar',
          founder_email: 'ramesh@kiranaonline.co',
          founder_phone: '+91-9000011111',
          founder_role: 'Business',
          years_experience: '1-2',
          problem_description: 'Kirana stores do not have an app to reach local consumers directly, resulting in loss of market share to big conglomerates.',
          target_customer: 'Local kirana store owners and residents in Tier-2 Indian cities.',
          mvp_status: 'Idea',
          sector: 'E-commerce',
          user_count: '0',
          monthly_revenue: 'Pre-revenue',
          team_size: 'Just me',
          team_background: 'Business',
          funding_ask_amount: 50000,
          funding_use: 'Developing the initial android app and onboarding kirana shops via offline marketing.',
          validation_evidence: 'Talked to 3 local kirana owners who expressed interest in a delivery app.',
          why_now: 'Looking to hire software developers.'
        }
      },
      {
        id: '35ee3dcd-fd8c-4c17-8540-9f3bff5710b4', // Rebecca Vance (Hot, Investor, In Review)
        flow_type: 'investor',
        name: 'Rebecca Vance',
        email: 'rebecca@vancecap.com',
        score: 91,
        bucket: 'hot',
        status: 'in_review',
        score_breakdown: {
          thesis_alignment: 28,
          stage_fit: 20,
          check_size: 15,
          engagement_model: 18,
          deployment_readiness: 10
        },
        ai_summary: 'Early-stage VC investor searching for Seed & Series A B2B SaaS. Cheque size $500K-$2M, active hands-on post-investment support model, deploying immediately (1-3 months). Alignment with SaaS portfolio.',
        ai_tags: ['VC', 'SaaS', 'Seed'],
        ai_flags: [],
        email_sent: false,
        alert_sent: false,
        meeting_status: null,
        meeting_link: null,
        meeting_scheduled_at: null,
        communication_logs: [],
        answers: {
          investor_name: 'Rebecca Vance',
          investor_linkedin: 'linkedin.com/in/rebeccavance',
          investor_email: 'rebecca@vancecap.com',
          investment_thesis: 'Partnering with early-stage enterprise SaaS founders in the US/Europe who have achieved initial PMF ($500K+ ARR) and want to scale to $10M.',
          investor_sectors: ['SaaS', 'Enterprise', 'Fintech'],
          stage_focus: ['Seed', 'Series A'],
          geographic_focus: 'US and Europe',
          check_size_min: 500000,
          check_size_max: 2000000,
          portfolio_count: '20+',
          notable_portfolio: 'Snyk, Snowflake, PagerDuty',
          support_model: 'Operational support',
          involvement_level: 'Active advisor',
          deployment_timeline: '1-3 months',
          ideal_company: 'Experienced founders, solid product velocity, low churn, and expansion potential within existing customer base.',
          investor_anything_else: 'Willing to lead rounds and take board seats.'
        }
      },
      {
        id: '25be3dcd-fd8c-4c17-8540-9f3bff5710b4', // Mark Marcus (Good, Investor, New)
        flow_type: 'investor',
        name: 'Mark Marcus',
        email: 'mark@marcus-angels.net',
        score: 78,
        bucket: 'good',
        status: 'new',
        score_breakdown: {
          thesis_alignment: 24,
          stage_fit: 18,
          check_size: 12,
          engagement_model: 14,
          deployment_readiness: 10
        },
        ai_summary: 'Angel syndicate lead searching for Pre-seed & Seed deeptech startups. Cheque size $50K-$200K, mentorship & operational support model, deploying in 3-6 months.',
        ai_tags: ['Angel', 'Deeptech', 'Pre-seed'],
        ai_flags: [],
        email_sent: false,
        alert_sent: false,
        meeting_status: null,
        meeting_link: null,
        meeting_scheduled_at: null,
        communication_logs: [],
        answers: {
          investor_name: 'Mark Marcus',
          investor_linkedin: 'linkedin.com/in/markmarcus',
          investor_email: 'mark@marcus-angels.net',
          investment_thesis: 'Helping academic spinouts and deeptech founders with seed capital, initial tech validation, and IP positioning.',
          investor_sectors: ['Deeptech', 'AI', 'Quantum'],
          stage_focus: ['Pre-seed', 'Seed'],
          geographic_focus: 'UK and Europe',
          check_size_min: 50000,
          check_size_max: 200000,
          portfolio_count: '5-10',
          notable_portfolio: 'QuantumFlow, NeuroPlex',
          support_model: 'Mentorship',
          involvement_level: 'Active advisor',
          deployment_timeline: '3-6 months',
          ideal_company: 'Deep intellectual property, technical breakthrough, willing to listen to advice, and coachable founding team.',
          investor_anything_else: 'Invest mostly alongside syndicates.'
        }
      },
      {
        id: '18be3dcd-fd8c-4c17-8540-9f3bff5710b4', // Tanmay Bhat (Maybe, Investor, Contacted)
        flow_type: 'investor',
        name: 'Tanmay Bhat',
        email: 'tanmay@creatorfunds.vc',
        score: 58,
        bucket: 'maybe',
        status: 'contacted',
        score_breakdown: {
          thesis_alignment: 18,
          stage_fit: 16,
          check_size: 10,
          engagement_model: 8,
          deployment_readiness: 6
        },
        ai_summary: 'Micro-VC investor seeking consumer/creator startups. Cheque size $25K-$50K (low range), capital-only support model, opportunistic deployment timeline.',
        ai_tags: ['Micro-VC', 'Consumer', 'Pre-seed'],
        ai_flags: ['Low average check size for VC program'],
        email_sent: true,
        alert_sent: false,
        meeting_status: null,
        meeting_link: null,
        meeting_scheduled_at: null,
        communication_logs: [
          { template: 'custom', timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(), message: 'Discussed fund allocation criteria via email' }
        ],
        answers: {
          investor_name: 'Tanmay Bhat',
          investor_linkedin: 'linkedin.com/in/tanmaybhat',
          investor_email: 'tanmay@creatorfunds.vc',
          investment_thesis: 'Investing in young creators, community platforms, and direct-to-consumer software startups.',
          investor_sectors: ['Consumer', 'Creator Economy', 'Social'],
          stage_focus: ['Pre-seed'],
          geographic_focus: 'India and Southeast Asia',
          check_size_min: 25000,
          check_size_max: 50000,
          portfolio_count: '10-20',
          notable_portfolio: 'Loco, Graphy',
          support_model: 'Capital only',
          involvement_level: 'Passive',
          deployment_timeline: 'Opportunistic',
          ideal_company: 'High community growth, viral marketing potential, young ambitious founders.',
          investor_anything_else: 'Can help portfolio companies with influencer marketing strategies.'
        }
      },
      {
        id: '11be3dcd-fd8c-4c17-8540-9f3bff5710b4', // John Smith (Low, Investor, Closed)
        flow_type: 'investor',
        name: 'John Smith',
        email: 'john@john-holding.com',
        score: 35,
        bucket: 'low',
        status: 'closed',
        score_breakdown: {
          thesis_alignment: 10,
          stage_fit: 8,
          check_size: 5,
          engagement_model: 8,
          deployment_readiness: 4
        },
        ai_summary: 'Family office representative searching for growth-stage cash-flowing real estate or traditional businesses. Cheque size $10M+, capital-only model, opportunistic timeline. Unaligned with early-stage venture focus.',
        ai_tags: ['Family Office', 'Real Estate', 'Growth'],
        ai_flags: ['Mismatched investment focus', 'Growth-stage focus only'],
        email_sent: true,
        alert_sent: false,
        meeting_status: null,
        meeting_link: null,
        meeting_scheduled_at: null,
        communication_logs: [
          { template: 'low', timestamp: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(), message: 'Sent polite decline notice email' }
        ],
        answers: {
          investor_name: 'John Smith',
          investor_linkedin: 'linkedin.com/in/johnsmith',
          investor_email: 'john@john-holding.com',
          investment_thesis: 'Preserving capital by investing in commercial real estate portfolios, warehousing, and traditional cash-generating small businesses.',
          investor_sectors: ['Real Estate', 'Manufacturing', 'Logistics'],
          stage_focus: ['Growth', 'Buyout'],
          geographic_focus: 'Global',
          check_size_min: 5000000,
          check_size_max: 20000000,
          portfolio_count: '20+',
          notable_portfolio: 'Downtown Office Tower, Logistics Center',
          support_model: 'Capital only',
          involvement_level: 'Passive',
          deployment_timeline: 'Opportunistic',
          ideal_company: 'Proven cashflow, solid real estate backing, $2M+ EBITDA.',
          investor_anything_else: 'Not looking for high-risk seed tech startups.'
        }
      }
    ];

    for (const lead of leads) {
      console.log(`👤 Inserting Lead: ${lead.name} (${lead.flow_type} - ${lead.bucket})...`);
      
      // 1. Insert Lead row
      await pool.query(`
        INSERT INTO leads (
          id, flow_type, name, email, score, bucket, status, 
          score_breakdown, ai_summary, ai_tags, ai_flags, 
          email_sent, alert_sent, meeting_status, meeting_link, 
          meeting_scheduled_at, communication_logs, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $11, $12, $13, $14, $15, $16, $17::jsonb, now() - interval '1 day', now()
        )
      `, [
        lead.id, lead.flow_type, lead.name, lead.email, lead.score, lead.bucket, lead.status,
        JSON.stringify(lead.score_breakdown), lead.ai_summary, lead.ai_tags, lead.ai_flags,
        lead.email_sent, lead.alert_sent, lead.meeting_status, lead.meeting_link,
        lead.meeting_scheduled_at, JSON.stringify(lead.communication_logs)
      ]);

      // 2. Insert Responses rows
      for (const [key, answer] of Object.entries(lead.answers)) {
        const questionId = questionsMap[key];
        if (!questionId) {
          console.warn(`   ⚠️ Warning: Question key '${key}' not found in database. Skipping response.`);
          continue;
        }

        await pool.query(`
          INSERT INTO responses (lead_id, question_id, question_key, answer, created_at)
          VALUES ($1, $2, $3, $4::jsonb, now() - interval '1 day')
        `, [
          lead.id,
          questionId,
          key,
          JSON.stringify(answer)
        ]);
      }
      console.log(`   ✅ Responses inserted.`);
    }

    console.log("\n🎉 Database cleanup & rich seeding completed successfully!");
  } catch (err) {
    console.error("❌ Seeding failed:", err.stack || err);
  } finally {
    await pool.end();
  }
}

seed();
