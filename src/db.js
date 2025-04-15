import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'Juan',
  host: 'localhost',
  database: 'postgres',
  password: '79513',
  port: 5432,
});

try {
  const client = await pool.connect();
  console.log('Conectado');
  client.release();
} catch (err) {
  console.error('Error');
}

export default pool;
