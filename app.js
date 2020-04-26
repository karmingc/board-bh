const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
module.exports = {
    io
}

const roomsAction = require('./public/components/rooms');
const roomsRole = require('./public/components/gameplay/setup');
const roomAnnounce = require('./public/components/gameplay/announce');
const roomDiscussion = require('./public/components/gameplay/ready');

// joining a specific room
// rooms are specifically server side

let given = []
let rooms = []

io.on('connection', client => {

    // you want to shift this into every room
    let numb = Math.floor(Math.random() * 10)
        while (given.includes(numb)) {
            numb = Math.floor(Math.random() * 10)
        }    
    given.push(numb)    
    // console.log(given)    
    client.emit('testing', numb)
    // console.log(io.engine.clientsCount + ' of people are connected.')        
    setInterval(()=> {
        client.emit('number', io.engine.clientsCount)
    },1000)


    // players join a specific room 
    client.on('join', (room, pName)=>{
        rooms = roomsAction.join(client, room, pName, rooms)
        console.log(`${pName} has joined room: ${room}`);            
    }) 
    // leave room
    client.on('leave', (room, pName)=> {
       rooms = roomsAction.leave(client, room, pName, rooms);
       console.log(`${pName} has left room: ${room}`);       
    })        
    // adding roles to specific room + update 4 every1
    client.on('addRole', (room, role) => {
        rooms = roomsRole.add(client, room, role, rooms);
        console.log(`add ${role} from ${room}`);
    })
    // remove roles to specific room + update 4 every1
    client.on('removeRole', (room, role) => {
        rooms = roomsRole.remove(client, room, role, rooms);
        console.log(`removed ${role} from ${room}`);
    })
    // start specific room 
    client.on('startGame', (room) => {
        // give a unique role for everybody in the same room
        // when click on start
        rooms = roomsRole.start(client, room, rooms);        
        // console.log('game has started')  
    })

    // Announcements
    client.on('Copycat', (room, target, host) => {
        rooms = roomAnnounce.Copycat(room, target, host, rooms);
        // console.log('Copycat unleashed.')
    })
    client.on('Bullies', (room)=> {
        roomAnnounce.Bullies(room, rooms);                
    })
    client.on('Lovebirds', (room)=>{
        roomAnnounce.Lovebirds(room, rooms);        
    })
    client.on('Stalker', (room, target, host)=>{
        roomAnnounce.Stalker(room, target, host, rooms);        
    })
    client.on('Snake', (room, target, host) =>{
        rooms = roomAnnounce.Snake(room, target, host, rooms);        
    })
    client.on('Troublemaker', (room, target, target2) => {
        rooms = roomAnnounce.Troublemaker(room, target, target2, rooms);        
    })
    // random view
    client.on('View', (room, target, host) => {
        roomAnnounce.View(room, target, host, rooms)        
    })

    // Post-announcement
    client.on('Discussion', (room, host) => {
        rooms = roomDiscussion.Ready(room, host, rooms);
    })





    // update each room the number of players in room
    setInterval(()=> {     
        for (let i = 0; i < rooms.length; i++) {
            let r = rooms[i];
            // number of players in specific room
            io.sockets.adapter.clients([r.id], function(err, clients){                   
                io.sockets.in(r.id).emit('nPlayerR', clients.length);                                       
            })                                                                          
        }              
    },1000)
    
    // find the room they left
    client.on('disconnect', () => {
        console.log('someone has left the client')
    });
})




const port = 4000;
app.use('/', (req, res) => {
    res.send('yo wsup')
});

server.listen(port, () => {
    console.log(`current listening to port ${port}`)
})


// io.on('connection', client => {

//     let numb = Math.floor(Math.random() * 10)
//     while (given.includes(numb)) {
//         numb = Math.floor(Math.random() * 10)
//     }    
//     given.push(numb)    
//     console.log(given)
    
//     console.log(io.engine.clientsCount + ' of people are connected.')    
//     client.emit('testing', numb)
//     setInterval(()=> {
//         client.emit('number', io.engine.clientsCount)
//     },1000)
//     client.on('connect', () => {})    
//     client.on('disconnect', () => {});
// })

