import { defineComputeConfig } from "@prisma/compute-sdk/config";

export default defineComputeConfig({
  app: {
    name: "kineo-nest-backend",
    framework: "nestjs",
    httpPort: 3000,
    env: ".env",
  },
});
