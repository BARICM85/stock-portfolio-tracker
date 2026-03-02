let portfolio = loadPortfolio();

/* ================= LIVE PRICE FETCH ================= */

async function fetchLivePrice(symbol) {
    try {
        const response = await fetch(
            "https://stock-price-proxy-2owf.onrender.com/price/" + symbol
        );

        if (!response.ok) return null;

        const data = await response.json();

        if (data && data.price !== undefined) {
            return Number(data.price);
        }

        return null;

    } catch (error) {
        console.error("Live fetch error:", error);
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

    let totalInvested = 0;
    let totalCurrent = 0;

    let bestStock = null;
    let worstStock = null;

    for (let stock of portfolio) {

        try {
            const livePrice = await fetchLivePrice(stock.symbol);
            if (livePrice !== null && !isNaN(livePrice)) {
                stock.currentPrice = livePrice;
            }
        } catch {}

        const invested = stock.quantity * stock.price;
        const current = stock.quantity * stock.currentPrice;
        const gain = current - invested;
        const gainPercent = invested > 0 ? (gain / invested) * 100 : 0;

        totalInvested += invested;
        totalCurrent += current;

        if (!bestStock || gainPercent > bestStock.gainPercent) {
            bestStock = { name: stock.name, gainPercent };
        }

        if (!worstStock || gainPercent < worstStock.gainPercent) {
            worstStock = { name: stock.name, gainPercent };
        }

        const color = gain >= 0 ? "green" : "red";

        html += `
            <p>
            <strong>${stock.name}</strong>
            | Qty: ${stock.quantity}
            | Buy: ₹${stock.price}
            | Live: ₹${stock.currentPrice}
            | <span style="color:${color}">
              P/L: ₹${gain.toFixed(2)} (${gainPercent.toFixed(2)}%)
              </span>
            </p>
        `;
    }

    const totalGain = totalCurrent - totalInvested;
    const totalPercent = totalInvested > 0
        ? ((totalGain / totalInvested) * 100).toFixed(2)
        : 0;

    const summaryColor = totalGain >= 0 ? "green" : "red";

    html = `
        <div style="padding:15px;border:1px solid #ccc;margin-bottom:15px;">
            <h3>Portfolio Summary</h3>
            <p>Total Invested: ₹${totalInvested.toFixed(2)}</p>
            <p>Total Current Value: ₹${totalCurrent.toFixed(2)}</p>
            <p style="color:${summaryColor}">
                Total P/L: ₹${totalGain.toFixed(2)} (${totalPercent}%)
            </p>
            <p>Best Performer: ${bestStock ? bestStock.name : "-"} 
                (${bestStock ? bestStock.gainPercent.toFixed(2) : 0}%)</p>
            <p>Worst Performer: ${worstStock ? worstStock.name : "-"} 
                (${worstStock ? worstStock.gainPercent.toFixed(2) : 0}%)</p>
        </div>
    ` + html;

    savePortfolio(portfolio);
    document.getElementById("content").innerHTML = html;
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

    // Prevent duplicate stock
    const existing = portfolio.find(s => s.name === name);
    if (existing) {
        existing.quantity += quantity;
        existing.price = price;
    } else {
        portfolio.push({
            name,
            symbol,
            quantity,
            price,
            currentPrice: price
        });
    }

    savePortfolio(portfolio);
    showPortfolio();
}

/* ================= EXCEL UPLOAD ================= */

function showUpload() {
    document.getElementById("content").innerHTML = `
        <h2>Upload Excel Portfolio</h2>
        <p>Excel format: name | quantity | price</p>
        <input type="file" id="excelFile" accept=".xlsx,.xls">
        <br><br>
        <button onclick="handleExcelUpload()">Upload</button>
    `;
}

function handleExcelUpload() {
    const fileInput = document.getElementById("excelFile");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a file.");
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const json = XLSX.utils.sheet_to_json(sheet);

        portfolio = loadPortfolio();

        json.forEach(row => {
            const name = String(row.name || "").toUpperCase();
            const quantity = parseFloat(row.quantity);
            const price = parseFloat(row.price);

            if (!name || isNaN(quantity) || isNaN(price)) return;

            const existing = portfolio.find(s => s.name === name);

            if (existing) {
                existing.quantity += quantity;
                existing.price = price;
            } else {
                portfolio.push({
                    name,
                    symbol: name + ".NS",
                    quantity,
                    price,
                    currentPrice: price
                });
            }
        });

        savePortfolio(portfolio);
        alert("Excel uploaded successfully!");
        showPortfolio();
    };

    reader.readAsArrayBuffer(file);
}
async function showBenchmark() {

    portfolio = loadPortfolio();

    const invested = calculateTotalInvested(portfolio);
    const current = calculateCurrentValue(portfolio);

    const portfolioReturn =
        invested > 0 ? ((current - invested) / invested) * 100 : 0;

    const niftyPrice = await fetchLivePrice("^NSEI");

    document.getElementById("content").innerHTML = `
        <h2>Benchmark Comparison</h2>
        <p>Your Portfolio Return: ${portfolioReturn.toFixed(2)}%</p>
        <p>Nifty Current Level: ₹${niftyPrice || "Unavailable"}</p>
        <p>(Full return tracking requires historical data — can add next)</p>
    `;
}
function showRisk() {

    portfolio = loadPortfolio();

    let total = calculateCurrentValue(portfolio);

    let highestWeight = 0;

    portfolio.forEach(stock => {
        const weight = (stock.quantity * stock.currentPrice) / total;
        if (weight > highestWeight) highestWeight = weight;
    });

    let riskLevel = "Low";

    if (highestWeight > 0.50) riskLevel = "High";
    else if (highestWeight > 0.30) riskLevel = "Moderate";

    document.getElementById("content").innerHTML = `
        <h2>Risk Analysis</h2>
        <p>Highest Stock Allocation: ${(highestWeight * 100).toFixed(2)}%</p>
        <p>Risk Level: <strong>${riskLevel}</strong></p>
        <p>(Add historical volatility later for advanced risk metrics)</p>
    `;
}
function showAllocation() {
    portfolio = loadPortfolio();

    if (portfolio.length === 0) {
        document.getElementById("content").innerHTML = "<p>No stocks added.</p>";
        return;
    }

    let labels = [];
    let values = [];

    portfolio.forEach(stock => {
        labels.push(stock.name);
        values.push(stock.quantity * stock.currentPrice);
    });

    document.getElementById("content").innerHTML = `
        <h2>Portfolio Allocation</h2>
        <canvas id="pieChart"></canvas>
    `;

    new Chart(document.getElementById("pieChart"), {
        type: "pie",
        data: {
            labels: labels,
            datasets: [{
                data: values
            }]
        }
    });
}
/* ================= INITIAL LOAD ================= */

showDashboard();



