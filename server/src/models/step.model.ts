import pool from '../config/database';
import { CampaignStep, CreateStepBody, UpdateStepBody } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const StepModel = {
  async findByCampaign(campaignId: number): Promise<CampaignStep[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM campaign_steps WHERE campaign_id = ? ORDER BY step_order ASC',
      [campaignId]
    );
    return rows as CampaignStep[];
  },

  async findById(id: number): Promise<CampaignStep | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM campaign_steps WHERE id = ?',
      [id]
    );
    return (rows[0] as CampaignStep) || null;
  },

  async create(campaignId: number, data: CreateStepBody): Promise<number> {
    // figure out the next step order
    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT COALESCE(MAX(step_order), 0) as max_order FROM campaign_steps WHERE campaign_id = ?',
      [campaignId]
    );
    const nextOrder = (existing[0] as any).max_order + 1;

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO campaign_steps (campaign_id, step_order, subject, body, delay_days) 
       VALUES (?, ?, ?, ?, ?)`,
      [campaignId, nextOrder, data.subject, data.body, data.delayDays]
    );
    return result.insertId;
  },

  async update(id: number, data: UpdateStepBody): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.subject !== undefined) {
      fields.push('subject = ?');
      values.push(data.subject);
    }
    if (data.body !== undefined) {
      fields.push('body = ?');
      values.push(data.body);
    }
    if (data.delayDays !== undefined) {
      fields.push('delay_days = ?');
      values.push(data.delayDays);
    }

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE campaign_steps SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM campaign_steps WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  },
};
