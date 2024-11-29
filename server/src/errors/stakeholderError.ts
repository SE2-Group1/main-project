const STAKEHOLDER_NOT_FOUND = 'The stakeholder does not exist';

/**
 * Represents an error that occurs when a stakeholder is not found.
 */

class StakeholderNotFoundError extends Error {
  customMessage: string;
  customCode: number;

  constructor() {
    super();
    this.customMessage = STAKEHOLDER_NOT_FOUND;
    this.customCode = 404;
  }
}

export { StakeholderNotFoundError };
