🛍️ Neela Fashion - Luxury E-Commerce Platform
A full-stack, production-ready e-commerce application built for a luxury fashion brand. Features a dynamic CMS, real-time inventory management, secure payment integration (PhonePe), and a responsive modern UI.
![alt text](https://via.placeholder.com/1000x300?text=Neela+Fashion+Preview)

🚀 Tech Stack
Frontend:
![alt text](https://img.shields.io/badge/React-18-blue)
React.js (Vite)
![alt text](https://img.shields.io/badge/TypeScript-5-blue)
TypeScript
![alt text](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC)
Tailwind CSS
State Management: React Context API
Backend:
![alt text](https://img.shields.io/badge/Node.js-18-green)
Node.js
![alt text](https://img.shields.io/badge/Express.js-4-white)
Express.js
ORM: Sequelize
Database: AWS TiDB (MySQL Compatible)
Services:
💳 Payment Gateway: PhonePe (UPI, Cards, Netbanking)
📧 Email Service: Nodemailer (Gmail SMTP)
☁️ Hosting: cPanel (Sofyhost)
✨ Key Features
👤 User Features
Dynamic Product Catalog: Filter by category, price, and search.
Smart Cart & Wishlist: Persists data for logged-in users (DB) and guests (LocalStorage).
Secure Checkout: Integrated with PhonePe for seamless payments.
Order Tracking: Real-time status updates via email.
Invoice Generation: Auto-generate PDF invoices after purchase.
🛠️ Admin Dashboard (CMS)
Content Management: Update Home banner, About Us, and Contact details without coding.
Product Management: Add/Edit/Delete products, manage stock, and upload images.
Order Management: View orders, change status (Shipped/Delivered), and handle cancellations.
Analytics: View total revenue, recent orders, and low stock alerts.
📂 Project Structure
code
Bash
Neela Fashion/
│
├── 📂 backend/                 # Node.js API Server
│   ├── models/                 # Sequelize Database Models
│   ├── server.js               # Entry point
│   ├── paymentController.js    # PhonePe Logic
│   ├── emailService.js         # SMTP Logic
│   └── .env                    # Local Secrets (Not synced)
│
└── 📂 neela-fashion/           # React Frontend
    ├── src/
    │   ├── components/         # Reusable UI Components
    │   ├── context/            # Global State (Auth, Cart, CMS)
    │   └── pages/              # Route Pages (Home, Shop, Admin)
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
3. Backend Setup
Navigate to the backend folder:
code
Bash
cd backend
Install dependencies:
code
Bash
npm install
Create a .env file in the backend/ folder and add:
code
Env
PORT=5000
DB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
DB_USER=your_tidb_user
DB_PASSWORD=your_tidb_password
DB_NAME=neela_fashion_db
DB_PORT=4000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
ADMIN_EMAIL=admin_email@gmail.com
PHONEPE_MERCHANT_ID=PGTESTPAYUAT
PHONEPE_SALT_KEY=099eb0cd-02cf-4e2a-8aca-3e6c6aff0399
PHONEPE_SALT_INDEX=1
PHONEPE_HOST_URL=https://api-preprod.phonepe.com/apis/pg-sandbox
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
Start the server:
code
Bash
node server.js
4. Frontend Setup
Open a new terminal and navigate to the frontend folder:
code
Bash
cd neela-fashion
Install dependencies:
code
Bash
npm install
Ensure .env.development exists in the root with:
code
Env
VITE_API_URL=http://localhost:5000
Start the app:
code
Bash
npm run dev
🚀 Deployment Guide (cPanel / Sofyhost)
Phase 1: Backend (API)
Create a subdomain in cPanel: api.neelafashion.com.
Go to "Setup Node.js App".
Create App:
Node Version: 18.x or 20.x
Mode: Production
App Root: backend
Startup File: server.js
Upload backend.zip (exclude node_modules), extract it, and click "Run NPM Install".
Important: Add all variables from your .env file into the "Environment Variables" section in cPanel settings.
Note: Change PHONEPE_HOST_URL to https://api.phonepe.com/apis/hermes (Live URL).
Phase 2: Frontend (Website)
In your local terminal, run:
code
Bash
npm run build
This creates a dist folder.
Compress the contents of the dist folder into frontend.zip.
Upload frontend.zip to the public_html folder in cPanel File Manager.
Extract the files. Ensure .htaccess is present for routing.
🔐 Admin Access
URL: /admin
Default Email: neelafashion@gmail.com
Default Password: admin-neela
(Change these immediately after first login from the Admin Settings panel)
📜 License
This project is proprietary software developed for Neela Fashion. Unauthorized copying or distribution is strictly prohibited.
Developed by: [S.Rishi Aravintha / Skenetic Digital]
