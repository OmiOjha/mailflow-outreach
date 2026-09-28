import pool from '../config/database';
import { Lead } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const LeadModel = {
  async findByCampaign(campaignId: number, page = 1, limit = 50): Promise<{ leads: Lead[]; total: number }> {
    const offset = (page - 1) * limit;

    const [countResult] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM leads WHERE campaign_id = ?',
      [campaignId]
    );
    const total = (countResult[0] as any).total;

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM leads WHERE campaign_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [campaignId, limit, offset]
    );

    return { leads: rows as Lead[], total };
  },

  async findById(id: number): Promise<Lead | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM leads WHERE id = ?',
      [id]
    );
    return (rows[0] as Lead) || null;
  },

  async bulkInsert(campaignId: number, leads: Partial<Lead>[]): Promise<{ inserted: number; duplicates: number }> {
    let inserted = 0;
    let duplicates = 0;

    for (const lead of leads) {
      try {
        await pool.execute<ResultSetHeader>(
          `INSERT INTO leads (campaign_id, email, first_name, last_name, company, custom_fields)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            campaignId,
            lead.email,
            lead.first_name || null,
            lead.last_name || null,
            lead.company || null,
            lead.custom_fields ? JSON.stringify(lead.custom_fields) : null,
          ]
        );
        inserted++;
      } catch (err: any) {
        // duplicate entry = ER_DUP_ENTRY
        if (err.code === 'ER_DUP_ENTRY') {
          duplicates++;
        } else {
          throw err;
        }
      }
    }

    return { inserted, duplicates };
  },

  async updateStatus(id: number, status: Lead['status']): Promise<void> {
    await pool.execute('UPDATE leads SET status = ? WHERE id = ?', [status, id]);
  },

  async incrementStep(id: number): Promise<void> {
    await pool.execute(
      'UPDATE leads SET current_step = current_step + 1 WHERE id = ?',
      [id]
    );
  },

  async findPendingForCampaign(campaignId: number): Promise<Lead[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM leads 
       WHERE campaign_id = ? AND status IN ('pending', 'active')
       ORDER BY id ASC`,
      [campaignId]
    );
    return rows as Lead[];
  },
};
