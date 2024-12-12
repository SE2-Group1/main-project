import request from 'supertest';

import { app } from '../../../index';
import { Area } from '../../../src/components/area';
import AreaController from '../../../src/controllers/areaController';
import { AreaRoutes } from '../../../src/routers/areaRoutes';

jest.mock('../../../src/controllers/areaController');
//TODO Add name_area
describe('AreaRoutes', () => {
  let areaRoutes: AreaRoutes;

  beforeAll(() => {
    const authenticator = {
      isAdminOrUrbanPlanner: jest.fn((req, res, next) => next()), // Mocking authenticator method
    };
    areaRoutes = new AreaRoutes(authenticator as any); // Casting to bypass type issues
    app.use('/areas', areaRoutes.getRouter());
  });

  it('should return a list of areas for GET /areas/georeference', async () => {
    const mockAreas = [
      new Area(1, 'Area 1', [
        { lon: 0, lat: 0 },
        { lon: 1, lat: 1 },
        { lon: 0, lat: 1 },
        { lon: 0, lat: 0 },
      ]),
      new Area(2, 'Area 2', [{ lon: 1, lat: 1 }]),
    ];
    jest
      .spyOn(AreaController.prototype, 'getAllAreas')
      .mockResolvedValueOnce(mockAreas);
    const response = await request(app).get('/areas/georeference');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id_area: 1,
        coordinates: [
          { lon: 0, lat: 0 },
          { lon: 1, lat: 1 },
          { lon: 0, lat: 1 },
          { lon: 0, lat: 0 },
        ],
        name_area: 'Area 1',
      },
      {
        id_area: 2,
        coordinates: [{ lon: 1, lat: 1 }],
        name_area: 'Area 2',
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
        coordinates: [12.4964, 41.9028],
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
        coordinates: [12.4964, 41.9028],
      });

    console.log(response.body);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(false);
  });
});
