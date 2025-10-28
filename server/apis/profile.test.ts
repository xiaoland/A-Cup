import { describe, it, expect, vi, beforeAll } from 'vitest';
import app from '../index';
import { sign } from 'hono/jwt';
import { v4 as uuidv4 } from 'uuid';
import { profiles, outbounds as outboundsTable, ruleSets as ruleSetsTable } from '../db/schema';

// Mock data
const mockOutbounds = [
  {
    id: 1,
    readableBy: '[]',
    writeableBy: '[]',
    name: 'vless-out',
    region: 'us',
    provider: 'test',
    type: 'vless',
    server: '1.1.1.1',
    server_port: 443,
    credential: JSON.stringify({ uuid: uuidv4(), flow: 'xtls-rprx-vision' }),
    tls: '{}',
    mux: '{}',
    other: '{}',
  },
];

const mockRuleSets = [
  {
    id: 3,
    readableBy: '[]',
    writeableBy: '[]',
    tag: 'my-rules',
    type: 'inline',
    format: null,
    content: '[]',
    download_detour: 0,
    update_interval: 0,
  },
];

const mockProfile = { id: '123', name: 'test-profile', outbounds: '[1]', rule_sets: '[3]' };

const mockDrizzle = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn(function(table) {
    if (table === outboundsTable) {
      return { where: vi.fn().mockResolvedValue(mockOutbounds) };
    }
    if (table === ruleSetsTable) {
      return { where: vi.fn().mockResolvedValue(mockRuleSets) };
    }
    if (table === profiles) {
        return { where: vi.fn().mockReturnThis() };
    }
    return this;
  }),
  where: vi.fn().mockReturnThis(),
  get: vi.fn().mockResolvedValue(mockProfile),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockResolvedValue(true),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  delete: vi.fn(() => ({ where: vi.fn().mockResolvedValue(true) })),
};

vi.mock('drizzle-orm/d1', () => ({
  drizzle: vi.fn(() => mockDrizzle),
}));


describe('Profile API', () => {
  const env = {
    DB: {},
    R2: {
      put: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
    },
    JWT_SECRET: 'test-secret',
    R2_PUBLIC_URL: 'https://r2.public.url',
  };

  let validToken: string;

  beforeAll(async () => {
    validToken = await sign({ sub: '1234567890', name: 'John Doe', iat: 1516239022, exp: 9999999999 }, env.JWT_SECRET);
    // Mock for get profile
    (mockDrizzle.from as any).mockImplementation((table: any) => {
      if (table === profiles) {
        return {
          where: () => ({
            get: () => Promise.resolve({ ...mockProfile, createdBy: '1234567890', tags: '[]', outbounds: '[]', rule_sets: '[]' })
          })
        };
      }
      if (table === outboundsTable) {
        return { where: vi.fn().mockResolvedValue(mockOutbounds) };
      }
      if (table === ruleSetsTable) {
        return { where: vi.fn().mockResolvedValue(mockRuleSets) };
      }
    });
  });

  const createProfileDto = {
    name: 'test-profile',
    tags: ['test'],
    outbounds: [1],
    route: {
      rule_set: [3],
    },
    dns: {
      servers: [{ type: 'udp', tag: 'dns-udp', address: '8.8.8.8', detour: 'direct' }],
      rules: [],
    },
    inbounds: [{ type: 'mixed', tag: 'mixed-in', listen: '127.0.0.1', listen_port: 1080 }],
  };

  it('should create a new profile', async () => {
    const req = new Request('http://localhost/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${validToken}` },
      body: JSON.stringify(createProfileDto),
    });

    const res = await app.fetch(req, { ...env, DB: {} });
    expect(res.status).toBe(201);
  });

  it('should get a profile', async () => {
    const req = new Request('http://localhost/api/profiles/123', {
      method: 'GET',
      headers: { Authorization: `Bearer ${validToken}` },
    });

    const res = await app.fetch(req, { ...env, DB: {} });
    expect(res.status).toBe(200);
  });

  it('should update a profile', async () => {
    (mockDrizzle.update as any).mockImplementation(() => ({
        set: () => ({
            where: () => Promise.resolve()
        })
    }));
    const req = new Request('http://localhost/api/profiles/123', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${validToken}` },
      body: JSON.stringify(createProfileDto),
    });

    const res = await app.fetch(req, { ...env, DB: {} });
    expect(res.status).toBe(204);
  });

  it('should delete a profile', async () => {
    const req = new Request('http://localhost/api/profiles/123', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${validToken}` },
    });

    const res = await app.fetch(req, { ...env, DB: {} });
    expect(res.status).toBe(204);
  });
});
