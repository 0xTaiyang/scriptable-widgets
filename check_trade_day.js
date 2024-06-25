let url = "http://www.szse.cn/api/report/exchange/onepersistenthour/monthList?month=";

let tradeDay = false
let highRepoRateDay = false

let currentDate = new Date();
let year = currentDate.getFullYear();
let month = currentDate.getMonth() + 1; // January is 0, so we add 1
let date = currentDate.getDate();
let nextMonth = month + 1

if (month < 10) {
    month = '0' + month;
}
if (nextMonth < 10) {
    nextMonth = '0' + nextMonth;
}
if (date < 10) {
    date = '0' + date;
}

let req = new Request(url + year + '-' + month);
let resp = await req.loadJSON();

let nextMonthReq = new Request(url + year + '-' + nextMonth);
let nextMonthResp = await nextMonthReq.loadJSON();

let joined = resp['data'].concat(nextMonthResp['data']);

for (let i = 0; i < joined.length; i++) {
    if (joined[i]['jyrq'] === year + '-' + month + '-' + date) {
        if (joined[i]['jybz'] === '1') {
            tradeDay = true;

            if (joined[i + 1]['jybz'] === '1' && joined[i + 2]['jybz'] === '0') {
                highRepoRateDay = true;
            }
        }
    }
}

// console.log(tradeDay);
// console.log(highRepoRateDay);
console.log('Trade Day: ' + tradeDay)
console.log('High Repo Rate Day: ' + highRepoRateDay);
Script.complete()