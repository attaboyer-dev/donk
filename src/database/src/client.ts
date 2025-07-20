// Repository exports

import { Pool } from "pg";

const PgPool = new Pool({
  host: "localhost",
  user: "devuser",
  database: "devdb",
  password: "devpass",
  port: 5432,
  max: 10,
});

export default PgPool;
