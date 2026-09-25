# 🚀 StoreCraft - Multi-Tenant E-Commerce Platform

StoreCraft is a powerful, modern, multi-tenant e-commerce platform built for small business owners and online merchants in Sri Lanka. It enables anyone to launch a customized online store with 1-click WhatsApp ordering, Koko / Mintpay installments, and Supabase cloud database integration.

---

## ✨ Features

- 🛍️ **Multi-Tenant Architecture**: Support for unlimited independent merchants with unique URLs (`store.html?shop=slug`).
- 🎛️ **Merchant Admin Portal**: Dashboard analytics, product CRUD, out-of-stock toggles, and store customizer.
- 💬 **1-Click WhatsApp Fulfillment**: Direct WhatsApp customer notification links.
- ⚡ **Supabase Cloud Database**: PostgreSQL cloud database with local JSON/localStorage fallback protection.
- 💳 **Sri Lankan Payment Support**: Cash on Delivery, Online Card Payment, and Koko / Mintpay 3x installments display.

---

## 🛠️ Quick Start & Setup

### 1. Install & Run Locally
```bash
# Clone the repository
git clone https://github.com/your-username/storecraft-ecommerce.html

# Navigate to project folder
cd "website template.com"

# Start the server
node server.js
```

Open your browser:
- **Platform Landing Page**: `http://localhost:3000/index.html`
- **Sample Store 1**: `http://localhost:3000/store.html?shop=simplytek`
- **Sample Store 2**: `http://localhost:3000/store.html?shop=mobilehub`
- **Merchant Admin Portal**: `http://localhost:3000/admin/index.html`

### 2. Connect Supabase Cloud Database (Optional)
1. Run the SQL script in `data/supabase_schema.sql` inside your **Supabase SQL Editor**.
2. Copy `config/keys.example.json` to `config/keys.json` and fill in your Supabase credentials:

```json
{
  "SUPABASE_URL": "https://your-project-ref.supabase.co",
  "SUPABASE_KEY": "your-supabase-anon-key"
}
```

---

## 📄 License
MIT License
