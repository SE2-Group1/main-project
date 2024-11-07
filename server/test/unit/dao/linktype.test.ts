import { LinkType } from '../../../src/components/linktype';
import LinkTypeDAO from '../../../src/dao/linktypeDAO';
import db from '../../../src/db/db';

jest.mock('../../../src/db/db');

describe('LinkTypeDAO', () => {
  let linkTypeDAO: LinkTypeDAO;

  beforeEach(() => {
    linkTypeDAO = new LinkTypeDAO();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllLinkTypes', () => {
    it('should return all link types', async () => {
      const mockLinkTypes = [{ link_name: 'type1' }, { link_name: 'type2' }];
      (db.query as jest.Mock).mockImplementation((sql, callback) => {
        callback(null, { rows: mockLinkTypes });
      });

      const result = await linkTypeDAO.getAllLinkTypes();
      expect(result).toEqual([new LinkType('type1'), new LinkType('type2')]);
    });

    it('should throw an error if the query fails', async () => {
      (db.query as jest.Mock).mockImplementation((sql, callback) => {
        callback(new Error('Query failed'), null);
      });

      await expect(linkTypeDAO.getAllLinkTypes()).rejects.toThrow(
        'Query failed',
      );
    });
  });

  describe('getLinkTypes', () => {
    it('should return a specific link type', async () => {
      const mockLinkType = { link_name: 'type1' };
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(null, { rows: [mockLinkType] });
      });

      const result = await linkTypeDAO.getLinkTypes('type1');
      expect(result).toEqual(new LinkType('type1'));
    });

    it('should throw an error if the link type is not found', async () => {
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(null, { rows: [] });
      });

      await expect(linkTypeDAO.getLinkTypes('type1')).rejects.toThrow(
        'Type not found',
      );
    });

    it('should throw an error if the query fails', async () => {
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(new Error('Query failed'), null);
      });

      await expect(linkTypeDAO.getLinkTypes('type1')).rejects.toThrow(
        'Query failed',
      );
    });
  });

  describe('addLinkType', () => {
    it('should add a new link type', async () => {
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(null);
      });

      const result = await linkTypeDAO.addLinkType('type3');
      expect(result).toBe(true);
    });

    it('should throw an error if the query fails', async () => {
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(new Error('Query failed'));
      });

      await expect(linkTypeDAO.addLinkType('type3')).rejects.toThrow(
        'Query failed',
      );
    });
  });
});
