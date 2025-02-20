// ==UserScript==
// @name         Stock Name
// @namespace    stock-name.nao.zero
// @version      0.3
// @description  stock name and more
// @author       nao [2669774]
// @match        https://www.torn.com/page.php?sid=stocks*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=torn.com
// @grant        none
// @run-at       document-start
// ==/UserScript==

// Add modal styles
const modalStyles = `
.stock-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.stock-modal-content {
    background: white;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    position: relative;
    min-width: 200px;
    max-width: 90%;
}

/* From Uiverse.io by JkHuger */
.l {
  display: block;
  margin-bottom: 1.5em;
  font-size: 1em;
}

.l {
  background-color: rgba(0,0,0,0.7);
  border-radius: 0.75em;
  box-shadow: 0.125em 0.125em 0 0.125em rgba(0,0,0,0.3) inset;
  color: #fdea7b;
  display: inline-flex;
  align-items: center;
  padding: 0.15em;
  width: 3em;
  height: 1.5em;
  transition: background-color 0.1s 0.3s ease-out, box-shadow 0.1s 0.3s ease-out;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

.l:before, .l:after {
  content: "";
  display: block;
}

.l:before {
  background-color: #d7d7d7;
  border-radius: 50%;
  width: 1.2em;
  height: 1.2em;
  transition: background-color 0.1s 0.3s ease-out, transform 0.3s ease-out;
  z-index: 1;
}

.l:after {
  background: linear-gradient(transparent 50%, rgba(0,0,0,0.15) 0) 0 50% / 50% 100%,
		repeating-linear-gradient(90deg,#bbb 0,#bbb,#bbb 20%,#999 20%,#999 40%) 0 50% / 50% 100%,
		radial-gradient(circle at 50% 50%,#888 25%, transparent 26%);
  background-repeat: no-repeat;
  border: 0.25em solid transparent;
  border-left: 0.4em solid #d8d8d8;
  border-right: 0 solid transparent;
  transition: border-left-color 0.1s 0.3s ease-out, transform 0.3s ease-out;
  transform: translateX(-22.5%);
  transform-origin: 25% 50%;
  width: 1.2em;
  height: 1em;
  box-sizing: border-box;
}
/* Checked */
.l:checked {
  background-color: rgba(0,0,0,0.45);
  box-shadow: 0.125em 0.125em 0 0.125em rgba(0,0,0,0.1) inset;
}

.l:checked:before {
  background-color: currentColor;
  transform: translateX(125%)
}

.l:checked:after {
  border-left-color: currentColor;
  transform: translateX(-2.5%) rotateY(180deg);
}
/* Other States */
.l:focus {
	/* Usually an anti-A11Y practice but set to remove an annoyance just for this demo */
  outline: 0;
}
`;

// Add styles to document
const styleSheet = document.createElement("style");
styleSheet.textContent = modalStyles;
(document.head || document.documentElement).appendChild(styleSheet);

if (!localStorage.getItem("hideStocks")) {
  localStorage.setItem("hideStocks", false);
}

let hideStocks = localStorage.getItem("hideStocks") == "true";

let toHide = [];

let stocksData = {};
const { fetch: origFetch } = window;
window.fetch = async (...args) => {
  const response = await origFetch(...args);
  console.log("STOCKNAME", response);

  if (response.url.includes("StockMarket&step=getInitialData")) {
    response
      .clone()
      .json()
      .then(function (body) {
        if (body.success) {
          for (const stockData of body.stocks) {
            const symbol = stockData.profile.acronym;
            const currentPrice = stockData.sharesPrice.chartData[1].value;
            const transactions = stockData.userOwned.transactions;
            const totalOwned = stockData.userOwned.sharesAmount;

            if (totalOwned % 10000 == 0 && toHide.indexOf(symbol) == -1) {
              toHide.push(symbol);
            }
            stocksData[symbol] = {
              totalOwned: totalOwned,
              current_price: currentPrice,
              transactions: transactions,
            };
          }
        }
      })
      .catch((err) => console.error(err));
  }
  console.log(stocksData);
  change();
  return response;
};

function showModal(content) {
  // Remove any existing modal
  removeModal();

  // Create modal elements
  const overlay = document.createElement("div");
  overlay.className = "stock-modal-overlay";

  const modalContent = document.createElement("div");
  modalContent.className = "stock-modal-content";
  modalContent.innerHTML = content;

  // Add click handlers
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      removeModal();
    }
  };

  // Prevent clicks within the modal from closing it
  modalContent.onclick = (e) => {
    e.stopPropagation();
  };

  // Add to DOM
  overlay.appendChild(modalContent);
  document.body.appendChild(overlay);
}

function removeModal() {
  const existingModal = document.querySelector(".stock-modal-overlay");
  if (existingModal) {
    existingModal.remove();
  }
}

function change() {
  if ($("ul[class^='stock_']").length == 0) {
    setTimeout(change, 300);
    return;
  }

  $("ul[class^='stock_']").each(function () {
    let color = "gray";
    const sym = $("img", $(this))
      .attr("src")
      .split("logos/")[1]
      .split(".svg")[0];
    const parent = $("img", $(this)).parent();

    if (hideStocks && toHide.indexOf(sym) != -1) {
      $(this).hide();
      return;
    }

    if (stocksData[sym] && stocksData[sym].totalOwned) {
      let totalOwned = stocksData[sym].totalOwned;
      let currentPrice = stocksData[sym].current_price;
      let current_value = totalOwned * currentPrice;
      let bought_value = 0;
      let last_date;
      let insertTitle = ``;

      for (let transaction of stocksData[sym].transactions) {
        last_date = transaction.date;
        bought_value += transaction.amount * transaction.boughtPrice;
        let net = (currentPrice - transaction.boughtPrice) * transaction.amount;
        let tcol = net >= 0 ? "green" : "red";
        net = net.toLocaleString();

        let tinsert = `<span style="color:${tcol};"><b>Date: </b>${transaction.date}<b> Amt: </d>${transaction.amount}<b> Net: </b>$${net}</br></span>`;
        insertTitle += tinsert;
      }

      color = bought_value <= current_value ? "green" : "red";
      let profit = current_value - bought_value;
      current_value = current_value.toLocaleString();
      profit = profit.toLocaleString();
      insertTitle =
        `<span style="color:${color};">
                <b>${sym}</b> </br>
                <b>Value:</b> $${current_value} </br>
                <b>Transactions:</b></br>
                ` + insertTitle;

      insertTitle += `
                <b>Profit:</b> $${profit} </br>
            </span>`;

      if (window.innerWidth >= 768) {
        // Check if device is a phone (screen width <= 768px)
        $("img", $(this)).attr("title", insertTitle);
      }

      $(parent).parent().off("click");
      $(parent)
        .parent()
        .on("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          showModal(insertTitle);
        });
    }

    if ($("div", $(parent)).length == 0) {
      $(parent).append(`<div style="color:${color};">${sym}</div>`);
    }
  });
}

function insertHideOption() {
  const inserPoint = document.querySelector("div[class^='titleContainer_']");
  if (!inserPoint) {
    setTimeout(insertHideOption, 300);
    return;
  }

  const checkBox = document.createElement("input");
  checkBox.type = "checkbox";
  checkBox.id = "hideStocks";

  checkBox.classList.add("l");
  checkBox.checked = hideStocks;
  checkBox.onchange = function () {
    hideStocks = checkBox.checked;
    localStorage.setItem("hideStocks", hideStocks);
    window.location.reload();
  };

  const label = document.createElement("label");
  label.htmlFor = "hideStocks";
  label.innerText = "Hide stocks: ";

  label.appendChild(checkBox);
  inserPoint.appendChild(label);
}
insertHideOption();
