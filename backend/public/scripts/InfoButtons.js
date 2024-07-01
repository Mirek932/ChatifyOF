function copyMessages() {
    var TextArea = document.getElementById("TargetMessage");
    TextArea.focus();
    TextArea.select();
    document.execCommand("Copy");
    window.getSelection().removeAllRanges();
    ShowInfo("Success Copied");
}
var isInTimeout = false;