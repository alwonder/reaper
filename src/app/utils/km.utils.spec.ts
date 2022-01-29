import { latLngToKm } from './coordinates-convertor.util';
import { getMultiplePointsDistance } from './km.utils';

const testCoords = [
  {
    "lat": 50.26983171908069,
    "lng": 127.53633499145509
  },
  {
    "lat": 50.27312324403723,
    "lng": 127.54817962646486
  },
  {
    "lat": 50.275756300181634,
    "lng": 127.53221511840822
  },
  {
    "lat": 50.25995577899054,
    "lng": 127.54817962646486
  },
  {
    "lat": 50.26939283189516,
    "lng": 127.56792068481447
  },
  {
    "lat": 50.26105320679729,
    "lng": 127.51384735107423
  },
  {
    "lat": 50.274330079512495,
    "lng": 127.51298904418945
  }
]

describe('Km Utils', () => {
  it('should calculate correct distance', () => {
    const kmCoords = testCoords.map((coord) => latLngToKm(coord));
    expect(getMultiplePointsDistance(kmCoords)).toEqual(11.358)
  })
});
