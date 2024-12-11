import { Resource } from '../components/resource';
import ResourceDAO from '../dao/resourceDAO';

class ResourceController {
  private dao: ResourceDAO;

  constructor() {
    this.dao = new ResourceDAO();
  }

  async getAllResources(): Promise<Resource[]> {
    return this.dao.getAllResources();
  }

  async getResourceById(id: number): Promise<Resource> {
    return this.dao.getResourceById(id);
  }

  async getResourcesByDocId(docId: number): Promise<Resource[]> {
    return this.dao.getResourcesByDocId(docId);
  }
}

export default ResourceController;
