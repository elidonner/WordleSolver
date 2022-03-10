const messageQueue = []; //object to hold response found by content-script.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Arbitrary string allowing the background to distinguish
  // message types. You might also be able to determine this
  // from the `sender`.
  if (message.type === 'from_content_script') {
    messageQueue.push(message.guess);
    return Promise.resolve("Dummy response to keep the console quiet"); //FIXME: doesn't work though...
  } else if (message.type === 'from_popup') {
    sendResponse(messageQueue);
  }
});