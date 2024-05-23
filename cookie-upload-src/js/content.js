window.addEventListener("load", myMain, false);

function getCookies(url) {
    // 如果您只需要向您的扩展程序的另一部分发送一个简单消息（以及可选地获得回应），您应该使用比较简单的 runtime.sendMessage 或 tabs.sendMessage 方法。
    // 这些方法分别让您从内容脚本向扩展程序或者反过来发送一个可以通过 JSON 序列化的消息，可选的 callback 参数允许您在需要的时候从另一边处理回应。
    // 在接收端，您需要设置一个 runtime.onMessage 事件监听器来处理消息。对应 content.js 里的 chrome.runtime.onMessage.addListener
    chrome.runtime.sendMessage({url: url}, async function (response) {
        console.log(`chrome.runtime.sendMessage`, response);
    });
}

function myMain(evt) {
    console.log("Cookies upload plugins running!");
    getCookies(document.URL)
}
