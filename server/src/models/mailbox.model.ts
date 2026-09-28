import pool from '../config/database';
import { Mailbox, CreateMailboxBody } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const MailboxModel = {
  async findAllByUser(userId: number): Promise<Mailbox[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, user_id, email, smtp_host, smtp_port, daily_limit, is_active, created_at FROM mailboxes WHERE user_id = ?',
      [userId]
    );
    return rows as Mailbox[];
  },

  async findById(id: number, userId: number): Promise<Mailbox | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM mailboxes WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return (rows[0] as Mailbox) || null;
  },

  async create(userId: number, data: CreateMailboxBody): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO mailboxes (user_id, email, smtp_host, smtp_port, smtp_user, smtp_pass, daily_limit)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, data.email, data.smtpHost, data.smtpPort, data.smtpUser, data.smtpPass, data.dailyLimit || 200]
    );
    return result.insertId;
  },

  async delete(id: number, userId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM mailboxes WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  },

  async toggleActive(id: number, userId: number, isActive: boolean): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE mailboxes SET is_active = ? WHERE id = ? AND user_id = ?',
      [isActive, id, userId]
    );
    return result.affectedRows > 0;
  },
};
