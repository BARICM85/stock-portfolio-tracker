/* ================= GOOGLE LOGIN ================= */

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const provider = new GoogleAuthProvider();

async function googleLogin() {
    try {
        await signInWithPopup(auth, provider);
        showToast("Google Login Successful!");
    } catch (error) {
        showToast(error.message);
    }
}

async function logout() {
    try {
        await signOut(auth);
        showToast("Logged out successfully!");
        showDashboard();
    } catch (error) {
        showToast(error.message);
    }
}

import { loadPortfolio, savePortfolio } from "./storage.js";

// 🔥 Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

let activePortfolio = "portfolioA";
let portfolio = loadPortfolio(activePortfolio);

import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAuJk0uxRGrnFZPocxBAKnIynQAW5pFtr8",
  authDomain: "stock-portfolio-app-244ff.firebaseapp.com",
  projectId: "stock-portfolio-app-244ff",
  storageBucket: "stock-portfolio-app-244ff.firebasestorage.app",
  messagingSenderId: "142779739862",
  appId: "1:142779739862:web:593b35d996c7f3fe692377"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

auth.onAuthStateChanged(user => {
    const profileDiv = document.getElementById("profile");
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    if (user) {
        profileDiv.innerHTML = `
            <img src="${user.photoURL || ''}">
            <p>${user.displayName || user.email}</p>
        `;
        loginBtn.style.display = "none";
        logoutBtn.style.display = "block";
    } else {
        profileDiv.innerHTML = "";
        loginBtn.style.display = "block";
        logoutBtn.style.display = "none";
    }
});

async function savePortfolioToCloud() {
    const user = auth.currentUser;
    if (!user) return;

    await setDoc(doc(db, "portfolios", user.uid), {
        stocks: portfolio
    });

    console.log("Portfolio saved to cloud!");
}

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

async function register() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        showToast("Please enter email and password");
        return;
    }

    if (password.length < 6) {
        showToast("Password must be at least 6 characters");
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        showToast("Registration successful!");
        showDashboard();
    } catch (error) {
        console.error(error);
        showToast(error.message);
    }
}

async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        showToast("Login successful!");
    } catch (error) {
        showToast(error.message);
    }
}

/* ================= CALCULATION HELPERS ================= */

function calculateTotalInvested(portfolio) {
    return portfolio.reduce((total, stock) => {
        const qty = Number(stock.quantity) || 0;
        const price = Number(stock.averagePrice || stock.price) || 0;
        return total + (qty * price);
    }, 0);
}

function calculateCurrentValue(portfolio) {
    return portfolio.reduce((total, stock) => {
        const qty = Number(stock.quantity) || 0;
        const current = Number(stock.currentPrice || stock.averagePrice || stock.price) || 0;
        return total + (qty * current);
    }, 0);
}


/* ================= DASHBOARD ================= */

function showDashboard() {

    portfolio = loadPortfolio() || [];

    const invested = calculateTotalInvested(portfolio);
    const current = calculateCurrentValue(portfolio);
    const profit = current - invested;

    const percent = invested > 0
        ? ((profit / invested) * 100).toFixed(2)
        : "0.00";

    const colorClass = profit >= 0 ? "positive" : "negative";

    document.getElementById("content").innerHTML = `
        <h2>Dashboard</h2>

        <div class="summary-grid">

            <div class="card">
                <h3>Total Invested</h3>
                <p>₹${invested.toFixed(2)}</p>
            </div>

            <div class="card">
                <h3>Current Value</h3>
                <p>₹${current.toFixed(2)}</p>
            </div>

            <div class="card">
                <h3>Total P/L</h3>
                <p class="${colorClass}">
                    ₹${profit.toFixed(2)} (${percent}%)
                </p>
            </div>

        </div>
    `;
}


/* ================= LOGIN SCREEN ================= */

function showLogin() {
    document.getElementById("content").innerHTML = `
        <h2>Login</h2>

        <input id="email" type="email" placeholder="Email">
        <input id="password" type="password" placeholder="Password">

        <br><br>

        <button onclick="register()">Register</button>
        <button onclick="login()">Login</button>
    `;
}
/* ================= PORTFOLIO ================= */

function switchPortfolio(type) {

    activePortfolio = type;

    portfolio = loadPortfolio(activePortfolio);

    showToast("Switched to " + type);

    showPortfolio();
}
async function showPortfolio() {

    portfolio = loadPortfolio();

    let html = `
    <h2>Portfolio - ${activePortfolio}</h2>

    <div style="margin-bottom:15px; display:flex; gap:10px;">

        <button onclick="clearPortfolio('portfolioA')"
            style="background:#2563eb;color:white;padding:6px 12px;border:none;border-radius:6px;cursor:pointer;">
            View A
        </button>

        <button onclick="clearPortfolio('portfolioB')"
            style="background:#2563eb;color:white;padding:6px 12px;border:none;border-radius:6px;cursor:pointer;">
            View B
        </button>

        <button onclick="clearPortfolio('${activePortfolio}')"
            style="background:#b91c1c;color:white;padding:6px 12px;border:none;border-radius:6px;cursor:pointer;">
            Clear ${activePortfolio}
        </button>

    </div>
`;

    let totalInvested = 0;
    let totalCurrent = 0;

    let analysis = [];

    for (let index = 0; index < portfolio.length; index++) {

    let stock = portfolio[index];

        try {
            const livePrice = await fetchLivePrice(stock.symbol);
            if (livePrice !== null && !isNaN(livePrice)) {
                stock.currentPrice = livePrice;
            }
        } catch (error) {}

        const invested = stock.averagePrice * stock.quantity;
        const current = stock.quantity * stock.currentPrice;
        const gain = current - invested;
        const gainPercent = invested > 0 ? (gain / invested) * 100 : 0;

        totalInvested += invested;
        totalCurrent += current;

        analysis.push({
            name: stock.script || stock.name,
            invested,
            current,
            gain,
            gainPercent
        });

        html += `
    <div class="card stock-card">

        <div style="display:flex; justify-content:space-between; align-items:center;">
            <h3>${stock.script || stock.name}</h3>

            <button onclick="deleteStock('${activePortfolio}', ${index})"
                style="background:#dc2626;color:white;border:none;padding:5px 10px;border-radius:6px;cursor:pointer;">
                Delete
            </button>
        </div>

        <p>Qty: ${stock.quantity}</p>
        <p>Avg Price: ₹${stock.averagePrice?.toFixed(2) || 0}</p>
        <p>Live Price: ₹${stock.currentPrice}</p>

        <p class="${gain >= 0 ? 'positive' : 'negative'}">
            ₹${gain.toFixed(2)} (${gainPercent.toFixed(2)}%)
        </p>

    </div>
      `;
    }

      function deleteStock(type, index) {

    if (!confirm("Delete this stock?")) return;

    let portfolio = loadPortfolio(type);

    portfolio.splice(index, 1);

    savePortfolio(type, portfolio);

    showPortfolio();
}
  function clearPortfolio(type) {

    if (!confirm("This will delete ALL stocks in " + type + ". Continue?"))
        return;

    savePortfolio(type, []);

    showPortfolio();
}
  
    // 🔥 SORTING SECTION

    const gainers = [...analysis]
        .filter(s => s.gain > 0)
        .sort((a, b) => b.gainPercent - a.gainPercent);

    const losers = [...analysis]
        .filter(s => s.gain < 0)
        .sort((a, b) => a.gainPercent - b.gainPercent);

    const topGainer = gainers[0];
    const topLoser = losers[0];

    const totalGain = totalCurrent - totalInvested;
    const totalPercent = totalInvested > 0
        ? ((totalGain / totalInvested) * 100).toFixed(2)
        : 0;

    html = `
        <div class="card">
            <h3>Portfolio Summary</h3>
            <p>Total Invested: ₹${totalInvested.toFixed(2)}</p>
            <p>Current Value: ₹${totalCurrent.toFixed(2)}</p>
            <p class="${totalGain >= 0 ? 'positive' : 'negative'}">
                Total P/L: ₹${totalGain.toFixed(2)} (${totalPercent}%)
            </p>

            <hr>

            <h4>🏆 Top Gainer</h4>
            <p>${topGainer ? topGainer.name + 
                " (" + topGainer.gainPercent.toFixed(2) + "%)" : "-"}</p>

            <h4>💀 Top Loser</h4>
            <p>${topLoser ? topLoser.name + 
                " (" + topLoser.gainPercent.toFixed(2) + "%)" : "-"}</p>
        </div>

        <div class="card">
            <h3>📈 Gainers</h3>
            ${
                gainers.length > 0
                ? gainers.map(s =>
                    `<p class="positive">
                        ${s.name} - ${s.gainPercent.toFixed(2)}%
                    </p>`
                  ).join("")
                : "<p>No gainers</p>"
            }
        </div>

        <div class="card">
            <h3>📉 Losers</h3>
            ${
                losers.length > 0
                ? losers.map(s =>
                    `<p class="negative">
                        ${s.name} - ${s.gainPercent.toFixed(2)}%
                    </p>`
                  ).join("")
                : "<p>No losers</p>"
            }
        </div>
    ` + html;

    savePortfolio(activePortfolio, portfolio);
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
        showToast("Please fill all fields correctly.");
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

    savePortfolio(activePortfolio, portfolio);
    await savePortfolioToCloud();
    showPortfolio();
}

/* ================= EXCEL UPLOAD ================= */

function showUpload() {

    document.getElementById("content").innerHTML = `

        <h2>Upload Trades (Active: ${activePortfolio})</h2>

        <p><strong>Required Excel Columns:</strong></p>
        <p>date | script | isin | exchange | type | quantity | price</p>

        <input type="file" id="excelFile" accept=".xlsx,.xls">

        <br><br>

        <button onclick="handleExcelUpload()">
        Upload Excel
        </button>

    `;
}

function handleExcelUpload(type) {

    activePortfolio = type;
    portfolio = loadPortfolio(type);

    const fileInput = document.getElementById("excelFile-" + type);

    if (!fileInput || !fileInput.files.length) {
        showToast("Please select a file.", "error");
        return;
    }

    const file = fileInput.files[0];

    if (!file) {
        showToast("Please select a file.", "error");
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {

        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);


        json.forEach(row => {

            const script = String(row.script || row.Script || "").toUpperCase();
            const isin = String(row.isin || row.ISIN || "");
            const exchange = String(row.exchange || row.Exchange || "").toUpperCase();
            const type = String(row.type || row.Type || "").toUpperCase();
            const quantity = parseFloat(row.quantity || row.Quantity);
            const price = parseFloat(row.price || row.Price);

            if (!script || !type || isNaN(quantity) || isNaN(price)) return;

            const symbol = exchange === "BSE"
                ? script + ".BO"
                : script + ".NS";

            let existing = portfolio.find(s => s.script === script);

            if (!existing) {
                existing = {
                    script,
                    isin,
                    exchange,
                    symbol,
                    quantity: 0,
                    totalInvestment: 0,
                    averagePrice: 0,
                    currentPrice: price
                };
                portfolio.push(existing);
            }

            if (type === "BUY") {
                existing.totalInvestment += quantity * price;
                existing.quantity += quantity;
            }

            if (type === "SELL") {
                existing.quantity -= quantity;
                if (existing.quantity < 0) existing.quantity = 0;
                existing.totalInvestment = existing.averagePrice * existing.quantity;
            }

            if (existing.quantity > 0) {
                existing.averagePrice =
                    existing.totalInvestment / existing.quantity;
            } else {
                existing.averagePrice = 0;
                existing.totalInvestment = 0;
            }

        });

        portfolio = portfolio.filter(s => s.quantity > 0);

        savePortfolio(activePortfolio, portfolio);

        showToast("Trades uploaded successfully!", "success");

        // Preview Section
        let previewRows = json.slice(0, 5).map(row => `
            <tr>
                <td>${row.date || row.Date || ""}</td>
                <td>${row.script || row.Script || ""}</td>
                <td>${row.isin || row.ISIN || ""}</td>
                <td>${row.exchange || row.Exchange || ""}</td>
                <td>${row.type || row.Type || ""}</td>
                <td>${row.quantity || row.Quantity || ""}</td>
                <td>${row.price || row.Price || ""}</td>
            </tr>
        `).join("");

        document.getElementById("content").innerHTML = `
            <div class="card">
                <h3>Excel Upload Successful</h3>

                <p><strong>Required Columns:</strong></p>
                <p>date | script | isin | exchange | type | quantity | price</p>

                <h4>Uploaded Preview (First 5 Rows)</h4>

                <table border="1" style="border-collapse:collapse;width:100%;">
                    <tr>
                        <th>Date</th>
                        <th>Script</th>
                        <th>ISIN</th>
                        <th>Exchange</th>
                        <th>Type</th>
                        <th>Qty</th>
                        <th>Price</th>
                    </tr>
                    ${previewRows}
                </table>

                <br>
                <button onclick="showPortfolio()">Go to Portfolio</button>
            </div>
        `;
    };

    reader.readAsArrayBuffer(file);
}

function showToast(message, type = "info") {

    const toast = document.getElementById("toast");

    toast.innerText = message;

    if (type === "success") {
        toast.style.background = "#16a34a";
    } else if (type === "error") {
        toast.style.background = "#dc2626";
    } else {
        toast.style.background = "#111827";
    }

    toast.style.display = "block";

    setTimeout(() => {
        toast.style.display = "none";
    }, 3000);
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
function downloadExcel() {

    portfolio = loadPortfolio();

    const worksheet = XLSX.utils.json_to_sheet(portfolio);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Portfolio");

    XLSX.writeFile(workbook, "portfolio.xlsx");
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
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const docRef = doc(db, "portfolios", user.uid);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
            const cloudData = snapshot.data().stocks;
            localStorage.setItem("portfolio", JSON.stringify(cloudData));
            portfolio = cloudData;
            showPortfolio();
        }
    }
});

/* ================= INITIAL LOAD ================= */

document.addEventListener("DOMContentLoaded", () => {
    showDashboard();
});

/* ================= EXPOSE TO HTML ================= */

window.showDashboard = showDashboard;
window.showPortfolio = showPortfolio;
window.showAddStock = showAddStock;
window.showUpload = showUpload;
window.showAllocation = showAllocation;
window.showBenchmark = showBenchmark;
window.showRisk = showRisk;
window.downloadExcel = downloadExcel;
window.showLogin = showLogin;
window.register = register;
window.login = login;
window.deleteStock = deleteStock;
window.googleLogin = googleLogin;
window.logout = logout;
window.showToast = showToast;
window.handleExcelUpload = handleExcelUpload;
window.switchPortfolio = switchPortfolio;
window.clearPortfolio = clearPortfolio;
window.addStock = addStock;














































