//Client Side
var socket = io({
  query: {
    username: localStorage.getItem("username")
  }
});

var user_ID = "f7Fn2NZH3";
var ID = 0;

var client_ID = Math.random(0) * 10000000;

var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('input');
var isMod = false;

var mps = 0;

var Username = "Loading...";
try {
  Username = localStorage.getItem('username');
  if (localStorage.getItem('username') != null) {
    ChangeUsername(localStorage.getItem('username'), localStorage.getItem('description'), localStorage.getItem('passcode'), localStorage.getItem('email'), "404", true);
  } else {
    Username = "78 101 119 32 85 115 101 114   1";
  }
} catch (error) {
  Username = "78 101 119 32 85 115 101 114   1";
}
Update_Uername();

var form_room_create = document.getElementById('room_create');
var input_room_create = document.getElementById('room_input_create');
var input_room_name_create = document.getElementById('room_name_create');

var form_room_join = document.getElementById('room_join');
var input_room_join = document.getElementById('room_input_join');

var form_username_change = document.getElementById('UsernameChange');

function ChangeUsername(newName, description, passcode, email, cid, alreadyDecoded) {
  //Send to the Socket the new uername + Passcodce + client id, if you can change it, send the 
  //Client, the new name an apply it if not send the client the error message
  socket.emit("Change Username", newName, description, passcode, email, client_ID, alreadyDecoded); 
}

function Update_Uername() {

}

function CheckForAdmin() {
  socket.emit('canGetModerator', user_ID, client_ID);
}

var counter = setInterval(TickMilliseconds, 1);

function TickMilliseconds() {
  mps += 1;
}

function SendData(data)
{
  socket.emit("data", data);
}
 
function CheckMPS() {
  mps = 0;
  elapsedTime = 0;
  socket.emit('Check MPS', client_ID);
}

document.getElementById('Emojies').onload = new function () {
  CheckMPS();
}

var isLoadTime = true;
var isDocumentTime = true;

var sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

var startTime = Date.now();
var elapsedTime;
var documentTime, serverTime;

var interval = setInterval(function () {
  elapsedTime = Date.now() - startTime;
}, 100);

function elapsedTimeStop() {
  document.getElementById("loadTimeTwo").innerText = "Document Time: " + mps;
  isDocumentTime = false;
  documentTime = mps;
}

socket.on('send MPS', function (client_ID_) {
  if (client_ID_ == client_ID)
    if (isLoadTime) {
      document.getElementById('loadTime').innerText = "Server Time: " + mps;
      serverTime = mps;
      isLoadTime = false;
      sleep(40).then(() => { CheckMPS(); });
    }
    else {
      document.getElementById("mps").innerHTML = "MPS: " + (elapsedTime / 1000).toFixed(3);
      sleep(4000).then(() => { CheckMPS(); });
      if (isLoadTime == false && isDocumentTime == false)
        document.getElementById('loadTimeThree').innerText = "Start Time: " + (documentTime + serverTime);
    }
});

socket.on('delete Room', function (){
  document.getElementById('appendRooms').innerHTML = "";
});

form_username_change.addEventListener('submit', function (e) {
  e.preventDefault();
  ChangeUsername(document.getElementById('username_new').value, document.getElementById('description'), document.getElementById('passcode').value, document.getElementById('email').value, "404", false);
});

form.addEventListener('submit', function (e) {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat message', input.value, ID, Username);
    input.value = '';
  }
});

//CREATE ROOM
form_room_create.addEventListener('submit', function (e) {
  e.preventDefault();
  if (input_room_create.value) {
    socket.emit('create room', input_room_create.value, input_room_name_create.value);
    input_room_join.value = input_room_create.value;
    input_room_create.value = '';
  }
});

//BROADCAST ROOM
//form_room_join.addEventListener('submit', function (e) {
//  //alert("joining " + input_room_join.value)
//  e.preventDefault();
//  if (input_room_join.value) {
//    socket.emit('join room', input_room_join.value);
//    ID = input_room_join.value;
//    input_room_join.value = '';
//  }
//});
socket.on('Username', function (username)
{
  Username = username;
});
socket.on("login", function (name, passcode, description, email){
  Username = name;
  localStorage.setItem("username", name);
  localStorage.setItem("passcode", passcode);
  localStorage.setItem("description", description);
  localStorage.setItem("email", email);
  ShowInfo("Success logedin with name: " + name);
});
socket.on("Login Error", function (error, isSuccess){
  if(isSuccess)
    {
      HideAccountGUI();
      ShowInfo(error);
    } else
      ShowInfo("Failed to login: " + error);
});
socket.on('append Room', function (room_ID, name, username_) {
  //<img src="icons/Rooms/delete.svg" alt="Delete">
  var MainDiv = document.createElement('div');
  MainDiv.setAttribute('code', room_ID);
  var JoinButton = document.createElement('img');
  JoinButton.addEventListener('click', () => {
    socket.emit('chat message', " Joined the Room", room_ID, "Server", false, Username);
    ID = room_ID;
    messages.innerHTML = '';
    RenderMessages(room_ID);
    socket.emit('join room', room_ID);
  });
  var DeleteButton = document.createElement('img');
  DeleteButton.addEventListener('click', () => {
    socket.emit('chat message', "Deletes room", room_ID, "Server", false);
    socket.emit('delete Room', room_ID);
  });
  DeleteButton.setAttribute('src', 'icons/Rooms/delete.svg');
  DeleteButton.setAttribute('alt', 'Join');
  DeleteButton.setAttribute('class', 'image');
  JoinButton.setAttribute('src', 'icons/Rooms/join.svg');
  JoinButton.setAttribute('alt', 'Join');
  JoinButton.setAttribute('class', 'image');
  var child = document.createElement('p');
  child.textContent = name;

  MainDiv.className = "room_class";
  MainDiv.appendChild(child);
  MainDiv.appendChild(JoinButton);
  MainDiv.appendChild(DeleteButton);

  document.getElementById('appendRooms').appendChild(MainDiv);
});
socket.on('change username', function (newName, client_id__) {
  if (client_ID == client_id__) {
    Username = newName;
    console.log("chanching name")
    localStorage.setItem('username', Username);
    localStorage.setItem('description', document.getElementById('description'));
    Update_Uername();
  }
});



var date = () => new Date();
var upload = (files) => socket.emit("upload", files);
var msgs = [];

function RenderMessages(room) {
  messages.innerHTML = '';
  for (var i = 0; i < msgs.length; i++) {
    if (msgs[i].room == room) {
      var item = document.createElement('li');
      var message = document.createElement("li");
      item.setAttribute('class', "message");
      message.setAttribute('class', "message inline"); // datum korrigiren !!!
      item.textContent = msgs[i].timeStamp + " <" + msgs[i].username + "> ";
      message.textContent =  msgs[i].message;
      item.appendChild(message);
      messages.appendChild(item);
      document.getElementById('messages').scrollTo(0, document.getElementById('messages').scrollHeight);
    }
  }
}

socket.on('get messages', function (msg) {
  msgs = msg;
  RenderMessages(0);
  reloadEvents();
});
socket.on('chat message', function (msg, ID_, Sender_Username, save) {
  socket.emit('change username confirm', (localStorage.getItem('username'), Username)); //(newName, oldName, client_ID, description, email)
  if (ID == ID_) {
    var item = document.createElement('li');
    var message = document.createElement("li");
    item.setAttribute('class', "message"); // datum korrigiren !!!
    message.setAttribute('class', "message inline"); // datum korrigiren !!!
    item.textContent = date().getFullYear() + "." + date().getMonth() + "." + (date().getDay() + 1) + " | " + date().getHours() + ":" + date().getMinutes() + " <" + Sender_Username + "> ";
    message.textContent = msg;
    item.appendChild(message);
    messages.appendChild(item);
    messages.scrollTo(0, document.getElementById('messages').scrollHeight);
  }
  reloadEvents();
});
socket.on('reload', function () {
  location.reload();
});
socket.on('redirect', function (dir) {
  window.location.pathname = dir;
});
socket.on('has Admin', function (client_ID_) {
  if (client_ID == client_ID_) {
    isMod = true;
    socket.emit('chat message', "Someone got Admin", ID, "Server");
  }
});