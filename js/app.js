// E-Commerce Template Main Application Logic (SimplyTek style - Synchronized with Admin Panel)

document.addEventListener('DOMContentLoaded', () => {
    // Helper to fetch live products (from Admin localStorage or initial data)
    function getLiveProducts() {
        const saved = localStorage.getItem('simply_admin_products');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Error parsing admin products from localStorage:", e);
            }
        }
        return [];
    }

    // Helper to fetch live store settings (from Admin localStorage)
    function getLiveStoreSettings() {
        const saved = localStorage.getItem('simply_store_settings');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Error parsing store settings:", e);
            }
        }
        return null;
    }

    // State management
    let state = {
        cart: JSON.parse(localStorage.getItem('simply_cart')) || [],
        wishlist: JSON.parse(localStorage.getItem('simply_wishlist')) || [],
        currency: localStorage.getItem('simply_currency') || 'LKR',
        exchangeRateLKRtoUSD: 0.0033, // Approx 1 USD = 305 LKR
        activeCategory: 'all',
        sortBy: 'default',
        priceMax: 300000,
        searchQuery: ''
    };

    // Initialize application UI
    initApp();

    function initApp() {
        applyLiveStoreSettings();
        renderProductGrids();
        updateCartBadge();
        updateWishlistBadge();
        renderCartDrawer();
        setupEventListeners();
        startFlashSaleTimer();
    }

    // Apply Live Store Settings from Admin to public site DOM
    function applyLiveStoreSettings() {
        const settings = getLiveStoreSettings();
        if (!settings) return;

        // Announcement Bar
        const announcementEl = document.querySelector('.top-announcement-text');
        if (announcementEl && settings.announcementText) {
            announcementEl.textContent = settings.announcementText;
        }

        // Store Hotline
        const hotlineEls = document.querySelectorAll('.store-hotline-link');
        if (settings.hotline) {
            hotlineEls.forEach(el => {
                el.href = `tel:${settings.hotline.replace(/\s+/g, '')}`;
                el.innerHTML = `<i class="fas fa-phone text-rose-500"></i> ${settings.hotline}`;
            });
        }
    }

    // Helper: Format Price based on currency
    function formatPrice(lkrAmount) {
        if (state.currency === 'USD') {
            const usdAmount = (lkrAmount * state.exchangeRateLKRtoUSD).toFixed(2);
            return `$${usdAmount}`;
        }
        return `Rs. ${lkrAmount.toLocaleString()}`;
    }

    // Expose formatPrice globally
    window.formatPrice = formatPrice;

    // Render Product Cards Grid dynamically from live product data
    function renderProductGrids() {
        const gridContainers = document.querySelectorAll('.product-grid-container');
        if (!gridContainers.length) return;

        const liveProducts = getLiveProducts();

        let filteredProducts = liveProducts.filter(p => {
            const matchesCat = state.activeCategory === 'all' || p.category === state.activeCategory;
            const matchesPrice = p.priceLKR <= state.priceMax;
            const matchesSearch = !state.searchQuery || p.title.toLowerCase().includes(state.searchQuery.toLowerCase()) || (p.brand && p.brand.toLowerCase().includes(state.searchQuery.toLowerCase()));
            return matchesCat && matchesPrice && matchesSearch;
        });

        // Sorting
        if (state.sortBy === 'price-low') {
            filteredProducts.sort((a, b) => a.priceLKR - b.priceLKR);
        } else if (state.sortBy === 'price-high') {
            filteredProducts.sort((a, b) => b.priceLKR - a.priceLKR);
        } else if (state.sortBy === 'rating') {
            filteredProducts.sort((a, b) => (b.rating || 5) - (a.rating || 5));
        }

        gridContainers.forEach(container => {
            const isFlashGrid = container.classList.contains('flash-sale-grid');
            const targetProducts = isFlashGrid ? liveProducts.filter(p => p.isFlashSale) : filteredProducts;

            if (targetProducts.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full text-center py-12 text-slate-500">
                        <i class="fas fa-box-open text-5xl mb-3 opacity-40"></i>
                        <p class="text-lg font-medium">No products match your selected filters.</p>
                        <button class="mt-4 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition reset-filters-btn">Reset Filters</button>
                    </div>
                `;
                return;
            }

            container.innerHTML = targetProducts.map(product => createProductCardHtml(product, isFlashGrid)).join('');
        });
    }

    // Template for individual Product Card
    function createProductCardHtml(p, isFlash = false) {
        const isWishlisted = state.wishlist.includes(p.id);
        const installment3x = Math.round(p.priceLKR / 3);
        const inStock = p.inStock !== false; // Default true if undefined

        return `
        <div class="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between relative ${!inStock ? 'opacity-75' : ''}">
            <!-- Badges -->
            <div class="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
                ${!inStock ? `<span class="bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm uppercase tracking-wider">OUT OF STOCK</span>` : ''}
                ${inStock && p.badge ? `<span class="bg-rose-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm uppercase tracking-wider">${p.badge}</span>` : ''}
                ${inStock && p.isFlashSale && p.flashDiscount ? `<span class="bg-amber-500 text-slate-950 text-[11px] font-extrabold px-2 py-0.5 rounded-md shadow-sm">${p.flashDiscount}</span>` : ''}
            </div>

            <!-- Action buttons top right -->
            <button class="wishlist-btn absolute top-3 right-3 z-10 w-9 h-9 bg-white/90 backdrop-blur-md rounded-full shadow-md flex items-center justify-center text-slate-600 hover:text-rose-600 hover:scale-110 transition ${isWishlisted ? 'text-rose-600' : ''}" data-id="${p.id}" title="Add to Wishlist">
                <i class="${isWishlisted ? 'fas' : 'far'} fa-heart text-sm"></i>
            </button>

            <!-- Product Image -->
            <div class="relative overflow-hidden aspect-square bg-slate-50 cursor-pointer quick-view-trigger" data-id="${p.id}">
                <img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 main-img">
                ${p.secondaryImage ? `<img src="${p.secondaryImage}" alt="${p.title}" class="w-full h-full object-cover object-center absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">` : ''}
                
                <!-- Quick View Overlay -->
                <div class="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-slate-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center">
                    <button class="px-4 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-semibold shadow hover:bg-rose-600 hover:text-white transition flex items-center gap-1.5">
                        <i class="fas fa-eye"></i> Quick View
                    </button>
                </div>
            </div>

            <!-- Product Details -->
            <div class="p-4 flex-1 flex flex-col justify-between">
                <div>
                    <!-- Brand & Rating -->
                    <div class="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                        <span class="font-semibold text-rose-600 uppercase tracking-wide">${p.brand || 'GENERIC'}</span>
                        <div class="flex items-center gap-1 text-amber-400">
                            <i class="fas fa-star text-[11px]"></i>
                            <span class="font-bold text-slate-700">${p.rating || 5.0}</span>
                            <span class="text-slate-400">(${p.reviewsCount || 1})</span>
                        </div>
                    </div>

                    <!-- Title -->
                    <h3 class="font-semibold text-slate-800 text-sm leading-snug line-clamp-2 hover:text-rose-600 transition cursor-pointer quick-view-trigger" data-id="${p.id}">
                        ${p.title}
                    </h3>

                    <!-- Pay Later Badge -->
                    <div class="mt-2 inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[11px] font-medium px-2 py-0.5 rounded-md">
                        <i class="fas fa-credit-card text-[10px]"></i> Or 3 x <strong>${formatPrice(installment3x)}</strong>
                    </div>
                </div>

                <!-- Price & Add to Cart -->
                <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                        <div class="text-rose-600 font-extrabold text-base leading-none">${formatPrice(p.priceLKR)}</div>
                        ${p.originalPriceLKR ? `<div class="text-slate-400 text-xs line-through mt-0.5">${formatPrice(p.originalPriceLKR)}</div>` : ''}
                    </div>

                    <button class="add-to-cart-btn ${inStock ? 'bg-slate-900 hover:bg-rose-600' : 'bg-slate-300 cursor-not-allowed'} text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shadow-md active:scale-95" data-id="${p.id}" ${!inStock ? 'disabled' : ''}>
                        <i class="fas fa-shopping-bag"></i> ${inStock ? 'Add' : 'Sold Out'}
                    </button>
                </div>
            </div>
        </div>
        `;
    }

    // Event Listeners setup
    function setupEventListeners() {
        // Listen for localStorage changes across tabs (e.g. Admin changes in another tab)
        window.addEventListener('storage', (e) => {
            if (e.key === 'simply_admin_products' || e.key === 'simply_store_settings') {
                applyLiveStoreSettings();
                renderProductGrids();
            }
        });

        document.body.addEventListener('click', (e) => {
            const addBtn = e.target.closest('.add-to-cart-btn');
            if (addBtn && !addBtn.disabled) {
                const id = parseInt(addBtn.dataset.id);
                addToCart(id, 1);
                return;
            }

            const wishBtn = e.target.closest('.wishlist-btn');
            if (wishBtn) {
                const id = parseInt(wishBtn.dataset.id);
                toggleWishlist(id);
                return;
            }

            const quickTrigger = e.target.closest('.quick-view-trigger');
            if (quickTrigger) {
                const id = parseInt(quickTrigger.dataset.id);
                openQuickView(id);
                return;
            }

            if (e.target.classList.contains('reset-filters-btn')) {
                state.activeCategory = 'all';
                state.priceMax = 300000;
                state.searchQuery = '';
                renderProductGrids();
                return;
            }
        });

        // Cart Drawer toggle buttons
        const cartToggleBtns = document.querySelectorAll('.cart-drawer-toggle');
        const cartDrawer = document.getElementById('cart-drawer');
        const cartOverlay = document.getElementById('cart-drawer-overlay');
        const closeCartBtn = document.getElementById('close-cart-btn');

        cartToggleBtns.forEach(btn => btn.addEventListener('click', () => {
            cartDrawer?.classList.remove('translate-x-full');
            cartOverlay?.classList.remove('hidden');
        }));

        [closeCartBtn, cartOverlay].forEach(el => el?.addEventListener('click', () => {
            cartDrawer?.classList.add('translate-x-full');
            cartOverlay?.classList.add('hidden');
        }));

        // Currency Toggle
        const currencySelect = document.getElementById('currency-select');
        if (currencySelect) {
            currencySelect.value = state.currency;
            currencySelect.addEventListener('change', (e) => {
                state.currency = e.target.value;
                localStorage.setItem('simply_currency', state.currency);
                renderProductGrids();
                renderCartDrawer();
            });
        }

        // Category Filter Pills
        const categoryFilterPills = document.querySelectorAll('.cat-filter-pill');
        categoryFilterPills.forEach(pill => {
            pill.addEventListener('click', () => {
                categoryFilterPills.forEach(p => p.classList.remove('bg-rose-600', 'text-white'));
                categoryFilterPills.forEach(p => p.classList.add('bg-slate-100', 'text-slate-700'));
                pill.classList.remove('bg-slate-100', 'text-slate-700');
                pill.classList.add('bg-rose-600', 'text-white');

                state.activeCategory = pill.dataset.category;
                renderProductGrids();
            });
        });

        // Live Header Search Input
        const searchInput = document.getElementById('main-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                state.searchQuery = e.target.value;
                renderProductGrids();
            });
        }

        // Sort By Select
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                state.sortBy = e.target.value;
                renderProductGrids();
            });
        }

        // Quick View Modal Close
        const modal = document.getElementById('quick-view-modal');
        const closeModalBtn = document.getElementById('close-quickview-btn');
        const modalOverlay = document.getElementById('quickview-overlay');

        [closeModalBtn, modalOverlay].forEach(el => el?.addEventListener('click', () => {
            modal?.classList.add('hidden');
        }));
    }

    // Add product to Cart logic
    function addToCart(productId, qty = 1) {
        const liveProducts = getLiveProducts();
        const product = liveProducts.find(p => p.id === productId);
        if (!product || product.inStock === false) return;

        const existingItem = state.cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.qty += qty;
        } else {
            state.cart.push({
                id: product.id,
                title: product.title,
                priceLKR: product.priceLKR,
                image: product.image,
                brand: product.brand,
                qty: qty
            });
        }

        saveCart();
        updateCartBadge();
        renderCartDrawer();
        showToast(`Added "${product.title}" to cart!`, 'success');
    }
    window.addToCart = addToCart;

    // Toggle Wishlist logic
    function toggleWishlist(productId) {
        const index = state.wishlist.indexOf(productId);
        const liveProducts = getLiveProducts();
        const product = liveProducts.find(p => p.id === productId);
        
        if (index > -1) {
            state.wishlist.splice(index, 1);
            showToast(`Removed from Wishlist`, 'info');
        } else {
            state.wishlist.push(productId);
            showToast(`Added "${product?.title || 'Item'}" to Wishlist!`, 'success');
        }

        localStorage.setItem('simply_wishlist', JSON.stringify(state.wishlist));
        updateWishlistBadge();
        renderProductGrids();
    }

    // Save cart state
    function saveCart() {
        localStorage.setItem('simply_cart', JSON.stringify(state.cart));
    }

    // Update cart badge counts
    function updateCartBadge() {
        const totalItems = state.cart.reduce((sum, item) => sum + item.qty, 0);
        document.querySelectorAll('.cart-count-badge').forEach(badge => {
            badge.textContent = totalItems;
            badge.classList.toggle('hidden', totalItems === 0);
        });
    }

    // Update wishlist badge count
    function updateWishlistBadge() {
        const count = state.wishlist.length;
        document.querySelectorAll('.wishlist-count-badge').forEach(badge => {
            badge.textContent = count;
            badge.classList.toggle('hidden', count === 0);
        });
    }

    // Render Side-over Cart Drawer
    function renderCartDrawer() {
        const cartItemsContainer = document.getElementById('cart-drawer-items');
        const cartSubtotalEl = document.getElementById('cart-subtotal-price');
        const cartDrawerFooter = document.getElementById('cart-drawer-footer');

        if (!cartItemsContainer) return;

        if (state.cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
                    <i class="fas fa-shopping-basket text-6xl mb-4 text-slate-200"></i>
                    <p class="text-base font-semibold text-slate-700">Your Cart is Empty</p>
                    <p class="text-xs mt-1 text-slate-400">Explore our categories and add items to your shopping cart.</p>
                </div>
            `;
            if (cartSubtotalEl) cartSubtotalEl.textContent = formatPrice(0);
            if (cartDrawerFooter) cartDrawerFooter.classList.add('opacity-50', 'pointer-events-none');
            return;
        }

        if (cartDrawerFooter) cartDrawerFooter.classList.remove('opacity-50', 'pointer-events-none');

        let totalLKR = 0;
        cartItemsContainer.innerHTML = state.cart.map((item, index) => {
            const itemTotal = item.priceLKR * item.qty;
            totalLKR += itemTotal;

            return `
            <div class="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl relative group">
                <img src="${item.image}" alt="${item.title}" class="w-16 h-16 object-cover rounded-lg bg-white border border-slate-200">
                <div class="flex-1 min-w-0">
                    <h4 class="text-xs font-semibold text-slate-800 line-clamp-1">${item.title}</h4>
                    <p class="text-rose-600 font-extrabold text-xs mt-0.5">${formatPrice(item.priceLKR)}</p>
                    
                    <div class="flex items-center gap-2 mt-2">
                        <div class="flex items-center border border-slate-200 rounded-md bg-white">
                            <button class="px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-100 rounded-l cart-qty-minus" data-index="${index}">-</button>
                            <span class="px-2 text-xs font-bold text-slate-800">${item.qty}</span>
                            <button class="px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-100 rounded-r cart-qty-plus" data-index="${index}">+</button>
                        </div>
                    </div>
                </div>

                <button class="text-slate-400 hover:text-rose-600 p-1.5 remove-cart-item" data-index="${index}" title="Remove Item">
                    <i class="fas fa-trash-alt text-xs"></i>
                </button>
            </div>
            `;
        }).join('');

        if (cartSubtotalEl) cartSubtotalEl.textContent = formatPrice(totalLKR);

        // Cart Drawer quantity handlers
        cartItemsContainer.querySelectorAll('.cart-qty-minus').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.index);
                if (state.cart[idx].qty > 1) {
                    state.cart[idx].qty--;
                } else {
                    state.cart.splice(idx, 1);
                }
                saveCart();
                updateCartBadge();
                renderCartDrawer();
            });
        });

        cartItemsContainer.querySelectorAll('.cart-qty-plus').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.index);
                state.cart[idx].qty++;
                saveCart();
                updateCartBadge();
                renderCartDrawer();
            });
        });

        cartItemsContainer.querySelectorAll('.remove-cart-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.index);
                state.cart.splice(idx, 1);
                saveCart();
                updateCartBadge();
                renderCartDrawer();
            });
        });
    }

    // Quick View Modal Content Population
    function openQuickView(productId) {
        const liveProducts = getLiveProducts();
        const product = liveProducts.find(p => p.id === productId);
        if (!product) return;

        const modal = document.getElementById('quick-view-modal');
        const modalBody = document.getElementById('quick-view-content');
        if (!modal || !modalBody) return;

        const installment3x = Math.round(product.priceLKR / 3);
        const inStock = product.inStock !== false;

        modalBody.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                <!-- Image Section -->
                <div class="flex flex-col gap-3">
                    <div class="aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                        <img id="qv-main-img" src="${product.image}" alt="${product.title}" class="w-full h-full object-cover">
                    </div>
                    ${product.secondaryImage ? `
                    <div class="flex gap-2">
                        <img src="${product.image}" class="w-16 h-16 object-cover rounded-lg border-2 border-rose-600 cursor-pointer thumbnail-img">
                        <img src="${product.secondaryImage}" class="w-16 h-16 object-cover rounded-lg border border-slate-200 cursor-pointer thumbnail-img">
                    </div>
                    ` : ''}
                </div>

                <!-- Details Section -->
                <div class="flex flex-col justify-between">
                    <div>
                        <div class="flex items-center gap-2 mb-2">
                            <span class="bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-0.5 rounded-md uppercase">${product.brand || 'Generic'}</span>
                            <span class="text-xs font-semibold ${inStock ? 'text-emerald-600' : 'text-rose-600'}">
                                <i class="fas ${inStock ? 'fa-check-circle' : 'fa-times-circle'}"></i> ${inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                        </div>
                        <h2 class="text-xl font-bold text-slate-900 leading-snug">${product.title}</h2>
                        
                        <div class="flex items-center gap-2 mt-2 text-sm">
                            <div class="flex text-amber-400">
                                <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
                            </div>
                            <span class="font-bold text-slate-700">${product.rating || 5.0}</span>
                            <span class="text-slate-400">(${product.reviewsCount || 1} customer reviews)</span>
                        </div>

                        <!-- Price Section -->
                        <div class="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-150">
                            <div class="flex items-baseline gap-3">
                                <span class="text-2xl font-black text-rose-600">${formatPrice(product.priceLKR)}</span>
                                ${product.originalPriceLKR ? `<span class="text-slate-400 text-sm line-through">${formatPrice(product.originalPriceLKR)}</span>` : ''}
                            </div>
                            <p class="text-xs text-slate-600 mt-1">
                                Pay in 3 installments of <strong class="text-slate-900">${formatPrice(installment3x)}</strong> with Koko / Mintpay
                            </p>
                        </div>

                        <!-- Description -->
                        <p class="text-slate-600 text-xs leading-relaxed mt-4">${product.description || ''}</p>
                    </div>

                    <!-- Quantity & Actions -->
                    <div class="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-3">
                        <div class="flex items-center gap-3">
                            <div class="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white">
                                <button id="qv-minus" class="px-3 py-2 text-slate-600 hover:bg-slate-100 font-bold">-</button>
                                <span id="qv-qty-val" class="px-4 text-sm font-bold text-slate-800">1</span>
                                <button id="qv-plus" class="px-3 py-2 text-slate-600 hover:bg-slate-100 font-bold">+</button>
                            </div>

                            <button id="qv-add-cart" class="flex-1 ${inStock ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30' : 'bg-slate-300 cursor-not-allowed'} text-white font-bold py-2.5 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg" ${!inStock ? 'disabled' : ''}>
                                <i class="fas fa-shopping-bag"></i> ${inStock ? 'Add To Cart' : 'Sold Out'}
                            </button>
                        </div>

                        <!-- Direct WhatsApp Order Button -->
                        <a href="https://wa.me/94771234567?text=${encodeURIComponent(`Hi SimplyTek, I want to buy: ${product.title} (${formatPrice(product.priceLKR)})`)}" target="_blank" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm text-center transition flex items-center justify-center gap-2 shadow-md">
                            <i class="fab fa-whatsapp text-lg"></i> Order via WhatsApp Instant
                        </a>
                    </div>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');

        let qvQty = 1;
        const qtyValEl = document.getElementById('qv-qty-val');
        document.getElementById('qv-minus')?.addEventListener('click', () => {
            if (qvQty > 1) {
                qvQty--;
                if (qtyValEl) qtyValEl.textContent = qvQty;
            }
        });
        document.getElementById('qv-plus')?.addEventListener('click', () => {
            qvQty++;
            if (qtyValEl) qtyValEl.textContent = qvQty;
        });

        document.getElementById('qv-add-cart')?.addEventListener('click', () => {
            if (inStock) {
                addToCart(product.id, qvQty);
                modal.classList.add('hidden');
            }
        });

        document.querySelectorAll('.thumbnail-img').forEach(thumb => {
            thumb.addEventListener('click', (e) => {
                const mainImg = document.getElementById('qv-main-img');
                if (mainImg) mainImg.src = e.target.src;
            });
        });
    }

    // Flash Sale Timer logic
    function startFlashSaleTimer() {
        const timerHours = document.getElementById('timer-hours');
        const timerMinutes = document.getElementById('timer-minutes');
        const timerSeconds = document.getElementById('timer-seconds');

        if (!timerHours || !timerMinutes || !timerSeconds) return;

        let totalSeconds = 28800; // 8 hours countdown

        setInterval(() => {
            if (totalSeconds <= 0) totalSeconds = 28800;
            totalSeconds--;

            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            timerHours.textContent = String(hours).padStart(2, '0');
            timerMinutes.textContent = String(minutes).padStart(2, '0');
            timerSeconds.textContent = String(seconds).padStart(2, '0');
        }, 1000);
    }

    // Toast Notification System
    function showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-white text-xs font-bold transition-all duration-300 transform translate-y-2 ${type === 'success' ? 'bg-slate-900 border-l-4 border-rose-500' : 'bg-slate-800'}`;
        toast.innerHTML = `
            <i class="${type === 'success' ? 'fas fa-check-circle text-rose-500 text-sm' : 'fas fa-info-circle text-blue-400 text-sm'}"></i>
            <span>${message}</span>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('opacity-0', '-translate-y-2');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
});
