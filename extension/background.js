if (typeof browser !== 'undefined') {
  browser.contextMenus.create({
    id: "open-speed-reader",
    title: "Lisez vite là",
    contexts: ["selection", "page"]
  });

  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "open-speed-reader") {
      if (browser.action && browser.action.openPopup) {
        browser.action.openPopup();
      } else {
        console.warn("browser.action.openPopup is not supported in this browser.");
      }
    }
  });
}
