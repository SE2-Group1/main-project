class Connection {
  /**
   * @param {number} id - to-be linked document id.
   * @param {string} linkType - link type.
   */

  constructor(id = 0, linkType = '') {
    this.id = id;
    this.linkType = linkType;
  }
}

export default Connection;
