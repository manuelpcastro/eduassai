/** Applies pending migrations from ./drizzle to DATABASE_URL. */
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('Set DATABASE_URL to the database connection string.')
  process.exit(1)
}

const client = postgres(url, { prepare: false, max: 1 })
await migrate(drizzle(client), { migrationsFolder: './drizzle'})
await client.end()
console.log('Migrations applied.')
