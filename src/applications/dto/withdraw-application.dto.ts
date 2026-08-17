import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const WithdrawApplicationSchema = z.object({
    withdrawnReason: z.string().optional().describe('Optional reason for withdrawing'),
});

export class WithdrawApplicationDto extends createZodDto(WithdrawApplicationSchema) { }