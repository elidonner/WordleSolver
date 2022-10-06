//global variables
var WORDLIST;
var mode;


async function select_mode(new_mode = "lessCheating", answer = ""){
  //if the new mode is different from the old mode, change the available words
  if (new_mode != mode || WORDLIST == null) {
    mode = new_mode
    if (mode == "lessCheating"){
      WORDLIST = possibleFiveLetterWords.map((x) => x);
    }else if(mode == "cheating"){
      WORDLIST = wordleWords.map((x) => x);
    } else {
      WORDLIST = answer
    }
  }
}

async function filter_word_list(){
    let { boardState = [], evaluations = [], solution = [] } = JSON.parse(window.localStorage.gameState || window.localStorage["nyt-wordle-state"]);
    answer = [solution]; //make the solution into the global variable answer

    new_mode = await chrome.storage.sync.get(["selection"]),
    new_mode = new_mode.selection;
    await select_mode(new_mode, answer);

    //filter word list for all nonempty guesses
    for (let i = 0; i<boardState.length; i++){
      let eval = convert_eval(evaluations[i]);
      let word = boardState[i];

      if (eval == null) {break;}
      
      solve(word, eval);
    }
}

//make eval something a little easier on my solver 
//FIXME: probably unnecessary
function convert_eval(evaluation){
    let eval = "";
    if(evaluation != null){
        for (let j=0; j<evaluation.length; j++){
            if (evaluation[j] == "correct"){
                eval = eval.concat("1")
            } else if (evaluation[j] == "absent"){
                eval = eval.concat("0")
            }else if (evaluation[j] == "present"){
                eval = eval.concat("2")
            }else{return null;}
        }
        return eval
    } else{return null;}
}

//TODO: break into functions for readabillity
function solve(word, response){

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
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Arbitrary string allowing the background to distinguish
    // message types. You might also be able to determine this
    // from the `sender`.
    if (message.type === 'from_popup') {
        try {
            filter_word_list();
            sendResponse({WORDLIST});
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