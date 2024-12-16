type GeoreferenceElement = {
  lon: number;
  lat: number;
};

export type Georeference = GeoreferenceElement[];

/**
 * Represents an area on the map in the system.
 */
class Area {
  id_area: number;
  coordinates: Georeference;
  name_area: string;

  /**
   * Creates a new instance of the Area class.
   * @param id_area - The unique identifier of the area
   * @param name_area - The name of the area
   * @param coordinates - The coordinate of the area or of the point
   */
  constructor(id_area: number, name_area: string, coordinates: Georeference) {
    this.id_area = id_area;
    this.name_area = name_area;
    this.coordinates = coordinates;
  }
}

export { Area };
