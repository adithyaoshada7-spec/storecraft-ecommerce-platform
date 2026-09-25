// Admin Panel Data & Settings Store (SimplyTek Admin)

// Store Configuration default state
const DEFAULT_STORE_SETTINGS = {
    storeName: "SIMPLYTEK",
    tagline: "Online Tech Store",
    hotline: "+94 77 123 4567",
    whatsappNumber: "94771234567",
    email: "support@simplytek.lk",
    announcementText: "Free Islandwide Delivery on orders over Rs. 10,000 | Cash on Delivery Available",
    currency: "LKR",
    enableKoko: true,
    enableCOD: true
};

// Initial Sample Orders list for non-tech merchant to see in action
const INITIAL_ORDERS = [
    {
        id: "ST-84920",
        date: "2026-09-24 08:15 AM",
        customerName: "Kasun Perera",
        phone: "0771234567",
        email: "kasun@gmail.com",
        address: "No. 45, Galle Road, Colombo 03",
        city: "Colombo",
        items: [
            { id: 1, title: "Anker Soundcore Life P2 Mini", qty: 1, priceLKR: 12900 }
        ],
        totalLKR: 12900,
        paymentMethod: "Cash on Delivery",
        status: "Pending" // Pending, Confirmed, Shipped, Delivered, Cancelled
    },
    {
        id: "ST-84921",
        date: "2026-09-23 04:30 PM",
        customerName: "Nimali Fernando",
        phone: "0719876543",
        email: "nimali.f@gmail.com",
        address: "No. 12, Kandy Road, Kiribathgoda",
        city: "Gampaha",
        items: [
            { id: 2, title: "Haylou Solar Plus RT3 Smartwatch", qty: 1, priceLKR: 15400 },
            { id: 3, title: "Baseus GaN5 Pro 65W Fast Charger", qty: 1, priceLKR: 14500 }
        ],
        totalLKR: 29900,
        paymentMethod: "Koko 3x Installments",
        status: "Confirmed"
    },
    {
        id: "ST-84922",
        date: "2026-09-22 11:10 AM",
        customerName: "Sahan Jayasinghe",
        phone: "0755551234",
        email: "sahan.j@outlook.com",
        address: "No. 88, Peradeniya Road, Kandy",
        city: "Kandy",
        items: [
            { id: 5, title: "Anker 335 Power Bank 20000mAh", qty: 1, priceLKR: 16800 }
        ],
        totalLKR: 16800,
        paymentMethod: "Online Card Payment",
        status: "Shipped"
    }
];

// Helper to get or initialize Admin Data in LocalStorage
function getAdminProducts() {
    const saved = localStorage.getItem('simply_admin_products');
    if (saved) {
        return JSON.parse(saved);
    }
    // Fallback to initial PRODUCTS_DATA from products-data.js
    if (typeof PRODUCTS_DATA !== 'undefined') {
        localStorage.setItem('simply_admin_products', JSON.stringify(PRODUCTS_DATA));
        return PRODUCTS_DATA;
    }
    return [];
}

function saveAdminProducts(products) {
    localStorage.setItem('simply_admin_products', JSON.stringify(products));
}

function getAdminOrders() {
    const saved = localStorage.getItem('simply_admin_orders');
    if (saved) return JSON.parse(saved);
    localStorage.setItem('simply_admin_orders', JSON.stringify(INITIAL_ORDERS));
    return INITIAL_ORDERS;
}

function saveAdminOrders(orders) {
    localStorage.setItem('simply_admin_orders', JSON.stringify(orders));
}

function getStoreSettings() {
    const saved = localStorage.getItem('simply_store_settings');
    if (saved) return JSON.parse(saved);
    localStorage.setItem('simply_store_settings', JSON.stringify(DEFAULT_STORE_SETTINGS));
    return DEFAULT_STORE_SETTINGS;
}

function saveStoreSettings(settings) {
    localStorage.setItem('simply_store_settings', JSON.stringify(settings));
}
