
// Initial setup
let buyMode = true;
let stockData = [];
let currentPrice = '<%= stockData.quote.c || 684.70 %>';
let openPrice = '<%= stockData.quote.o || 655.95 %>';
let balance = '<%= user ? user.virtualPoints : 10000 %>'; // Get balance from user data
let stocksOwned = 0;
let currentSymbol = '<%= stockData.stockSymbol || "INBK" %>'; // Get symbol from data
let currentPeriod = '1D'; // Default time period

// DOM Elements
const currentValueEl = document.getElementById('currentValue');
const stockChangeEl = document.getElementById('stockChange');
const stockPercentChangeEl = document.getElementById('stockPercentChange');
const nsePriceEl = document.getElementById('nse-price');
const nsePriceOrderEl = document.getElementById('nse-price-order');
const nsePercentEl = document.getElementById('nse-percent');
const executionPriceEl = document.getElementById('execution-price');
const balanceEl = document.getElementById('balance');
const userBalanceEl = document.getElementById('userBalance');
const requiredAmountEl = document.getElementById('required-amount');
const quantityEl = document.getElementById('quantity');
const currentPriceInputEl = document.getElementById('current-price-input');
const orderButton = document.getElementById('order-button');
const buyToggle = document.getElementById('buy-toggle');
const sellToggle = document.getElementById('sell-toggle');
const canvas = document.getElementById('stockChart');
const ctx = canvas.getContext('2d');
const successPopup = document.getElementById('success-popup');
const errorPopup = document.getElementById('error-popup');
const successMessage = document.getElementById('success-message');
const errorMessage = document.getElementById('error-message');
const stockNameEl = document.getElementById('stock-name');
const orderStockNameEl = document.getElementById('order-stock-name');
const searchInput = document.getElementById('stock-search');
const searchButton = document.getElementById('search-button');
const todayLowEl = document.getElementById('todayLow');
const todayHighEl = document.getElementById('todayHigh');
const stockOpenEl = document.getElementById('stockOpen');
const timeButtons = document.querySelectorAll('.time-btn');
const transactionForm = document.getElementById('transaction-form');
const transactionTypeInput = document.getElementById('transactionType');
const stockSymbolInput = document.getElementById('stockSymbolInput');
const companyNameInput = document.getElementById('companyNameInput');
const priceChangeContainer = document.getElementById('price-change-container');

// Initialize chart data based on time period
function initChartData(period = '1D') {
    stockData = [];
    const now = Date.now();
    let dataPoints = 100;
    let timeInterval;
    let startPrice;
    let volatility;
    
    // Configure based on time period
    switch(period) {
        case '1D':
            timeInterval = 5 * 60 * 1000; // 5 minutes
            startPrice = openPrice;
            volatility = 0.005; // 0.5% volatility
            break;
        case '1W':
            timeInterval = 2 * 60 * 60 * 1000; // 2 hours
            startPrice = currentPrice * 0.97;
            volatility = 0.01; // 1% volatility
            break;
        case '1M':
            timeInterval = 8 * 60 * 60 * 1000; // 8 hours
            startPrice = currentPrice * 0.93;
            volatility = 0.015; // 1.5% volatility
            break;
        case '3M':
            timeInterval = 24 * 60 * 60 * 1000; // 1 day
            startPrice = currentPrice * 0.85;
            volatility = 0.02; // 2% volatility
            break;
        case '6M':
            timeInterval = 2 * 24 * 60 * 60 * 1000; // 2 days
            startPrice = currentPrice * 0.75;
            volatility = 0.025; // 2.5% volatility
            break;
        case '1Y':
            timeInterval = 3 * 24 * 60 * 60 * 1000; // 3 days
            startPrice = currentPrice * 0.65;
            volatility = 0.03; // 3% volatility
            break;
        case '3Y':
            timeInterval = 9 * 24 * 60 * 60 * 1000; // 9 days
            startPrice = currentPrice * 0.5;
            volatility = 0.04; // 4% volatility
            break;
        case '5Y':
            timeInterval = 15 * 24 * 60 * 60 * 1000; // 15 days
            startPrice = currentPrice * 0.4;
            volatility = 0.05; // 5% volatility
            break;
        case 'All':
            timeInterval = 30 * 24 * 60 * 60 * 1000; // 30 days
            startPrice = currentPrice * 0.3;
            volatility = 0.06; // 6% volatility
            break;
    }
    
    let price = startPrice;
    
    for (let i = 0; i < dataPoints; i++) {
        // Generate price with random walk but trending toward current price
        const randomFactor = (Math.random() - 0.5) * 2 * volatility;
        const trendFactor = (i / dataPoints) * 0.8; // Stronger trend as we approach current time
        
        // Mix random walk with trend toward current price
        price = price * (1 + randomFactor) * (1 - trendFactor) + currentPrice * trendFactor;
        
        // Ensure last point is current price
        if (i === dataPoints - 1) {
            price = currentPrice;
        }
        
        stockData.push({
            time: now - (dataPoints - i) * timeInterval,
            price: price
        });
    }
}

// Format currency
function formatCurrency(value) {
    return parseFloat(value).toFixed(2);
}

// Draw chart function
function drawChart() {
    // Set canvas dimensions
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Find min and max for scaling
    const prices = stockData.map(data => data.price);
    let minPrice = Math.min(...prices) * 0.995; // Add 0.5% padding
    let maxPrice = Math.max(...prices) * 1.005;
    const priceRange = maxPrice - minPrice;

    // Draw grid
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;

    // Horizontal grid lines
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
        ctx.beginPath();
        const y = 20 + (canvas.height - 40) * (i / gridLines);
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Vertical grid lines
    const timeSpan = stockData[stockData.length - 1].time - stockData[0].time;
    for (let i = 0; i <= 6; i++) {
        ctx.beginPath();
        const x = i * (canvas.width / 6);
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    // Draw chart line
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#1e88e5'; // Blue color theme

    // Plot points
    for (let i = 0; i < stockData.length; i++) {
        const x = (i / (stockData.length - 1)) * canvas.width;
        const y = canvas.height - ((stockData[i].price - minPrice) / priceRange) * (canvas.height - 40) - 20;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();

    // Add area fill under the line
    const lastPoint = stockData.length - 1;
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fillStyle = 'rgba(30, 136, 229, 0.1)'; // Light blue with transparency
    ctx.fill();
}

// Update price with random movement
function updatePrice() {
    // Generate random price movement
    const movement = (Math.random() - 0.48) * 2; // Slightly biased upward
    currentPrice = parseFloat((currentPrice + movement).toFixed(2));
    
    // Set lower bound
    if (currentPrice < 1) currentPrice = 1;
    
    // Update displays
    currentValueEl.textContent = formatCurrency(currentPrice);
    nsePriceEl.textContent = formatCurrency(currentPrice);
    nsePriceOrderEl.textContent = formatCurrency(currentPrice);
    currentPriceInputEl.value = formatCurrency(currentPrice);
    executionPriceEl.textContent = formatCurrency(currentPrice);
    
    // Calculate and update price change
    const priceChange = (currentPrice - openPrice).toFixed(2);
    const priceChangePercent = ((priceChange / openPrice) * 100).toFixed(2);
    
    stockChangeEl.textContent = priceChange >= 0 ? '+' + Math.abs(priceChange) : '-' + Math.abs(priceChange);
    stockPercentChangeEl.textContent = priceChange >= 0 ? '+' + Math.abs(priceChangePercent) : '-' + Math.abs(priceChangePercent);
    nsePercentEl.textContent = priceChange >= 0 ? '+' + Math.abs(priceChangePercent) : '-' + Math.abs(priceChangePercent);
    
    // Update color based on price change
    const priceChangeColor = priceChange >= 0 ? '#00b897' : '#ff5252';
    priceChangeContainer.style.color = priceChangeColor;
    
    // Add new data point to chart if in 1D view
    if (currentPeriod === '1D') {
        stockData.push({
            time: Date.now(),
            price: currentPrice
        });
        
        // Keep only the last 100 points
        if (stockData.length > 100) {
            stockData.shift();
        }
        
        // Redraw chart
        drawChart();
    }
    
    // Update required amount calculation
    updateRequiredAmount();
}

// Calculate required amount
function updateRequiredAmount() {
    const quantity = parseInt(quantityEl.value) || 0;
    const price = parseFloat(currentPriceInputEl.value) || currentPrice;
    const amount = quantity * price;
    
    executionPriceEl.textContent = formatCurrency(price);
    requiredAmountEl.textContent = formatCurrency(amount);
    
    // Check if user has enough balance for buy order
    if (buyMode && amount > balance) {
        orderButton.disabled = true;
        orderButton.classList.add('opacity-50');
        orderButton.classList.add('cursor-not-allowed');
    } else {
        orderButton.disabled = false;
        orderButton.classList.remove('opacity-50');
        orderButton.classList.remove('cursor-not-allowed');
    }
}

// Toggle between buy and sell
function toggleBuySell(isBuy) {
    buyMode = isBuy;
    
    if (isBuy) {
        buyToggle.classList.add('active-buy');
        buyToggle.classList.remove('active-sell');
        sellToggle.classList.remove('active-sell');
        sellToggle.classList.remove('active-buy');
        orderButton.textContent = 'BUY';
        orderButton.classList.add('buy-color');
        orderButton.classList.remove('sell-color');
        transactionTypeInput.value = 'buy';
    } else {
        sellToggle.classList.add('active-sell');
        sellToggle.classList.remove('active-buy');
        buyToggle.classList.remove('active-buy');
        buyToggle.classList.remove('active-sell');
        orderButton.textContent = 'SELL';
        orderButton.classList.add('sell-color');
        orderButton.classList.remove('buy-color');
        transactionTypeInput.value = 'sell';
    }
    
    // Update required amount to check if user has enough balance
    updateRequiredAmount();
}

// Show popup
function showPopup(popupId, message) {
    const popup = document.getElementById(popupId);
    const messageEl = document.getElementById(popupId === 'success-popup' ? 'success-message' : 'error-message');
    if (messageEl) {
        messageEl.textContent = message;
    }
    popup.classList.add('active');
}

// Close popup
function closePopup(popupId) {
    document.getElementById(popupId).classList.remove('active');
}

// Change time period
function changeTimePeriod(period) {
    currentPeriod = period;
    
    // Update active button
    timeButtons.forEach(btn => {
        if (btn.dataset.period === period) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Reinitialize chart data for the selected period
    initChartData(period);
    drawChart();
}

// Fetch stock data from API
async function fetchStockData(symbol) {
    try {
        // Show loading state
        currentValueEl.textContent = 'Loading...';
        stockChangeEl.textContent = '';
        stockPercentChangeEl.textContent = '';
        
        const response = await fetch(`/api/stock/${symbol}`);

        if (!response.ok) throw new Error('Failed to fetch stock data');

        const data = await response.json();

        const quote = data.quote;
        const currentValue = quote.c !== undefined ? quote.c : 'N/A';
        const percentChange = quote.dp !== undefined ? quote.dp : 'N/A';
        const change = quote.d !== undefined ? quote.d : 'N/A';
        const todayLow = quote.l !== undefined ? quote.l : 'N/A';
        const todayHigh = quote.h !== undefined ? quote.h : 'N/A';
        const open = quote.o !== undefined ? quote.o : 'N/A';

        // Update DOM Elements
        currentValueEl.textContent = currentValue;
        stockChangeEl.textContent = change >= 0 ? '+' + change : change;
        stockPercentChangeEl.textContent = percentChange !== 'N/A' ? (percentChange >= 0 ? '+' + percentChange.toFixed(2) : percentChange.toFixed(2)) : 'N/A';
        todayLowEl.textContent = todayLow;
        todayHighEl.textContent = todayHigh;
        stockOpenEl.textContent = open;
        
        // Update current price and other variables
        currentPrice = parseFloat(currentValue) || currentPrice;
        openPrice = parseFloat(open) || openPrice;
        
        // Update stock name
        stockNameEl.textContent = symbol;
        orderStockNameEl.textContent = symbol;
        
        // Update form inputs
        stockSymbolInput.value = symbol;
        companyNameInput.value = symbol; // Using symbol as company name if not available
        currentPriceInputEl.value = currentValue;
        
        // Update price change color
        const priceChangeColor = change >= 0 ? '#00b897' : '#ff5252';
        priceChangeContainer.style.color = priceChangeColor;
        
        // Reinitialize chart with new data
        initChartData(currentPeriod);
        drawChart();
        
        // Update required amount
        updateRequiredAmount();
        
    } catch (error) {
        console.error('Error fetching stock data:', error);
        showPopup('error-popup1', 'Failed to fetch stock data. Please try again.');
    }
}

// Search for a stock
function searchStock() {
    const symbol = searchInput.value.trim().toUpperCase();
    if (symbol) {
        currentSymbol = symbol;
        fetchStockData(symbol);
    } else {
        showPopup('error-popup1', 'Please enter a valid stock symbol.');
    }
}

// Form submission handler
transactionForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const quantity = parseInt(quantityEl.value) || 0;
    const price = parseFloat(currentPriceInputEl.value) || currentPrice;
    const amount = quantity * price;
    
    // Validate quantity
    if (quantity <= 0) {
        showPopup('error-popup', 'Please enter a valid quantity.');
        return;
    }
    
    // Check if user has enough balance for buy order
    if (buyMode && amount > balance) {
        showPopup('error-popup', 'Insufficient balance to place this order.');
        return;
    }
    
    // For sell orders, check if user owns enough shares (this would be implemented server-side)
    if (!buyMode) {
        // This is a placeholder - actual check would be done server-side
        // You could add an API call here to check if user owns enough shares
    }
    
    // Submit the form if all validations pass
    this.submit();
});

// Initialize event listeners
function initEventListeners() {
    // Buy/Sell toggle
    buyToggle.addEventListener('click', () => toggleBuySell(true));
    sellToggle.addEventListener('click', () => toggleBuySell(false));
    
    // Input changes
    quantityEl.addEventListener('input', updateRequiredAmount);
    
    // Time filter buttons
    timeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            changeTimePeriod(this.dataset.period);
        });
    });
    
    // Search button
    searchButton.addEventListener('click', searchStock);
    
    // Search input enter key
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchStock();
        }
    });
    
    // Window resize
    window.addEventListener('resize', drawChart);
}

// Initialize app
function initApp() {
    initChartData();
    drawChart();
    updateRequiredAmount();
    initEventListeners();
    
    // Start real-time updates
    setInterval(updatePrice, 1000);
}

// Start the application
initApp();
