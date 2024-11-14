class Link {
  id: number;
  link_type: string;

  constructor(id: number, link_type: string) {
    this.id = id;
    this.link_type = link_type;
  }
}

// Link representation received from the client
export type LinkClient = {
  type: string;
  isValid: boolean;
};

export { Link };
