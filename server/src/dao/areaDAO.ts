import { Area, Georeference } from '../components/area';
import db from '../db/db';

class AreaDAO {
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
          console.log(result.rows);
          const areas = result.rows.map(
            (row: {
              id_area: number;
              name_area: string;
              area_geojson: string;
            }) => {
              const geoJson = JSON.parse(row.area_geojson);
              const coord = this.parseGeoJsonCoordinates(geoJson);
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

  private parseGeoJsonCoordinates(geoJson: any): Georeference {
    switch (geoJson.type) {
      case 'Point':
        return [{ lon: geoJson.coordinates[0], lat: geoJson.coordinates[1] }];
      case 'Polygon':
        return geoJson.coordinates[0].map((coord: number[]) => ({
          lon: coord[0],
          lat: coord[1],
        }));
      case 'MultiPolygon':
        // For MultiPolygon, flatten the coordinates
        return geoJson.coordinates.map((polygon: any[]) =>
          polygon[0].map(([lon, lat]: [number, number]) => ({
            lon,
            lat,
          })),
        );
      default:
        throw new Error('Unexpected GeoJSON type');
    }
  }
  /**
   * Route to add an Area in the db
   * It requires the user to be an admin or an urban planner.
   * It expects the following parameters:
   * coordinates of the area.
   */
  async addArea(
    coordinates: number[][],
    name_area: string | null,
  ): Promise<number> {
    // If the area already exists, return the id
    const id_area = await this.checkExistingArea(coordinates);
    if (id_area > 0) {
      return id_area;
    }
    let geomText = '';
    const sql = `INSERT INTO areas (area,name_area) VALUES (ST_GeomFromText($1, 4326),$2)
    RETURNING id_area`;
    if (coordinates.length <= 2) {
      const coordzero: any = coordinates[0];
      const pointString = `${coordzero[0]} ${coordzero[1]}`;
      geomText = `POINT(${pointString})`;
      //(FromText('POINT(12.4924 41.8902)', 4326));
    } else {
      const pointString = coordinates
        .map((coord: number[]) => `${coord[0]} ${coord[1]}`)
        .join(',');
      geomText = `POLYGON((${pointString}))`;
    }
    return new Promise<number>((resolve, reject) => {
      try {
        db.query(
          sql,
          [geomText, name_area],
          (err: Error | null, result: any) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(result.rows[0].id_area);
          },
        );
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
      const pointString = `${coordZero[0]} ${coordZero[1]}`;
      geomText = `POINT(${pointString})`;
    } else {
      const pointString = coordinates
        .map((coord: number[]) => `${coord[0]} ${coord[1]}`)
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
          [coordinates[0], coordinates[1]],
          (err: Error | null, result: any) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(result.rows[0].st_contains);
          },
        );
      } catch (error) {
        reject(
          new Error(
            `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
          ),
        );
      }
    });
  }
}

export default AreaDAO;
