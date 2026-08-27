# Inventory Management System — MERN

A beginner-friendly inventory management system for small retail stores and warehouses.

## Features

- JWT login
- Dashboard
- Product CRUD
- Supplier CRUD
- Purchases
- Sales
- Automatic stock increase/decrease
- Stock history
- Low-stock alerts
- Basic reports
- Fast-moving product detection
- Basic reorder suggestions
- Chart.js dashboard charts
- Admin profile

## Technology

- Frontend: React + Vite + React Router + Axios + Chart.js
- Backend: Node.js + Express + MongoDB + Mongoose
- Authentication: JWT + bcryptjs

## 1. Requirements

Install:

1. Node.js 18+ (20+ recommended)
2. MongoDB Community Server OR use MongoDB Atlas
3. VS Code
4. Git (optional)

## 2. Project setup

This project has:

inventory-management-system/
  backend/
  frontend/

Open two terminals.

### Terminal 1 — Backend

cd backend
npm install
copy .env.example .env

Edit `.env`:

MONGO_URI=mongodb://127.0.0.1:27017/inventory_management
JWT_SECRET=change_this_to_a_long_random_secret
PORT=5000

Then:

npm run seed
npm run dev

### Terminal 2 — Frontend

cd frontend
npm install
npm run dev

Open the URL shown by Vite, normally:

http://localhost:5173

## 3. Demo login

After running `npm run seed`:

Email: admin@example.com
Password: admin123

## 4. If using MongoDB Atlas

Replace MONGO_URI with your Atlas connection string, for example:

mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/inventory_management

Do not commit `.env`.

## 5. How the system works

Purchase:
stock = stock + purchased quantity

Sale:
stock = stock - sold quantity

A sale is rejected if there is not enough stock.

Low stock:
current stock <= minimum stock

Fast moving:
products are ranked by quantity sold in the selected report period.

Reorder suggestion:
a product is suggested when it is low-stock and has sales, or when its sales velocity indicates that current stock is low relative to recent demand.

## 6. API overview

POST   /api/auth/login
GET    /api/auth/me

GET    /api/products
POST   /api/products
GET    /api/products/:id
PUT    /api/products/:id
DELETE /api/products/:id

GET    /api/suppliers
POST   /api/suppliers
GET    /api/suppliers/:id
PUT    /api/suppliers/:id
DELETE /api/suppliers/:id

GET    /api/purchases
POST   /api/purchases

GET    /api/sales
POST   /api/sales

GET    /api/stock-history

GET    /api/reports

GET    /api/profile
PUT    /api/profile

## 7. Suggested development order

1. Run MongoDB
2. Start backend
3. Seed demo admin
4. Start frontend
5. Login
6. Add suppliers
7. Add products
8. Record purchases
9. Record sales
10. Check stock history
11. Check low-stock alerts
12. Check dashboard/reports

## 8. Production notes

This is an educational starter project. Before production use, add stronger validation, rate limiting, secure cookie-based authentication, audit logging, backups, role-based permissions, tests, pagination, and more robust transaction handling.
