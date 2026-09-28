import { Request, Response } from 'express';
import { EmailLogModel } from '../models/emailLog.model';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';
import { getPixelBuffer } from '../utils/tracking';

export const TrackingController = {
  /**
   * Handles open tracking via a 1x1 transparent pixel.
   * Returns a GIF image so email clients load it normally.
   */
  async trackOpen(req: Request, res: Response): Promise<void> {
    try {
      const { trackingId } = req.params;

      // fire-and-forget the DB update — don't slow down the pixel response
      EmailLogModel.markOpened(trackingId).catch((err) => {
        console.error('Failed to record open:', err.message);
      });

      res.set({
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      });
      res.send(getPixelBuffer());
    } catch (err) {
      // still serve the pixel even if something goes wrong
      res.set('Content-Type', 'image/gif');
      res.send(getPixelBuffer());
    }
  },

  /**
   * Handles click tracking by redirecting to the original URL.
   */
  async trackClick(req: Request, res: Response): Promise<void> {
    try {
      const { trackingId } = req.params;

      // look up the original URL
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT original_url, email_log_id FROM click_links WHERE tracking_id = ?',
        [trackingId]
      );

      if (!rows[0]) {
        res.status(404).send('Link not found');
        return;
      }

      const { original_url, email_log_id } = rows[0] as any;

      // update click count and mark email as clicked
      pool.execute(
        'UPDATE click_links SET click_count = click_count + 1, last_clicked_at = NOW() WHERE tracking_id = ?',
        [trackingId]
      ).catch(() => {});

      // also get the email log tracking id to update email status
      const [logRows] = await pool.execute<RowDataPacket[]>(
        'SELECT tracking_id FROM email_logs WHERE id = ?',
        [email_log_id]
      );
      if (logRows[0]) {
        EmailLogModel.markClicked((logRows[0] as any).tracking_id).catch(() => {});
      }

      res.redirect(302, original_url);
    } catch (err) {
      console.error('Click tracking error:', err);
      res.status(500).send('Redirect failed');
    }
  },
};
