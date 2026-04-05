// Network Management Dashboard - Dummy Data Generator
// Focus on requested categories: Electronics, Seasonal Vegetables, Green Leafy Vegetables, Carbonated Drinks, Clothes, Beauty Products

const CATEGORIES = {
    "Electronics": ["Smartphones", "Laptops", "Headphones", "Smartwatches", "Chargers"],
    "Seasonal Vegetables": ["Tomatoes", "Cucumbers", "Pumpkins", "Carrots", "Bell Peppers"],
    "Green Leafy Vegetables": ["Spinach", "Kale", "Mint", "Coriander", "Lettuce"],
    "Carbonated Drinks": ["Cola", "Lemon Lime", "Ginger Ale", "Sparkling Water", "Energy Soda"],
    "Clothes": ["Jackets", "Shirts", "Trousers", "T-Shirts", "Dresses"],
    "Beauty Products": ["Face Serum", "Moisturizer", "Lipstick", "Sunscreen", "Shampoo"]
};

// Helper function to generate random variations
const randomRange = (min, max) => Math.random() * (max - min) + min;
const randomInt = (min, max) => Math.floor(randomRange(min, max));

// 1. ABC-XYZ Matrix Data
// Classifies products by revenue (A, B, C) and demand volatility (X, Y, Z)
function generateABCXYZData() {
    const data = [];
    Object.keys(CATEGORIES).forEach(category => {
        CATEGORIES[category].forEach(subCat => {
            // Logic: 
            // Electronics are usually A-X or B-Y (High rev)
            // Vegetables are usually C-Z or B-Z (volatile demand, lower individual item revenue but high turnover)
            
            let revenueClass = 'B';
            let volatilityClass = 'Y';
            let revenue = 0;
            let holdingCost = 0;

            if (category === "Electronics") {
                revenueClass = 'A';
                volatilityClass = Math.random() > 0.5 ? 'X' : 'Y';
                revenue = randomInt(500000, 1500000);
                holdingCost = randomInt(15, 25); // high tech holding cost
            } else if (category.includes("Vegetables")) {
                revenueClass = 'C';
                volatilityClass = 'Z'; // Highly erratic due to perishability
                revenue = randomInt(50000, 200000);
                holdingCost = randomInt(30, 50); // refrigeration
            } else if (category === "Clothes") {
                revenueClass = Math.random() > 0.5 ? 'A' : 'B';
                volatilityClass = 'Y'; // Seasonal trend
                revenue = randomInt(200000, 800000);
                holdingCost = randomInt(10, 20);
            } else {
                revenueClass = 'B';
                volatilityClass = 'X'; 
                revenue = randomInt(100000, 500000);
                holdingCost = randomInt(5, 15);
            }

            // Force some C-Z items for testing the minimizing panel
            if (subCat === "Mint" || subCat === "Ginger Ale" || subCat === "Chargers") {
                revenueClass = 'C';
                volatilityClass = 'Z';
            }

            data.push({
                category,
                subCat,
                class: `${revenueClass}-${volatilityClass}`,
                revenue,
                holdingCost,
                turnoverRatio: randomRange(0.5, 12).toFixed(1), // < 2 is bad
                gmroii: randomRange(0.8, 5.5).toFixed(2)
            });
        });
    });
    return data.sort((a,b) => b.revenue - a.revenue);
}

// 2. Sales Velocity Data (Units per day approximation)
function generateVelocityData() {
    return [
        { category: "Carbonated Drinks", velocity: 450, color: "rgba(59, 130, 246, 0.8)" },
        { category: "Green Leafy Vegetables", velocity: 380, color: "rgba(16, 185, 129, 0.8)" },
        { category: "Seasonal Vegetables", velocity: 320, color: "rgba(16, 185, 129, 0.6)" },
        { category: "Beauty Products", velocity: 150, color: "rgba(139, 92, 246, 0.8)" },
        { category: "Clothes", velocity: 85, color: "rgba(245, 158, 11, 0.8)" },
        { category: "Electronics", velocity: 25, color: "rgba(239, 68, 68, 0.8)" }
    ];
}

// 3. GMROII Scatter Data
function generateGMROIIScatter() {
    const rawData = generateABCXYZData();
    return rawData.map(item => ({
        x: parseFloat(item.turnoverRatio),
        y: parseFloat(item.gmroii),
        r: Math.max(item.revenue / 100000, 4), // Bubble size
        label: item.subCat,
        category: item.category
    }));
}

// 4. Congestion Map (Storage Utilization vs Turnover)
// Represented as labels, data (storage %), and background colors (turnover rate heat)
function generateCongestionData() {
    return {
        labels: ["Clothes", "Electronics", "Seasonal Veg", "Carbonated Drinks", "Beauty", "Leafy Veg"],
        data: [35, 20, 15, 15, 10, 5],
        turnoverIndication: [
            "rgba(239, 68, 68, 0.7)",  // Red (Slow turn, space hog)
            "rgba(245, 158, 11, 0.7)", // Amber
            "rgba(16, 185, 129, 0.7)", // Green (Fast turn)
            "rgba(16, 185, 129, 0.9)", // Green
            "rgba(59, 130, 246, 0.7)", // Blue (Stable)
            "rgba(16, 185, 129, 0.7)"  // Green
        ]
    };
}

// 5. Forecast vs Actual (Prediction Intervals Simulation)
function generateForecastData() {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    // Let's use Clothes (Jackets) as an example of volatile forecasting
    const actual = [200, 220, 180, 150, 120, 90]; 
    const forecast = [190, 210, 190, 170, 140, 100];
    const upperLimit = forecast.map(v => v * 1.2);
    const lowerLimit = forecast.map(v => v * 0.8);
    
    return { months, actual, forecast, upperLimit, lowerLimit };
}

// 6. Actionable Alerts Simulation
function generateAlerts() {
    return [
        { type: "reduce", target: "Winter Jackets", desc: "C-Z classification. Expected savings: $14,000 + 12% space freed." },
        { type: "increase", target: "Face Serum", desc: "High velocity, low stock. Expected profit lift: $6,500." },
        { type: "transfer", target: "Ginger Ale", desc: "Transfer 500 units from Store A to Store B to balance DOS." }
    ];
}

// 7. Store Level Output
function generateStoreData() {
    const stores = ["Store Alpha", "Store Beta", "Store Gamma", "Store Delta"];
    return {
        footfall: stores.map(() => randomInt(500, 2000)),
        conversion: stores.map(() => randomInt(15, 45)), // percentage
        stockoutRisk: stores.map(() => randomInt(2, 10)),
        labels: stores
    };
}

// 8. Redistribution Maps
function generateRedistributionNetwork() {
    return [
        { from: "Store Alpha", to: "Store Gamma", volume: 120, category: "Carbonated Drinks" },
        { from: "Warehouse B", to: "Store Delta", volume: 450, category: "Seasonal Vegetables" },
        { from: "Store Beta", to: "Store Alpha", volume: 50, category: "Beauty Products" }
    ];
}

// 9. Regional Sales 
function generateRegionalData() {
    const regions = ["North", "South", "East", "West"];
    return {
        labels: regions,
        marketShare: [35, 25, 20, 20],
        trend: {
            months: ["Q1", "Q2", "Q3", "Q4"],
            North: [100, 110, 120, 125],
            South: [80, 85, 90, 85],
            East: [60, 65, 75, 80],
            West: [70, 72, 70, 68]
        },
        dominance: [
            [40, 20, 10, 30, 0, 0], // North
            [20, 40, 20, 10, 10, 0], // South
            [10, 10, 50, 10, 10, 10], // East
            [30, 10, 10, 10, 20, 20]  // West
        ]
    };
}

// 10. Supplier Specs
function generateSupplierData() {
    const suppliers = ["TechCorp", "FarmFresh", "GreenValley", "SparkleBev", "WearVogue", "GlowUp"];
    return {
        labels: suppliers,
        leadTimeVar: [1.2, 3.5, 2.1, 0.5, 4.2, 1.8], // Variance in days
        defectRate: [0.5, 4.2, 2.5, 0.1, 1.2, 0.8] // Percentage
    };
}

// 11. Predictive Variables
function generatePredictiveData() {
    return {
        labels: ["Price Elasticity", "Marketing Spend", "Local Weather", "Competitor Promos"],
        weights: [45, 25, 20, 10], // Importance weighting
        confidence: [87, 92, 78, 65, 81] // Score over tests
    };
}

// Export to window
window.MockData = {
    abcXyz: generateABCXYZData(),
    velocity: generateVelocityData(),
    gmroii: generateGMROIIScatter(),
    congestion: generateCongestionData(),
    forecast: generateForecastData(),
    alerts: generateAlerts(),
    store: generateStoreData(),
    redistribution: generateRedistributionNetwork(),
    regional: generateRegionalData(),
    supplier: generateSupplierData(),
    predictive: generatePredictiveData()
};

