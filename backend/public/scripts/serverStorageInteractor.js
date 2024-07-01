var socket = io();

class serverStorageClass{
    setItem(key, value)
    {
        socket.emit("setItem", key, value, socket);
    }
    getItem(key)
    {
        socket.emit("getItem", key);
    }
}
var serverStorage = new serverStorageClass();