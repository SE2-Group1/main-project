import { Link, LinkClient } from '../../../src/components/link';
import LinkDAO from '../../../src/dao/linkDAO';
import db from '../../../src/db/db';

describe('Link DAO', () => {
  let linkDAO: LinkDAO;
  beforeEach(() => {
    linkDAO = new LinkDAO();
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe('addLink', () => {
    test('It should return true', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null);
        });
      const result = await linkDAO.addLink(1, 2, 'linkType');
      expect(result).toBe(true);
    });

    test('It should throw an error', async () => {
      // Mocking the query method
      jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback('error');
        });
      try {
        await linkDAO.addLink(1, 2, 'linkType');
      } catch (error) {
        expect(error).toBe('error');
      }
    });
  });

  describe('checkLink', () => {
    test('It should return true if the link exists', async () => {
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, {
            rows: [{ doc1: 1, doc2: 2, link_type: 'linkType' }],
          });
        });

      const result = await linkDAO.checkLink(1, 2, 'linkType');
      expect(result).toBe(true);
      mockDBQuery.mockRestore();
    });

    test('It should throw an error if the query fails', async () => {
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(new Error('Database error'), null);
        });

      await expect(linkDAO.checkLink(1, 2, 'linkType')).rejects.toThrow(
        'Database error',
      );
      mockDBQuery.mockRestore();
    });
  });

  describe('getLinks', () => {
    test('It should return an array of links', async () => {
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null, {
            rows: [
              { doc1: 1, dd1: '1', doc2: 2, dd2: '2', link_type: 'linkType' },
            ],
          });
        });

      const result = await linkDAO.getLinks(1);
      expect(result).toEqual([new Link('2', 2, 'linkType')]);
      mockDBQuery.mockRestore();
    });

    test('It should throw an error if the query fails', async () => {
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(new Error('Database error'), null);
        });

      await expect(linkDAO.getLinks(1)).rejects.toThrow('Database error');
      mockDBQuery.mockRestore();
    });
  });

  describe('removeLink', () => {
    test('It should return true if the link is removed', async () => {
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(null);
        });

      const result = await linkDAO.removeLink(1, 2, 'linkType');
      expect(result).toBe(true);
      mockDBQuery.mockRestore();
    });

    test('It should throw an error if the query fails', async () => {
      const mockDBQuery = jest
        .spyOn(db, 'query')
        .mockImplementation((sql, params, callback: any) => {
          callback(new Error('Database error'), null);
        });

      await expect(linkDAO.removeLink(1, 2, 'linkType')).rejects.toThrow(
        'Database error',
      );
      mockDBQuery.mockRestore();
    });
  });

  describe('insertLinks', () => {
    test('It should return if the links are inserted', async () => {
      const mockDBQuery = jest.spyOn(db, 'query').mockImplementation(sql => {
        return;
      });
      const mockCheckLink = jest
        .spyOn(linkDAO, 'checkLink')
        .mockImplementation(
          async (doc1: number, doc2: number, linkType: string) => {
            return false;
          },
        );
      const mockAddLink = jest
        .spyOn(linkDAO, 'addLink')
        .mockImplementation(
          async (doc1: number, doc2: number, linkType: string) => {
            return true;
          },
        );
      const mockRemoveLink = jest
        .spyOn(linkDAO, 'removeLink')
        .mockImplementation(
          async (doc1: number, doc2: number, linkType: string) => {
            return true;
          },
        );

      const links: LinkClient[] = [
        { type: 'linkType1', isValid: true },
        { type: 'linkType2', isValid: false },
      ];
      await linkDAO.insertLinks(1, 2, links);
      mockDBQuery.mockRestore();
      mockCheckLink.mockRestore();
      mockAddLink.mockRestore();
      mockRemoveLink.mockRestore();
    });

    test('It should throw an error if one of the functions fails', async () => {
      const mockDBQuery = jest.spyOn(db, 'query').mockImplementation(sql => {
        return;
      });

      const links: LinkClient[] = [
        { type: 'linkType1', isValid: true },
        { type: 'linkType2', isValid: false },
      ];

      const mockCheckLink = jest
        .spyOn(linkDAO, 'checkLink')
        .mockImplementation(
          async (doc1: number, doc2: number, linkType: string) => {
            throw new Error('Database error');
          },
        );
      await expect(linkDAO.insertLinks(1, 2, links)).rejects.toThrow(
        'Database error',
      );
      mockDBQuery.mockRestore();
      mockCheckLink.mockRestore();
    });
  });
});
