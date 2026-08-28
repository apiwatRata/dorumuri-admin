import { drizzle } from 'drizzle-orm/postgres-js'
import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.DB_HOST!,       
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER!,       
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,   
  ssl: { rejectUnauthorized: false }, 
  max: 20,              
  idleTimeoutMillis: 30000, 
  connectionTimeoutMillis: 10000, 
});

export const db = drizzle({ client: pool });