import express from 'express';
import { Geometry } from 'geojson';
import request from 'supertest';

import { Area } from '../../../src/components/area';
import { AreaRoutes } from '../../../src/routers/areaRoutes';

jest.mock('../../../src/controllers/areaController', () => {
  return jest.fn().mockImplementation(() => {
    return {
      getAllAreas: jest.fn().mockResolvedValue([
        new Area(1, {
          type: 'Polygon',
          coordinates: [
            [
              [0, 0],
              [1, 1],
              [1, 0],
              [0, 0],
            ],
          ],
        } as Geometry),
        new Area(2, { type: 'Point', coordinates: [1, 1] } as Geometry),
      ]),
    };
  });
});

describe('AreaRoutes', () => {
  let app: express.Application;
  let areaRoutes: AreaRoutes;

  beforeAll(() => {
    app = express();
    const authenticator = {}; // Mock the authenticator object
    areaRoutes = new AreaRoutes(authenticator as any); // Cast as `any` to bypass type issues
    app.use('/areas', areaRoutes.getRouter());
  });

  it('should return a list of areas for GET /areas', async () => {
    const response = await request(app).get('/areas');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id_area: 1,
        area: {
          type: 'Polygon',
          coordinates: [
            [
              [0, 0],
              [1, 1],
              [1, 0],
              [0, 0],
            ],
          ],
        },
      },
      {
        id_area: 2,
        area: {
          type: 'Point',
          coordinates: [1, 1],
        },
      },
    ]);
  });
});
