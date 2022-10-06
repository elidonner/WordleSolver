// If I open popup, send a message to background and get a response with the guess


document.addEventListener('DOMContentLoaded', async () => {
  const possibleHTML = document.getElementById('possible');
  const numWords = document.getElementById('numWords');

  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  console.log(tab)
  // Send message to solver.js to get state and update
  await chrome.tabs.sendMessage(tab.id, {type: 'from_popup'},({WORDLIST={}}) => {
    //send possible words
    possibleHTML.innerHTML = WORDLIST.map(word => `${word[0].toUpperCase().concat(word.slice(1,word.length))}`).join(', ')

    // send number of posible words, if statement for including s or not
    numWords.innerHTML = `${WORDLIST.length} possible word${WORDLIST.length > 1 ? 's' : ''}`;
  });
})