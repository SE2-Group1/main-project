class Link {
  doc: string;
  link_type: string;

  constructor(doc: string, link_type: string) {
    this.doc = doc;
    this.link_type = link_type;
  }
}

// Link representation received from the client
export type LinkClient = {
  type: string;
  isValid: boolean;
};

export { Link };
