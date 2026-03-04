const STORAGE_KEY = "allPortfolios";

/* ================= LOAD ALL ================= */

function loadAllPortfolios() {
    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) {
        return {
            portfolioA: [],
            portfolioB: []
        };
    }

    return JSON.parse(data);
}

/* ================= SAVE ALL ================= */

function saveAllPortfolios(allPortfolios) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allPortfolios));
}

/* ================= LOAD ONE ================= */

export function loadPortfolio(type = "portfolioA") {
    const all = loadAllPortfolios();
    return all[type] || [];
}

/* ================= SAVE ONE ================= */

export function savePortfolio(type, portfolio) {
    const all = loadAllPortfolios();
    all[type] = portfolio;
    saveAllPortfolios(all);
}
