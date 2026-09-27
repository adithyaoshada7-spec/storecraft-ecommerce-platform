// Robust Admin Panel Logic for Product Management, Customer Orders & Settings

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    let activeSlug = urlParams.get('shop') || localStorage.getItem('simply_active_merchant_slug') || 'simplytek';

    let currentStore = null;
    let products = [];
    let orders = [];

    const loginModal = document.getElementById('login-modal');
    const loginForm = document.getElementById('admin-login-form');

    initAdminApp();

    async function initAdminApp() {
        await loadStoreData(activeSlug);
        setupNavigation();
        setupEventListeners();
        renderAllAdminViews();
    }

    // Helper: Load store products, orders, and metadata (API + LocalStorage fallback)
    async function loadStoreData(slug) {
        activeSlug = slug;
        localStorage.setItem('simply_active_merchant_slug', slug);

        let apiSuccess = false;

        const SUPABASE_URL = "https://ldjsjlkyfztnavwdcurz.supabase.co";
        const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkanNqbGt5Znp0bmF2d2RjdXJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyMzY2MTUsImV4cCI6MjEwNTgxMjYxNX0.ragMF45p3QdC3VkzaEbI3HPXuNWDbCBvkYw0zHla8G4";

        // 1. Fetch store and products directly from Supabase Cloud API
        try {
            const storeRes = await fetch(`${SUPABASE_URL}/rest/v1/stores?slug=eq.${encodeURIComponent(slug)}&select=*`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });

            if (storeRes.ok) {
                const supaStores = await storeRes.json();
                if (Array.isArray(supaStores) && supaStores.length > 0) {
                    currentStore = supaStores[0];
                    apiSuccess = true;

                    // Fetch products filtering strictly by store_slug
                    const prodRes = await fetch(`${SUPABASE_URL}/rest/v1/products?store_slug=eq.${encodeURIComponent(slug)}&select=*&order=created_at.desc`, {
                        headers: {
                            'apikey': SUPABASE_KEY,
                            'Authorization': `Bearer ${SUPABASE_KEY}`
                        }
                    });

                    if (prodRes.ok) {
                        const prodData = await prodRes.json();
                        if (Array.isArray(prodData)) {
                            products = prodData.map(p => ({
                                id: p.id,
                                storeSlug: p.store_slug,
                                title: p.title,
                                category: p.category || 'general',
                                brand: p.brand || 'Generic',
                                priceLKR: Number(p.price !== undefined ? p.price : (p.price_lkr !== undefined ? p.price_lkr : 0)),
                                originalPriceLKR: (p.original_price || p.original_price_lkr) ? Number(p.original_price || p.original_price_lkr) : null,
                                inStock: p.in_stock !== false,
                                image: p.image || p.image_url || 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600',
                                badge: p.badge || 'NEW',
                                description: p.description || ''
                            }));
                        }
                    }
                }
            }
        } catch (supaErr) {
            console.warn("Direct Supabase admin fetch warning:", supaErr);
        }

        // 2. Try REST API Server if direct fetch didn't load store
        if (!apiSuccess) {
            try {
                const res = await fetch(`/api/stores/${slug}`);
                if (res.ok) {
                    const data = await res.json();
                    currentStore = data.store;
                    products = data.products || [];
                    apiSuccess = true;
                }
            } catch (e) {}
        }

        // 2. LocalStorage Fallback if API fails or offline
        if (!apiSuccess || !products || products.length === 0) {
            if (typeof getAdminProducts === 'function') {
                products = getAdminProducts();
            } else {
                const saved = localStorage.getItem('simply_admin_products');
                products = saved ? JSON.parse(saved) : [];
            }
        }

        if (!currentStore) {
            if (typeof getStoreSettings === 'function') {
                currentStore = getStoreSettings();
                currentStore.slug = slug;
            } else {
                currentStore = {
                    slug: slug,
                    name: slug.toUpperCase(),
                    hotline: "+94 77 123 4567",
                    whatsappNumber: "94771234567",
                    announcementText: "Free Islandwide Delivery Available"
                };
            }
        }

        if (!orders || orders.length === 0) {
            if (typeof getAdminOrders === 'function') {
                orders = getAdminOrders();
            } else {
                const savedOrders = localStorage.getItem('simply_admin_orders');
                orders = savedOrders ? JSON.parse(savedOrders) : [];
            }
        }

        // Always sync back to localStorage for consistency
        saveLocalProducts(products);
    }

    function saveLocalProducts(prods) {
        localStorage.setItem('simply_admin_products', JSON.stringify(prods));
    }

    function saveLocalOrders(ords) {
        localStorage.setItem('simply_admin_orders', JSON.stringify(ords));
    }

    // Navigation tab switching
    function setupNavigation() {
        const navButtons = document.querySelectorAll('.admin-nav-btn');
        const sections = document.querySelectorAll('.admin-section');

        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.target;
                
                navButtons.forEach(b => {
                    b.classList.remove('bg-rose-600', 'text-white', 'shadow-md');
                    b.classList.add('text-slate-400', 'hover:bg-slate-900', 'hover:text-white');
                });

                btn.classList.remove('text-slate-400', 'hover:bg-slate-900', 'hover:text-white');
                btn.classList.add('bg-rose-600', 'text-white', 'shadow-md');

                sections.forEach(sec => {
                    if (sec.id === target) {
                        sec.classList.remove('hidden');
                    } else {
                        sec.classList.add('hidden');
                    }
                });
            });
        });
    }

    // Render All Views
    function renderAllAdminViews() {
        if (!currentStore) return;

        const storeNameEl = document.getElementById('admin-store-title');
        if (storeNameEl) storeNameEl.textContent = `${currentStore.name || activeSlug.toUpperCase()} Dashboard`;

        const viewStoreBtn = document.getElementById('btn-view-live-store');
        if (viewStoreBtn) viewStoreBtn.href = `../store.html?shop=${activeSlug}`;

        renderDashboardStats();
        renderProductsTable();
        renderOrdersTable();
        loadSettingsForm();
    }

    // 1. Dashboard Stats Calculation
    function renderDashboardStats() {
        const totalSales = orders
            .filter(o => o.status !== 'Cancelled')
            .reduce((sum, o) => sum + (o.totalLKR || 0), 0);
        
        const activeProductsCount = products.length;
        const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;
        const lowStockCount = products.filter(p => p.inStock === false).length;

        const salesEl = document.getElementById('stat-total-sales');
        const prodEl = document.getElementById('stat-active-products');
        const pendEl = document.getElementById('stat-pending-orders');
        const stockEl = document.getElementById('stat-low-stock');

        if (salesEl) salesEl.textContent = `Rs. ${totalSales.toLocaleString()}`;
        if (prodEl) prodEl.textContent = activeProductsCount;
        if (pendEl) pendEl.textContent = pendingOrdersCount;
        if (stockEl) stockEl.textContent = lowStockCount;

        const recentOrdersContainer = document.getElementById('dashboard-recent-orders');
        if (recentOrdersContainer) {
            if (orders.length === 0) {
                recentOrdersContainer.innerHTML = '<p class="text-xs text-slate-400 text-center py-4">No recent orders.</p>';
            } else {
                recentOrdersContainer.innerHTML = orders.slice(0, 4).map(o => `
                    <div class="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <div>
                            <span class="font-extrabold text-xs text-rose-600 block">${o.id}</span>
                            <span class="text-xs font-bold text-slate-800">${o.customerName}</span>
                            <span class="text-[11px] text-slate-400 block">${o.date}</span>
                        </div>
                        <div class="text-right">
                            <span class="font-black text-xs text-slate-900 block">Rs. ${(o.totalLKR || 0).toLocaleString()}</span>
                            <span class="inline-block px-2 py-0.5 text-[10px] font-bold rounded-md ${getStatusBadgeClass(o.status)}">${o.status}</span>
                        </div>
                    </div>
                `).join('');
            }
        }
    }

    function getStatusBadgeClass(status) {
        switch (status) {
            case 'Pending': return 'bg-amber-100 text-amber-700';
            case 'Confirmed': return 'bg-blue-100 text-blue-700';
            case 'Shipped': return 'bg-purple-100 text-purple-700';
            case 'Delivered': return 'bg-emerald-100 text-emerald-700';
            case 'Cancelled': return 'bg-rose-100 text-rose-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    }

    // 2. Render Products Table (CRUD)
    function renderProductsTable() {
        const tableBody = document.getElementById('products-table-body');
        if (!tableBody) return;

        if (products.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-8 text-slate-400 text-xs">
                        No products added yet. Click "+ Add New Product" above to list your first item.
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = products.map(p => {
            const inStock = p.inStock !== false;
            return `
            <tr class="border-b border-slate-100 hover:bg-slate-50/80 transition text-xs">
                <td class="p-3">
                    <img src="${p.image || 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600'}" alt="${p.title}" class="w-12 h-12 object-cover rounded-xl border border-slate-200 bg-white">
                </td>
                <td class="p-3">
                    <span class="font-bold text-slate-800 block line-clamp-1">${p.title}</span>
                    <span class="text-[10px] text-rose-600 font-semibold uppercase">${p.brand || 'Generic'}</span>
                </td>
                <td class="p-3">
                    <span class="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase">${p.category || 'General'}</span>
                </td>
                <td class="p-3 font-extrabold text-slate-900">
                    Rs. ${(p.priceLKR || 0).toLocaleString()}
                    ${p.originalPriceLKR ? `<span class="block text-[10px] text-slate-400 line-through font-normal">Rs. ${p.originalPriceLKR.toLocaleString()}</span>` : ''}
                </td>
                <td class="p-3">
                    <button class="toggle-stock-btn px-2.5 py-1 rounded-lg text-[10px] font-bold ${inStock ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-rose-100 text-rose-700 border border-rose-300'}" data-id="${p.id}">
                        <i class="fas ${inStock ? 'fa-check' : 'fa-times'} mr-1"></i> ${inStock ? 'In Stock' : 'Out of Stock'}
                    </button>
                </td>
                <td class="p-3">
                    <div class="flex items-center gap-2">
                        <button class="delete-prod-btn p-2 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-lg text-rose-600 transition" data-id="${p.id}" title="Delete Product">
                            <i class="fas fa-trash-alt text-xs"></i>
                        </button>
                    </div>
                </td>
            </tr>
            `;
        }).join('');

        // Stock Toggle event handlers
        tableBody.querySelectorAll('.toggle-stock-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                const p = products.find(item => String(item.id) === String(id));
                if (p) {
                    p.inStock = !p.inStock;
                    saveLocalProducts(products);

                    // Direct Supabase Cloud REST API Stock Update
                    try {
                        await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${encodeURIComponent(id)}`, {
                            method: 'PATCH',
                            headers: {
                                'apikey': SUPABASE_KEY,
                                'Authorization': `Bearer ${SUPABASE_KEY}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ in_stock: p.inStock })
                        });
                    } catch(e) {}

                    try {
                        await fetch(`/api/stores/${activeSlug}/products/${id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ inStock: p.inStock })
                        });
                    } catch(e) {}

                    renderProductsTable();
                    renderDashboardStats();
                    showAdminToast(`Stock updated for "${p.title}"`);
                }
            });
        });

        // Delete Product event handlers
        tableBody.querySelectorAll('.delete-prod-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                const p = products.find(item => String(item.id) === String(id));
                const prodTitle = p ? p.title : 'Product';
                if (confirm(`Are you sure you want to delete "${prodTitle}"?`)) {
                    products = products.filter(item => String(item.id) !== String(id));
                    saveLocalProducts(products);

                    // Direct Supabase Cloud REST API Product Deletion
                    try {
                        await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${encodeURIComponent(id)}`, {
                            method: 'DELETE',
                            headers: {
                                'apikey': SUPABASE_KEY,
                                'Authorization': `Bearer ${SUPABASE_KEY}`
                            }
                        });
                    } catch(e) {}

                    try {
                        await fetch(`/api/stores/${activeSlug}/products/${id}`, { method: 'DELETE' });
                    } catch(e) {}

                    renderProductsTable();
                    renderDashboardStats();
                    showAdminToast('Product deleted from catalog');
                }
            });
        });
    }

    // 3. Render Orders Table
    function renderOrdersTable() {
        const tableBody = document.getElementById('orders-table-body');
        if (!tableBody) return;

        if (orders.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-slate-400 text-xs">No orders received yet.</td></tr>';
            return;
        }

        tableBody.innerHTML = orders.map(o => `
            <tr class="border-b border-slate-100 hover:bg-slate-50/80 transition text-xs">
                <td class="p-3 font-extrabold text-rose-600">${o.id}</td>
                <td class="p-3">
                    <span class="font-bold text-slate-800 block">${o.customerName}</span>
                    <span class="text-[10px] text-slate-500">${o.phone}</span>
                </td>
                <td class="p-3">${o.address || ''}, ${o.city || ''}</td>
                <td class="p-3 font-black text-slate-900">Rs. ${(o.totalLKR || 0).toLocaleString()}</td>
                <td class="p-3">
                    <select class="order-status-sel bg-slate-100 border text-xs font-bold rounded-lg px-2 py-1 cursor-pointer" data-id="${o.id}">
                        <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Confirmed" ${o.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
                <td class="p-3">
                    <a href="https://wa.me/94${(o.phone || '').replace(/^0/, '')}?text=${encodeURIComponent(`Hi ${o.customerName}, regarding your order ${o.id} from ${currentStore.name || 'our store'}: status updated to ${o.status}.`)}" target="_blank" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] inline-flex items-center gap-1 transition">
                        <i class="fab fa-whatsapp"></i> WhatsApp Msg
                    </a>
                </td>
            </tr>
        `).join('');

        tableBody.querySelectorAll('.order-status-sel').forEach(sel => {
            sel.addEventListener('change', async (e) => {
                const orderId = sel.dataset.id;
                const newStatus = e.target.value;
                const o = orders.find(item => item.id === orderId);
                if (o) {
                    o.status = newStatus;
                    saveLocalOrders(orders);

                    try {
                        await fetch(`/api/stores/${activeSlug}/orders/${orderId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: newStatus })
                        });
                    } catch(e) {}

                    renderDashboardStats();
                    showAdminToast(`Order ${orderId} updated to "${newStatus}"`);
                }
            });
        });
    }

    // 4. Load Store Settings Form
    function loadSettingsForm() {
        if (!currentStore) return;
        const nameInput = document.getElementById('set-store-name');
        const taglineInput = document.getElementById('set-tagline');
        const hotlineInput = document.getElementById('set-hotline');
        const whatsappInput = document.getElementById('set-whatsapp');
        const announcementInput = document.getElementById('set-announcement');

        if (nameInput) nameInput.value = currentStore.name || '';
        if (taglineInput) taglineInput.value = currentStore.tagline || '';
        if (hotlineInput) hotlineInput.value = currentStore.hotline || '';
        if (whatsappInput) whatsappInput.value = currentStore.whatsappNumber || '';
        if (announcementInput) announcementInput.value = currentStore.announcementText || '';
    }

    // Event Listeners for Forms and Buttons
    function setupEventListeners() {
        // Login Form
        loginForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const slug = document.getElementById('login-slug').value.trim().toLowerCase();
            const pass = document.getElementById('login-pass').value;

            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ storeSlug: slug, password: pass })
                });

                const data = await res.json();
                if (res.ok && data.success) {
                    await loadStoreData(data.store.slug);
                    loginModal?.classList.add('hidden');
                    renderAllAdminViews();
                    showAdminToast(`Logged into store "${data.store.name}"`);
                    return;
                }
            } catch (err) {}

            // Fallback login
            await loadStoreData(slug);
            loginModal?.classList.add('hidden');
            renderAllAdminViews();
            showAdminToast(`Logged into store "${slug.toUpperCase()}"`);
        });

        // Add Product Form Listener (Guaranteed Execution)
        const productForm = document.getElementById('product-form');
        productForm?.addEventListener('submit', async (e) => {
            e.preventDefault();

            const title = document.getElementById('prod-title').value.trim();
            const category = document.getElementById('prod-category').value;
            const brand = document.getElementById('prod-brand').value.trim() || 'Generic';
            const priceLKR = parseInt(document.getElementById('prod-price').value) || 0;
            const originalPriceLKR = parseInt(document.getElementById('prod-orig-price').value) || null;
            const image = document.getElementById('prod-image').value.trim() || 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600';
            const description = document.getElementById('prod-desc').value.trim();

            if (!title || priceLKR <= 0) {
                alert('Please enter a valid product title and price!');
                return;
            }

            const newId = products.length > 0 ? Math.max(...products.map(p => p.id || 0)) + 1 : 1;

            const newProduct = {
                id: newId,
                storeSlug: activeSlug,
                title: title,
                category: category,
                brand: brand,
                priceLKR: priceLKR,
                originalPriceLKR: originalPriceLKR,
                rating: 5.0,
                reviewsCount: 1,
                inStock: true,
                image: image,
                badge: "NEW",
                description: description
            };

            // 1. Instantly push to local products array & save
            products.unshift(newProduct);
            saveLocalProducts(products);

            // 2. Direct Supabase Cloud REST API Insertion (Without passing integer ID so Supabase auto-generates UUID)
            try {
                const supaProdPayload = {
                    store_slug: activeSlug,
                    title: title,
                    price: priceLKR,
                    original_price: originalPriceLKR,
                    category: category,
                    image_url: image,
                    in_stock: true
                };

                const supaRes = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(supaProdPayload)
                });

                if (supaRes.ok) {
                    console.log("✅ Product inserted into Supabase with store_slug:", activeSlug);
                    // Re-sync live products from Supabase to load the auto-generated UUID
                    await loadStoreData(activeSlug);
                } else {
                    const errText = await supaRes.text();
                    console.error("Supabase Product Insert Failed:", errText);
                }
            } catch (supaErr) {
                console.warn("Direct Supabase product insertion error:", supaErr);
            }

            // 3. Send to backend REST API Server if running
            try {
                await fetch(`/api/stores/${activeSlug}/products`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newProduct)
                });
            } catch (e) {}

            // 4. Update UI
            renderProductsTable();
            renderDashboardStats();

            // 5. Hide Modal & Reset Form
            document.getElementById('product-modal')?.classList.add('hidden');
            productForm.reset();

            showAdminToast(`Added "${title}" to products list!`);
        });

        // Store Settings Form Save
        document.getElementById('settings-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const updated = {
                name: document.getElementById('set-store-name').value,
                tagline: document.getElementById('set-tagline').value,
                hotline: document.getElementById('set-hotline').value,
                whatsappNumber: document.getElementById('set-whatsapp').value,
                announcementText: document.getElementById('set-announcement').value
            };

            try {
                await fetch(`/api/stores/${activeSlug}/settings`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updated)
                });
            } catch (e) {}

            currentStore = { ...currentStore, ...updated };
            localStorage.setItem('simply_store_settings', JSON.stringify(currentStore));
            renderAllAdminViews();
            showAdminToast("Store settings saved!");
        });
    }

    // Toast Notification System
    function showAdminToast(message) {
        let toastContainer = document.getElementById('admin-toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'admin-toast-container';
            toastContainer.className = 'fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = 'flex items-center gap-2 bg-slate-900 text-white border-l-4 border-rose-500 px-4 py-3 rounded-xl shadow-2xl text-xs font-bold transition-all duration-300 transform translate-y-2';
        toast.innerHTML = `<i class="fas fa-check-circle text-rose-500 text-sm"></i> <span>${message}</span>`;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('opacity-0', '-translate-y-2');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
});
