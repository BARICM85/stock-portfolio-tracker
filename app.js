let portfolio = loadPortfolio();

function showDashboard() {
    const invested = calculateTotalInvested(portfolio);
    const current = calculateCurrentValue(portfolio);
    const profit = current - invested;

    document.getElementById("content").innerHTML = `
        <h2>Dashboard</h2>
        <p>Total Invested: ₹${invested}</p>
        <p>Current Value: ₹${current}</p>
        <p>Profit/Loss: ₹${profit}</p>
    `;
}

async function showPortfolio() {
    let html = "<h2>Portfolio</h2>";

    for (let stock of portfolio) {
        const livePrice = await fetchLivePrice(stock.symbol);

        if (livePrice) {
            stock.currentPrice = livePrice;
        }

        html += `
            <p>
            ${stock.name} 
            | Qty: ${stock.quantity} 
            | Buy: ₹${stock.price}
            | Live: ₹${stock.currentPrice}
            </p>
        `;
    }

    savePortfolio(portfolio);
    document.getElementById("content").innerHTML = html;
}

function showAddStock() {
    document.getElementById("content").innerHTML = `
        <h2>Add Stock</h2>
        <input id="name" placeholder="Stock Name">
        <input id="quantity" type="number" placeholder="Quantity">
        <input id="price" type="number" placeholder="Buy Price">
        <button onclick="addStock()">Add</button>
    `;
}

async function addStock() {
    const name = document.getElementById("name").value.toUpperCase();
    const quantity = parseFloat(document.getElementById("quantity").value);
    const price = parseFloat(document.getElementById("price").value);

    const symbol = name + ".NS";  // NSE stocks

    const livePrice = await fetchLivePrice(symbol);

    portfolio.push({
        name,
        symbol,
        quantity,
        price,
        currentPrice: livePrice ? livePrice : price
    });

    savePortfolio(portfolio);
    showPortfolio();
}