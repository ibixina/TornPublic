// ==UserScript==
// @name         last-action
// @namespace    last-action.zero.nao
// @version      0.1
// @description  shows last action on profile page
// @author       nao [2669774]
// @match        https://www.torn.com*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=torn.com
// @grant        none
// @updateURL    <UPDATE_URL>
// @downloadURL  <DOWNLOAD_URL>

// ==/UserScript==

const { fetch: origFetch } = window;
window.fetch = async (...args) => {
  //  console.log("fetch called with args:", args);

  const response = await origFetch(...args);

  /* work with the cloned response in a separate promise
     chain -- could use the same chain with `await`. */

  if (response.url.includes("/page.php?sid=UserMiniProfile")) {
    //  console.log("REsponseL : "+response);

    response
      .clone()
      .json()
      .then(function (body) {
        var time = body.user.lastAction.seconds;
        insert(time);
      })
      .catch((err) => console.error(err));
  }

  return response;
};

function convert(t) {
  //  console.log(t);
  var days = Math.floor(t / 86400);
  t = t - 86400 * days;
  var hrs = Math.floor(t / 3600);
  t = t - hrs * 3600;
  var minutes = Math.floor(t / 60);
  t = t - minutes * 60;

  var result = "";
  if (days) {
    result += `${days} days `;
  }
  if (hrs) {
    result += `${hrs} hours `;
  }
  if (minutes) {
    result += `${minutes} minutes `;
  }
  result += `${t} seconds`;
  // console.log(result);

  return result;
}
function insert(t) {
  // console.log(t);
  if ($(".icons", $("#profile-mini-root")).length > 0) {
    if ($(".laction", $("#profile-mini-root")).length == 0) {
      var tt = convert(t);
      var ldata = `<p class='laction' style='float:"right";'>Last Action: ${tt}</p>`;
      // console.log(ldata);

      $(".icons", $("#profile-mini-root")).append(ldata);
    }
  } else {
    setTimeout(insert, 300, t);
  }
}
