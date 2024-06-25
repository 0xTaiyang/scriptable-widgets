
async function bank(ccy, bankName) {
    const url = "https://wx.sunrate.com/api/price/getAllBankForex"

    try {
        const response = await fetch(url, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        for (let i = 0; i < data.result.data.bank[ccy].length; i++) {
            if (data.result.data.bank[ccy][i].bank === bankName) {
                return parseFloat(data.result.data.bank[ccy][i].xh_sell_price)/100
            }
        }
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
}

async function main () {
    const forex = await bank('USD','icbc')
    console.log(forex)
}

main()