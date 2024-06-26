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
    const bankData = await bank('USD', 'icbc')
    const bankDataSmallText = ' / ' + String(bankData.toFixed(2))

    const bnData = await bnP2P();
    const bestBn = parseFloat(bnData.data[0].adv.price)

    const okxData = await okxP2P();
    const bestOkx = parseFloat(okxData.data.sell[0].price)

    if (bestBn > bestOkx) {
        return {  
          "name": "OKX",
          "subName": "/ ICBC",
          "data": String(bestOkx),
          "subData": bankDataSmallText
        }
    } else {
        return {  
          "name": "Binance",
          "subName": "/ ICBC",
          "data": String(bestBn),
          "subData": bankDataSmallText
        }
     }
   

}

async function getOkxBasis(symbol, notifyLevel) {
    const maxPairReq = new Request("https://***/okx-basis?symbol=" + symbol + "&notifyLevel=" + notifyLevel);
    let maxPair = await maxPairReq.loadJSON();
    maxPair.data = maxPair.data.toFixed(2) + "%"
    return maxPair;
};

async function getHSBC(notifyLevel) {
    const maxPairReq = new Request("https://***/hsbc-au-cny?" + "&notifyLevel=" + notifyLevel);
    let apy = await maxPairReq.loadJSON();
    apy.data = apy.data.toFixed(2) + "%"
    return apy;
};

async function widget() {
    const btc = await getOkxBasis("BTC", "20");
    const eth = await getOkxBasis("ETH", "20");
    const hsbc = await getHSBC("3");
    const p2p = await bestP2P()

    const data = [btc, eth, hsbc, p2p]

    const font = new Font("Menlo-Bold", 20)
    const subFont =  new Font("Menlo-Regular",10)
    const dataColour = "33B864"

    const list = new ListWidget();

    let mainStack = list.addStack()
    mainStack.layoutVertically()

    for (let i = 0; i < data.length; i++) {
        let stack = mainStack.addStack()
        stack.layoutHorizontally()
        let item = data[i]

        nameText = stack.addText(item["name"])
        nameText.font = font
        if (item.hasOwnProperty('subName') && item.subName != null) {
            subNameText = stack.addText(" "+item.subName)
            subNameText.font = subFont
        }

        stack.addSpacer()
        dataText = stack.addText(item["data"])
        dataText.font = font
        dataText.textColor = new Color(dataColour)
        if (item.hasOwnProperty('subData') && item.subData != null) {
            subDataText =stack.addText(item.subData)
            subDataText.font = subFont
            subDataText.textColor = new Color(dataColour)
        }

        if (i < data.length - 1) {
            mainStack.addSpacer()
        }
    }

    list.presentMedium()
    Script.setWidget(list);
    Script.complete()
}

widget()