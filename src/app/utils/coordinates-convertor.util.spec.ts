import { CoordinatesLatLng } from '../types/map.types';
import { kmToLatLng, latLngToKm } from './coordinates-convertor.util';

const testCoords: CoordinatesLatLng[] = [
  {
    "lat": 49.90213728791819,
    "lng": 128.03552728146317
  },
  {
    "lat": 49.90213728791819,
    "lng": 128.04951768368485
  }
]

describe('Coordinates Convertor Utils', () => {
  it('should correctly convert latlng coordinates to km', () => {
    expect(latLngToKm(testCoords[0])).toEqual({ x: 5517.878928474265, y: 9180.232584157682 });
  });

  it('should correctly convert coordinates to km and back', () => {
    const km = latLngToKm(testCoords[0]);
    const latLng = kmToLatLng(km);
    expect(latLng).toEqual(testCoords[0]);
  });
});
