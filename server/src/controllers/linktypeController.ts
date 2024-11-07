import { LinkType } from '../components/linktype';
import LinkTypeDAO from '../dao/linktypeDAO';

class LinkTypeController {
  private dao: LinkTypeDAO;

  constructor() {
    this.dao = new LinkTypeDAO();
  }

  async getAllLinkTypes(): Promise<LinkType[]> {
    return this.dao.getAllLinkTypes();
  }

  async getLinkTypes(linktype: string): Promise<LinkType> {
    return this.dao.getLinkTypes(linktype);
  }

  async addLinkType(linktype: string): Promise<boolean> {
    return this.dao.addLinkType(linktype);
  }
}

export default LinkTypeController;
