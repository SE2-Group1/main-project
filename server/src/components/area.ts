import { Geometry } from 'geojson';

type GeoreferenceElement = {
  lat: number;
  lon: number;
};

export type Georeference = GeoreferenceElement[];

/**
 * Represents an area on the map in the system.
 */
class Area {
  id_area: number;
  area: Geometry;

  /**
   * Creates a new instance of the Area class.
   * @param id_area - The unique identifier of the area
   * @param area - A GeoJSON geometry representing the area on the map
   */
  constructor(id_area: number, area: Geometry) {
    this.id_area = id_area;
    this.area = area;
  }
}

export { Area };
