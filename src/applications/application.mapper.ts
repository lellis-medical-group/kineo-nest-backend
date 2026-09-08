import type {
  ListingStatus,
  ProfileType,
  Specialty,
} from "../generated/prisma/enums";

type EmbeddedListing = {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  specialty: Specialty;
  status: ListingStatus;
  urgent: boolean;
  practice: {
    id: string;
    name: string;
    address: string;
    city: string;
    latitude: number | null;
    longitude: number | null;
  };
};

type EmbeddedApplicant = {
  id: string;
  specialty: Specialty;
  profileType: ProfileType;
  city: string | null;
  verified: boolean;
  user: { name: string | null; image: string | null };
};

function toEmbeddedListingDto(listing: EmbeddedListing) {
  return {
    id: listing.id,
    title: listing.title,
    startDate: listing.startDate.toISOString(),
    endDate: listing.endDate.toISOString(),
    specialty: listing.specialty,
    status: listing.status,
    urgent: listing.urgent,
    practice: { ...listing.practice },
  };
}

function toEmbeddedApplicantDto(applicant: EmbeddedApplicant) {
  return {
    id: applicant.id,
    specialty: applicant.specialty,
    profileType: applicant.profileType,
    city: applicant.city,
    verified: applicant.verified,
    user: { ...applicant.user },
  };
}

export function toApplicationDto<
  T extends {
    viewedAt: Date | null;
    respondedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    listing?: EmbeddedListing | null;
    applicant?: EmbeddedApplicant | null;
  },
>(application: T) {
  const { listing, applicant, ...rest } = application;

  return {
    ...rest,
    viewedAt: application.viewedAt ? application.viewedAt.toISOString() : null,
    respondedAt: application.respondedAt
      ? application.respondedAt.toISOString()
      : null,
    createdAt: application.createdAt.toISOString(),
    updatedAt: application.updatedAt.toISOString(),
    ...(listing ? { listing: toEmbeddedListingDto(listing) } : {}),
    ...(applicant ? { applicant: toEmbeddedApplicantDto(applicant) } : {}),
  };
}
