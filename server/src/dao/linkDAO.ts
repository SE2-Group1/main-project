import { Connection } from '../components/connection';
import db from '../db/db';
import {
  ConflictingLinkTypeError,
  DuplicateLinkError,
} from '../errors/linkError';

interface LinkResult {
  link_type: string; // Define the structure of your link result
}

class LinkDAO {
  async insertLinks(docId: number, connections: Connection[]): Promise<void> {
    const checkQuery = `
            SELECT link_type FROM public.link
            WHERE doc1 = $1 AND doc2 = $2
        `;

    const insertQuery = `
            INSERT INTO public.link (doc1, doc2, link_type)
            VALUES ($1, $2, $3)
        `;

    try {
      await db.run('BEGIN');

      for (const connection of connections) {
        const result: LinkResult | null = await db.get(checkQuery, [
          docId,
          connection.id,
        ]);

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

      await db.run('COMMIT');
    } catch (error) {
      await db.run('ROLLBACK');
      console.error('Error inserting links:', error);
      throw error;
    }
  }
}

export default LinkDAO;
