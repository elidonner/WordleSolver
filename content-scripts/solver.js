let alphabet = 'abcdefghijklmnopqrstuvwxyz'

//Actual solver from wordle
//TODO: break into functions for readabillity
function filter_word_list(guess){
let { boardState = [], evaluations = [] } = JSON.parse(window.localStorage.gameState || window.localStorage["nyt-wordle-state"]);
console.log(boardState); console.log(evaluations);

  word = guess.letters; response = guess.evaluation;

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
  wordList = new_list.sort();
  return wordList
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