const pool = require('../config/database');

const TOTAL_USERS = 10000;
const TOTAL_PRODUCTS = 10000;
const BATCH_SIZE = 1000;

const generateUsers = (start, count) => {
  const users = [];

  for (let i = start; i < start + count; i++) {
    users.push([
      `user${i}`,
      'password123'
    ]);
  }

  return users;
};

const generateProducts = (start, count) => {
  const products = [];

  for (let i = start; i < start + count; i++) {
    products.push([
      `Product ${i}`,
      `Description for Product ${i}`,
      (Math.random() * 100000 + 10000).toFixed(2),
      Math.floor(Math.random() * 1000) + 1
    ]);
  }

  return products;
};

const seedUsers = async () => {
  console.log(`Seeding ${TOTAL_USERS} users...`);

  for (let start = 1; start <= TOTAL_USERS; start += BATCH_SIZE) {
    const count = Math.min(BATCH_SIZE, TOTAL_USERS - start + 1);

    const users = generateUsers(start, count);

    await pool.query(
      'INSERT INTO users (username, upassword) VALUES ?',
      [users]
    );

    console.log(`Users inserted: ${Math.min(start + count - 1, TOTAL_USERS)}/${TOTAL_USERS}`);
  }

  console.log('Users seeding completed.');
};

const seedProducts = async () => {
  console.log(`Seeding ${TOTAL_PRODUCTS} products...`);

  for (let start = 1; start <= TOTAL_PRODUCTS; start += BATCH_SIZE) {
    const count = Math.min(BATCH_SIZE, TOTAL_PRODUCTS - start + 1);

    const products = generateProducts(start, count);

    await pool.query(
      `INSERT INTO products 
      (pname, pdescription, price, stock) 
      VALUES ?`,
      [products]
    );

    console.log(
      `Products inserted: ${Math.min(start + count - 1, TOTAL_PRODUCTS)}/${TOTAL_PRODUCTS}`
    );
  }

  console.log('Products seeding completed.');
};

const seed = async () => {
  try {
    console.log('Starting database seeding...\n');

    await seedUsers();
    console.log('');

    await seedProducts();
    console.log('');

    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await pool.end();
  }
};

seed();