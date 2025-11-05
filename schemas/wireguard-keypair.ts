import { z } from 'zod';

export const WireguardKeypairSchema = z.object({
  id: z.string(),
  publicKey: z.string(),
  privateKey: z.string(),
  createdAt: z.number(),
});

export type WireguardKeypair = z.infer<typeof WireguardKeypairSchema>;

export const CreateWireguardKeypairSchema = z.object({
  publicKey: z.string(),
  privateKey: z.string(),
});

export type CreateWireguardKeypair = z.infer<typeof CreateWireguardKeypairSchema>;
