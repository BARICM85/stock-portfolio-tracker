function savePortfolio(data) {
    localStorage.setItem("portfolio", JSON.stringify(data));
}

function loadPortfolio() {
    const data = localStorage.getItem("portfolio");
    return data ? JSON.parse(data) : [];
}