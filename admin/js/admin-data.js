// Admin Panel Data & Settings Store (Dynamic Supabase Backend)

const DEFAULT_STORE_SETTINGS = {};
const INITIAL_ORDERS = [];

function getAdminProducts() {
    const saved = localStorage.getItem('simply_admin_products');
    if (saved) {
        return JSON.parse(saved);
    }
    return [];
}

function saveAdminProducts(products) {
    localStorage.setItem('simply_admin_products', JSON.stringify(products));
}

function getAdminOrders() {
    const saved = localStorage.getItem('simply_admin_orders');
    if (saved) return JSON.parse(saved);
    return [];
}

function saveAdminOrders(orders) {
    localStorage.setItem('simply_admin_orders', JSON.stringify(orders));
}

function getStoreSettings() {
    const saved = localStorage.getItem('simply_store_settings');
    if (saved) return JSON.parse(saved);
    return {};
}

function saveStoreSettings(settings) {
    localStorage.setItem('simply_store_settings', JSON.stringify(settings));
}
