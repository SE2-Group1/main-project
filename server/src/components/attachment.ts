class Attachment {
  id: number;
  name: string;
  file: Buffer | null;

  constructor(id: number, name: string, pages: number, file: Buffer | null) {
    this.id = id;
    this.name = name;
    this.file = file;
  }
}

// Attachment representation received from the client
export type AttachmentClient = {
  name: string;
  isValid: boolean;
};

export { Attachment };
