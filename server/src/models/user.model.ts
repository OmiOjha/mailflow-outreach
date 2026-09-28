import pool from '../config/database';
import { User } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const UserModel = {
  async findByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return (rows[0] as User) || null;
  },

  async findById(id: number): Promise<User | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return (rows[0] as User) || null;
  },

  async create(email: string, passwordHash: string, name: string): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
      [email, passwordHash, name]
    );
    return result.insertId;
  },
};
