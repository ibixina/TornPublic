// ==UserScript==
// @name         happy-jumper
// @namespace    happy-jumper.zero.nao
// @version      0.1
// @description  tracks happy jumps
// @author       nao [2669774]
// @match        https://www.torn.com/item.php*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=torn.com
// @grant        none

// ==/UserScript==

let api = "";
let url = window.location.href;
let rfc = getRFC();

let itemOrder = [
  "xanax",
  "xanax",
  "xanax",
  "xanax",
  "edvd",
  "edvd",
  "edvd",
  "edvd",
  "ecstacy",
];

if (!localStorage.happyhelper && itemOrder.length > 0) {
  localStorage.happyhelper = 0;
}

let itemIds = {
  xanax: 111,
  edvd: 111,
  ecstacy: 111,
};

function getRFC() {
  var rfc = $.cookie("rfc_v");
  if (!rfc) {
    var cookies = document.cookie.split("; ");
    for (var i in cookies) {
      var cookie = cookies[i].split("=");
      if (cookie[0] == "rfc_v") {
        return cookie[1];
      }
    }
  }
  return rfc;
}

function useItem(itemId, useFac = "0") {
  $.post(
    `https://www.torn.com/item.php?rfcv=${getRFC()}`,
    {
      step: "useItem",
      itemID: itemId,
      fac: useFac,
    },
    function (response) {
      response = JSON.parse(response);
      $(".items-name").html(response.text);
      console.log(response.text);

      localStorage.happyhelper += 1;
    },
  );
}

function insert() {
  if ($(".items-wrap").length == 0) {
    setTimeout(insert, 1000);
    return;
  }

  let currentItem = localStorage.happyhelper;
  currentItem = currentItem % itemOrder.length;
  const buttons = `<button id="hhitem" class='torn-btn' item='${itemOrder[currentItem]}' style="width:150px;height:150px;margin-right:15px;">${itemOrder[currentItem]}</button><button class='torn-btn' id='hhreset' style="width:150px;height:150px;">Reset</button>`;

  $(".items-wrap").prepend(buttons);

  $(`#hhitem`).on("click", function () {
    const item = $(this).attr("item");
    const itemId = itemIds[item];

    useItem(itemId);
  });

  $("#hhreset").on("click", () => {
    if (itemOrder.length > 0) {
      localStorage.happyjumper = 0;
    } else {
      alert("You need to have at least one item in item order");
    }
  });
}

insert();
