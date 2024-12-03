//import { QueryResult } from 'pg';
import { Area, Georeference } from '../components/area';
import db from '../db/db';

class AreaDAO {
  /*/**
   * Returns all areas.
   * @returns A Promise that resolves to an array with all areas.
   */
  /*getAllAreas(): Promise<Area[]> {
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
  }*/

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
   * Route to check if an Area already exists in the db
   * It requires the user to be an admin or an urban planner.
   * It expects the following parameters:
   * id of the area.
   */
  checkExistingArea(coordinates: number[][]): Promise<number> {
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
          if (result.rows.length > 0) {
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

  /**
   * Route to retrieve all areas and points with their georeference
   * It requires the user to be an admin or an urban planner.
   */
  async getAllAreas(): Promise<Area[]> {
    return new Promise<Area[]>((resolve, reject) => {
      try {
        const sql = `SELECT id_area, name_area, ST_AsGeoJSON(area) AS area_geojson FROM areas`;
        db.query(sql, (err: Error | null, result: any) => {
          if (err) {
            reject(err);
            return;
          }

          const areas = result.rows.map(
            (row: {
              id_area: number;
              name_area: string;
              area_geojson: string;
            }) => {
              const geoJson = JSON.parse(row.area_geojson);
              let coord: Georeference = [];

              if (geoJson.type === 'Point') {
                coord = [
                  {
                    lat: geoJson.coordinates[1],
                    lon: geoJson.coordinates[0],
                  },
                ];
              } else if (geoJson.type === 'Polygon') {
                coord = geoJson.coordinates[0].map((c: number[]) => ({
                  lat: c[1],
                  lon: c[0],
                }));
              } else if (geoJson.type === 'MultiPolygon') {
                coord = geoJson.coordinates.flat().map((c: number[]) => ({
                  lat: c[1],
                  lon: c[0],
                }));
              } else {
                throw new Error('Unexpected GeoJSON type');
              }
              return new Area(row.id_area, row.name_area, coord);
            },
          );

          resolve(areas);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Route to check if coordinates inserted manually are inside municipality area
   * It expects the following parameters:
   * coordinates of a point
   */
  checkPointInsideArea(coordinates: number[]): Promise<boolean> {
    const sql = `
      SELECT ST_Contains(area, ST_SetSRID(ST_MakePoint($1, $2), 4326))
      FROM areas
      WHERE id_area = 1`;
    return new Promise<boolean>((resolve, reject) => {
      try {
        db.query(
          sql,
          [coordinates[1], coordinates[0]],
          (err: Error | null, result: any) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(result.rows[0].st_contains);
          },
        );
      } catch (error) {
        reject(error);
      }
    });
  }
}

export default AreaDAO;
