import { Stakeholder } from '../components/stakeholder';
import StakeholderDAO from '../dao/stakeholderDAO';

/**
 * Represents a controller for managing documents.
 * All methods of this class must interact with the corresponding DAO class to retrieve or store data.
 */
class StakeholderController {
  private dao: StakeholderDAO;

  constructor() {
    this.dao = new StakeholderDAO();
  }

  /**
   * Creates a new stakeholder.
   * @param stakeholder - The name of the stakeholder. It must not be null.
   * @param desc - The description of the stakeholder. It must not be null.
   */
  async addStakeholder(stakeholder: string): Promise<void> {
    return this.dao.addStakeholder(stakeholder);
  }

  /**
   * Returns a specific stakeholder.
   * @param stakeholder - The name of the stakeholder to retrieve. The stakeholder must exist.
   * @returns A Promise that resolves to the stakeholder with the specified name.
   * @throws StakeholderNotFoundError if the stakeholder with the specified name does not exist.
   */
  async getStakeholder(stakeholder: string): Promise<Stakeholder> {
    return this.dao.getStakeholder(stakeholder);
  }

  /**
   * Returns all stakeholders.
   * @returns A Promise that resolves to an array with all stakeholders.
   */
  async getAllStakeholders(): Promise<Stakeholder[]> {
    return this.dao.getAllStakeholders();
  }
}

export default StakeholderController;
