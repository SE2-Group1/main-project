/**
 * Represents a stakeholder in the system.
 */
class Stakeholder {
  stakeholder: string;
  desc: string;

  /**
   * Creates a new instance of the Stakeholder class.
   * @param stakeholder - The name of the stakeholder.
   * @param desc - The description of the stakeholder.
   */
  constructor(stakeholder: string, desc: string) {
    this.stakeholder = stakeholder;
    this.desc = desc;
  }
}

export { Stakeholder };