import { execSync } from 'child_process';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';

export interface TestDatabase {
  container: StartedPostgreSqlContainer;
  databaseUrl: string;
}

export async function startTestDatabase(): Promise<TestDatabase> {
  const container = await new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase('garage_flow_test')
    .withUsername('test')
    .withPassword('test')
    .start();

  const databaseUrl = container.getConnectionUri();

  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'inherit',
  });

  return { container, databaseUrl };
}

export async function stopTestDatabase(database: TestDatabase): Promise<void> {
  await database.container.stop();
}
