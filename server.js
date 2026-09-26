// Multi-Tenant E-Commerce Platform Server (Node.js REST API + Supabase Cloud Database Support)

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const SupabaseDB = require('./config/supabase');

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');

// Local DB fallback helpers
function readDb() {
    try {
        if (fs.existsSync(DB_FILE)) {
            return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        }
    } catch (e) {}
    return { stores: [], products: [], orders: [] };
}

function writeDb(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
        console.warn("Notice: Local DB write skipped (cloud/read-only filesystem):", e.message);
    }
}

function sendJSON(res, data, statusCode = 200) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end(JSON.stringify(data));
}

function parseJSONBody(req) {
    if (req.body !== undefined && req.body !== null) {
        if (typeof req.body === 'object') {
            return Promise.resolve(req.body);
        }
        if (typeof req.body === 'string') {
            try {
                return Promise.resolve(req.body ? JSON.parse(req.body) : {});
            } catch (e) {}
        }
    }
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                reject(e);
            }
        });
    });
}

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

async function handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    if (method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });
        return res.end();
    }

    const useSupabase = SupabaseDB.isConfigured();

    // 1. Merchant Registration
    if (pathname === '/api/stores/register' && method === 'POST') {
        try {
            const body = await parseJSONBody(req);
            const storeName = body.storeName || body.name;
            const slug = (body.storeSlug || body.slug || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
            const ownerEmail = body.ownerEmail || body.owner_email;

            if (!storeName || !slug || !ownerEmail || !body.password) {
                return sendJSON(res, { error: 'Please provide store name, slug, email, and password.' }, 400);
            }

            if (useSupabase) {
                const existing = await SupabaseDB.getStoreBySlug(slug);
                if (existing) {
                    return sendJSON(res, { error: 'This store URL/Slug is already taken on Supabase.' }, 409);
                }
                const newStore = await SupabaseDB.createStore({
                    ...body,
                    slug: slug,
                    name: storeName,
                    storeName: storeName,
                    ownerEmail: ownerEmail
                });
                return sendJSON(res, { success: true, message: 'Store created in Supabase!', store: newStore });
            } else {
                const db = readDb();
                if (db.stores.some(s => s.slug === slug)) {
                    return sendJSON(res, { error: 'This store URL/Slug is already taken.' }, 409);
                }
                const newStore = {
                    id: `store-${Date.now()}`,
                    slug: slug,
                    name: body.storeName,
                    tagline: body.tagline || 'Online Store',
                    ownerEmail: body.ownerEmail,
                    password: body.password,
                    hotline: body.hotline || '+94 77 123 4567',
                    whatsappNumber: body.whatsappNumber || '94771234567',
                    announcementText: body.announcementText || 'Free Islandwide Delivery Available',
                    createdAt: new Date().toISOString()
                };
                db.stores.push(newStore);
                writeDb(db);
                return sendJSON(res, { success: true, message: 'Store created locally!', store: newStore });
            }
        } catch (e) {
            return sendJSON(res, { error: e.message || 'Failed to register store' }, 500);
        }
    }

    // 2. Merchant Login
    if (pathname === '/api/auth/login' && method === 'POST') {
        try {
            const body = await parseJSONBody(req);

            if (useSupabase) {
                const store = await SupabaseDB.getStoreBySlug(body.storeSlug);
                if (!store || store.password !== body.password) {
                    return sendJSON(res, { error: 'Invalid Store Slug or Password.' }, 401);
                }
                return sendJSON(res, { success: true, store: { ...store, whatsappNumber: store.whatsapp_number, ownerEmail: store.owner_email } });
            } else {
                const db = readDb();
                const store = db.stores.find(s => (s.slug === body.storeSlug || s.ownerEmail === body.email) && s.password === body.password);
                if (!store) return sendJSON(res, { error: 'Invalid Store Slug / Email or Password.' }, 401);
                return sendJSON(res, { success: true, store });
            }
        } catch (e) {
            return sendJSON(res, { error: 'Login error' }, 400);
        }
    }

    // 3. List Stores Directory
    if (pathname === '/api/stores' && method === 'GET') {
        try {
            if (useSupabase) {
                const stores = await SupabaseDB.getStores();
                const result = (stores || []).map(s => ({
                    id: s.id,
                    slug: s.slug,
                    name: s.name,
                    tagline: s.tagline,
                    whatsappNumber: s.whatsapp_number,
                    productCount: 0
                }));
                return sendJSON(res, result);
            } else {
                const db = readDb();
                const publicStores = db.stores.map(s => ({
                    id: s.id,
                    slug: s.slug,
                    name: s.name,
                    tagline: s.tagline,
                    whatsappNumber: s.whatsappNumber,
                    productCount: db.products.filter(p => p.storeSlug === s.slug).length
                }));
                return sendJSON(res, publicStores);
            }
        } catch (e) {
            return sendJSON(res, []);
        }
    }

    // 4. Fetch Public Store & Products by Slug
    const storeMatch = pathname.match(/^\/api\/stores\/([a-zA-Z0-9-]+)$/);
    if (storeMatch && method === 'GET') {
        const slug = storeMatch[1];
        try {
            if (useSupabase) {
                const store = await SupabaseDB.getStoreBySlug(slug);
                if (!store) {
                    return sendJSON(res, { error: 'Store not found', storeExists: false }, 404);
                }
                const products = await SupabaseDB.getProductsByStore(slug);
                return sendJSON(res, {
                    store: {
                        slug: store.slug,
                        name: store.name || store.store_name || store.storeName || slug.toUpperCase(),
                        tagline: store.tagline || 'Online Store',
                        hotline: store.hotline || '+94 77 123 4567',
                        whatsappNumber: store.whatsapp || store.whatsapp_number || '94771234567',
                        announcementText: store.announcement_text || 'Free Islandwide Delivery Available'
                    },
                    products: products || []
                });
            } else {
                const db = readDb();
                const store = db.stores.find(s => s.slug === slug);
                if (!store) {
                    return sendJSON(res, { error: 'Store not found', storeExists: false }, 404);
                }
                const products = db.products.filter(p => p.storeSlug === slug);
                return sendJSON(res, {
                    store: {
                        slug: store.slug,
                        name: store.name || store.storeName || store.store_name || slug.toUpperCase(),
                        tagline: store.tagline || 'Online Store',
                        hotline: store.hotline || '+94 77 123 4567',
                        whatsappNumber: store.whatsappNumber || store.whatsapp_number || '94771234567',
                        announcementText: store.announcementText || store.announcement_text || 'Free Islandwide Delivery Available'
                    },
                    products: products || []
                });
            }
        } catch (e) {
            return sendJSON(res, {
                store: {
                    slug: slug,
                    name: slug.toUpperCase(),
                    tagline: 'Online Store',
                    hotline: '+94 77 123 4567',
                    whatsappNumber: '94771234567',
                    announcementText: 'Free Islandwide Delivery Available'
                },
                products: []
            });
        }
    }

    // 5. Products Operations (Add / Update / Delete)
    const storeProductsMatch = pathname.match(/^\/api\/stores\/([a-zA-Z0-9-]+)\/products(?:\/(\d+))?$/);
    if (storeProductsMatch) {
        const slug = storeProductsMatch[1];
        const prodId = storeProductsMatch[2] ? parseInt(storeProductsMatch[2]) : null;

        if (method === 'POST') {
            try {
                const body = await parseJSONBody(req);
                body.storeSlug = slug;

                if (useSupabase) {
                    const newProd = await SupabaseDB.createProduct(body);
                    return sendJSON(res, { success: true, product: newProd });
                } else {
                    const db = readDb();
                    const newId = db.products.length > 0 ? Math.max(...db.products.map(p => p.id)) + 1 : 1;
                    const newProduct = {
                        id: newId,
                        storeSlug: slug,
                        title: body.title,
                        category: body.category || 'general',
                        brand: body.brand || 'Generic',
                        priceLKR: parseInt(body.priceLKR) || 0,
                        originalPriceLKR: body.originalPriceLKR ? parseInt(body.originalPriceLKR) : null,
                        rating: 5.0,
                        reviewsCount: 1,
                        inStock: body.inStock !== false,
                        image: body.image || 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600',
                        badge: 'NEW',
                        description: body.description || ''
                    };
                    db.products.push(newProduct);
                    writeDb(db);
                    return sendJSON(res, { success: true, product: newProduct });
                }
            } catch (e) {
                return sendJSON(res, { error: e.message || 'Failed to add product' }, 400);
            }
        }

        if (method === 'PUT' && prodId) {
            try {
                const body = await parseJSONBody(req);
                if (useSupabase) {
                    const updated = await SupabaseDB.updateProduct(slug, prodId, body);
                    return sendJSON(res, { success: true, product: updated });
                } else {
                    const db = readDb();
                    const idx = db.products.findIndex(p => p.id === prodId && p.storeSlug === slug);
                    if (idx === -1) return sendJSON(res, { error: 'Product not found' }, 404);
                    db.products[idx] = { ...db.products[idx], ...body };
                    writeDb(db);
                    return sendJSON(res, { success: true, product: db.products[idx] });
                }
            } catch (e) {
                return sendJSON(res, { error: 'Failed to update product' }, 400);
            }
        }

        if (method === 'DELETE' && prodId) {
            try {
                if (useSupabase) {
                    await SupabaseDB.deleteProduct(slug, prodId);
                    return sendJSON(res, { success: true, message: 'Deleted from Supabase' });
                } else {
                    const db = readDb();
                    db.products = db.products.filter(p => !(p.id === prodId && p.storeSlug === slug));
                    writeDb(db);
                    return sendJSON(res, { success: true, message: 'Deleted locally' });
                }
            } catch (e) {
                return sendJSON(res, { error: 'Failed to delete' }, 400);
            }
        }
    }

    // 6. Customer Orders Operations
    const storeOrdersMatch = pathname.match(/^\/api\/stores\/([a-zA-Z0-9-]+)\/orders(?:\/([a-zA-Z0-9-]+))?$/);
    if (storeOrdersMatch) {
        const slug = storeOrdersMatch[1];
        const orderId = storeOrdersMatch[2] || null;

        if (method === 'GET') {
            try {
                if (useSupabase) {
                    const orders = await SupabaseDB.getOrdersByStore(slug);
                    return sendJSON(res, orders);
                } else {
                    const db = readDb();
                    const orders = db.orders.filter(o => o.storeSlug === slug);
                    return sendJSON(res, orders);
                }
            } catch (e) {
                return sendJSON(res, []);
            }
        }

        if (method === 'POST') {
            try {
                const body = await parseJSONBody(req);
                body.storeSlug = slug;

                if (useSupabase) {
                    const newOrder = await SupabaseDB.createOrder(body);
                    return sendJSON(res, { success: true, order: newOrder });
                } else {
                    const db = readDb();
                    const newOrder = {
                        id: `ST-${Math.floor(10000 + Math.random() * 90000)}`,
                        storeSlug: slug,
                        date: new Date().toLocaleString(),
                        customerName: body.customerName,
                        phone: body.phone,
                        email: body.email,
                        address: body.address,
                        city: body.city,
                        items: body.items || [],
                        totalLKR: body.totalLKR,
                        paymentMethod: body.paymentMethod || 'Cash on Delivery',
                        status: 'Pending'
                    };
                    db.orders.unshift(newOrder);
                    writeDb(db);
                    return sendJSON(res, { success: true, order: newOrder });
                }
            } catch (e) {
                return sendJSON(res, { error: 'Order placement failed' }, 400);
            }
        }

        if (method === 'PUT' && orderId) {
            try {
                const body = await parseJSONBody(req);
                if (useSupabase) {
                    await SupabaseDB.updateOrderStatus(slug, orderId, body.status);
                    return sendJSON(res, { success: true });
                } else {
                    const db = readDb();
                    const o = db.orders.find(item => item.id === orderId && item.storeSlug === slug);
                    if (o) o.status = body.status;
                    writeDb(db);
                    return sendJSON(res, { success: true });
                }
            } catch (e) {
                return sendJSON(res, { error: 'Failed to update order status' }, 400);
            }
        }
    }

    // Static File Serving
    let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        return res.end('Access Denied');
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            return res.end('<h1>404 Not Found</h1>');
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
    });
}

const server = http.createServer(handleRequest);

module.exports = handleRequest;

if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`🚀 Multi-Tenant E-Commerce Platform Server running at http://localhost:${PORT}`);
        if (SupabaseDB.isConfigured()) {
            console.log(`⚡ Connected to Supabase Cloud Database!`);
        } else {
            console.log(`💾 Supabase Keys missing in config/keys.json -> Running on Local Database Engine.`);
        }
    });
}
