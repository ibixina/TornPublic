// ==UserScript==
// @name         Stock Name
// @namespace    stock-name2.nao.zero
// @version      0.1
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
`;

// Add styles to document
const styleSheet = document.createElement("style");
styleSheet.textContent = modalStyles;
(document.head || document.documentElement).appendChild(styleSheet);

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

    if (stocksData[sym] && stocksData[sym].totalOwned) {
      let totalOwned = stocksData[sym].totalOwned;
      let currentPrice = stocksData[sym].current_price;
      let current_value = totalOwned * currentPrice;
      let bought_value = 0;
      let last_date;

      let insertTitle = `<span style="color:${color};">
                <b>${sym}</b> </br>
                <b>Value:</b> $${current_value} </br>
                <b>Transactions:</b> ${last_date}
                `;

      for (let transaction of stocksData[sym].transactions) {
        last_date = transaction.date;
        bought_value += transaction.amount * transaction.boughtPrice;
        let net = (current_value - bought_value) * transaction.amount;
        net = net.toLocaleString();
        let tinsert = `<b>Date:</b>${transaction.date} <b>Amt: </d>${transaction.amount}<b>Net: </b>$${net}</br>`;
        insertTitle += tinsert;
      }

      color = bought_value <= current_value ? "green" : "red";
      let profit = current_value - bought_value;
      current_value = current_value.toLocaleString();
      profit = profit.toLocaleString();

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
