import { SCHEMA_VERSION } from './schema';

export type MigrationFn = (data: unknown) => unknown;

/**
 * Sequential schema migration dictionary keyed by incoming schemaVersion.
 */
export const migrations: Record<number, MigrationFn> = {
  // Example for future versions:
  // 1: (data: any) => ({ ...data, schemaVersion: 2, ... }),
};

/**
 * Runs sequential migrations if stored data is from an earlier schema version.
 */
export function migrateData(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') {
    return raw;
  }

  const record = raw as Record<string, unknown>;
  let version = typeof record.schemaVersion === 'number' ? record.schemaVersion : 0;

  let current = record;
  while (version < SCHEMA_VERSION) {
    const migration = migrations[version];
    if (!migration) {
      // No explicit migration found, bump version if compatible or let Zod validate
      break;
    }
    current = migration(current) as Record<string, unknown>;
    version = (current.schemaVersion as number) ?? version + 1;
  }

  return current;
}
