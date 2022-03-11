// cheating type handler
function cheating_selection(num) {
    console.log('button clicked')
    switch (num) {
        case 1:
            document.getElementById("lessCheating").classList.add('selected');
            document.getElementById("cheating").classList.remove('selected');
            var selection = "lessCheating"
            document.body.style.backgroundColor = "#d3e3fc";
            break;
        case 2:
            document.getElementById("lessCheating").classList.remove('selected');
            document.getElementById("cheating").classList.add('selected');
            var selection = "cheating"
            document.body.style.backgroundColor = 
            "#ffccbc";
            break;
    }
    to_log = "mode from options set to ".concat(selection)
    console.log(to_log);

    chrome.storage.sync.set({selection});
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
document.getElementById("cheating").addEventListener("click", more_cheating);