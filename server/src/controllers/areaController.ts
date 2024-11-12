import { Area } from '../components/area';
import AreaDAO from '../dao/areaDAO';

/**
 * Represents a controller for managing documents.
 * All methods of this class must interact with the corresponding DAO class to retrieve or store data.
 */
class DocumentController {
  private dao: AreaDAO;

  constructor() {
    this.dao = new AreaDAO();
  }
  
  /**
   * Returns all areas.
   * @returns A Promise that resolves to an array with all areas.
   */
  async getAllAreas(): Promise<Area[]> {
    const areas = await this.dao.getAllAreas();
    return areas;
  }

  /**
   * Route to add a georeferece to a document
   * @param id - The id of the document to update. The document must exist.
   * @param georef - The new georeferece of the document. It must not be null.
   * @returns A Promise that resolves to true if the document has been updated.
   * @throws Error if the document could not be updated.
   */
  async addDocArea(docId: number, coordinates: number[]): Promise<boolean> {
    const idArea = await this.dao.addArea(coordinates);
    return this.dao.addDocArea(docId, idArea);
  }

}

export default DocumentController;
