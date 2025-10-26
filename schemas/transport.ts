import { z } from 'zod';

const HttpTransportSchema = z.object({
  type: z.literal('http'),
  host: z.union([z.string(), z.array(z.string())]).optional(),
  path: z.string().optional(),
  method: z.string().optional(),
  headers: z.record(z.string(), z.string()).optional(),
  idle_timeout: z.string().optional(),
  ping_timeout: z.string().optional(),
});

const WsTransportSchema = z.object({
  type: z.literal('ws'),
  path: z.string().optional(),
  headers: z.record(z.string(), z.string()).optional(),
  max_early_data: z.number().int().optional(),
  early_data_header_name: z.string().optional(),
});

const QuicTransportSchema = z.object({
  type: z.literal('quic'),
});

const GrpcTransportSchema = z.object({
  type: z.literal('grpc'),
  service_name: z.string().optional(),
  idle_timeout: z.string().optional(),
  ping_timeout: z.string().optional(),
  permit_without_stream: z.boolean().optional(),
});

const HttpUpgradeTransportSchema = z.object({
  type: z.literal('httpupgrade'),
  host: z.string().optional(),
  path: z.string().optional(),
  headers: z.record(z.string(), z.string()).optional(),
});

export const SingBoxTransportSchema = z.discriminatedUnion('type', [
  HttpTransportSchema,
  WsTransportSchema,
  QuicTransportSchema,
  GrpcTransportSchema,
  HttpUpgradeTransportSchema,
]);
