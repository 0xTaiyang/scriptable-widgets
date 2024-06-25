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
        const request = new Request(url)
        request.method = "post";
        request.headers = {
            "Content-Type": "application/json"
        };
        request.body = JSON.stringify(payload);

        const response = await request.loadJSON();
        return response
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
}

async function okxP2P() {
    const timestamp = Date.now();
    const url = `https://www.okx.com/v3/c2c/tradingOrders/books?quoteCurrency=CNY&baseCurrency=USDT&side=sell&paymentMethod=bank&userType=all&showTrade=false&showFollow=false&showAlreadyTraded=false&isAbleFilter=false&receivingAds=false&t=${timestamp}`;
    try {
        const request = new Request(url)
        request.method = "get";
        request.headers = {
            "Content-Type": "application/json"
        };
        const response = await request.loadJSON();

        return response
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
}
async function bank(ccy, bankName) {

    const url = 'https://wx.sunrate.com/api/price/getAllBankForex'
    try {
        const request = new Request(url)
        request.method = "get";
        request.headers = {
            "Content-Type": "application/json"
        };
        const data = await request.loadJSON();
        for (let i = 0; i < data.result.data.bank[ccy].length; i++) {
            if (data.result.data.bank[ccy][i].bank === bankName) {
                return parseFloat(data.result.data.bank[ccy][i].xh_sell_price) / 100
            }
        }
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
}

async function bestP2P() {
    const bnData = await bnP2P();
    const bnBest = parseFloat(bnData.data[0].adv.price)

    const okxData = await okxP2P();
    const bestOkx = parseFloat(okxData.data.sell[0].price)

    const bankData = await bank('USD', 'icbc')

    if (bnBest > bestOkx) {
        return {
            "name": "OKX / ICBC",
            "data": String(bestOkx) + ' / ' + String(bankData.toFixed(2))
        }
    } else {
        return {
            "name": "Binance / ICBC",
            "data": String(bnBest) + ' / ' + String(bankData.toFixed(2))
        }
    }
}

async function getOkxBasis(symbol, notifyLevel) {
    const maxPairReq = new Request("https://****/okx-basis?symbol=" + symbol + "&notifyLevel=" + notifyLevel);
    let maxPair = await maxPairReq.loadJSON();
    maxPair.data = maxPair.data.toFixed(2) + "%"
    return maxPair;
};

async function getHSBC(notifyLevel) {
    const maxPairReq = new Request("https://****/hsbc-au-cny?" + "&notifyLevel=" + notifyLevel);
    let apy = await maxPairReq.loadJSON();
    apy.data = apy.data.toFixed(2) + "%"
    return apy;
};

async function widget() {
    const btc = await getData("BTC", "20");
    const eth = await getData("ETH", "20");
    const hsbc = await getHSBC("3");
    const p2p = await bestP2P()

    const data = [btc, eth, hsbc, p2p]

    const fontSize = 20
    const dataColour = "33B864"
    const spacing = 12

    const list = new ListWidget();

    let mainStack = list.addStack()
    mainStack.layoutVertically()

    for (let i = 0; i < data.length; i++) {
        let stack = mainStack.addStack()
        stack.layoutHorizontally()
        let item = data[i]

        nameText = stack.addText(item["name"])
        nameText.font = Font.boldSystemFont(fontSize)
        stack.addSpacer()
        dataText = stack.addText(item["data"])
        dataText.font = Font.boldSystemFont(fontSize)
        dataText.textColor = new Color(dataColour)
        if (i < data.length - 1) {
            mainStack.addSpacer()
        }
    }

    list.presentMedium()
    Script.setWidget(list);
    Script.complete()
}

widget()