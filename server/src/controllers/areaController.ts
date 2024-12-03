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
  /*async getAllAreas(): Promise<Area[]> {
    const areas = await this.dao.getAllAreas();
    return areas;
  }*/

  /**
   * Route to retrieve all areas and points with their georeference
   * It requires the user to be an admin or an urban planner.
   * @returns A Promise that resolves to an array of with all areas.
   */
  async getAllAreas(): Promise<Area[]> {
    const areas = await this.dao.getAllAreas();
    return areas;
  }
}

export default DocumentController;
