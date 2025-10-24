import { z } from 'zod';
import { Z } from 'zod-class';
import { exportProfileToR2 } from '../fund/profile-export';

export class Profile extends Z.class({
  id: z.string(),
  created_by: z.number(),
  name: z.string(),
  tags: z.preprocess(
    (v) => (typeof v === 'string' ? JSON.parse(v) : v),
    z.array(z.string())
  ),
  outbounds: z.preprocess(
    (v) => (typeof v === 'string' ? JSON.parse(v) : v),
    z.array(z.number())
  ),
  rule_sets: z.preprocess(
    (v) => (typeof v === 'string' ? JSON.parse(v) : v),
    z.array(z.number())
  ),
}) {
  exportToSingBox(db: any, env: any, baseConfig?: any) {
    return exportProfileToR2(db, env, this.id, baseConfig);
  }
}
