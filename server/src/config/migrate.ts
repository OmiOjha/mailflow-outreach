import pool from './database';

const migrations = [
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS mailboxes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    smtp_host VARCHAR(255) NOT NULL,
    smtp_port INT NOT NULL DEFAULT 587,
    smtp_user VARCHAR(255) NOT NULL,
    smtp_pass VARCHAR(255) NOT NULL,
    daily_limit INT NOT NULL DEFAULT 200,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_mailboxes_user (user_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    mailbox_id INT,
    status ENUM('draft', 'active', 'paused', 'completed') DEFAULT 'draft',
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (mailbox_id) REFERENCES mailboxes(id) ON DELETE SET NULL,
    INDEX idx_campaigns_user (user_id),
    INDEX idx_campaigns_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS campaign_steps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id INT NOT NULL,
    step_order INT NOT NULL,
    subject VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    delay_days INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    UNIQUE KEY uniq_campaign_step (campaign_id, step_order)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company VARCHAR(200),
    custom_fields JSON,
    status ENUM('pending', 'active', 'completed', 'bounced', 'unsubscribed') DEFAULT 'pending',
    current_step INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    UNIQUE KEY uniq_campaign_lead (campaign_id, email),
    INDEX idx_leads_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS email_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lead_id INT NOT NULL,
    campaign_id INT NOT NULL,
    step_id INT NOT NULL,
    mailbox_id INT,
    tracking_id VARCHAR(36) NOT NULL UNIQUE,
    status ENUM('queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed') DEFAULT 'queued',
    opened_at TIMESTAMP NULL,
    clicked_at TIMESTAMP NULL,
    sent_at TIMESTAMP NULL,
    error_message TEXT,
    retry_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (step_id) REFERENCES campaign_steps(id) ON DELETE CASCADE,
    INDEX idx_email_logs_tracking (tracking_id),
    INDEX idx_email_logs_campaign (campaign_id),
    INDEX idx_email_logs_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS click_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email_log_id INT NOT NULL,
    tracking_id VARCHAR(36) NOT NULL UNIQUE,
    original_url TEXT NOT NULL,
    click_count INT DEFAULT 0,
    last_clicked_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (email_log_id) REFERENCES email_logs(id) ON DELETE CASCADE,
    INDEX idx_click_links_tracking (tracking_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
];

async function migrate() {
  console.log('Running migrations...\n');

  for (const sql of migrations) {
    // pull table name from the CREATE TABLE statement
    const match = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/);
    const tableName = match ? match[1] : 'unknown';

    try {
      await pool.execute(sql);
      console.log(`  ✓ ${tableName}`);
    } catch (err) {
      console.error(`  ✗ ${tableName}:`, (err as Error).message);
      process.exit(1);
    }
  }

  console.log('\nMigrations complete.');
  process.exit(0);
}

migrate();
