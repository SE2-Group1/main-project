import { Language } from '../../../src/components/language';
import LanguageController from '../../../src/controllers/languageController';
import LanguageDAO from '../../../src/dao/languageDAO';

jest.mock('../../../src/dao/languageDAO');

describe('LanguageController', () => {
  let languageController: LanguageController;
  let mockDAO: jest.Mocked<LanguageDAO>;

  beforeEach(() => {
    mockDAO = new LanguageDAO() as jest.Mocked<LanguageDAO>;
    languageController = new LanguageController();
    (languageController as any).dao = mockDAO;
  });

  describe('getAllLanguages', () => {
    it('should return all languages', async () => {
      const languages: Language[] = [
        new Language('1', 'English'),
        new Language('2', 'Spanish'),
      ];
      mockDAO.getAllLanguages.mockResolvedValue(languages);

      const result = await languageController.getAllLanguages();

      expect(result).toEqual(languages);
      expect(mockDAO.getAllLanguages).toHaveBeenCalledTimes(1);
    });
  });

  describe('getLanguage', () => {
    it('should return a language by id', async () => {
      const language = new Language('1', 'English');
      mockDAO.getLanguage.mockResolvedValue(language);

      const result = await languageController.getLanguage('1');

      expect(result).toEqual(language);
      expect(mockDAO.getLanguage).toHaveBeenCalledWith('1');
      expect(mockDAO.getLanguage).toHaveBeenCalledTimes(1);
    });
  });

  describe('addLanguage', () => {
    it('should add a new language', async () => {
      mockDAO.addLanguage.mockResolvedValue(true);

      const result = await languageController.addLanguage('3', 'French');

      expect(result).toBe(true);
      expect(mockDAO.addLanguage).toHaveBeenCalledWith('3', 'French');
      expect(mockDAO.addLanguage).toHaveBeenCalledTimes(1);
    });
  });
});
