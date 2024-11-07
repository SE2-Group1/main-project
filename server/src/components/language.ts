/**
 * Represents a stakeholder in the system.
 */
class Language {
  language_id: string;
  language_name: string;

  /**
   * Creates a new instance of the Stakeholder class.
   * @param stakeholder - The name of the stakeholder.
   * @param desc - The description of the stakeholder.
   */
  constructor(language_id: string, language_name: string) {
    this.language_id = language_id;
    this.language_name = language_name;
  }
}

export { Language };
