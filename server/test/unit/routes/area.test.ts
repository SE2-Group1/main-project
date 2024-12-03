import express from 'express';
import request from 'supertest';

import { Area } from '../../../src/components/area';
import AreaController from '../../../src/controllers/areaController';
import { AreaRoutes } from '../../../src/routers/areaRoutes';

jest.mock('../../../src/controllers/areaController', () => {
  return jest.fn().mockImplementation(() => {
    return {
      getAllAreas: jest.fn().mockResolvedValue([
        new Area(1, 'Area1', [
          { lat: 0, lon: 0 },
          { lat: 1, lon: 1 },
          { lat: 1, lon: 0 },
          { lat: 0, lon: 0 },
        ]),
        new Area(2, 'Area2', [{ lat: 1, lon: 1 }]),
      ]),
    };
  });
});

describe('AreaRoutes', () => {
  let app: express.Application;
  let areaRoutes: AreaRoutes;

  beforeAll(() => {
    app = express();
    const authenticator = {
      isAdminOrUrbanPlanner: (req: any, res: any, next: any) => next(),
    };
    areaRoutes = new AreaRoutes(authenticator as any); // Cast as `any` to bypass type issues
    app.use('/areas', areaRoutes.getRouter());
  });

  it('should return a list of areas for GET /georeference', async () => {
    const response = await request(app).get('/areas/georeference');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id_area: 1,
        name_area: 'Area1',
        coordinates: [
          { lat: 0, lon: 0 },
          { lat: 1, lon: 1 },
          { lat: 1, lon: 0 },
          { lat: 0, lon: 0 },
        ],
      },
      {
        id_area: 2,
        name_area: 'Area2',
        coordinates: [{ lat: 1, lon: 1 }],
      },
    ]);
  });

  it('should return 422 for POST /areas/checkPointInsideArea without coordinates', async () => {
    const response = await request(app).post('/areas/checkPointInsideArea');
    expect(response.status).toBe(422);
  });

  it('should return 200 for POST /areas/checkPointInsideArea with coordinates', async () => {
    const mockIsInside = true;
    jest
      .spyOn(AreaController.prototype, 'checkPointInsideArea')
      .mockResolvedValueOnce(mockIsInside);

    const response = await request(app)
      .post('/areas/checkPointInsideArea')
      .send({
        coordinates: [41.9028, 12.4964],
      });


    console.log(response.body);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(true);
  });

  it('should return 200 for POST /areas/checkPointInsideArea with coordinates', async () => {
    const mockIsInside = false;
    jest
      .spyOn(AreaController.prototype, 'checkPointInsideArea')
      .mockResolvedValueOnce(mockIsInside);

    const response = await request(app)
      .post('/areas/checkPointInsideArea')
      .send({
        coordinates: [41.9028, 12.4964],
      });

    
    console.log(response.body);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(false);
  });
});
