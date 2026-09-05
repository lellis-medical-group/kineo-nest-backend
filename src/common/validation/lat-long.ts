/**
 * Generic validation rule shared by Profile and Practice DTOs.
 *
 * Prisma keeps `latitude` and `longitude` both optional (`Float?`) on Profile
 * and Practice, but a single coordinate is useless for geolocation and always
 * indicates a mistake coming from the client. This rule enforces that both
 * values are either present together or absent together.
 */
export function latLongsPaired(data: {
  latitude?: number;
  longitude?: number;
}): boolean {
  return (data.latitude === undefined) === (data.longitude === undefined);
}
