import { LinkType } from '../../../src/components/linkType';
import LinkTypeDAO from '../../../src/dao/linkTypeDAO';
import db from '../../../src/db/db';
import { LinkTypeNotFoundError } from '../../../src/errors/linkError';

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

  describe('getLinkType', () => {
    it('should return a specific link type', async () => {
      const mockLinkType = { link_name: 'type1' };
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(null, { rows: [mockLinkType] });
      });

      const result = await linkTypeDAO.getLinkType('type1');
      expect(result).toEqual(new LinkType('type1'));
    });

    it('should throw an error if the link type is not found', async () => {
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(null, { rows: [] });
      });

      try {
        await linkTypeDAO.getLinkType('type1');
      } catch (error) {
        expect(error).toBeInstanceOf(LinkTypeNotFoundError);
      }
    });

    it('should throw an error if the query fails', async () => {
      (db.query as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(new Error('Query failed'), null);
      });

      await expect(linkTypeDAO.getLinkType('type1')).rejects.toThrow(
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
