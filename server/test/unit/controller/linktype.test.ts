import { LinkType } from '../../../src/components/linkType';
import LinkTypeController from '../../../src/controllers/linkTypeController';
import LinkTypeDAO from '../../../src/dao/linkTypeDAO';

jest.mock('../../../src/dao/linktypeDAO');

describe('LinkTypeController', () => {
  let linkTypeController: LinkTypeController;
  let mockDAO: jest.Mocked<LinkTypeDAO>;

  beforeEach(() => {
    mockDAO = new LinkTypeDAO() as jest.Mocked<LinkTypeDAO>;
    linkTypeController = new LinkTypeController();
    (linkTypeController as any).dao = mockDAO;
  });

  describe('getAllLinkTypes', () => {
    it('should return all link types', async () => {
      const linkTypes: LinkType[] = [
        new LinkType('type1'),
        new LinkType('type2'),
      ];
      mockDAO.getAllLinkTypes.mockResolvedValue(linkTypes);

      const result = await linkTypeController.getAllLinkTypes();

      expect(result).toEqual(linkTypes);
      expect(mockDAO.getAllLinkTypes).toHaveBeenCalledTimes(1);
    });
  });

  describe('getLinkType', () => {
    it('should return a link type by name', async () => {
      const linkType = new LinkType('type1');
      mockDAO.getLinkType.mockResolvedValue(linkType);

      const result = await linkTypeController.getLinkTypes('type1');

      expect(result).toEqual(linkType);
      expect(mockDAO.getLinkType).toHaveBeenCalledWith('type1');
      expect(mockDAO.getLinkType).toHaveBeenCalledTimes(1);
    });
  });

  describe('addLinkType', () => {
    it('should add a new link type', async () => {
      mockDAO.addLinkType.mockResolvedValue(true);

      const result = await linkTypeController.addLinkType('type3');

      expect(result).toBe(true);
      expect(mockDAO.addLinkType).toHaveBeenCalledWith('type3');
      expect(mockDAO.addLinkType).toHaveBeenCalledTimes(1);
    });
  });
});
