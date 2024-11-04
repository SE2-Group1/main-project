// linkError.ts
export class DuplicateLinkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DuplicateLinkError';
  }
}

export class ConflictingLinkTypeError extends Error {
  constructor(
    message: string,
    public existingLinkType: string,
  ) {
    super(message);
    this.name = 'ConflictingLinkTypeError';
  }
}
