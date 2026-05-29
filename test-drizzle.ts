import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { eq, and } from 'drizzle-orm';
import { passcodes } from './drizzle/schema';

async function main() {
  const pool = mysql.createPool(process.env.DATABASE_URL as string);
  const db = drizzle(pool);

  const result = await db.select({
    id: passcodes.id,
    code: passcodes.code,
    type: passcodes.type,
    isActive: passcodes.isActive,
  }).from(passcodes).where(and(eq(passcodes.code, 't101'), eq(passcodes.isActive, true)));

  console.log('Drizzle result with isActive=true:', JSON.stringify(result, null, 2));

  // isActive=1で比較
  const result2 = await db.select({
    id: passcodes.id,
    code: passcodes.code,
    type: passcodes.type,
    isActive: passcodes.isActive,
  }).from(passcodes).where(eq(passcodes.code, 't101'));

  console.log('Drizzle result without isActive filter:', JSON.stringify(result2, null, 2));

  await pool.end();
}

main().catch(console.error);
