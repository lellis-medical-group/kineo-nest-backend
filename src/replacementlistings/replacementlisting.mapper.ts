export function toReplacementListingDto(listing: {
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}) {
  return {
    ...listing,
    startDate: listing.startDate.toISOString(),
    endDate: listing.endDate.toISOString(),
    createdAt: listing.createdAt.toISOString(),
    updatedAt: listing.updatedAt.toISOString(),
  };
}
