import { Link } from '../components/link';
import { LinkClient } from '../components/link';
import db from '../db/db';

class LinkDAO {
  /**
   * Get all the links for a document.
   * @param docId - The id of the document.
   * @returns A Promise that resolves with an array of links.
   * @throws Error if the query fails.
   */
  getLinks(docId: number): Promise<Link[]> {
    const sql = `SELECT doc1, doc2, link_type FROM link WHERE doc1 = $1 OR doc2 = $1`;
    return new Promise<Link[]>((resolve, reject) => {
      db.query(sql, [docId], (err: Error | null, result: any) => {
        if (err) {
          reject(err);
          return;
        }
        const links: Link[] = [];
        result.rows.forEach((row: any) => {
          const doc1 = row.doc1;
          const doc2 = row.doc2;
          const link_type = row.link_type;
          const doc = doc1 === docId ? doc2 : doc1;
          links.push(new Link(doc, link_type));
        });
        resolve(links);
      });
    });
  }

  /**
   * Route to create a new link between documents
   * It requires the user to be an admin or an urban planner.
   * It expects the following parameters:
   * list with the ids of the documents to link.
   * It returns a 200 status code if the link has been created.
   */
  addLink(doc1: number, doc2: number, link_type: string): Promise<boolean> {
    const sql = ` INSERT INTO link (doc1, doc2, link_type) VALUES ($1, $2, $3)`;
    return new Promise<boolean>((resolve, reject) => {
      db.query(sql, [doc1, doc2, link_type], (err: Error | null) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(true);
      });
    });
  }

  removeLink(doc1: number, doc2: number, link_type: string): Promise<boolean> {
    const sql = ` DELETE FROM link WHERE (doc1 = $1 AND doc2 = $2 OR doc1 = $2 AND doc2 = $1) AND link_type = $3`;
    return new Promise<boolean>((resolve, reject) => {
      db.query(sql, [doc1, doc2, link_type], (err: Error | null) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(true);
      });
    });
  }

  async insertLinks(
    doc1: number,
    doc2: number,
    links: LinkClient[],
  ): Promise<void> {
    try {
      await db.query('BEGIN');
      for (const link of links) {
        const isLinkExisting = await this.checkLink(doc1, doc2, link.type);
        if (link.isValid && !isLinkExisting) {
          // add link
          await this.addLink(doc1, doc2, link.type);
        } else if (!link.isValid && isLinkExisting) {
          // remove link
          await this.removeLink(doc1, doc2, link.type);
        }
      }
      await db.query('COMMIT');
    } catch (error) {
      await db.query('ROLLBACK');
      console.error('Error inserting links:', error);
      throw error;
    }
  }

  /**
   * Check if the link exists.
   * @param doc1 - The id of the first document.
   * @param doc2 - The id of the second document.
   * @param link_type - The type of the link.
   * @returns A Promise that resolves if the link exists.
   * @throws Error if the link does not exist.
   */
  checkLink(doc1: number, doc2: number, link_type: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        const sql =
          'SELECT doc1, doc2, link_type FROM link WHERE (doc1 = $1 AND doc2 = $2 OR doc1 = $2 AND doc1 = $1) AND link_type = $3';
        db.query(
          sql,
          [doc1, doc2, link_type],
          (err: Error | null, result: any) => {
            if (err) {
              reject(err);
              return;
            }
            if (result.rows.length === 0) {
              resolve(false);
              return;
            }
            resolve(true);
          },
        );
      } catch (error) {
        reject(error);
      }
    });
  }
}

export default LinkDAO;
