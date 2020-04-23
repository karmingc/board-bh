const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const join = (room, pName) => {
    let roomN;
    // if (!rooms.includes(room)) {
    //     rooms.push(room)
    // }
    client.join(room)             
    io.sockets.adapter.clients([room], function(err, clients){    
        roomN = clients.length;                         
        console.log(`${pName} has joined ${room},total clients in ${room}: %d`, clients.length);
    })    
    // clearly this is not working
    // setInterval(()=> {
    //     client.emit(room, roomN)
    // }, 1000)
}




module.exports = {
    join
}