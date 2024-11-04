// LinkDAO.ts
import { Connection } from '../components/connection';
import db from '../db/db';
import {
  ConflictingLinkTypeError,
  DuplicateLinkError,
} from '../errors/linkError';

class LinkDAO {
  async insertLinks(docId: number, connections: Connection[]): Promise<void> {
    const checkQuery = `
            SELECT link_type FROM Link
            WHERE doc1 = ? AND doc2 = ?
        `;

    const insertQuery = `
            INSERT INTO Link (doc1, doc2, link_type)
            VALUES (?, ?, ?)
        `;

    try {
      await db.run('BEGIN'); // Start transaction

      for (const connection of connections) {
        const result = await db.get(checkQuery, [docId, connection.id]);

        if (result) {
          if (result.link_type === connection.linkType) {
            throw new DuplicateLinkError(
              `Duplicate link between ${docId} and ${connection.id} with link type "${connection.linkType}".`,
            );
          } else {
            throw new ConflictingLinkTypeError(
              `Conflict: link between ${docId} and ${connection.id} exists with type "${result.link_type}".`,
              result.link_type,
            );
          }
        }

        await db.run(insertQuery, [docId, connection.id, connection.linkType]);
      }

      await db.run('COMMIT'); // Commit transaction if no errors
    } catch (error) {
      await db.run('ROLLBACK'); // Rollback on error
      console.error('Error inserting links:', error);
      throw error;
    }
  }
}

export default LinkDAO;
