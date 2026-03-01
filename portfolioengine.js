function calculateTotalInvested(stocks) {
    return stocks.reduce((total, stock) => {
        return total + (stock.quantity * stock.price);
    }, 0);
}

function calculateCurrentValue(stocks) {
    return stocks.reduce((total, stock) => {
        return total + (stock.quantity * stock.currentPrice);
    }, 0);
}

async function fetchLivePrice(symbol) {
    try {
        const url = `https://api.allorigins.win/get?url=${encodeURIComponent(
            `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`
        )}`;

        const response = await fetch(url);
        const data = await response.json();
        const parsed = JSON.parse(data.contents);

        return parsed.quoteResponse.result[0].regularMarketPrice;
    } catch (error) {
        console.log("Live price fetch failed", error);
        return null;
    }
}