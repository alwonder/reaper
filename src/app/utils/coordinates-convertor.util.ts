import { CoordinatesKm, CoordinatesLatLng, MapPoint } from '../types/map.types';

const LAT_KM_MULTIPLIER = 110.574;
const LNG_KM_MULTIPLIER = 111.320;

export const latLngToKm = ({lat, lng}: CoordinatesLatLng): CoordinatesKm => {
  return {
    x: lat * LAT_KM_MULTIPLIER,
    y: lng * (LNG_KM_MULTIPLIER * Math.cos(lat * Math.PI / 180)),
  }
}

export const kmToLatLng = ({x, y}: CoordinatesKm): CoordinatesLatLng => {
  const lat = x / LAT_KM_MULTIPLIER;
  const lng = y / (LNG_KM_MULTIPLIER * Math.cos((lat * Math.PI / 180)))
  return { lat, lng };
}

export const toPoint = (coords: CoordinatesLatLng): MapPoint => {
    return [coords.lng, coords.lat];
}
