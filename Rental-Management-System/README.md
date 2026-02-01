# 🛒 RentMart – Rental Management System

RentMart is a modern **rental marketplace platform** inspired by Amazon and Flipkart, where users can rent products and vendors can list products for rent after admin approval.  
The system is designed to demonstrate **real-world marketplace logic**, **clean UI/UX**, and **scalable architecture** within a hackathon environment.

---

## 🚀 Problem Statement

In many cities, people need products temporarily (tools, electronics, furniture, appliances), but buying them is expensive and inefficient.  
At the same time, many individuals and businesses own underutilized products that could generate income if rented.

**RentMart solves this problem by providing a centralized rental marketplace.**

---

## 🎯 Key Features

### 👤 User Features
- Common signup and login for all users
- Browse rental products
- View product details with rental pricing
- Rent products using date-based rental flow
- View rental history and status in dashboard

### 🏪 Vendor Features
- Any user can apply to become a vendor
- Vendor onboarding with mandatory GSTIN verification
- Admin approval required before accessing vendor dashboard
- Add, manage, and list products for rent
- Vendors can also rent products like normal users

### 👮 Admin Features (Advanced)
- View vendor onboarding requests
- Approve or reject vendors
- Control vendor access to the marketplace
- View system reports:
  - Total users
  - Total vendors
  - Total rentals
  - Total revenue (simulated)

---

## 🧩 Application Pages (Optimized & Merged)

1. Global Header / Navigation Bar  
2. Home Page  
3. Authentication Page (Signup + Login)  
4. Product Listing Page  
5. Product Details + Rental Flow  
6. User Dashboard  
7. Become a Vendor Page  
8. Vendor Dashboard (Add & Manage Products)  
9. Admin Panel (Vendor Approval & Reports)

> Related features are merged using tabs and sections to improve UX and reduce unnecessary navigation.

---

## 🛠️ Tech Stack

### Frontend
- React (Functional Components)
- React Router
- HTML5, CSS3
- JavaScript (ES6+)

### Backend (Prototype / Mock)
- Node.js
- Express.js
- REST-style API structure
- In-memory / mock data storage for demo

> Backend logic is designed to be easily adaptable to Odoo (Python + PostgreSQL).

---

## 🎨 UI / UX Design

- Familiar marketplace layout
- Clean card-based design
- Clear information hierarchy
- Minimal colors and professional spacing
- Focus on usability and trust

---

## 🔐 Business Rules Implemented

- No role selection during signup
- All users start as normal users
- Vendor access requires admin approval
- Rental is date-based (start & end date)
- Invalid rental dates are restricted
- Role-based UI rendering

---

## 🧪 Demo Data

- GSTIN used for demo purposes only
- Admin approval is simulated for hackathon demo
- Reports use mock values to demonstrate logic

---

## 📂 Project Setup

```bash
# Clone repository
git clone https://github.com/25cs056-hardik/Rental-Management-System.git

# Install dependencies
npm install

# Run development server
npm run dev