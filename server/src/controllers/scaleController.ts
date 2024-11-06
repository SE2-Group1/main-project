import { Scale } from '../components/scale';
import ScaleDAO from '../dao/scaleDAO';

class StakeholderController {
  private dao: ScaleDAO;

  constructor() {
    this.dao = new ScaleDAO();
  }

  async getAllScales(): Promise<Scale[]> {
    return this.dao.getAllScales();
  }

  async getScale(scale: string): Promise<string> {
    return this.dao.getScale(scale);
  }

  async addScale(scale: string): Promise<boolean> {
    return this.dao.addScale(scale);
  }
}

export default StakeholderController;
