/**
 * Represents a stakeholder in the system.
 */
class Type {
  type_name: string;

  /**
   * Creates a new instance of the Stakeholder class.
   * @param stakeholder - The name of the stakeholder.
   * @param desc - The description of the stakeholder.
   */
  constructor(type_name: string) {
    this.type_name = type_name;
  }
}

export { Type };
