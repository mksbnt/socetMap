import { LatLngTuple } from 'leaflet';
import { IPoint, ISignal } from '../../interfaces/signal.interface';

export function sortCoordinatesClockwise(
  coordinates: LatLngTuple[]
): LatLngTuple[] {
  // Find the centroid of the coordinates
  const centroid: LatLngTuple = coordinates.reduce(
    (acc, coord) => [acc[0] + coord[0], acc[1] + coord[1]],
    [0, 0]
  );
  centroid[0] /= coordinates.length;
  centroid[1] /= coordinates.length;

  // Sort coordinates based on polar angle with respect to the centroid
  coordinates.sort((a, b) => {
    const angleA = Math.atan2(a[1] - centroid[1], a[0] - centroid[0]);
    const angleB = Math.atan2(b[1] - centroid[1], b[0] - centroid[0]);

    return angleA - angleB;
  });

  return coordinates;
}

export function findCenter(coordinates: LatLngTuple[]): LatLngTuple {
  const center: LatLngTuple = coordinates.reduce(
    (acc, coord) => [acc[0] + coord[0], acc[1] + coord[1]],
    [0, 0]
  );

  center[0] /= coordinates.length;
  center[1] /= coordinates.length;

  return center;
}

export function extractPoints(signals: ISignal[]): LatLngTuple[] {
  return signals.map((signal) => [signal.point.lat, signal.point.lon]);
}

export function extractZones(signals: ISignal[]): LatLngTuple[][] {
  return signals.map((signal) =>
    signal.zone.map((coord: IPoint) => [coord.lat, coord.lon] as LatLngTuple)
  );
}

export function sortZones(zones: LatLngTuple[][]): LatLngTuple[][] {
  return zones.map((zone) => sortCoordinatesClockwise(zone));
}

export function deepArrayEquals(arr1: any[], arr2: any[]): boolean {
  if (arr1.length !== arr2.length) return false;

  for (let i = 0; i < arr1.length; i++) {
    if (Array.isArray(arr1[i]) && Array.isArray(arr2[i])) {
      if (!deepArrayEquals(arr1[i], arr2[i])) return false;
    } else {
      if (arr1[i] !== arr2[i]) return false;
    }
  }

  return true;
}
