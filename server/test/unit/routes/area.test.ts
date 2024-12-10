//TODO Add name_area
/*
import request from 'supertest';

import { app } from '../../../index';
import { Area } from '../../../src/components/area';
import AreaController from '../../../src/controllers/areaController';
import { AreaRoutes } from '../../../src/routers/areaRoutes';
*/

jest.mock('../../../src/controllers/areaController');
//TODO Add name_area
/*describe('AreaRoutes', () => {
  let areaRoutes: AreaRoutes;

  beforeAll(() => {
    const authenticator = {
      isAdminOrUrbanPlanner: jest.fn((req, res, next) => next()), // Mocking authenticator method
    };
    areaRoutes = new AreaRoutes(authenticator as any); // Casting to bypass type issues
    app.use('/areas', areaRoutes.getRouter());
  });

  it('should return a list of areas for GET /areas', async () => {
    const mockAreas = [
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
      }),
      new Area(2, { type: 'Point', coordinates: [1, 1] }),
    ];
    jest
      .spyOn(AreaController.prototype, 'getAllAreas')
      .mockResolvedValueOnce(mockAreas);
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
      { id_area: 2, area: { type: 'Point', coordinates: [1, 1] } },
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

    console.log('PORCA MADONNA');
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

    console.log('PORCA MADONNA');
    console.log(response.body);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(false);
  });
});*/
