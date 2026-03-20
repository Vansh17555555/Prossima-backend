const { Pool } = require("pg");
require("dotenv").config();

/**
 * writePool: Always connects to the primary database.
 * Used for all INSERT, UPDATE, DELETE operations.
 */
const writePool = new Pool({
  connectionString: process.env.DB_PRIMARY_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: {
    rejectUnauthorized: false
  }
});

/**
 * readPool: Connects to a read replica if available,
 * otherwise falls back to the primary database.
 * Used for all SELECT queries.
 */
const readPool = new Pool({
  connectionString: process.env.DB_REPLICA_URL || process.env.DB_PRIMARY_URL,
  max: 50,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: {
    rejectUnauthorized: false
  }
});

// Log pool errors to prevent process crashes
writePool.on("error", (err) => {
  console.error("Unexpected error on idle write client", err);
});

readPool.on("error", (err) => {
  console.error("Unexpected error on idle read client", err);
});

module.exports = {
  writePool,
  readPool,
  // Helper to ensure we use the right pool
  query: (text, params) => {
    throw new Error(
      "Direct query not allowed. Use readPool or writePool explicitly.",
    );
  },
};
