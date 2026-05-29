import mysql from 'mysql2/promise';
const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await conn.execute('SELECT id, code, type, isActive, CAST(isActive AS UNSIGNED) as isActive_int FROM passcodes');
console.log(JSON.stringify(rows, null, 2));
await conn.end();
