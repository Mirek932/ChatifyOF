var isInTimeout = false;
function ShowInfo(text) {
    var infoText = document.getElementById("infoText")
    infoText.innerHTML = text;
    infoText.setAttribute("style", "animation-play-state:running;");
    if(!isInTimeout)
        {
            setTimeout(()=>{
                infoText.setAttribute("style", "animation-play-state:paused;");
                isInTimeout = false;
            }, 1000); isInTimeout = true;
        }
}