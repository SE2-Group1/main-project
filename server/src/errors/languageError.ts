const LANGUAGE_NOT_FOUND = 'The language was not found.';

export class LanguageNotFoundError extends Error {
  customMessage: string;
  customCode: number;

  constructor() {
    super();
    this.customMessage = LANGUAGE_NOT_FOUND;
    this.customCode = 404;
  }
}
