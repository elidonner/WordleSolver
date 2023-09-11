//global variables
var WORDLIST = possibleFiveLetterWords.map((x) => x);
const States = Object.freeze({
  CORRECT: "correct",
  PRESENT: "present in another position",
  ABSENT: "absent",
  EMPTY: "empty"
});

async function filter_word_list(){
    // let { boardState = [], evaluations = [], solution = [] } = JSON.parse(window.localStorage.gameState || window.localStorage["nyt-wordle-state"]);
    let guesses = Array.from(document.querySelectorAll('[data-state]')).slice(0,30).map(item => item.ariaLabel);

    // Change 1x30 array into 6x5 array
    let boardState = guesses.reduce((rows, key, index) => (index % 5 == 0 ? rows.push([key]) : rows[rows.length-1].push(key)) && rows, []);

    //filter word list for all nonempty guesses
    for (let row of boardState){
      let [eval, word] = evaluate(row);

      if (eval == null) {break;}
      
      solve(word, eval);
    }
}

function evaluate(row){
  let eval = "";
  let word = "";

  for (let [index, guess] of row.entries()) {
    let [position, letter, evaluation] = guess.toLowerCase().split(', ');

    if(letter != States.EMPTY){
      word = word.concat(letter);
      switch(evaluation) {
        case States.CORRECT:
          eval = eval.concat("1");
          break;
        case States.PRESENT:
          eval = eval.concat("2");
          break;
        case States.ABSENT:
          eval = eval.concat("0");
          break;
      }
    } else {break;}
  }

  if (eval.length == 5) {return [eval, word]}
  else {return [null,null]}
}

//TODO: break into functions for readabillity
function solve(word, response){
  console.log(word,response)

  for(let i = 0; i < response.length; i++){
    //if the letter was green, WORDLIST only contains words with green letter in this index
    if(response[i] == 1){
      let temp_list = [];
      for (let j=0; j < WORDLIST.length; j++){
        if(word[i] == WORDLIST[j][i]){
          temp_list.push(WORDLIST[j]);
          //recheck same index since we popped
        }
      }
      WORDLIST = temp_list;
    }

    //if the letter was gray, WORDLIST doesn't contain words with this letter, unless that letter is green elsewhere
    else if(response[i] == 0){
      check_gray(word, response, i)
    }


    //or if the letter was yellow, WORDLIST doesn't contain words with letter in this index, but contains only words with this letter in remaining indices (gray indices)
    else if(response[i] == 2){

        //get rid of all words with yellow leter in this index
        let j = 0
        while(j < WORDLIST.length){
            if (word[i] == WORDLIST[j][i]){
              WORDLIST.splice(j,1);
              //recheck same index since we popped
            } else{j++;}
        }

        //WORDLIST should only contain words with yellow letter in remaining indices
        let temp_list = []
        for (j=0; j < response.length; j++){
          //if the letter is not green
          if(response[j] != 1){
            //find words with yellow letter in this index (I have already removed words for yellow letter in index, so WORDLIST is safe)
            q=0
            while(q < WORDLIST.length) {
              if(word[i] == WORDLIST[q][j]){
                temp_list.push(WORDLIST[q]);
                WORDLIST.splice(q,1); //get rid of word from WORDLIST so we don't duplicate
              } else{q++;}
            }
          }
        }
                    
        WORDLIST = temp_list;
    }
  }
  WORDLIST.sort()
}


//check a gray letter, check edge case of word with more than one of same letter
function check_gray(word, response, index){
  i = index;
  
  //check if gray letter is elsewhere in the guess
  for(let j = 0; j<response.length; j++){
    // j!=i: don't check the letter itself
    // word[i] == word[j] the letter is being reused in a guess
    // response [j] != 0 the reused letter is yellow
    if(j!=i && word[i] == word[j] && response[j] != 0){
      // If we have reached here , then gray letter is elsewhere in the word, just delete all the words that have the letter in this index
      let q = 0
      while(q < WORDLIST.length){
          if (word[i] == WORDLIST[q][i]){
            WORDLIST.splice(q,1);
            //recheck same index since we popped
          } else{q++;}
      }
      //exit the function
      return;
    }
  }

  //if we didn't find the gray letter elsewhere in the word
  //new list doesn't contain word with this letter
  let j = 0;
  while(j < WORDLIST.length){
      if(WORDLIST[j].includes(word[i])){
        WORDLIST.splice(j,1);
        //recheck same index since we popped
      } else{j++;}
  }
  return;
}


/*
*
*
CHROME EVENT LISTENERS
*
*
*/



// Listen to message from popup.js and respond
chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse) {
    // Arbitrary string allowing the background to distinguish
    // message types. You might also be able to determine this
    // from the `sender`.
    if (message.type === 'from_popup') {
      console.log("In thingy")
        try {
            filter_word_list();
            console.log(WORDLIST);
            sendResponse(WORDLIST);
        } catch (e) {
            console.error("encountered JSON parse error", e);
        }
    }
});

//  Listen to keyboard enters to update
document.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
    filter_word_list();
    }
})

// run filter_word_list when page opens, should help if previous guesses have been made
filter_word_list();