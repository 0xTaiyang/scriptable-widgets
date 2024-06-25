
async function okxBasis(symbol,fee) {
    const timestampInMilliseconds = new Date().getTime();

    let maxPair = { "name": "", "data": 0, "daysTilExpiry": 0 };

    const futureReq = new Request("https://aws.okx.com/api/v5/market/tickers?instType=FUTURES&instFamily=" + symbol + "-USD");
    let futureData = await futureReq.loadJSON();

    const spotReq = new Request("https://aws.okx.com/api/v5/market/ticker?instId=" + symbol + "-USDT")
    let spotData = await spotReq.loadJSON();
    let SpotAsk = parseFloat(spotData["data"][0]["askPx"]);

    for (let i = 0; i < futureData["data"].length; i++) {
        let name = futureData["data"][i]["instId"];
        let expiryDay = name.split("-")[2];
        let expiryDayTimestamp = new Date(`20${expiryDay.slice(0, 2)}-${expiryDay.slice(2, 4)}-${expiryDay.slice(4)}T10:00:00`).getTime();
        let daysTilExpiry = Math.round((expiryDayTimestamp - timestampInMilliseconds) / (24 * 60 * 60 * 1000));
        if (daysTilExpiry < 20) {
            continue
        }
        let futureBid = parseFloat(futureData["data"][i]["bidPx"]);
        let apy = (((futureBid - SpotAsk) / SpotAsk) * 100 - fee) * (365 / daysTilExpiry);
        let pair = { "name": name, "data": apy, "daysTilExpiry": daysTilExpiry };

        if (maxPair["data"] == 0) {
            maxPair = pair;
        };

        if (apy > maxPair["data"]) {
            maxPair = pair;
        }
    }

    maxPair["data"] = maxPair["data"].toFixed(2) + "%"

    return maxPair;
};

async function main() {
    const maxPair = await okxBasis("BTC",0.2)
    console.log(maxPair)
}

main()