import { stopTestDatabase, type TestDatabase } from './postgres-test-container';

declare global {
  // eslint-disable-next-line no-var
  var __TEST_DATABASE__: TestDatabase | undefined;
}

export default async function globalTeardown(): Promise<void> {
  if (global.__TEST_DATABASE__) {
    await stopTestDatabase(global.__TEST_DATABASE__);
  }
}
