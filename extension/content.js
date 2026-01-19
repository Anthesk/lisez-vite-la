chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getText") {
        // try to get user selection first
        const selection = window.getSelection().toString().trim();
        if (selection.length > 0) {
            sendResponse({ text: selection });
        } else {
            // if no selection, get all the page
            // TODO: later, try to find the main content, or something
            // TODO: or not, i don't really know
            sendResponse({ text: document.body.innerText });
        }
    }
    return true;
});
