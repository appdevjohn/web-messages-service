import pg, { Pool } from 'pg'

const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'messages',
  password: process.env.PGPASSWORD || 'password',
  port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
})

const query = (
  query: string,
  params: (string | boolean | null | undefined)[]
): Promise<pg.QueryResult> => {
  return pool.query(query, params)
}

export default query
