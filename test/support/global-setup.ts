import { startTestDatabase, type TestDatabase } from './postgres-test-container';

declare global {
  // eslint-disable-next-line no-var
  var __TEST_DATABASE__: TestDatabase | undefined;
}

export default async function globalSetup(): Promise<void> {
  const testDatabase = await startTestDatabase();
  process.env.DATABASE_URL = testDatabase.databaseUrl;
  global.__TEST_DATABASE__ = testDatabase;
}
