# E-Commerce API Performance Test

Performance testing project for an e-commerce REST API using **Apache JMeter**, **Node.js**, **Express**, **MySQL**, and **Docker**.

This project is designed to simulate realistic e-commerce user flows and evaluate API performance under increasing concurrent load.

## Project Overview

The application provides an e-commerce API with authentication, product, cart, and checkout functionality.

The JMeter performance test simulates the following end-to-end user journey:

```text
Login
  ↓
Get Products
  ↓
Add Product to Cart
  ↓
Get Cart
  ↓
Checkout
```

Each JMeter thread uses a separate test user account loaded dynamically from a CSV file.

## Tech Stack

* Node.js
* Express.js
* MySQL 8
* Apache JMeter
* Docker
* Docker Compose
* JWT Authentication

## Project Structure

```text
api-demo-performance-test/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── app.js
│   ├── .env
│   └── package.json
│
├── database/
│   └── init/
│
├── jmeter/
│   ├── data/
│   │   └── users.csv
│   ├── scripts/
│   │   └── generate-users.js
│   └── ecommerce-api-performance-test.jmx
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

## API Flow

### 1. Login

```http
POST /api/auth/login
```

Authenticates the user and returns a JWT token.

The token is extracted by JMeter using a JSON Extractor and stored as:

```text
${token}
```

### 2. Get Products

```http
GET /api/products
```

Retrieves available products.

The first product ID is extracted from the response and stored as:

```text
${productId}
```

### 3. Add Product to Cart

```http
POST /api/cart/items
```

Adds the selected product to the authenticated user's cart.

Example request body:

```json
{
  "productId": ${productId},
  "quantity": 1
}
```

### 4. Get Cart

```http
GET /api/cart
```

Retrieves the current user's cart.

### 5. Checkout

```http
POST /api/transactions/checkout
```

Checks out the authenticated user's cart and completes the transaction flow.

## JMeter Test Flow

The JMeter test plan uses the following sequence:

```text
CSV Data Set Config
        │
        ▼
      Login
        │
        ├── Extract JWT → ${token}
        │
        ▼
   Get Products
        │
        ├── Extract Product ID → ${productId}
        │
        ▼
Add Product to Cart
        │
        ▼
    Get Cart
        │
        ▼
    Checkout
```

The test flow has been validated successfully using multiple concurrent users.

## Test Data

Test user credentials are generated from the MySQL database using:

```text
jmeter/scripts/generate-users.js
```

The generated file is:

```text
jmeter/data/users.csv
```

Example format:

```csv
username,password
user00001,password123
user00002,password123
user00003,password123
```

The CSV is configured in JMeter using **CSV Data Set Config**.

Configuration:

```text
Variable Names: username,password
Delimiter: ,
Ignore First Line: True
Recycle on EOF: False
Stop Thread on EOF: True
Sharing Mode: All threads
```

The login request dynamically uses:

```json
{
  "username": "${username}",
  "password": "${password}"
}
```

This allows each JMeter thread to use a different test account.

## Generate Test Users CSV

The user generation script connects to the MySQL database and exports test users into a CSV file.

When running the script directly from the host machine:

```bash
JMETER_DB_HOST=localhost node jmeter/scripts/generate-users.js
```

The database hostname differs depending on where the script is executed.

From the host machine:

```text
localhost
```

From a Docker container:

```text
performance-test-mysql
```

## Running the Backend

Start the backend application:

```bash
cd backend
npm install
npm run dev
```

The API runs on:

```text
http://localhost:5001
```

## Running MySQL with Docker

Start the MySQL container:

```bash
docker compose up -d
```

Check running containers:

```bash
docker ps
```

Check MySQL logs:

```bash
docker logs performance-test-mysql
```

## Running JMeter

Open:

```text
jmeter/ecommerce-api-performance-test.jmx
```

in Apache JMeter.

Before running the performance test, make sure the backend and MySQL services are running.

For initial validation, the test plan can be executed with a small number of threads.

Example:

```text
Number of Threads: 3
Ramp-Up Period: 3 seconds
Loop Count: 1
```

The complete API flow should execute successfully for each user.

## Performance Test Plan

The planned load testing stages are:

| Test        | Concurrent Users |     Ramp-Up |
| ----------- | ---------------: | ----------: |
| Baseline    |               10 |  10 seconds |
| Medium Load |              100 |  60 seconds |
| Target Load |              500 | 300 seconds |

The following metrics will be evaluated:

* Average Response Time
* Minimum Response Time
* Maximum Response Time
* 90th Percentile
* 95th Percentile
* 99th Percentile
* Throughput
* Error Rate

## Performance Test Considerations

`View Results Tree` should only be used during debugging and functional validation.

For actual load testing, GUI listeners should be disabled to reduce JMeter resource consumption and prevent the JMeter client from becoming a performance bottleneck.

For load testing, JMeter should preferably be executed in non-GUI mode.

Example:

```bash
jmeter -n \
  -t jmeter/ecommerce-api-performance-test.jmx \
  -l results.jtl \
  -e \
  -o results/html-report
```

## Current Status

* [x] Backend REST API
* [x] MySQL database
* [x] Dockerized MySQL
* [x] JWT authentication
* [x] Product API
* [x] Cart API
* [x] Checkout API
* [x] JMeter test plan
* [x] JWT token extraction
* [x] Product ID extraction
* [x] Dynamic test users
* [x] CSV Data Set Config
* [x] API assertions
* [x] End-to-end API flow validation
* [ ] 10 concurrent user performance test
* [ ] 100 concurrent user performance test
* [ ] 500 concurrent user performance test
* [ ] CLI-based JMeter execution
* [ ] Dockerized JMeter execution
* [ ] HTML performance report
* [ ] CI/CD performance test integration

## Goal

The main goal of this project is to build a realistic and repeatable API performance testing pipeline for an e-commerce application.

The project will gradually increase load from baseline testing to 500 concurrent users while measuring API response time, throughput, and error rate.
