import { Resource } from '../../../src/components/resource';
import ResourceController from '../../../src/controllers/resourceController';
import ResourceDAO from '../../../src/dao/resourceDAO';

jest.mock('../../../src/dao/resourceDAO');

describe('ResourceController', () => {
  let resourceController: ResourceController;
  let mockDAO: jest.Mocked<ResourceDAO>;

  beforeEach(() => {
    mockDAO = new ResourceDAO() as jest.Mocked<ResourceDAO>;
    resourceController = new ResourceController();
    (resourceController as any).dao = mockDAO;
  });

  describe('getAllResources', () => {
    it('should return all resources', async () => {
      const resources: Resource[] = [
        new Resource(1, 'Resource1', 10, null),
        new Resource(2, 'Resource2', 20, null),
      ];
      mockDAO.getAllResources.mockResolvedValue(resources);

      const result = await resourceController.getAllResources();

      expect(result).toEqual(resources);
      expect(mockDAO.getAllResources).toHaveBeenCalledTimes(1);
    });
  });

  describe('getResourceById', () => {
    it('should return a resource by id', async () => {
      const resource = new Resource(1, 'Resource1', 10, null);
      mockDAO.getResourceById.mockResolvedValue(resource);

      const result = await resourceController.getResourceById(1);

      expect(result).toEqual(resource);
      expect(mockDAO.getResourceById).toHaveBeenCalledWith(1);
      expect(mockDAO.getResourceById).toHaveBeenCalledTimes(1);
    });
  });

  describe('getResourcesByDocId', () => {
    it('should return resources by document id', async () => {
      const resources: Resource[] = [
        new Resource(1, 'Resource1', 10, null),
        new Resource(2, 'Resource2', 20, null),
      ];
      mockDAO.getResourcesByDocId.mockResolvedValue(resources);

      const result = await resourceController.getResourcesByDocId(1);

      expect(result).toEqual(resources);
      expect(mockDAO.getResourcesByDocId).toHaveBeenCalledWith(1);
      expect(mockDAO.getResourcesByDocId).toHaveBeenCalledTimes(1);
    });
  });
});
