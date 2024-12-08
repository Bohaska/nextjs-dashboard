import bcrypt from 'bcrypt';
import { db } from '@vercel/postgres';
import { invoices, customers, revenue, users, stocks, currencies } from '../lib/placeholder-data';

const client = await db.connect();

async function seedUsers() {
  await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await client.sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;

  const insertedUsers = await Promise.all(users.map(async (user) => {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    return client.sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
        ON CONFLICT (id) DO NOTHING;
      `;
  }),
  );

  return insertedUsers;
}

async function seedInvoices() {
  await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await client.sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      customer_id UUID NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );
  `;

  const insertedInvoices = await Promise.all(invoices.map(
      (invoice) => client.sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
        ON CONFLICT (id) DO NOTHING;
      `,),
  );

  return insertedInvoices;
}

async function seedCustomers() {
  await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await client.sql`
    CREATE TABLE IF NOT EXISTS customers (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    );
  `;

  const insertedCustomers = await Promise.all(customers.map(
      (customer) => client.sql`
        INSERT INTO customers (id, name, email, image_url)
        VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
        ON CONFLICT (id) DO NOTHING;
      `,),
  );

  return insertedCustomers;
}

async function seedRevenue() {
  await client.sql`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `;

  const insertedRevenue = await Promise.all(revenue.map(
      (rev) => client.sql`
        INSERT INTO revenue (month, revenue)
        VALUES (${rev.month}, ${rev.revenue})
        ON CONFLICT (month) DO NOTHING;
      `,),
  );

  return insertedRevenue;
}

async function seedStocks() {
  await client.sql`
    CREATE TABLE IF NOT EXISTS stocks (
      ticker VARCHAR(255) NOT NULL UNIQUE PRIMARY KEY,
      company_name VARCHAR(255) NOT NULL,
      market VARCHAR(255) NOT NULL,
      stock_type VARCHAR(255) NOT NULL,
      currency_code CHAR(3) NOT NULL,
      FOREIGN KEY (currency_code) REFERENCES currencies(currency_code) ON DELETE CASCADE;
    );
  `;

  const insertedStocks = await Promise.all(stocks.map(
      (stock) => client.sql`
        INSERT INTO stocks (ticker, company_name, market, stock_type, currency_code)
        VALUES (${stock.ticker}, ${stock.company_name}, ${stock.market}, ${stock.stock_type}, ${stock.currency_code})
        ON CONFLICT (ticker) DO NOTHING;
      `,),
  );

  return insertedStocks;
}

async function seedCurrencies() {
  await client.sql`
    CREATE TABLE IF NOT EXISTS currencies (
      currency_code CHAR(3) NOT NULL PRIMARY KEY, -- ISO 4217 currency code
      currency_name VARCHAR(255) NOT NULL,       -- Full name of the currency
      conversion_rate_to_cny DECIMAL(10, 6) NOT NULL, -- Conversion rate to USD
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Timestamp of last update
    );
  `;

  const insertedCurrencies = await Promise.all(currencies.map(
      (currency) => client.sql`
        INSERT INTO stocks (currency_code, currency_name, conversion_rate_to_cny)
        VALUES (${currency.currency_code}, ${currency.currency_name}, ${currency.conversion_rate_to_cny})
        ON CONFLICT (currency_code) DO NOTHING;
      `,),
  );

  return insertedCurrencies;
}

export async function GET() {
  try {
    await client.sql`BEGIN`;
    /* await seedUsers();
    await seedCustomers();
    await seedInvoices();
    await seedRevenue(); */
    await seedStocks()
    await seedCurrencies()
    await client.sql`COMMIT`;

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    await client.sql`ROLLBACK`;
    return Response.json({ error }, { status: 500 });
  }
}
