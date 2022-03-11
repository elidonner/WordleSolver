//FIXME: use this instead to access solutions!
let { boardState = [], evaluations = [] } = JSON.parse(window.localStorage.gameState || window.localStorage["nyt-wordle-state"]);
console.log(boardState); console.log(evaluations);

//access the game board through shadow roots
const $game_board = document.querySelector("game-app").shadowRoot.getElementById("board")
let i = 0;

// When webpage is open, get the status, this should cover case when webpage is opened and there are already guesses
// works by recursion
check_status_on_start();
function check_status_on_start(){
    let j = i+1;
    get_status();
    //if i went up by a value, then get_status was successful, and we should restart
    if(i==j){
        check_status_on_start();
    }
}


// Execute a function when the user releases a key on the keyboard
document.addEventListener('keyup', keyUpHandler);

function keyUpHandler(event){
    
    if (event.key === 'Enter') {
        console.log(event.key)
        get_status();
        event.preventDefault();
    }
}


//get's status of guess by checking if it has been evaluated
function get_status(){
    var stat = $game_board.getElementsByTagName('game-row')[i].shadowRoot.querySelector('game-tile').getAttribute("evaluation");
    if (stat != null){
        guess = evaluate_guess(i);
        update_word_list(guess);

        i++;
    }
}

function get_row(i)
    {
        row = $game_board.getElementsByTagName('game-row')[i].shadowRoot.querySelectorAll('game-tile')
        return row
    }

function evaluate_guess(i)
    {
        row = get_row(i)
        word = ""
        feedback = ""
        for (let j = 0; j < row.length; j++){
            letter = row[j].getAttribute('letter')
            evaluation = row[j].getAttribute('evaluation')
            evaluation = convert_eval(evaluation)
            word = word.concat(letter)
            feedback = feedback.concat(evaluation)
        }
        return {letters: word, evaluation: feedback}
    }

function convert_eval(evaluation){
    if (evaluation == "correct"){
        return "1"
    } else if (evaluation == "absent"){
        return "0"
    }else if (evaluation == "present"){
        return "2"
    }
}

function update_word_list(msg){
    chrome.runtime.sendMessage({guess: msg, type: 'from_content_script'}); 
}