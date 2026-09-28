import pool from '../config/database';
import { Campaign, CreateCampaignBody, UpdateCampaignBody } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const CampaignModel = {
  async findAllByUser(userId: number): Promise<Campaign[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT c.*, 
        (SELECT COUNT(*) FROM leads WHERE campaign_id = c.id) as lead_count,
        (SELECT COUNT(*) FROM campaign_steps WHERE campaign_id = c.id) as step_count
       FROM campaigns c 
       WHERE c.user_id = ? 
       ORDER BY c.created_at DESC`,
      [userId]
    );
    return rows as Campaign[];
  },

  async findById(id: number, userId: number): Promise<Campaign | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM campaigns WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return (rows[0] as Campaign) || null;
  },

  async create(userId: number, data: CreateCampaignBody): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO campaigns (user_id, name, description, mailbox_id, timezone) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, data.name, data.description || null, data.mailboxId || null, data.timezone || 'UTC']
    );
    return result.insertId;
  },

  async update(id: number, userId: number, data: UpdateCampaignBody): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }
    if (data.mailboxId !== undefined) {
      fields.push('mailbox_id = ?');
      values.push(data.mailboxId);
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }
    if (data.timezone !== undefined) {
      fields.push('timezone = ?');
      values.push(data.timezone);
    }

    if (fields.length === 0) return false;

    values.push(id, userId);
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE campaigns SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );
    return result.affectedRows > 0;
  },

  async delete(id: number, userId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM campaigns WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  },

  async updateStatus(id: number, status: Campaign['status']): Promise<void> {
    await pool.execute(
      'UPDATE campaigns SET status = ? WHERE id = ?',
      [status, id]
    );
  },
};
