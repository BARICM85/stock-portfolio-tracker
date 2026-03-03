export function loadPortfolio() {
    const data = localStorage.getItem("portfolio");
    return data ? JSON.parse(data) : [];
}

export function savePortfolio(portfolio) {
    localStorage.setItem("portfolio", JSON.stringify(portfolio));
}
