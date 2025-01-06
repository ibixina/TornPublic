// ==UserScript==
// @name         buy-max
// @namespace    buy-max.zero.nao
// @version      0.1
// @description  buy max based on money on hand
// @author       nao [2669774]
// @match        https://www.torn.com/page.php?sid=ItemMarket*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=torn.com
// @grant        none
// @updateURL    <UPDATE_URL>
// @downloadURL  <DOWNLOAD_URL>

// ==/UserScript==

$(document).on("click", ".input-money-symbol", function () {
  const parent = $(this).parents("li[class^='rowWrapper_']");
  const price = $("div[class^='price_']", parent)
    .text()
    .trim()
    .replace("$", "")
    .replaceAll(",", "");
  const money = Math.floor(
    parseInt(document.getElementById("user-money").getAttribute("data-money")),
  );

  const qty = Math.floor(money / parseInt(price));

  const qtyInput = $(".input-money", parent);
  $(qtyInput).val(qty);
  $(qtyInput).trigger("input").trigger("input");
});