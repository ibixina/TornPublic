// ==UserScript==
// @name         one-click-listing-itemprice
// @namespace    one-click-listing.zero.nao
// @version      0.1
// @description  one click listing in the item market based on the item market price
// @author       nao [2669774]
// @match        https://www.torn.com/page.php?sid=ItemMarket*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=torn.com
// @grant        none

// ==/UserScript==

const api = "";

if (!localStorage.itemPricePerc) {
  localStorage.itemPricePerc = 0;
}

async function getItemPrice(itemid) {
  let response = await $.getJSON(
    `https://api.torn.com/v2/market/${itemid}/itemmarket?key=${api}&offset=0`,
  );

  const lowestPrice = response.itemmarket.listings[0].price;
  return lowestPrice;
}

function insertPerc() {
  const container = document.querySelector("div[class^='titleContainer_']");

  if (!container) {
    setTimeout(insertPerc, 300);
    return;
  }
  const label = document.createElement("label");
  label.innerText = "Percentage: ";
  const percInput = document.createElement("input");
  percInput.setAttribute("type", "number");
  percInput.value = localStorage.itemPricePerc;
  percInput.addEventListener("input", function () {
    localStorage.itemPricePerc = this.value;
  });

  container.appendChild(label);
  container.appendChild(percInput);
}

function insert() {
  $("div[class^='itemRowWrapper_']:not([processed])").each(function () {
    let itemid = $("img[src^='/images/items']", $(this))
      .attr("src")
      .split("items/")[1]
      .split("/")[0];

    $("img", $(this)).css("background", "rgba(159, 42, 202, 0.5)");
    $(`img`, $(this)).on("click", async function (e) {
      e.stopPropagation();

      let parent = $(this).parents('div[class^="itemRowWrapper"]');
      let itemprice = await getItemPrice(itemid);
      itemprice = itemprice * ((100 + 1 * localStorage.itemPricePerc) / 100);
      itemprice = Math.round(itemprice);
      if ($(".input-money-symbol > input", $(parent)).length > 0) {
        $(".input-money-symbol", $(parent)).trigger("click");
      }

      if ($("input[id^='itemRow-selectCheckbox']", $(parent)).length > 0) {
        $("input[id^='itemRow-selectCheckbox']", $(parent)).trigger("click");
      }

      let inputsWrapper = $("div[class^='priceInputWrapper_']", $(parent));
      $("input", $(inputsWrapper)).val(itemprice).trigger("input");
    });

    $(this).attr("processed", true);
  });
}

insertPerc();
setInterval(insert, 1000);
