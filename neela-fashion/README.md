Neela Fashion/
│
├── 📂 backend/                     (Node.js & TiDB Backend)
│   ├── node_modules/
│   ├── .env                        (Database & Email Credentials)
│   ├── Cart.js                     (Cart Model)
│   ├── Category.js                 (Category Model)
│   ├── CMS.js                      (Content Management Model)
│   ├── database.js                 (Sequelize DB Connection)
│   ├── emailService.js             (Nodemailer Logic)
│   ├── Order.js                    (Order Model)
│   ├── Product.js                  (Product Model)
│   ├── Review.js                   (Review Model)
│   ├── server.js                   (Main Server Entry Point)
│   ├── User.js                     (User Model)
│   ├── package-lock.json
│   └── package.json
│
└── 📂 neela-fashion/               (React + Vite Frontend)
    ├── 📂 node_modules/
    │
    ├── 📂 components/              (Reusable UI Components)
    │   ├── FloatingContact.tsx
    │   ├── Footer.tsx
    │   ├── Navbar.tsx
    │   └── ProductCard.tsx
    │
    ├── 📂 context/                 (Global State Management)
    │   ├── AuthContext.tsx
    │   ├── CartContext.tsx
    │   ├── CMSContext.tsx
    │   └── WishlistContext.tsx
    │
    ├── 📂 pages/                   (Main Website Pages)
    │   ├── About.tsx
    │   ├── Admin.tsx
    │   ├── Cart.tsx
    │   ├── Checkout.tsx
    │   ├── Contact.tsx
    │   ├── Home.tsx
    │   ├── Login.tsx
    │   ├── OrderSuccess.tsx
    │   ├── ProductDetail.tsx
    │   ├── Profile.tsx
    │   ├── Shop.tsx
    │   ├── Signup.tsx
    │   └── Wishlist.tsx
    │
    ├── 📂 services/                (Helper Functions)
    │   └── data.ts                 (Dummy Data)
    │
    ├── .env.local                  (Frontend Env Variables - API URL)
    ├── .gitignore
    ├── App.tsx                     (Main App Router)
    ├── index.html                  (Entry HTML)
    ├── index.tsx                   (React DOM Render)
    ├── metadata.json
    ├── package-lock.json
    ├── package.json
    ├── README.md
    ├── tsconfig.json               (TypeScript Config)
    ├── types.ts                    (TypeScript Interfaces)
    └── vite.config.ts              (Vite Configuration)


PHONEPE_ANT_ID=PGTESTPAYUAT
PHONEPE_SALT_KEY=099eb0cd-02cf-4e2a-8aca-3e6c6aff0399
PHONEPE_SALT_INDEX=1
PHONEPE_HOST_URL=https://api-preprod.phonepe.com/apis/pg-sandbox

PHONEPE_ANT_ID=M227Q3R5FYG6Y
PHONEPE_SALT_KEY=faab0830-ddf7-4b1e-890c-cbc0a3357fba
PHONEPE_SALT_INDEX=1
PHONEPE_HOST_URL=https://api.phonepe.com/apis/hermes