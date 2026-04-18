import { z } from 'zod';

export const CreateWalletSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid EVM address'),
  label: z.string().min(1).max(100).optional(),
});

export type CreateWalletDto = z.infer<typeof CreateWalletSchema>;
