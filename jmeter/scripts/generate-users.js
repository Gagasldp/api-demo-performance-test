const fs = require('fs');
const path = require('path');

require('../../backend/node_modules/dotenv').config({
  path: path.join(__dirname, '../../backend/.env'),
});

const mysql = require('../../backend/node_modules/mysql2/promise');

async function generateUsersCsv() {
  const connection = await mysql.createConnection({
  host: process.env.JMETER_DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

  const [users] = await connection.execute(`
    SELECT username, upassword
    FROM users
    ORDER BY id
  `);

  const outputPath = path.join(
    __dirname,
    '../data/users.csv'
  );

  const csvContent = [
    'username,password',
    ...users.map(
      user => `${user.username},${user.upassword}`
    ),
  ].join('\n');

  fs.writeFileSync(outputPath, csvContent);

  console.log(`Generated ${users.length} users`);
  console.log(`Output: ${outputPath}`);

  await connection.end();
}

generateUsersCsv().catch(error => {
  console.error('Failed to generate users CSV:', error);
  process.exit(1);
});