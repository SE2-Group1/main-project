import { Type } from '../components/type';
import TypeDAO from '../dao/typeDAO';

class TypeController {
  private dao: TypeDAO;

  constructor() {
    this.dao = new TypeDAO();
  }

  async getAllTypes(): Promise<Type[]> {
    return this.dao.getAllTypes();
  }

  async getType(type_name: string): Promise<Type> {
    return this.dao.getType(type_name);
  }

  async addType(type_name: string): Promise<boolean> {
    return this.dao.addType(type_name);
  }
}

export default TypeController;
