/**
 * Represents a stakeholder in the system.
 */
class LinkType {
  link_type: string;

  /**
   * Creates a new instance of the Stakeholder class.
   * @param stakeholder - The name of the stakeholder.
   * @param desc - The description of the stakeholder.
   */
  constructor(link_type: string) {
    this.link_type = link_type;
  }
}

export { LinkType };
