import mysql from 'mysql2/promise';

let pool;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host:     process.env.MYSQL_HOST     || 'localhost',
      port:     Number(process.env.MYSQL_PORT) || 3306,
      user:     process.env.MYSQL_USER     || 'copaapp',
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE || 'copatracker',
      waitForConnections: true,
      connectionLimit: 10,
    });
  }
  return pool;
}

export function query(sql, params) {
  return getPool().execute(sql, params);
}
