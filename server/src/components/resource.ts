class Resource {
  id: number;
  name: string;
  pages: number;
  file: Buffer | null;

  constructor(id: number, name: string, pages: number, file: Buffer | null) {
    this.id = id;
    this.name = name;
    this.pages = pages;
    this.file = file;
  }
}

// Resource representation received from the client
export type ResourceClient = {
  name: string;
  isValid: boolean;
};

export { Resource };
