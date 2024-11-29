import { Type } from '../../../src/components/type';
import TypeController from '../../../src/controllers/typeController';
import TypeDAO from '../../../src/dao/typeDAO';

jest.mock('../../../src/dao/typeDAO');

describe('TypeController', () => {
  let typeController: TypeController;
  let mockDAO: jest.Mocked<TypeDAO>;

  beforeEach(() => {
    mockDAO = new TypeDAO() as jest.Mocked<TypeDAO>;
    typeController = new TypeController();
    (typeController as any).dao = mockDAO;
  });

  describe('getAllTypes', () => {
    it('should return all types', async () => {
      const types: Type[] = [new Type('type1'), new Type('type2')];
      mockDAO.getAllTypes.mockResolvedValue(types);

      const result = await typeController.getAllTypes();

      expect(result).toEqual(types);
      expect(mockDAO.getAllTypes).toHaveBeenCalledTimes(1);
    });
  });

  describe('getType', () => {
    it('should return a type by name', async () => {
      const type = new Type('type1');
      mockDAO.getType.mockResolvedValue(type);

      const result = await typeController.getType('type1');

      expect(result).toEqual(type);
      expect(mockDAO.getType).toHaveBeenCalledWith('type1');
      expect(mockDAO.getType).toHaveBeenCalledTimes(1);
    });
  });

  describe('addType', () => {
    it('should add a new type', async () => {
      mockDAO.addType.mockResolvedValue(true);

      const result = await typeController.addType('type3');

      expect(result).toBe(true);
      expect(mockDAO.addType).toHaveBeenCalledWith('type3');
      expect(mockDAO.addType).toHaveBeenCalledTimes(1);
    });
  });
});
