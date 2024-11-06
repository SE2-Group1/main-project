/**
 * Represents a stakeholder in the system.
 */
class Scale {
  scale: string;

  /**
   * Creates a new instance of the Stakeholder class.
   * @param stakeholder - The name of the stakeholder.
   * @param desc - The description of the stakeholder.
   */
  constructor(scale: string) {
    this.scale = scale;
  }
}

export { Scale };
