// Create PostgreSQL Connection Pool here !
import * as pg from "pg";
const { Pool } = pg.default;

const connectionPool = new Pool({
  connectionString:
    "postgresql://postgres:naranut9959@db.oxlzilbfpmwakfqpcwsy.supabase.co:5432/postgres",
});

export default connectionPool;
