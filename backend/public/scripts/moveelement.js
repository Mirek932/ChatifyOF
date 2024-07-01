let pos1, pos2;
const element = document.getElementById("moveEle");
//Array.from(document.getElementsByClassName("message")).forEach(ele => {
//    console.log("FOUNDED: " + ele);
//    ele.addEventListener("mousedown", function(e){
//        pos1 = e.offsetX;
//        pos2 = e.offsetY;
//        eleMove(e);
//    });
//});
var el1out = true;
var el2out = true;
function reloadEvents() {
    hideMoveEle();
    Array.prototype.forEach.call(document.getElementsByClassName("message"), function(ele){
        console.log("FOUNDED: " + ele);
        ele.addEventListener("mousemove", function(e){
            element.setAttribute("style", "display: block;");
            pos1 = e.offsetX;
            pos2 = e.offsetY;
            eleMove(e);
        });
    });     
}
document.addEventListener("mousemove", (ev)=>{
    if(!(ev.target.getAttribute("class") == "message" || ev.target.getAttribute("class") == "message inline" || ev.target.getAttribute("class") == "InfoImage" || ev.target.getAttribute("class") == "InfoButton" || ev.target.getAttribute("class") == "InfoButtons" || ev.target.getAttribute("class") == "messages"))
        hideMoveEle();
    if(ev.target.getAttribute("class") == "message inline")
    {
            document.getElementById("TargetMessage").value = ev.target.innerHTML;
    } else if(ev.target.getAttribute("class") == "message")
        {
            document.getElementById("TargetMessage").value = ev.target.childNodes[1].innerHTML;
        }
});
hideMoveEle();
function hideMoveEle(){
    console.log(el1out + " -> " + el2out)
    element.setAttribute("style", "display: none;");
}
reloadEvents();

function eleMove(e)
{
    element.style.top = (e.clientY - pos2) + "px";
    element.style.left = (e.clientX - pos1) + "px";
}