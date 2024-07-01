const express = require("./node_modules/express");
const app = express();
//const os = require("./node_modules/os");
//const appip = os.networkInterfaces()  ;
const appid = "-";
const http = require("http");
const server = http.createServer(app);
const { Server, RemoteSocket } = require("./node_modules/socket.io");
const io = new Server(server);
var path = require("./node_modules/path");
const { writeFile } = require("./node_modules/promises"); //'fs/promises'
var fs = require('fs');
var colors = require("./node_modules/colors/safe");
const soup = require('./scripts/washyourmouthoutwithsoap-develop/index')
soup.words('de');
var subdomainOptions = {
  base: 'chatifyof.com'
};

const port = 3000;
const appadress = 'http://['+appid+']:'+port;
const blacklist = require("./storage/blacklist.json")
var modUserIds = ['f7Fn2NZH3'];
var rooms_id = [];

var rooms = require("./storage/rooms.json");
var board = require("./storage/board.json");
var users = require("./storage/user.json");
let messages = require("./storage/message.json");
var ServerStorageItems = require("./storage/serverStorage.json");
const { DefaultDeserializer } = require("v8");

var serverStatus = false;

var currentTime = () => 
{
  if(date().getMinutes() < 10)
    return date().getDate() + "." + date().getMonth() + "." + date().getFullYear() + " || " + date().getHours() + ":0" + date().getMinutes();
  if(date().getHours() < 10)
    return date().getDate() + "." + date().getMonth() + "." + date().getFullYear() + " || 0" + date().getHours() + ":" + date().getMinutes();
  if(date().getDate() < 10)
    return "0" + date().getDate() + "." + date().getMonth() + "." + date().getFullYear() + " || " + date().getHours() + ":" + date().getMinutes();
  if(date().getMonth < 10)
    return date().getDate() + ".0" + date().getMonth() + "." + date().getFullYear() + " || " + date().getHours() + ":" + date().getMinutes();
  return date().getDate() + "." + date().getMonth() + "." + date().getFullYear() + " || " + date().getHours() + ":" + date().getMinutes();
}
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('subdomain')(subdomainOptions));

//Bekomme die HTML File
app.get('/404', (req, res) => {
  res.sendFile(__dirname + "/public/tabs/404.html");
  //res.sendFile(__dirname + "/public/tabs/update.html");
});
app.get('/', (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
app.get('/restart', (req, res) => {
  res.sendFile(__dirname + "/public/tabs/update.html");
});
app.get('/post', (req, res) => {
  res.sendFile(__dirname + "/public/tabs/newsleader.html");
});
app.get('/chat', (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
app.get('/profile', (req, res) => {
  res.sendFile(__dirname + "/public/tabs/profile.html");
});
app.get('/iamboredsoifyoutypethisinyoururlyouhaveluckandgototheupdatepage', (req, res) => {
  res.redirect('/restart');
});
app.get('/*', (req, res) => {
  res.redirect('/404')
  //res.sendFile(__dirname + "/public/tabs/update.html");
});

//Fall jemand bei IO connected
io.on('connection', (socket) => {
  socket.emit("delete Room");
  for (var i = 0; i < rooms.length; i++) {
    socket.emit('append Room', rooms[i].id, rooms[i].name);
  }

  socket.emit("delete Profiles");
  for (var i = 0; i < users.length; i++)
  {
    socket.emit('append profile', users[i].name, users[i].description);
  } 

  socket.emit("delete letter");
  for (var i = 0; i < board.length; i++)
  {
    socket.emit('letter', board[i].message, board[i].title);
  }
  
  socket.on("connect_error", (err) => {
    console.error(`connect_error due to ${err.message}`);
  });


  socket.emit('get messages', messages);
  if(socket.handshake.query.username == undefined)
    console.log(colors.black("(ID: " + socket.id + ")"));
  else
    console.log(colors.yellow(socket.handshake.query.username + ' connected') + colors.black(' (ID: ' + socket.id + ")"));
  socket.on('disconnect', () => {
    var timeout = setTimeout(()=>
    {
      console.log('user disconnected: ', socket.id, " || " + socket.username);
    }, 10);
  });
});

io.on('send Image', (image) => {
  console.log("Sending image... " + image);
  socket.emit('image', image); // image should be a buffer
});

function deleteDict(dict, point) {
  var newDict = [];
  for(var i = 0; i < dict.length; i++) {
    console.log(dict[i]);
    if(i != point) {
    console.log(dict[i]);
    newDict.push(dict[i]);
    }
  }
  if(newDict == undefined || newDict == null || newDict == "")
  {
    return [];
  } else 
  {
    console.log(colors.america("the new Dict is: " + JSON.stringify(newDict, null, 4)));
    return newDict;
  }
}

var vershMulti = 1000;

function decode(string)
{
  var decodedNewName = "";
  var multipier = Math.round(Math.random()*vershMulti)
  for (let i = 0; i < string.length; i++)
    {
      decodedNewName += string.charCodeAt(i) * multipier + " ";
    }
  decodedNewName += "  "+multipier;//was ,
  console.log(decodedNewName);
  return decodedNewName;
}
function encode(string)
{
  var username = "";
  var multipier = string.split("  ")[1];//change , to double  
  var numbers = string.split("  ")[0].split(" ");

  for(let i = 0; i < numbers.length; i++)
  {
    let num = parseInt(numbers[i], 10) / multipier;
    if(num >= 0 && num <= 255)
      {
        username += String.fromCharCode(num);
      } else {
        console.log("Wierd dezimal: " + num);
      }
  }
  return username;
}

function DictToArray(dict, f)
{
  var newArray = [];
  for(var i = 0; i < dict.length; dict++)
  {
    newArray.push(dict[i].f);
  }
  return newArray;
}

function overwriteFile(dir, dict, output, error)
{
  fs.writeFile(dir, JSON.stringify(dict, null, 4), err => {
     if(error && err) console.error(error + "\n" + err);

     console.log(output);
  });
}

io.on('connect', (socket) => {
  //  socket.emit('reload');
});
var alreadySetReloadTimeout = false;
var reloadTime = 10 /*SECONDS */ * 1000 // the left number means the seconds;

io.on('connection', (socket) => {
  socket["clientID"] = "Test1234FD";
  if(!serverStatus)
  {
    io.emit('redirect', "restart")
    console.log("reloading clients");
    if(!alreadySetReloadTimeout)
     var TimeOut = setTimeout(()=>{
      console.log("success restarted");
        io.emit('redirect', "chat");
       serverStatus = true;
       clearTimeout(TimeOut);
     }, reloadTime);
     alreadySetReloadTimeout = true;
  }
  socket.on('Check MPS', (client_ID) => {
    io.emit('send MPS', client_ID);
  });
  socket.on('setItem', (key, value, UUID)=>{
    //Check if the UUID is already registerd, if so change/add the value+key
    ServerStorageItems.forEach(el => {
      if(el["uuid"] == UUID)
        {
          //The UUID has been found and matches to the current asked uuid 
          //Change/add the key+value
          el[key] = value;
          console.log(el["uuid"]);
          //Printet has benn done! Now save and return this, so that it dosnt create an new UUID
        overwriteFile('./storage/serverStorage.json', ServerStorageItems, "Success setted item; UUID has been found", "an Error occoued: ");
        return;
        }
    });
    //Erstelle Message
    let formData = {
      uuid: UUID,
      [key]: value  
    }
    ServerStorageItems.push(formData);
    overwriteFile('./storage/serverStorage.json', ServerStorageItems, "Success setted item; UUID hasnt been found", "an Error occoued: ");
  });

  socket.on('chat message', (msg, ID, uncode_username, Save, spawnUsername) => {
    var username = encode(uncode_username);
      console.log(colors.america("USERNAME_OLD: " + uncode_username + " USERNAME NEW: " +username)); //ERROR: double decode
//Check if message contains in the Blackist
    blacklist.forEach(e => {      
        if(msg.toLowerCase().trim().includes(e.toLowerCase().trim()))
        {
          console.log(colors.red('THE BAD WORLD IS: ' + msg));
         msg = "*Englisches Schimpfen*";
        }
    });

    soup.words('de').forEach(e => {
      if(msg.toLowerCase().trim().includes(e.toLowerCase().trim()))
      {
        console.log(colors.red('THE BAD WORLD IS: ' + msg));
        msg = "*Deutsches Schimpfes*";
      }
    });

    console.log(colors.bgBlue(spawnUsername + " -> " + username));
    if(spawnUsername != undefined)
      io.emit('chat message', encode(spawnUsername) + msg, ID, uncode_username);
    else  
      io.emit('chat message', msg, ID, username);

    if (Save == undefined)
      Save = true;
    console.log(colors.green("Chat Message: ") + colors.bgMagenta(msg) + colors.green(" From user: ") + colors.bgYellow(username) + colors.gray(" (ID: " + socket.id + ") ")  + colors.green("shuld save? ") + colors.blue(Save));

    //Erstelle Message
    let formData = {
      message: msg,
      room: ID,
      username: username,
      timeStamp: date().getFullYear() + "." + date().getMonth() + "." + (date().getDay() + 1) + " | " + date().getHours() + ":" + date().getMinutes()
    }

    messages.push(formData);

    if (Save)
      //JSON.stringify(msg)
    overwriteFile('./storage/message.json', messages, "Done writting messages file", "an Error occoued: ");
  });
  socket.on('response', (ID_, client_ID) => {
    io.emit('response', ID_, client_ID);
  });
  socket.on('unresponse', (ID_, client_ID) => {
    io.emit('unresponse', ID_, client_ID);
  });
  socket.on('create room', (room_id, name) => {
    console.log(colors.rainbow("A new room has been brodcasted.") + colors.black(" Room ID: " + room_id + " || Name: " + name));
    io.emit('append Room', room_id, name);

    var newRoom = {
      "name": name,
      "id": room_id
    };
    rooms.push(newRoom);
    overwriteFile('./storage/rooms.json', rooms, "Done writting rooms file", "An error occoured ");
  });

  socket.on("send letter", (msg, title) => {
    var newLeader = {
      "title": title,
      "message": msg,
      "time": currentTime()
    };
    board.push(newLeader);
    console.log(currentTime());
    overwriteFile('./storage/board.json', board);
    io.emit("letter", msg, title);
    console.log(msg);
  });

  socket.on("upload", (file) => {
    console.log(file); // <Buffer 25 50 44 ...>

    // save the content to the disk, for example
  });
  socket.on('delete Room', (Room_ID) => {
    for (var i = 0; i < rooms.length; i++) {
      if (rooms[i].id == Room_ID) {
        socket.emit("chat message", "Deleting Room... This may take some while", Room_ID, "Server",  false);
        rooms = deleteDict(rooms, i);
        overwriteFile('./storage/rooms.json', rooms, "Done writting text file", "An error occoured: ");
        //console.log(colors.red(rooms[i].name + " // " + i));
        //console.log(colors.red(rooms[i]));
        socket.emit("chat message", "Success Delets room! This message shuld you not see ", Room_ID, "ERROR", false);
        io.emit('reload');
        break;
      }
    }
    socket.emit('chat message', "Cant delete Room: Cant find Room", Room_ID, "Server");
  });
  socket.on('data', (data) =>{
    overwriteFile('./storage/profile/0.txt');
  });
  socket.on('Change Username', (newName, description, passcode, email, client_ID, alreadyDecoded) => {
    //Fist check if the username is already given if so check if the password is correct
    console.log("Username Changing... -> " + description);
    var hasFound = false;
    var FoundID = 0;
    var emailHasFound=false;
    var emaiLFoundID=0;
    for(var i = 0; i < users.length; i++)
      {
        if(users[i].name == newName)
          {
            hasFound = true;
            FoundID = i;
          }
        if(users[i].email == email)
          {
            emailHasFound = true;
            emaiLFoundID = i;
          }
      }
    console.log("Final: \n hasFound: " + hasFound + " \n FoundID + " + FoundID + " \n emailHasFound: " + emaiLFoundID + "\n emailHasFound: " + emailHasFound);
    if(hasFound)
      {
        //Now check if the Pasword is correct
        if(users[FoundID].passcode == passcode)
          {
            //Passcode is correct log in!
            var decodedNewName = "";
            console.log(alreadyDecoded);
            if(!alreadyDecoded)
              {
                decodedNewName = decode(newName);
              } else
                decodedNewName = newName;
            
            console.log(colors.red(passcode));
            io.emit("login", decodedNewName, passcode, description, email);
            io.emit("Login Error", "Success logined!");
          } else
          {
            //Passcode is incorrect give error message!
            io.emit("Login Error", "Failed to login: Password is incorrect");
          }
      } else 
      {
        //Check if email is forgiven
        if(emailHasFound)
          {
            // Email is already in use give error Message
            io.emit("Login Error", "Failed to create Account: Email is already in use");
          } else 
          {
            var decodedNewName = "";
            if(!alreadyDecoded)
              {
                decodedNewName = decode(newName);
              } else
                decodedNewName = newName;
            
              io.emit("login", decodedNewName);
              // Give message, that a new Account can be created
            io.emit("Login Error", "Account success Created!");
            if(!alreadyDecoded)
              { //it isnt decodede, which means newName is NOT numbers
                var newPrototypeName = {
                  "name": newName, //let it newName because it should NOT write the encoded things
                  "passcode": passcode,
                  "description": description,
                  "email": email
                };
                console.log(colors.bgYellow("name " + newName + //let it newName because it should NOT write the encoded things
                  " passcode " + passcode+
                  " description "+ description+
                  " email "+ email))
                users.push(newPrototypeName);
              } else { //encode it first and then write
                  //var username = encode(newName);
                  //var newPrototypeName = {
                  //  "name": username, //let it newName because it should NOT write the encoded things
                  //  "passcode": passcode, // Is null because nothings given, thats why it shuld check if it is already avalible
                  //  "description": description, // But why shuld it write it again? Nothings changed since you havnt logged in
                  //  "email": email
                  //};
                }
            
          console.log(colors.bgRed("writing + " + users + "\n with " + newPrototypeName + " andescr: " + description));
          overwriteFile('./storage/user.json', users, "Done writting users1 file", "An error occoured ");
        }
      }
  });
  socket.on('join room', (room_id) => {
    console.log("Someone joined an room ID: " + room_id);
  });


  socket.on('canGetModerator', (id, client_id) => {
    console.log(id + " trys to get Admin");
    for (var i = 0; i < modUserIds.length; i++) {
      if (modUserIds[i] == id) {
        console.log("user is an Admin!");
        io.emit('has Admin', client_id);
      }
    }
  });
});

const hostname = 'localhost';

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);

});

var date = () => new Date();