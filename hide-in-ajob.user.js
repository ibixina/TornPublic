// ==UserScript==
// @name         hide-employed
// @namespace    hide-employed.zero.nao
// @version      0.1
// @description  hides anyone in sa job or company in advanced search
// @author       nao [2669774]
// @match        https://www.torn.com/page.php?sid=UserList*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=torn.com
// @grant        none
// @updateURL    https://raw.githubusercontent.com/ibixina/TornPublic/main/hide-in-ajob.user.js
// @downloadURL  https://raw.githubusercontent.com/ibixina/TornPublic/main/hide-in-ajob.user.js

// ==/UserScript==

const filterIcons = [
  "icon21",
  "icon22",
  "icon23",
  "icon24",
  "icon25",
  "icon26",
  "icon73",
  "icon27",
  "icon83",
];

const originalAjax = $.ajax;
$.ajax = function (options) {
  console.log("[HIDEEMP] :", options);
  if (options.url.includes("page.php")) {
    const originalSuccess = options.success;
    options.success = function (response, textStatus, jqXHR) {
      console.log("[HIDEEMP] Original Response:", response);
      const newList = [];
      if (response.list) {
        for (const user of response.list) {
          const iconsList = user.IconsList;
          let shouldHide = false;
          for (const icon of filterIcons) {
            if (iconsList.includes(icon)) {
              shouldHide = true;
            }
          }
          if (!shouldHide) {
            newList.push(user);
          }
        }
      }

      const modifiedResponse = { ...response, list: newList };
      // Call the original success callback with the modified response
      if (originalSuccess) {
        originalSuccess(modifiedResponse, textStatus, jqXHR);
      }
    };
  }

  return originalAjax(options);
};
