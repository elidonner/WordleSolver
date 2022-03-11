// Listen to keyboard enters to update
document.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        chrome.runtime.sendMessage({
            possible: filter_list(), 
        });
    }
})

// Listen to message from popup.js and respond
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
        let possible = filter_list();
        sendResponse(possible);
    } catch (e) {
        console.error("encountered JSON parse error", e);
    }
});

// Run when wordle page first opens
chrome.runtime.sendMessage({
    possible: filter_list(), 
});