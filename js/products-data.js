// Sample Product Database for SimplyTek-style E-Commerce Store Template

const PRODUCTS_DATA = [
    {
        id: 1,
        title: "Anker Soundcore Life P2 Mini True Wireless Earbuds",
        category: "audio",
        categoryName: "Audio & Sound",
        brand: "Anker",
        priceLKR: 12900,
        originalPriceLKR: 16500,
        rating: 4.8,
        reviewsCount: 142,
        inStock: true,
        isFlashSale: true,
        flashDiscount: "22% OFF",
        kokoPrice: 4300, // 3 x 4300
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
        secondaryImage: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&auto=format&fit=crop&q=80",
        badge: "BESTSELLER",
        description: "Big Sound, Tiny Size: Soundcore Life P2 Mini TWS earbuds have 10mm drivers that boost quality sound with deep bass. 3 EQ modes (Soundcore Signature, Bass Booster, Podcast).",
        specs: {
            "Bluetooth": "V5.2",
            "Playtime": "8 Hours (32 Hours with Case)",
            "Water Resistance": "IPX5 Waterproof",
            "Warranty": "6 Months Official Warranty"
        },
        colors: ["#000000", "#FFFFFF", "#1E3A8A"]
    },
    {
        id: 2,
        title: "Haylou Solar Plus RT3 Smart Watch with Bluetooth Calling",
        category: "smartwatches",
        categoryName: "Smart Watches",
        brand: "Haylou",
        priceLKR: 15400,
        originalPriceLKR: 18900,
        rating: 4.7,
        reviewsCount: 98,
        inStock: true,
        isFlashSale: true,
        flashDiscount: "18% OFF",
        kokoPrice: 5133,
        image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80",
        secondaryImage: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop&q=80",
        badge: "HOT",
        description: "1.43 inch AMOLED Display | 466*466 Pixels | Bluetooth Phone Calls | 105 Sports Modes | Always-On Display | Heart Rate & SpO2 Monitoring.",
        specs: {
            "Display": "1.43\" AMOLED Display",
            "Battery Life": "7 Days Daily Usage",
            "Calling": "Bluetooth Calling Supported",
            "Warranty": "6 Months Warranty"
        },
        colors: ["#000000", "#9CA3AF"]
    },
    {
        id: 3,
        title: "Baseus GaN5 Pro 65W Fast Charger Desktop Power Strip",
        category: "power",
        categoryName: "Power & Cables",
        brand: "Baseus",
        priceLKR: 14500,
        originalPriceLKR: 17200,
        rating: 4.9,
        reviewsCount: 76,
        inStock: true,
        isFlashSale: false,
        kokoPrice: 4833,
        image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80",
        secondaryImage: "https://images.unsplash.com/photo-1622445268121-ec11d3266322?w=600&auto=format&fit=crop&q=80",
        badge: "NEW",
        description: "Baseus 65W GaN5 Pro Quick Charge Wall Charger with Type-C to Type-C 100W Cable. Charge laptops, MacBooks, iPhones, and Android devices simultaneously.",
        specs: {
            "Output": "65W Max USB-C + USB-A",
            "Technology": "5th Gen GaN Chipset",
            "Safety": "Overvoltage & Surge Protection",
            "Warranty": "6 Months Warranty"
        },
        colors: ["#000000", "#FFFFFF"]
    },
    {
        id: 4,
        title: "Joyroom JR-T03S Pro ANC Noise Cancelling TWS Earbuds",
        category: "audio",
        categoryName: "Audio & Sound",
        brand: "Joyroom",
        priceLKR: 9800,
        originalPriceLKR: 12500,
        rating: 4.6,
        reviewsCount: 215,
        inStock: true,
        isFlashSale: true,
        flashDiscount: "21% OFF",
        kokoPrice: 3266,
        image: "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=600&auto=format&fit=crop&q=80",
        secondaryImage: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
        badge: "SALE",
        description: "Active Noise Cancellation (ANC) with Wireless Charging case. Crystal clear calls, dual mic noise reduction, and custom fit silicone ear tips.",
        specs: {
            "Noise Cancellation": "Active ANC up to 25dB",
            "Charging": "Qi Wireless & Lightning Port",
            "Playtime": "5 Hours continuous play",
            "Warranty": "3 Months Warranty"
        },
        colors: ["#FFFFFF"]
    },
    {
        id: 5,
        title: "Anker 335 Power Bank (PowerCore 20K) 20000mAh 20W Fast Charge",
        category: "power",
        categoryName: "Power & Cables",
        brand: "Anker",
        priceLKR: 16800,
        originalPriceLKR: 19900,
        rating: 4.9,
        reviewsCount: 310,
        inStock: true,
        isFlashSale: false,
        kokoPrice: 5600,
        image: "https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=600&auto=format&fit=crop&q=80",
        secondaryImage: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80",
        badge: "TOP RATED",
        description: "Ultra-High Capacity 20,000mAh power bank with 20W Power Delivery output. Charge iPhone 14 / 15 up to 4.3 times or Samsung Galaxy S23 up to 3.1 times.",
        specs: {
            "Capacity": "20,000 mAh / 74Wh",
            "Ports": "1x USB-C In/Out, 2x USB-A Out",
            "Protection": "MultiProtect Safety System",
            "Warranty": "6 Months Official Warranty"
        },
        colors: ["#000000", "#1E3A8A"]
    },
    {
        id: 6,
        title: "Kugoo Kirin M4 Pro Electric Scooter 500W Motor",
        category: "lifestyle",
        categoryName: "Smart Lifestyle",
        brand: "Kugoo",
        priceLKR: 245000,
        originalPriceLKR: 275000,
        rating: 4.9,
        reviewsCount: 34,
        inStock: true,
        isFlashSale: false,
        kokoPrice: 81666,
        image: "https://images.unsplash.com/photo-1597086884639-6f97d519b48c?w=600&auto=format&fit=crop&q=80",
        secondaryImage: "https://images.unsplash.com/photo-1597086884639-6f97d519b48c?w=600&auto=format&fit=crop&q=80",
        badge: "PREMIUM",
        description: "500W Powerful Motor | 45 km/h Max Speed | Up to 55 km Range | Dual Disc Brakes | 10 inch Off-Road Tires with LED Headlight.",
        specs: {
            "Motor": "500W Rear Hub Brushless",
            "Battery": "48V 18Ah Lithium",
            "Max Load": "150 kg",
            "Warranty": "1 Year Motor & Controller Warranty"
        },
        colors: ["#000000"]
    },
    {
        id: 7,
        title: "Razer BlackShark V2 X Gaming Headset 7.1 Surround",
        category: "gaming",
        categoryName: "Gaming & PC",
        brand: "Razer",
        priceLKR: 21900,
        originalPriceLKR: 24900,
        rating: 4.8,
        reviewsCount: 88,
        inStock: true,
        isFlashSale: true,
        flashDiscount: "12% OFF",
        kokoPrice: 7300,
        image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80",
        secondaryImage: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
        badge: "GAMING",
        description: "7.1 Surround Sound for accurate positional audio. TriForce 50mm Drivers, HyperClear Cardioid Mic, and advanced passive noise cancellation ear cushions.",
        specs: {
            "Connectivity": "3.5mm Analog Audio Jack",
            "Drivers": "Razer TriForce 50mm",
            "Weight": "240g Ultra Light",
            "Warranty": "1 Year Official Warranty"
        },
        colors: ["#000000", "#10B981"]
    },
    {
        id: 8,
        title: "Xiaomi Smart Air Purifier 4 Compact HEPA H13",
        category: "smarthome",
        categoryName: "Smart Home",
        brand: "Xiaomi",
        priceLKR: 32500,
        originalPriceLKR: 36900,
        rating: 4.7,
        reviewsCount: 52,
        inStock: true,
        isFlashSale: false,
        kokoPrice: 10833,
        image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&auto=format&fit=crop&q=80",
        secondaryImage: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80",
        badge: "SMART HOME",
        description: "Compact desk or floor air purifier. Captures 99.97% of particles as small as 0.3 microns. Smart Mi Home app control + Alexa & Google Assistant support.",
        specs: {
            "Coverage": "Up to 27 m² Area",
            "Filter": "3-in-1 High Efficiency Filter",
            "Control": "Mi Home App / Voice Control",
            "Warranty": "6 Months Warranty"
        },
        colors: ["#FFFFFF"]
    }
];

// Product Categories list for navigation and filters
const CATEGORIES = [
    { id: "all", name: "All Products", icon: "fa-th-large" },
    { id: "audio", name: "Audio & Sound", icon: "fa-headphones-alt", count: 24 },
    { id: "smartwatches", name: "Smart Watches", icon: "fa-stopwatch", count: 18 },
    { id: "power", name: "Power & Cables", icon: "fa-bolt", count: 32 },
    { id: "gaming", name: "Gaming Gear", icon: "fa-gamepad", count: 15 },
    { id: "smarthome", name: "Smart Home", icon: "fa-home", count: 12 },
    { id: "lifestyle", name: "Smart Lifestyle", icon: "fa-bicycle", count: 8 }
];

// Featured Brands
const BRANDS = ["Anker", "Haylou", "Baseus", "Joyroom", "Xiaomi", "Razer", "Kugoo", "Apple", "Samsung"];
