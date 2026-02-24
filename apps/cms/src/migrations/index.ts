import * as migration_20260223_153048_init_postgres_schema from './20260223_153048_init_postgres_schema';

export const migrations = [
  {
    up: migration_20260223_153048_init_postgres_schema.up,
    down: migration_20260223_153048_init_postgres_schema.down,
    name: '20260223_153048_init_postgres_schema',
  },
];
