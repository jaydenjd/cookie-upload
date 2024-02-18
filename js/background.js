// Utility function to check if a string is JSON
function isJSON(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}

// Utility function to save cookies to the server
async function saveCookieToServer(setting, currentCookie, currentUrl) {
    let post_url = setting.url || await (await chrome.storage.local.get('post_url')).post_url;
    const params = new URLSearchParams();
    params.append('ref_url', currentUrl);
    params.append('cookie', currentCookie);

    try {
        const response = await fetch(post_url, {
            method: 'POST',
            body: params,
            headers: {'Content-Type': 'application/x-www-form-urlencoded', 'token': setting.token},
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Cookie saved to server:", data);
        } else {
            console.error('Failed to save cookie to server:', response.statusText);
        }
    } catch (error) {
        console.error('Error saving cookie to server:', error);
    }
}

// Setup alarm for refreshing based on settings
function setupRefreshAlarm(domain, setting) {
    if (setting.auto_fresh && setting.fresh_time > 0) {
        chrome.alarms.create(`refreshAlarm_${domain}`, {delayInMinutes: setting.fresh_time / 60});
        console.log(`Refresh alarm for ${domain} set for every ${setting.fresh_time} seconds.`);
    }
}

// 修改监听定时器的逻辑
chrome.alarms.onAlarm.addListener((alarm) => {
    // 检查定时器名称以确定触发的是哪个域名的定时器
    if (alarm.name.startsWith('refreshAlarm_')) {
        let domain = alarm.name.split('_')[1];
        console.log('Refresh alarm for domain:', domain, 'triggered.');
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
                if (new URL(tab.url).hostname === domain) {
                    chrome.tabs.reload(tab.id);
                    console.log(`Tab with id ${tab.id} for domain ${domain} reloaded.`);
                }
            });
        });
    }
});

// Example of getting cookies and setting up the alarm
async function getCookiesAndSetupAlarm(url) {
    let domain = new URL(url).hostname;
    let cookies = await chrome.cookies.getAll({url});
    let cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join(';');
    console.log("【background】", cookieString)
    chrome.storage.local.get(domain, (result) => {
        let setting = result[domain] && isJSON(result[domain]) ? JSON.parse(result[domain]) : {
            fresh_time: 0,
            auto_fresh: false
        };
        if (cookieString !== '') {
            saveCookieToServer(setting, cookieString, url);
        }
        if (setting.auto_fresh && setting.fresh_time > 0) {
            setupRefreshAlarm(domain, setting);
        }
    });
}

// Event listeners for extension installation and messages
chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed.');
    // Initialize settings if necessary
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Received message:', request);
    // if (request.action === 'getCookiesAndSetupAlarm') {
    getCookiesAndSetupAlarm(request.url).then(() => sendResponse({message: 'Cookies processed and alarm set up.'}));
    return true;  // Indicate async response
    // }
});

console.log('Background script loaded.');

chrome.tabs.onActivated.addListener(async (activeInfo) => {
    console.log(activeInfo);
    let tab = await chrome.tabs.get(activeInfo.tabId);
    var urlParse = new URL(tab.url);
    var domain = urlParse.hostname;
    if (domain) {
        chrome.storage.local.get(domain, function (result) {
            let data = result[domain];
            if (isJSON(data)) {
                let settings = JSON.parse(data);
                chrome.action.setBadgeText({text: settings.fresh + 'm'});
            } else {
                chrome.action.setBadgeText({text: ''});
            }
        });
    }
});
