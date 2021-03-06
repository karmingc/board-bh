const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

module.exports = {
    io
}

const roomsAction = require('./public/components/rooms');
const roomSetup = require('./public/components/gameplay/setup');
const roomAnnounce = require('./public/components/gameplay/announce');
const roomDiscussion = require('./public/components/gameplay/ready');
const roomVote = require('./public/components/gameplay/vote');
const chat = require('./public/components/chat/chat');
const c = require('./public/components/list/classes')

let rooms = []

io.on('connection', client => {

    setInterval(()=> {
        client.emit('online', io.engine.clientsCount)
    },1000)


    // update each room the number of players in room
    setInterval(()=> {     
        for (let i = 0; i < rooms.length; i++) {
            let r = rooms[i];
            // number of players in specific room
            io.sockets.adapter.clients([r.id], function(err, clients){                   
                io.sockets.in(r.id).emit('onlineRoom', clients.length);                                       
            })                                                                          
        }              
    },1000)


    setInterval(()=> {     
        client.emit("viewRooms", rooms)         
    },1000)

    // players join a specific room 
    client.on('join', (room, pName)=>{
        rooms = roomsAction.join(client, room, pName, rooms)                       
    }) 
    // leave room
    client.on('leave', (room)=> {
       rooms = roomsAction.leave(client, room,rooms);           
    })       
    
    // just viewing
    client.on('view', (room)=>{
        roomsAction.view(client, room, rooms)
    })

    client.on('kick', (room, target) => {
        rooms = roomsAction.kick(room, rooms, target)
    })

    // adding roles to specific room + update 4 every1
    client.on('addRole', (room, role) => {
        rooms = roomSetup.add(room, rooms, role);        
    })
    // remove roles to specific room + update 4 every1
    client.on('removeRole', (room, role) => {
        rooms = roomSetup.remove(room, rooms, role);        
    })
    // start specific room 
    client.on('start', (room) => {
        // give a unique role for everybody in the same room        
        rooms = roomSetup.start(room, rooms);               
    })
    client.on('restart', (room) => {
        rooms = roomSetup.restart(room, rooms, client)        
    })
    // Announcements
    client.on("RoleAction", (room, role) => {
        rooms = roomAnnounce.RoleAction(client, room, rooms, role);
    })
    client.on("NoRoleAction", (room, role) => {
        rooms = roomAnnounce.NoRoleAction(room, rooms, role)
    })

    client.on('Copycat', (room, target, host) => {
        rooms = roomAnnounce.Copycat(room, target, host, rooms);
        // console.log('Copycat unleashed.')
    })
    client.on('Ghosts', (room)=> {
        roomAnnounce.Ghosts(room, rooms);                
    })
    client.on('Lovebirds', (room)=>{
        roomAnnounce.Lovebirds(room, rooms);        
    })
    client.on('Stalker', (room, target, host)=>{
        roomAnnounce.Stalker(room, target, host, rooms);        
    })
    client.on('Thief', (room, target, host) =>{
        rooms = roomAnnounce.Thief(room, target, host, rooms);        
    })
    client.on('Meddler', (room, target, target2) => {
        rooms = roomAnnounce.Meddler(room, target, target2, rooms);        
    })

    client.on('Clueless', (room, initHost) => {
        roomAnnounce.Clueless(room, rooms, initHost);
    })
    // random view
    client.on('View', (room, target, host) => {
        roomAnnounce.View(room, target, host, rooms)        
    })
    
    // Post-asnnouncement
    client.on('Ready', (room, host) => {
        rooms = roomDiscussion.Ready(room, rooms, host);
    })

    // Vote
    client.on('Vote', (room, target, host) => {
        rooms = roomVote.Receive(room, target, host, rooms);
    })

    client.on('Reveal', (room) => {
        roomVote.Reveal(room, rooms)      
    })

    client.on("Winner", (room) => {
        roomVote.Winner(room, rooms)
    })

    // chat related
    client.on("Chat", (room, name) => {
        chat.getChat(room, rooms, name);
    })

    client.on("SendChat", (room, name, msg) => {
        rooms = chat.sendMsg(room, rooms, name, msg);
    })

    
    // find the room they left
    client.on('disconnect', () => {                           
        for (let i = 0; i < rooms.length; i++) {
            let r = rooms[i]
            for (let j = 0; j < r.client.length; j++) {
                if (r.client[j] === client.id) {
                    r.removePlayer(j, new c.Message(r.players[j], " left", "null"))                                                                                                                           
                    io.sockets.in(r.id).emit('roomNames', r.players);   
                    io.sockets.in(r.id).emit("updateChat", rooms[rooms.length-1].chat);                                                                                                                                      
                    io.to(r.client[0]).emit('master', true);  
                    // delete room if no players
                    if (r.players.length === 0) {
                        rooms.splice(i, 1)                            
                    }                                
                }
            }
        }                                       
    });
})




const port = process.env.PORT || 4000;
app.use('/', (req, res) => {
    res.send('yo wsup')
});

server.listen(port, () => {
    console.log(`current listening to port ${port}`)
})

