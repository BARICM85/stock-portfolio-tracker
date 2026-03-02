let portfolio = loadPortfolio();

/* ================= LIVE PRICE FETCH ================= */

async function fetchLivePrice(symbol) {
    try {
        const response = await fetch(
            "https://stock-price-proxy-2owf.onrender.com/price/" + symbol
        );

        if (!response.ok) {
            return null;
        }

        const data = await response.json();

        if (data.price !== undefined && !isNaN(data.price)) {
            return parseFloat(data.price);
        }

        return null;
    } catch (error) {
        console.error("Live price fetch error:", error);
        return null;
    }
}

/* ================= DASHBOARD ================= */

function showDashboard() {
    portfolio = loadPortfolio();

    const invested = calculateTotalInvested(portfolio);
    const current = calculateCurrentValue(portfolio);
    const profit = current - invested;
    const percent =
        invested > 0 ? ((profit / invested) * 100).toFixed(2) : 0;

    const color = profit >= 0 ? "green" : "red";

    document.getElementById("content").innerHTML = `
        <h2>Dashboard</h2>
        <p>Total Invested: ₹${invested.toFixed(2)}</p>
        <p>Current Value: ₹${current.toFixed(2)}</p>
        <p style="color:${color}">
            Profit/Loss: ₹${profit.toFixed(2)} (${percent}%)
        </p>
    `;
}

/* ================= PORTFOLIO ================= */

async function showPortfolio() {
    portfolio = loadPortfolio();

    let html = "<h2>Portfolio</h2>";

    for (let stock of portfolio) {

        try {
            const livePrice = await fetchLivePrice(stock.symbol);

            if (livePrice !== null && !isNaN(livePrice)) {
                stock.currentPrice = livePrice;
            }
        } catch (err) {
            console.log("Live price error for", stock.symbol);
        }

        const value = stock.quantity * stock.currentPrice;
        const invested = stock.quantity * stock.price;
        const gain = value - invested;
        const gainPercent =
            invested > 0 ? ((gain / invested) * 100).toFixed(2) : 0;

        const color = gain >= 0 ? "green" : "red";

        html += `
            <p>
            <strong>${stock.name}</strong>
            | Qty: ${stock.quantity}
            | Buy: ₹${stock.price}
            | Live: ₹${stock.currentPrice}
            | <span style="color:${color}">
                P/L: ₹${gain.toFixed(2)} (${gainPercent}%)
              </span>
            </p>
        `;
    }

    savePortfolio(portfolio);
    document.getElementById("content").innerHTML = html;

    // Auto refresh every 30 seconds
    setTimeout(showPortfolio, 30000);
}

/* ================= ADD STOCK ================= */

function showAddStock() {
    document.getElementById("content").innerHTML = `
        <h2>Add Stock</h2>
        <input id="name" placeholder="Stock Name (e.g. RELIANCE)">
        <input id="quantity" type="number" placeholder="Quantity">
        <input id="price" type="number" placeholder="Buy Price">
        <button onclick="addStock()">Add</button>
    `;
}

async function addStock() {
    const nameInput = document.getElementById("name").value.trim();
    const quantity = parseFloat(document.getElementById("quantity").value);
    const price = parseFloat(document.getElementById("price").value);

    if (!nameInput || isNaN(quantity) || isNaN(price)) {
        alert("Please fill all fields correctly.");
        return;
    }

    const name = nameInput.toUpperCase();
    const symbol = name + ".NS";

    let livePrice = price;

    try {
        const fetchedPrice = await fetchLivePrice(symbol);
        if (fetchedPrice !== null && !isNaN(fetchedPrice)) {
            livePrice = fetchedPrice;
        }
    } catch (err) {
        console.log("Live fetch failed, using buy price.");
    }

    portfolio.push({
        name,
        symbol,
        quantity,
        price,
        currentPrice: livePrice
    });

    savePortfolio(portfolio);
    showPortfolio();
}

/* ================= INITIAL LOAD ================= */

showDashboard();


