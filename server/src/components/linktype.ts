/**
 * Represents a stakeholder in the system.
 */
class LinkType {
  linktype: string;

  /**
   * Creates a new instance of the Stakeholder class.
   * @param stakeholder - The name of the stakeholder.
   * @param desc - The description of the stakeholder.
   */
  constructor(linktype: string) {
    this.linktype = linktype;
  }
}

export { LinkType };
