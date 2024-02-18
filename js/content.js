window.addEventListener("load", myMain, false);

function getCookies(url) {
    chrome.runtime.sendMessage({url: url}, async function (response) {
        console.log(`chrome.runtime.sendMessage`, response);
    });
}

function myMain(evt) {
    console.log("Cookies helper running!");
    getCookies(document.URL)
}
