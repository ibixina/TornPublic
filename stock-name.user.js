// ==UserScript==
// @name         Stock Name
// @namespace    stock-name.nao.zero
// @version      0.1
// @description  stock name abbr
// @author       nao [2669774]
// @match        https://www.torn.com/page.php?sid=stocks*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=torn.com
// @grant        none
// ==/UserScript==

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

change();
