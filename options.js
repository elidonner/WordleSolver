// cheating type handler
function cheating_selection(num) {
    console.log('button clicked')
    switch (num) {
        case 1:
            document.getElementById("lessCheating").classList.add('selected');
            document.getElementById("Cheating").classList.remove('selected');
            var selection = "lessCheating"
            document.body.style.backgroundColor = "#d3e3fc";
            break;
        case 2:
            document.getElementById("lessCheating").classList.remove('selected');
            document.getElementById("Cheating").classList.add('selected');
            var selection = "Cheating"
            document.body.style.backgroundColor = 
            "#ffccbc";
            break;
    }
    //save settings
    chrome.storage.sync.set(
        {mode: selection}
    )
}

//FIXME: cleaner way to do this?
function less_cheating(){
    cheating_selection(1) 
}
function more_cheating(){
    cheating_selection(2);
}
//restore options
document.addEventListener('DOMContentLoaded', less_cheating);

//listen for button clicks
document.getElementById('lessCheating').addEventListener("click", less_cheating);
document.getElementById("Cheating").addEventListener("click", more_cheating);