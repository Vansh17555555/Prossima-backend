const { writePool } = require('./lib/db');
const fs = require('fs');
const path = require('path');

async function initDb() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    console.log('Initializing database schema...');
    await writePool.query(schema);
    console.log('Database schema initialized successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
}

initDb();
