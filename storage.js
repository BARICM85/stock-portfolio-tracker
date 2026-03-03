function loadPortfolio() {
    const data = localStorage.getItem("portfolio");
    return data ? JSON.parse(data) : [];
}

function savePortfolio(portfolio) {
    localStorage.setItem("portfolio", JSON.stringify(portfolio));

    // ALSO SAVE TO FIREBASE IF LOGGED IN
    const user = auth.currentUser;
    if (!user) return;

    firebaseHelpers.setDoc(
        firebaseHelpers.doc(db, "portfolios", user.uid),
        { stocks: portfolio }
    );
}
