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
  async addArea(coordinates: number[][]): Promise<number> {
    // If the area already exists, return the id
    const id_area = await this.checkExistingArea(coordinates);
    if (id_area > 0) {
      return id_area;
    }
    console.log('Adding area');
    console.log(coordinates);
    let geomText = '';
    const sql = `INSERT INTO areas (area) VALUES (ST_GeomFromText($1, 4326))
    RETURNING id_area`;
    if (coordinates.length <= 2) {
      const coordzero: any = coordinates[0];
      const pointString = `${coordzero[0]} ${coordzero[1]}`;
      geomText = `POINT(${pointString})`;
      //(FromText('POINT(12.4924 41.8902)', 4326));
    } else {
      const pointString = coordinates
        .map((coord: number[]) => `${coord[1]} ${coord[0]}`)
        .join(',');
      geomText = `POLYGON((${pointString}))`;
    }
    return new Promise<number>((resolve, reject) => {
      try {
        db.query(sql, [geomText], (err: Error | null, result: any) => {
          if (err) {
            console.log('primo errore', err);
            reject(err);
            return;
          }
          console.log('Area added', result.rows[0].id_area);
          resolve(result.rows[0].id_area);
        });
      } catch (error) {
        console.log('secondo errore', error);
        reject(error);
      }
    });
  }

  /**
   * Route to check if an Area already exists in the db
   * It requires the user to be an admin or an urban planner.
   * It expects the following parameters:
   * id of the area.
   */
  checkExistingArea(coordinates: number[][]): Promise<number> {
    console.log('Checking existing area');
    let geomText = '';
    const sql = `SELECT id_area FROM areas WHERE ST_Equals(ST_GeomFromText($1, 4326), area) LIMIT 1`;
    if (coordinates.length <= 2) {
      const coordZero: any = coordinates[0];
      const pointString = `${coordZero[1]} ${coordZero[0]}`;
      geomText = `POINT(${pointString})`;
    } else {
      const pointString = coordinates
        .map((coord: number[]) => `${coord[1]} ${coord[0]}`)
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
          console.log('Area checked');
          console.log(result.rows[0]);
          if (result.rows.length > 0) {
            console.log('Area already exists', result.rows[0].id_area);
            resolve(result.rows[0].id_area);
          } else {
            resolve(-1);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

export default AreaDAO;
