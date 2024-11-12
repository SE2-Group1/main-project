import { LinkType } from '../components/linkType';
import LinkTypeDAO from '../dao/linkTypeDAO';

class LinkTypeController {
  private dao: LinkTypeDAO;

  constructor() {
    this.dao = new LinkTypeDAO();
  }

  async getAllLinkTypes(): Promise<LinkType[]> {
    return this.dao.getAllLinkTypes();
  }

  async getLinkTypes(link_type: string): Promise<LinkType> {
    return this.dao.getLinkType(link_type);
  }

  async addLinkType(link_type: string): Promise<boolean> {
    return this.dao.addLinkType(link_type);
  }
}

export default LinkTypeController;
