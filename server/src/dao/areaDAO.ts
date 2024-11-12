import { QueryResult } from 'pg';
import { Area } from '../components/area';
import db from '../db/db';
  
class AreaDAO {
  /**
  * Returns all areas.
  * @returns A Promise that resolves to an array with all areas.
  */
  getAllAreas(): Promise<Area[]> {
    return new Promise<Area[]>((resolve, reject) => {
      try {
        const sql = 'SELECT * FROM areas';
        db.query(sql, (err: Error | null, result: QueryResult<any>) => {
          if (err) {
            reject(err);
            return;
          }
          const areas = result.rows.map(row => new Area(row.id_area, row.area));
          resolve(areas);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Route to add an Area in the db
   * It requires the user to be an admin or an urban planner.
   * It expects the following parameters:
   * coordinates of the area.
   */
  addArea(coordinates: number[]): Promise<number> {
    let geomText = '';
    const sql = `INSERT INTO areas (area) VALUES (ST_GeomFromText($1, 4326))
    RETURNING id_area`;
    if (coordinates.length < 3) {
      const coordzero: any = coordinates[0];
      const pointString = `${coordzero[1]} ${coordzero[0]}`;
      geomText = `POINT(${pointString})`;
      //(ST_GeomFromText('POINT(12.4924 41.8902)', 4326));
    } else {
      const pointString = coordinates
        .map((coord: any) => `${coord[1]} ${coord[0]}`)
        .join(',');
      geomText = `POLYGON((${pointString}))`;
    }
    return new Promise<number>((resolve, reject) => {
      try {
        db.query(sql, [geomText], (err: Error | null, result: any) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(result.rows[0].id_area);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Route to add a georeferece to a document
   * It requires the user to be an admin or an urban planner.
   * It expects the following parameters:
   * id of the document to update and the new georeferece.
   * It returns a 200 status code if the document has been updated.
   */
  addDocArea(docId: number, idArea: number): Promise<boolean> {
    const sql = `INSERT INTO area_doc (area, doc) VALUES ($1, $2)`;
    return new Promise<boolean>((resolve, reject) => {
      db.query(sql, [ docId], (err: Error | null) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(true);
      });
    });
  }
}

export default AreaDAO;
