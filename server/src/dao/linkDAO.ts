import { Connection } from '../components/connection';
import db from '../db/db';
import {
  ConflictingLinkTypeError,
  DuplicateLinkError,
} from '../errors/linkError';

// Define the structure of the link type result
interface LinkTypeResult {
  link_type: string;
}

class LinkDAO {
  // Function to check for existing links
  private async checkExistingLink(
    docId: number,
    connectionId: number,
  ): Promise<LinkTypeResult | null> {
    const checkQuery = `
            SELECT link_type FROM public.link
            WHERE doc1 = ? AND doc2 = ?
        `;

    return new Promise((resolve, reject) => {
      db.get(
        checkQuery,
        [docId, connectionId],
        (err: Error | null, row: LinkTypeResult | undefined) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
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
            INSERT INTO public.link (doc1, doc2, link_type)
            VALUES (?, ?, ?)
        `;

    return new Promise<void>((resolve, reject) => {
      db.run(
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
      await db.run('BEGIN');

      for (const connection of connections) {
        const existingLink = await this.checkExistingLink(docId, connection.id);

        if (existingLink) {
          if (existingLink.link_type === connection.linkType) {
            throw new DuplicateLinkError(
              `Duplicate link between ${docId} and ${connection.id} with link type "${connection.linkType}".`,
            );
          } else {
            throw new ConflictingLinkTypeError(
              `Conflict: link between ${docId} and ${connection.id} exists with type "${existingLink.link_type}".`,
              existingLink.link_type,
            );
          }
        }

        await this.insertLink(docId, connection);
      }

      await db.run('COMMIT');
    } catch (error) {
      await db.run('ROLLBACK');
      console.error('Error inserting links:', error);
      throw error;
    }
  }
}

export default LinkDAO;
