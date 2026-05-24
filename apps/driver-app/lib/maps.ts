export type MapPoint = {
  label: string;
  address?: string;
  lat?: number;
  lng?: number;
};

function encodeAddress(point: MapPoint): string {
  if (point.lat != null && point.lng != null) {
    return `${point.lat},${point.lng}`;
  }
  return encodeURIComponent([point.label, point.address].filter(Boolean).join(', '));
}

export function googleMapsDirectionsUrl(origin: MapPoint, destination: MapPoint): string {
  const params = new URLSearchParams({
    api: '1',
    origin: decodeURIComponent(encodeAddress(origin)),
    destination: decodeURIComponent(encodeAddress(destination)),
    travelmode: 'driving',
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function appleMapsDirectionsUrl(origin: MapPoint, destination: MapPoint): string {
  const params = new URLSearchParams({
    saddr: decodeURIComponent(encodeAddress(origin)),
    daddr: decodeURIComponent(encodeAddress(destination)),
    dirflg: 'd',
  });
  return `http://maps.apple.com/?${params.toString()}`;
}
