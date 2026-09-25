// Supabase Cloud REST API Adapter (Zero-dependency HTTPS REST Client)

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const KEYS_FILE = path.join(__dirname, 'keys.json');

function getKeys() {
    try {
        if (fs.existsSync(KEYS_FILE)) {
            const content = fs.readFileSync(KEYS_FILE, 'utf8');
            const parsed = JSON.parse(content);
            if (parsed.SUPABASE_URL && parsed.SUPABASE_KEY) return parsed;
        }
    } catch (e) {}
    return {
        SUPABASE_URL: process.env.SUPABASE_URL || "",
        SUPABASE_KEY: process.env.SUPABASE_KEY || ""
    };
}

function getSupabaseUrl() {
    const k = getKeys();
    return k.SUPABASE_URL ? k.SUPABASE_URL.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '') : "";
}

function getSupabaseKey() {
    const k = getKeys();
    return k.SUPABASE_KEY || "";
}

function isConfigured() {
    return !!(getSupabaseUrl() && getSupabaseKey());
}

// Low-level HTTPS Request helper for Supabase PostgREST API
function supabaseRequest(endpoint, method = 'GET', data = null, preferHeader = null) {
    return new Promise((resolve, reject) => {
        if (!isConfigured()) {
            return reject(new Error("Supabase URL and Key are not configured in environment variables or config/keys.json"));
        }

        const supabaseUrl = getSupabaseUrl();
        const supabaseKey = getSupabaseKey();

        const fullUrl = new URL(`${supabaseUrl}/rest/v1/${endpoint}`);
        const options = {
            hostname: fullUrl.hostname,
            port: fullUrl.port || (fullUrl.protocol === 'https:' ? 443 : 80),
            path: fullUrl.pathname + fullUrl.search,
            method: method,
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': preferHeader || 'return=representation'
            }
        };

        const client = fullUrl.protocol === 'https:' ? https : http;
        const req = client.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = body ? JSON.parse(body) : [];
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(parsed);
                    } else {
                        reject(new Error(parsed.message || `Supabase API error (${res.statusCode}): ${body}`));
                    }
                } catch (e) {
                    resolve(body);
                }
            });
        });

        req.on('error', (err) => reject(err));
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

// Supabase Data Operations API
const SupabaseDB = {
    isConfigured,

    // 1. Stores
    async getStores() {
        return await supabaseRequest('stores?select=*');
    },

    async getStoreBySlug(slug) {
        const res = await supabaseRequest(`stores?slug=eq.${encodeURIComponent(slug)}&select=*`);
        return Array.isArray(res) && res.length > 0 ? res[0] : null;
    },

    async createStore(storeData) {
        const res = await supabaseRequest('stores', 'POST', {
            slug: storeData.slug || storeData.storeSlug,
            name: storeData.name || storeData.storeName,
            whatsapp: storeData.whatsapp || storeData.whatsappNumber || storeData.whatsapp_number || '94771234567'
        });
        return Array.isArray(res) ? res[0] : res;
    },

    async updateStore(slug, updates) {
        const payload = {};
        if (updates.name) payload.name = updates.name;
        if (updates.whatsapp || updates.whatsappNumber || updates.whatsapp_number) {
            payload.whatsapp = updates.whatsapp || updates.whatsappNumber || updates.whatsapp_number;
        }

        const res = await supabaseRequest(`stores?slug=eq.${encodeURIComponent(slug)}`, 'PATCH', payload);
        return Array.isArray(res) ? res[0] : res;
    },

    // 2. Products
    async getProductsByStore(slug) {
        const res = await supabaseRequest(`products?store_slug=eq.${encodeURIComponent(slug)}&select=*&order=id.desc`);
        return (res || []).map(p => ({
            id: p.id,
            storeSlug: p.store_slug,
            title: p.title,
            category: p.category,
            brand: p.brand,
            priceLKR: Number(p.price_lkr),
            originalPriceLKR: p.original_price_lkr ? Number(p.original_price_lkr) : null,
            inStock: p.in_stock,
            isFlashSale: p.is_flash_sale,
            flashDiscount: p.flash_discount,
            image: p.image,
            badge: p.badge,
            description: p.description
        }));
    },

    async createProduct(productData) {
        const payload = {
            store_slug: productData.storeSlug,
            title: productData.title,
            category: productData.category || 'general',
            brand: productData.brand || 'Generic',
            price_lkr: productData.priceLKR,
            original_price_lkr: productData.originalPriceLKR || null,
            in_stock: productData.inStock !== false,
            is_flash_sale: !!productData.isFlashSale,
            flash_discount: productData.flashDiscount || null,
            image: productData.image,
            badge: productData.badge || 'NEW',
            description: productData.description || ''
        };

        const res = await supabaseRequest('products', 'POST', payload);
        const p = Array.isArray(res) ? res[0] : res;
        return {
            id: p.id,
            storeSlug: p.store_slug,
            title: p.title,
            category: p.category,
            brand: p.brand,
            priceLKR: Number(p.price_lkr),
            originalPriceLKR: p.original_price_lkr ? Number(p.original_price_lkr) : null,
            inStock: p.in_stock,
            image: p.image,
            badge: p.badge,
            description: p.description
        };
    },

    async updateProduct(slug, id, updates) {
        const payload = {};
        if (updates.inStock !== undefined) payload.in_stock = updates.inStock;
        if (updates.title) payload.title = updates.title;
        if (updates.priceLKR) payload.price_lkr = updates.priceLKR;

        const res = await supabaseRequest(`products?id=eq.${id}&store_slug=eq.${encodeURIComponent(slug)}`, 'PATCH', payload);
        return Array.isArray(res) ? res[0] : res;
    },

    async deleteProduct(slug, id) {
        await supabaseRequest(`products?id=eq.${id}&store_slug=eq.${encodeURIComponent(slug)}`, 'DELETE');
        return true;
    },

    // 3. Orders
    async getOrdersByStore(slug) {
        const res = await supabaseRequest(`orders?store_slug=eq.${encodeURIComponent(slug)}&select=*&order=created_at.desc`);
        return (res || []).map(o => ({
            id: o.id,
            storeSlug: o.store_slug,
            date: o.created_at ? new Date(o.created_at).toLocaleString() : '',
            customerName: o.customer_name,
            phone: o.phone,
            email: o.email,
            address: o.address,
            city: o.city,
            items: o.items_json,
            totalLKR: Number(o.total_lkr),
            paymentMethod: o.payment_method,
            status: o.status
        }));
    },

    async createOrder(orderData) {
        const payload = {
            id: orderData.id || `ST-${Math.floor(10000 + Math.random() * 90000)}`,
            store_slug: orderData.storeSlug,
            customer_name: orderData.customerName,
            phone: orderData.phone,
            email: orderData.email || '',
            address: orderData.address || '',
            city: orderData.city || '',
            items_json: orderData.items || [],
            total_lkr: orderData.totalLKR,
            payment_method: orderData.paymentMethod || 'Cash on Delivery',
            status: 'Pending'
        };

        const res = await supabaseRequest('orders', 'POST', payload);
        return Array.isArray(res) ? res[0] : res;
    },

    async updateOrderStatus(slug, orderId, status) {
        const res = await supabaseRequest(`orders?id=eq.${encodeURIComponent(orderId)}&store_slug=eq.${encodeURIComponent(slug)}`, 'PATCH', { status });
        return Array.isArray(res) ? res[0] : res;
    }
};

module.exports = SupabaseDB;
