async function bnP2P() {
  const url = "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search";
  const payload = {
    proMerchantAds: false,
    page: 1,
    rows: 10,
    PayTypes: ["BANK"],
    asset: "USDT",
    fiat: "CNY",
    tradeType: "BUY",
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data
  } catch (error) {
    console.error("Error fetching data: ", error);
  }
}

async function okxP2P() {
  const timestamp = Date.now();
  const url = `https://www.okx.com/v3/c2c/tradingOrders/books?quoteCurrency=CNY&baseCurrency=USDT&side=sell&paymentMethod=bank&userType=all&showTrade=false&showFollow=false&showAlreadyTraded=false&isAbleFilter=false&receivingAds=false&t=${timestamp}`;
  try {
      const response = await fetch(url, {
          method: 'GET',
      });

      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data
  } catch (error) {
      console.error("Error fetching data: ", error);
  }
}

async function bestPrice() {
  const bnData = await bnP2P();
  const bnBest = parseFloat(bnData.data[0].adv.price)

  const okxData = await okxP2P();
  const bestOkx = parseFloat(okxData.data.sell[0].price)
  console.log(bnBest, bestOkx)
  return bnBest > bestOkx ? console.log(bestOkx) : console.log(bnBest);
}

bestPrice()