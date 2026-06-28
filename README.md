# 🛍️ Neela Fashion - Luxury E-Commerce Platform

A full-stack, production-ready e-commerce application built for a luxury fashion brand. Features a dynamic CMS, real-time inventory management, secure payment integration (PhonePe), and a responsive modern UI.

![Project Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![License](https://img.shields.io/badge/License-Proprietary-blue)

---

## 🚀 Tech Stack

### Frontend
*   ![React](https://img.shields.io/badge/React-18-blue) **React.js (Vite)**
*   ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) **TypeScript**
*   ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC) **Tailwind CSS**
*   **State Management:** React Context API

### Backend & Database
*   ![Node.js](https://img.shields.io/badge/Node.js-18-green) **Node.js**
*   ![Express](https://img.shields.io/badge/Express.js-4-white) **Express.js**
*   **ORM:** Sequelize
*   **Database:** AWS TiDB (MySQL Compatible)

### Services
*   💳 **Payment Gateway:** PhonePe (UPI, Cards, Netbanking)
*   📧 **Email Service:** Nodemailer (Gmail SMTP)
*   ☁️ **Hosting:** cPanel (Sofyhost)

---

## ✨ Key Features

### 👤 User Features
*   **Dynamic Product Catalog:** Filter by category, price, and search.
*   **Smart Cart & Wishlist:** Persists data for logged-in users (DB) and guests (LocalStorage).
*   **Secure Checkout:** Integrated with PhonePe for seamless payments.
*   **Order Tracking:** Real-time status updates via email.
*   **Invoice Generation:** Auto-generate PDF invoices after purchase.

### 🛠️ Admin Dashboard (CMS)
*   **Content Management:** Update Home banner, About Us, and Contact details without coding.
*   **Product Management:** Add/Edit/Delete products, manage stock, and upload images.
*   **Order Management:** View orders, change status (Shipped/Delivered), and handle cancellations.

---

## 📂 Project Structure

```bash
Neela Fashion/
│
├── 📂 backend/                 # Node.js API Server
│   ├── models/                 # Sequelize Database Models
│   ├── server.js               # Entry point
│   ├── paymentController.js    # PhonePe Logic
│   └── emailService.js         # SMTP Logic
│
└── 📂 neela-fashion/           # React Frontend
    ├── src/
    │   ├── components/         # Reusable UI Components
    │   ├── context/            # Global State
    │   └── pages/              # Route Pages
    ├── .env.development        # Local Config
    └── .env.production         # Live Config

🛠️ Local Development Setup

Follow these steps to run the project on your machine.
1. Prerequisites
Node.js (v18 or higher)
Git
2. Clone the Repository
code
Bash
git clone https://github.com/yourusername/neela-fashion.git
cd neela-fashion


