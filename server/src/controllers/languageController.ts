import { Language } from '../components/language';
import LanguageDAO from '../dao/languageDAO';

class LanguageController {
  private dao: LanguageDAO;

  constructor() {
    this.dao = new LanguageDAO();
  }

  async getAllLanguages(): Promise<Language[]> {
    return this.dao.getAllLanguages();
  }

  async getLanguage(language_id: string): Promise<Language> {
    return this.dao.getLanguage(language_id);
  }

  async addLanguage(
    language_id: string,
    language_name: string,
  ): Promise<boolean> {
    return this.dao.addLanguage(language_id, language_name);
  }
}

export default LanguageController;
