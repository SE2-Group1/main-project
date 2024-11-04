import { Connection } from '../components/connection';
import db from '../db/db';
import {
  ConflictingLinkTypeError,
  DuplicateLinkError,
} from '../errors/linkError';

class LinkDAO {
  // Function to check for existing links
  private async checkExistingLink(
    docId: number,
    connectionId: number,
  ): Promise<Connection | null> {
    const checkQuery = `
            SELECT link_type FROM link
            WHERE doc1 = ? AND doc2 = ?
        `;

    return new Promise((resolve, reject) => {
      db.query(
        checkQuery,
        [docId, connectionId],
        (err: Error | null, result: any) => {
          if (err) {
            reject(err);
          }
          if (result.length > 0) {
            resolve(
              new Connection(result.rows[0].doc2, result.rows[0].link_type),
            ); //should be LinkTypeResult
          } else {
            resolve(null);
          }
        },
      );
    });
  }

  // Function to insert a new link
  private async insertLink(
    docId: number,
    connection: Connection,
  ): Promise<void> {
    const insertQuery = `
            INSERT INTO link (doc1, doc2, link_type)
            VALUES (?, ?, ?)
        `;

    return new Promise<void>((resolve, reject) => {
      db.query(
        insertQuery,
        [docId, connection.id, connection.linkType],
        function (err: Error | null) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        },
      );
    });
  }

  // function to insert array of links
  async insertLinks(docId: number, connections: Connection[]): Promise<void> {
    try {
      await db.query('BEGIN');

      for (const connection of connections) {
        const existingLink = await this.checkExistingLink(docId, connection.id);

        if (existingLink) {
          if (existingLink.linkType === connection.linkType) {
            throw new DuplicateLinkError(
              `Duplicate link between ${docId} and ${connection.id} with link type "${connection.linkType}".`,
            );
          } else {
            throw new ConflictingLinkTypeError(
              `Conflict: link between ${docId} and ${connection.id} exists with type "${existingLink.linkType}".`,
              existingLink.linkType,
            );
          }
        }

        await this.insertLink(docId, connection);
      }

      await db.query('COMMIT');
    } catch (error) {
      await db.query('ROLLBACK');
      console.error('Error inserting links:', error);
      throw error;
    }
  }
}

export default LinkDAO;
