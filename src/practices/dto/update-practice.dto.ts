import { createZodDto } from "nestjs-zod";
import { latLongsPaired } from "../../common/validation/lat-long";
import { CreatePracticeObjectSchema } from "./create-practice.dto";

export const UpdatePracticeSchema = CreatePracticeObjectSchema.partial().refine(
  latLongsPaired,
  {
    message: "latitude and longitude must be provided together",
    path: ["latitude"],
  },
);

export class UpdatePracticeDto extends createZodDto(UpdatePracticeSchema) {}
