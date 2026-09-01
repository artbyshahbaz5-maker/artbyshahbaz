# Art By Shahbaz – Node.js Website + Admin Panel

Aapki HTML/CSS website ko **Node.js** mein convert kar diya gaya hai, aur **Admin Panel** server se connect hai.

## Features

- ✅ Website Node.js server se chalti hai
- ✅ Admin Panel se products, categories, gallery, reviews, FAQs, settings change karo
- ✅ Jo bhi change / add karoge, **turant website pe show** hoga (server pe save hota hai)
- ✅ Data `data/data.json` file mein store hota hai (persistent)
- ✅ Koi external package install karne ki zaroorat nahi (pure Node.js)

## Kaise chalayein

```bash
cd artbyshahbaz
node server.js
```

Browser mein kholo: **http://localhost:3000**

### Admin Panel

1. Website pe logo pe **5 baar click** karo (ya URL mein `#admin` add karo)
2. Login:
   - **Email:** `admin@artbyshahbaz.com`
   - **Password:** `admin123`
3. Products / Gallery / Settings etc. edit karo → **Save**
4. Page refresh karo – changes dikhengi

## Folder Structure

```
artbyshahbaz/
├── server.js          ← Node.js server + API
├── package.json
├── data/
│   └── data.json      ← Saara content yahan save hota hai
├── public/
│   └── index.html     ← Frontend (admin panel ke sath)
└── uploads/           ← Future image uploads
```

## API Endpoints

| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| GET    | /api/data             | Public website data      |
| POST   | /api/admin/login      | Admin login              |
| PUT    | /api/admin/data       | Full data save (admin)   |
| PUT    | /api/admin/settings   | Update settings          |
| PUT    | /api/admin/social     | Update social links      |
| PUT    | /api/admin/account    | Change email/password    |

## Password change

Admin panel → **Account** tab se email/password change kar sakte ho.

## Deploy (VPS / cPanel / Railway / Render)

1. Project upload karo
2. `node server.js` ya `npm start`
3. Port 3000 (ya environment `PORT`) open rakho

Agar aapko MongoDB / PostgreSQL chahiye ho to bata dena – upgrade kar denge.
