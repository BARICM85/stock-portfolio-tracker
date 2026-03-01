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
        const response = await fetch(
            `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`
        );

        const data = await response.json();
        return data.quoteResponse.result[0].regularMarketPrice;
    } catch (error) {
        console.log("Error fetching price", error);
        return null;
    }
}
