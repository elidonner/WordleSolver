//global variables
let alphabet = 'abcdefghijklmnopqrstuvwxyz'
var wordList;
var answer;
//chrome.storage.sync.set({'selection': selection}); //initialize
select_mode(); //initialize to less cheating


async function select_mode(mode = "lessCheating"){
    if (mode == "cheating"){
        wordList = wordleWords.map((x) => x);
    }else if(mode == "mostCheating"){
        wordList = answer;
    } else{
        wordList = possibleFiveLetterWords.map((x) => x);
    }
}

async function filter_word_list(){
    let { boardState = [], evaluations = [], solution = [] } = JSON.parse(window.localStorage.gameState || window.localStorage["nyt-wordle-state"]);
    answer = [solution]; //weird global variable thing

    mode = await chrome.storage.sync.get(["selection"]),
    mode = mode.selection;
    await select_mode(mode);

    //filter word list for all nonempty guesses
    for (let i = 0; i<boardState.length; i++){
        eval = convert_eval(evaluations[i]);
        let word = boardState[i];

        if(eval != null){
            solve({word, eval});
        }
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
function solve(guess){
  word = guess.word; response = guess.eval;

  for(let i = 0; i < response.length; i++){
    if(response[i] == 0){
      try{
        alphabet = alphabet.replace(word[0],'');
      } catch {
        text1 = "why'd you guess that? you already used "
        text2 = ", silly!"
        text = text1.concat(word[i]).concat(text2)
        return text
      }
    }
  }

  new_list = wordList
  for(let i = 0; i < response.length; i++){
    //if the letter was green, new_list only contains words with green letter in this index
    if(response[i] == 1){
      temp_list = [];
      for (let j=0; j < new_list.length; j++){
        if(word[i] == new_list[j][i]){
          temp_list.push(new_list[j]);
          //recheck same index since we popped
        }
      }
      new_list = temp_list
    }

    //if the letter was gray, new_list doesn't contain words with this letter, unless that letter is green elsewhere
    else if(response[i] == 0){
      new_list = check_gray(word, response, new_list, i)
    }

    //or if the letter was yellow, new_list doesn't contain words with letter in this index, but contains only words with this letter in remaining indices (gray indices)
    else if(response[i] == 2){

        //get rid of all words with yellow leter in this index
        let j = 0
        while(j < new_list.length){
            if (word[i] == new_list[j][i]){
              new_list.splice(j,1);
              //recheck same index since we popped
            } else{j++;}
        }

        //new_list only contains words with yellow letter in remaining indices
        temp_list = []
        for (j=0; j < response.length; j++){
          //if the letter is not green
          if(response[j] != 1){
            //find words with yellow letter in this index (I have already removed words for yellow letter in index, so new_list is safe)
            for(let q = 0; q < new_list.length; q++){
              if(word[i] == new_list[q][j]){
                temp_list.push(new_list[q]);
              }
              //recheck same index since we popped
            }
          }
        }
                    
        new_list = temp_list;
    }
  }


  wordList = new_list.sort(); //update global
}


//check the gray word, check for edge case that a gray letter is already in the word green elsewhere
function check_gray(word, response, new_list, index){
  i = index;
  //check if the letter is somewhere else green
  for(let j = 0; j<response.length; j++){
    if(j!=i){
      if(word[i]==word[j]){
        if(response[j]!=0){
          // If we have reached there, then gray letter is elsewhere in the word, just delete all the words that have the letter in this index
          let q = 0
          while(q < new_list.length){
              if (word[i] == new_list[q][i]){
                new_list.splice(q,1);
                //recheck same index since we popped
              } else{q++;}
          }
          return new_list;
        }
      }
    }
  }

  //new list doesn't contain word with this letter
  let j = 0;
  while(j < new_list.length){
      if(new_list[j].includes(word[i])){
        new_list.splice(j,1);
        //recheck same index since we popped
      } else{j++;}
  }
  return new_list
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
            sendResponse({wordList});
        } catch (e) {
            console.error("encountered JSON parse error", e);
        }
    }
  });

 // Listen to keyboard enters to update
document.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
    filter_word_list();
    }
})

//run filter_word_list when page opens, should help if previous guesses have been made
filter_word_list();
  