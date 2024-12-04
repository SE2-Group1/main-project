import { Area } from '../components/area';
import AreaDAO from '../dao/areaDAO';

/**
 * Represents a controller for managing documents.
 * All methods of this class must interact with the corresponding DAO class to retrieve or store data.
 */
class AreaController {
  private dao: AreaDAO;

  constructor() {
    this.dao = new AreaDAO();
  }

  /**
   * Route to retrieve all areas and points with their georeference
   * It requires the user to be an admin or an urban planner.
   * @returns A Promise that resolves to an array of with all areas.
   */
  async getAllAreas(): Promise<Area[]> {
    const areas = await this.dao.getAllAreas();
    return areas;
  }

  /**
   * Check if a point is inside the municipality area
   * @param coordinates The coordinates of the point to check.
   * @returns A Promise that resolves to a boolean indicating if the point is inside the municipality area.
   */
  async checkPointInsideArea(coordinates: number[]): Promise<boolean> {
    const isInside = await this.dao.checkPointInsideArea(coordinates);
    return isInside;
  }
}

export default AreaController;
