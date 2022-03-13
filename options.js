// cheating type handler
function cheating_selection(num) {
    switch (num) {
        case 1:
            document.getElementById("lessCheating").classList.add('selected');
            document.getElementById("cheating").classList.remove('selected');
            document.getElementById("mostCheating").classList.remove('selected');
            var selection = "lessCheating"
            document.body.style.backgroundColor = 
            "#FF9C86";
            break;
        case 2:
            document.getElementById("lessCheating").classList.remove('selected');
            document.getElementById("cheating").classList.add('selected');
            document.getElementById("mostCheating").classList.remove('selected');
            var selection = "cheating"
            document.body.style.backgroundColor = 
            "#DD7058";
            break;
        case 3:
            document.getElementById("lessCheating").classList.remove('selected');
            document.getElementById("cheating").classList.remove('selected');
            document.getElementById("mostCheating").classList.add('selected');
            var selection = "cheating"
            document.body.style.backgroundColor = 
            "#C34D33";
            break;
    }

    chrome.storage.sync.set({'selection': selection})
}

//FIXME: cleaner way to do this?
function less_cheating(){
    cheating_selection(1) 
}
function more_cheating(){
    cheating_selection(2);
}
function most_cheating(){
    cheating_selection(3);
}

//restore options
document.addEventListener('DOMContentLoaded', less_cheating);

//listen for button clicks
document.getElementById('lessCheating').addEventListener("click", less_cheating);
document.getElementById("cheating").addEventListener("click", more_cheating);
document.getElementById("mostCheating").addEventListener("click", most_cheating);