import fs from 'fs';
import path from 'path';

import { Attachment } from '../components/attachment';
import db from '../db/db';

/**
 * A class that implements the interaction with the database for all attachment-related operations.
 */
class AttachmentDAO {
  /**
   * Returns all attachments.
   * @returns A Promise that resolves to an array with all attachments.
   */
  getAllAttachments(): Promise<Attachment[]> {
    return new Promise<Attachment[]>((resolve, reject) => {
      try {
        const sql = 'SELECT * FROM attachments';
        db.query(sql, async (err: Error | null, result: any) => {
          if (err) {
            reject(err);
            return;
          }

          const attachments = result.rows.map((row: any) => {
            return new Attachment(
              row.attachmentid,
              row.attachment_name,
              row.attachment_pages,
              null,
            );
          });
          resolve(attachments);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Returns a specific attachment.
   * @param id - The ID of the attachment to retrieve. The attachment must exist.
   * @returns A Promise that resolves to the attachment with the specified ID.
   * @throws AttachmentNotFoundError if the attachment with the specified ID does not exist.
   */
  getAttachmentById(id: number): Promise<Attachment> {
    return new Promise<Attachment>((resolve, reject) => {
      try {
        const sql = 'SELECT * FROM attachments WHERE attachmentid = $1';
        db.query(sql, [id], async (err: Error | null, result: any) => {
          if (err) {
            reject(err);
            return;
          }
          if (result.rowCount === 0) {
            reject(new Error('Attachment not found'));
            return;
          }
          const row = result.rows[0];
          const attachmentHash = row.attachment_hash;
          const ext = path.extname(row.attachment_name);
          const filePath = path.join('attachments', `${attachmentHash}${ext}`);

          try {
            const fileBuffer = await fs.promises.readFile(filePath);
            resolve(
              new Attachment(
                row.attachmentid,
                row.attachment_name,
                row.attachment_pages,
                fileBuffer,
              ),
            );
          } catch (fileError) {
            reject(fileError);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Returns all the attachments that are linked to a specific document.
   * @param docId - The ID of the document to retrieve the attachments from.
   * @returns A Promise that resolves to an array with all attachments linked to the specified document.
   */
  getAttachmentsByDocId(docId: number): Promise<Attachment[]> {
    return new Promise<Attachment[]>((resolve, reject) => {
      try {
        const sql = 'SELECT * FROM attachments WHERE docId = $1';
        db.query(sql, [docId], async (err: Error | null, result: any) => {
          if (err) {
            reject(err);
            return;
          }
          const attachments = result.rows.map((row: any) => {
            return new Attachment(
              row.attachmentid,
              row.attachment_name,
              row.attachment_pages,
              null,
            );
          });
          resolve(attachments);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Deletes an attachment.
   * @param attachmentId - The ID of the attachment.
   * @param docId - The ID of the document.
   */
  async deleteAttachment(
    attachmentId: number,
    docId: number,
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        const sql =
          'DELETE FROM attachments WHERE attachmentId = $1 and docId = $2';
        db.query(
          sql,
          [attachmentId, docId],
          (err: Error | null, result: any) => {
            if (err) {
              throw err;
            }
            resolve(true);
          },
        );
      } catch (error) {
        reject(new Error(`Unexpected error:${error}`));
      }
    });
  }
}

export default AttachmentDAO;
