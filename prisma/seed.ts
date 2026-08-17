import { createPrismaClient } from "../src/lib/prisma";
import { hashPassword } from "better-auth/crypto";
import { ProfileType, Specialty, ListingStatus, ApplicationStatus } from "../src/generated/prisma/enums";

const prisma = createPrismaClient();

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getFutureDate(daysToAdd: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date;
}

async function main() {
  console.log("--- Cleaning the database ---");

  await prisma.application.deleteMany();
  await prisma.replacementListing.deleteMany();
  await prisma.practice.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  console.log("--- Creating users, Better Auth accounts, and profiles ---");

  const firstNames = ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi", "Ivan", "Judy", "Kevin", "Lara", "Mallory", "Nancy", "Oscar"];
  const lastNames = ["Martin", "Durand", "Dubois", "Thomas", "Robert", "Richard", "Petit", "Leroy", "Moreau", "Simon", "Laurent", "Lefebvre", "Michel", "Garcia", "David"];
  const cities = ["Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille"];
  const specialties = Object.values(Specialty);
  const profileTypes = Object.values(ProfileType);

  const createdProfiles = [];

  const defaultHashedPassword = await hashPassword("Password123!");

  for (let i = 0; i < 15; i++) {
    const firstName = firstNames[i];
    const lastName = lastNames[i];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@medecin.fr`;
    const city = cities[i % cities.length];
    const specialty = specialties[i % specialties.length];
    const profileType = profileTypes[i % profileTypes.length];

    const userId = crypto.randomUUID();

    const user = await prisma.user.create({
      data: {
        id: userId,
        email: email,
        name: `${firstName} ${lastName}`,
        emailVerified: true,
        accounts: {
          create: {
            id: crypto.randomUUID(),
            accountId: userId, // CRUCIAL : accountId doit être égal à userId pour le provider credential
            providerId: "credential",
            password: defaultHashedPassword,
          },
        },
        profile: {
          create: {
            specialty: specialty,
            profileType: profileType,
            city: city,
            verified: i % 3 !== 0,
            isPublic: true,
            latitude: 48.8566 + (Math.random() - 0.5) * 2,
            longitude: 2.3522 + (Math.random() - 0.5) * 2,
          },
        },
      },
      include: { profile: true },
    });

    if (user.profile) {
      createdProfiles.push(user.profile);
    }
  }

  console.log("--- Creating medical practices ---");

  const createdPractices = [];
  const practiceOwners = createdProfiles.filter(p => p.profileType === ProfileType.INSTALLED || p.profileType === ProfileType.BOTH);

  for (let i = 0; i < practiceOwners.length; i++) {
    const owner = practiceOwners[i];
    const cityValue = owner.city ?? "Paris";

    const practice = await prisma.practice.create({
      data: {
        ownerId: owner.id,
        name: `Practice ${cityValue} ${i + 1}`,
        address: `${i + 5} Main Street`,
        city: cityValue,
        latitude: owner.latitude,
        longitude: owner.longitude,
        isPublic: true,
      },
    });
    createdPractices.push(practice);
  }

  console.log("--- Creating replacement listings ---");

  const createdListings = [];
  const listingStatuses = [ListingStatus.DRAFT, ListingStatus.OPEN, ListingStatus.OPEN, ListingStatus.OPEN, ListingStatus.FILLED];

  for (let i = 0; i < createdPractices.length; i++) {
    const practice = createdPractices[i];
    const ownerProfile = practiceOwners[i];

    for (let j = 0; j < 2; j++) {
      const startDays = 10 + (i * 5) + (j * 20);
      const durationDays = 3 + Math.floor(Math.random() * 10);

      const listing = await prisma.replacementListing.create({
        data: {
          practiceId: practice.id,
          createdById: ownerProfile.id,
          startDate: getFutureDate(startDays),
          endDate: getFutureDate(startDays + durationDays),
          specialty: ownerProfile.specialty,
          status: getRandomItem(listingStatuses),
          urgent: j === 0 && i % 2 === 0,
          description: `Looking for a replacement for practice ${practice.name}. Position ${j === 0 ? 'urgent' : 'planned'}.`,
          maxApplications: 5 + j,
        },
      });
      createdListings.push(listing);
    }
  }

  console.log("--- Creating applications ---");

  const applicants = createdProfiles.filter(p => p.profileType === ProfileType.REPLACEMENT || p.profileType === ProfileType.BOTH);
  const applicationStatuses = [ApplicationStatus.PENDING, ApplicationStatus.PENDING, ApplicationStatus.SHORTLISTED, ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED];

  let applicationsCreated = 0;
  const maxApplications = 40;

  while (applicationsCreated < maxApplications) {
    const listing = getRandomItem(createdListings);
    const applicant = getRandomItem(applicants);

    const existing = await prisma.application.findUnique({
      where: {
        listingId_applicantId: {
          listingId: listing.id,
          applicantId: applicant.id,
        }
      }
    });

    if (!existing) {
      const status = getRandomItem(applicationStatuses);
      const isResponded = status === ApplicationStatus.ACCEPTED || status === ApplicationStatus.REJECTED;

      await prisma.application.create({
        data: {
          listingId: listing.id,
          applicantId: applicant.id,
          status: status,
          message: `Hello, I am interested in this replacement listing from ${listing.startDate.toLocaleDateString()} to ${listing.endDate.toLocaleDateString()}.`,
          viewedAt: status !== ApplicationStatus.PENDING ? new Date() : null,
          respondedAt: isResponded ? new Date() : null,
        }
      });
      applicationsCreated++;
    }
  }

  console.log("--- Seed completed successfully ---");
  console.log(`- ${createdProfiles.length} users and profiles created.`);
  console.log(`- ${createdPractices.length} practices created.`);
  console.log(`- ${createdListings.length} listings created.`);
  console.log(`- ${applicationsCreated} applications created.`);
  console.log("You can log in with any generated email (e.g., alice.martin@medecin.fr) and the password: Password123!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });