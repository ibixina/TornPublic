// ==UserScript==
// @name         Stock Name
// @namespace    stock-name.nao.zero
// @version      0.1
// @description  stock name abbr
// @author       nao [2669774]
// @match        https://www.torn.com/page.php?sid=stocks*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=torn.com
// @grant        none
// @run-at        document-start
// ==/UserScript==

let stocksData = {};
const { fetch: origFetch } = window;
window.fetch = async (...args) => {
  //  console.log("fetch called with args:", args);

  const response = await origFetch(...args);
  console.log("STOCKNAME", response);

  /* work with the cloned response in a separate promise
     chain -- could use the same chain with `await`. */

  if (response.url.includes("StockMarket")) {
    //  console.log("REsponseL : "+response);

    response
      .clone()
      .json()
      .then(function (body) {
        if (body.success) {
          for (const stockData of body.stocks) {
            const symbol = stocksData.profile.acronym;
            const currentPrice = stockData.sharesPrice.chartData[1].value;
            const transactions = stockData.userOwned.transactions;

            stocksData[stocksData.id] = {
              symbol: symbol,
              current_price: currentPrice,
              transactions: transactions,
            };
          }
        }
      })
      .catch((err) => console.error(err));
  }
  change();
  return response;
};

function change() {
  if ($("ul[class^='stock_']").length == 0) {
    setTimeout(change, 300);
    return;
  }

  $("ul[class^='stock_']").each(function () {
    const sym = $("img", $(this))
      .attr("src")
      .split("logos/")[1]
      .split(".svg")[0];
    const name = $("div[class^='nameContainer_']", $(this)).text();
    $("img", $(this))
      .parent()
      .append(` <div style="color:yellow;"> [${sym}]</div>`);
  });
}
