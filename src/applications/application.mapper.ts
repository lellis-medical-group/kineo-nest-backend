export function toApplicationDto<
  T extends {
    viewedAt: Date | null;
    respondedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  },
>(application: T) {
  return {
    ...application,
    viewedAt: application.viewedAt ? application.viewedAt.toISOString() : null,
    respondedAt: application.respondedAt
      ? application.respondedAt.toISOString()
      : null,
    createdAt: application.createdAt.toISOString(),
    updatedAt: application.updatedAt.toISOString(),
  };
}
