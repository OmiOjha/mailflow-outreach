import bcrypt from 'bcryptjs';
import pool from './database';

async function seed() {
  console.log('Seeding database...\n');

  try {
    // create a demo user
    const hash = await bcrypt.hash('password123', 10);
    const [userResult] = await pool.execute(
      `INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      ['demo@mailflow.io', hash, 'Demo User']
    );
    const userId = (userResult as any).insertId || 1;
    console.log('  ✓ demo user created (demo@mailflow.io / password123)');

    // add a mailbox
    await pool.execute(
      `INSERT INTO mailboxes (user_id, email, smtp_host, smtp_port, smtp_user, smtp_pass, daily_limit)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE email = VALUES(email)`,
      [userId, 'outreach@mailflow.io', 'smtp.gmail.com', 587, 'outreach@mailflow.io', 'app-password', 200]
    );
    console.log('  ✓ demo mailbox added');

    // create a sample campaign
    const [campaignResult] = await pool.execute(
      `INSERT INTO campaigns (user_id, name, description, status) VALUES (?, ?, ?, ?)`,
      [userId, 'Product Launch Outreach', 'Initial outreach for Q1 product launch', 'draft']
    );
    const campaignId = (campaignResult as any).insertId;
    console.log('  ✓ sample campaign created');

    // add campaign steps
    await pool.execute(
      `INSERT INTO campaign_steps (campaign_id, step_order, subject, body, delay_days) VALUES (?, ?, ?, ?, ?)`,
      [campaignId, 1, 'Quick question about {{company}}', 'Hi {{firstName}},\n\nI noticed {{company}} is growing fast...', 0]
    );
    await pool.execute(
      `INSERT INTO campaign_steps (campaign_id, step_order, subject, body, delay_days) VALUES (?, ?, ?, ?, ?)`,
      [campaignId, 2, 'Following up', 'Hi {{firstName}},\n\nJust wanted to follow up on my last email...', 3]
    );
    await pool.execute(
      `INSERT INTO campaign_steps (campaign_id, step_order, subject, body, delay_days) VALUES (?, ?, ?, ?, ?)`,
      [campaignId, 3, 'Last try — {{firstName}}', 'Hi {{firstName}},\n\nI know you\'re busy so I\'ll keep this brief...', 5]
    );
    console.log('  ✓ campaign steps added (3 steps)');

    // add some sample leads
    const leads = [
      ['john@acme.com', 'John', 'Doe', 'Acme Corp'],
      ['sarah@techstart.io', 'Sarah', 'Chen', 'TechStart'],
      ['mike@growthco.com', 'Mike', 'Johnson', 'GrowthCo'],
      ['lisa@innovate.dev', 'Lisa', 'Park', 'Innovate Labs'],
      ['raj@cloudnine.io', 'Raj', 'Patel', 'CloudNine'],
    ];

    for (const [email, firstName, lastName, company] of leads) {
      await pool.execute(
        `INSERT INTO leads (campaign_id, email, first_name, last_name, company) VALUES (?, ?, ?, ?, ?)`,
        [campaignId, email, firstName, lastName, company]
      );
    }
    console.log(`  ✓ ${leads.length} sample leads added`);

    console.log('\nSeeding complete.');
  } catch (err) {
    console.error('Seed error:', (err as Error).message);
  }

  process.exit(0);
}

seed();
