// Ensure local md5 library is compliant with CSP

// 在扩展安装或更新时加载存储API
chrome.runtime.onInstalled.addListener(function () {
    // 在这里加载存储API
    console.log('Storage API loaded');
});

document.addEventListener('DOMContentLoaded', function () {
    const save_btn = document.querySelector('#save_btn');
    const clear_btn = document.querySelector('#clear_btn');
    const delete_btn = document.querySelector('#delete_btn');
    const current_url = document.querySelector('#current_url');
    const post_url = document.querySelector('#post_url');
    const fresh_time = document.querySelector('#fresh_time');
    const auto_fresh = document.querySelector('#auto_fresh');
    var tabUrl = ""
    var domain = ""

    // Updated method for getting the current tab in MV3
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        const tab = tabs[0]; // Assuming the first tab is the active one
        tabUrl = tab.url;
        var urlParse = new URL(tab.url);
        // 使用URL对象获取域名
        domain = urlParse.hostname;
        console.log("【popup】domain, tabUrl", domain, tab.url);
        chrome.storage.local.get(['post_url'], function (result) {
            if (result["post_url"]) {
                post_url.value = result['post_url'];
            }
        });

        chrome.storage.local.get(domain, function (result) {
            if (result[domain]) { // 检查result[domain]是否有值
                console.log("【popup】query localItem", result[domain]);
                const item = JSON.parse(result[domain]); // 解析获取的值
                current_url.value = item.url;
                fresh_time.value = item.fresh_time;
                auto_fresh.checked = item.auto_fresh;

                // 根据auto_fresh和fresh_time设置徽章文本
                if (auto_fresh.checked && parseInt(fresh_time.value) > 0) {
                    chrome.action.setBadgeText({text: fresh_time.value + 's'});
                } else {
                    chrome.action.setBadgeText({text: ''});
                }
            } else {
                // 如果没有找到对应的设置，可以在这里定义默认行为
                // 例如清空徽章文本或设置默认值
                chrome.action.setBadgeText({text: ''});
                // 可以设置默认的URL和刷新时间，或者留空
                // current_url.value = '默认或上一次的URL';
                // fresh_time.value = '默认的刷新时间';
                // auto_fresh.checked = false; // 或根据需求设置默认值
            }
        });


    });

    save_btn.addEventListener('click', () => saveSettings(tabUrl, domain));
    clear_btn.addEventListener('click', () => clearSettings());
    delete_btn.addEventListener('click', () => deleteSetting(domain));
});

function saveSettings(tabUrl, domain) {
    const current = current_url.value;
    const post = post_url.value;
    const fresh = fresh_time.value;
    const auto = auto_fresh.checked;

    if (auto && fresh > 0) {
        chrome.action.setBadgeText({text: fresh + 's'});
    } else {
        chrome.action.setBadgeText({text: ''});
    }

    localItem = JSON.stringify({
        "url": current,
        "post_url": post,
        "fresh_time": fresh,
        "auto_fresh": auto,
        "ref": tabUrl // Assuming you meant the current URL
    });

    console.log("【popup】localItem", localItem);
    // if(post !== ''){
    //     localStorage.setItem('post_url', post);
    // }
    localStorage.setItem('current_url', current);
    chrome.storage.local.set({'post_url': post}, function () {
        console.log('【popup】Data has been set.', post);
    });
    // 变量需要用 [] 引起来
    chrome.storage.local.set({[domain]: localItem}, function () {
        console.log('【popup】Data has been set.', domain, tabUrl);
    });

    localStorage.setItem('fresh', fresh);
    localStorage.setItem('ref', tabUrl);
    localStorage.setItem('auto', auto);
}

function clearSettings() {
    // localStorage.clear();
    chrome.storage.local.clear(function () {
        console.log('【popup】local storage cleared');
    });
    // Consider selectively clearing localStorage to avoid removing all data
}

function deleteSetting(domain) {
    // localStorage.removeItem(hashedUrl);
    chrome.storage.local.remove(domain, function () {
        var error = chrome.runtime.lastError;
        if (error) {
            console.error(error);
        }
    })

}

function isJSON(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        console.log('error：' + str + '!!!' + e);
        return false;
    }
}
