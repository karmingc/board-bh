const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const roomTest = require('./public/components/rooms');


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
    client.on('join', (room, pName) => {        

        client.join(room)    
            
        // when somebody joins, first update their list
        for (let i = 0; i < rooms.length; i++) {
            let r = rooms[i];
            if (r.id === room) {
                io.sockets.in(room).emit('roomInitial', r.players);    
            }
        }        
        // adds their name
        if (typeof pName !== "undefined") {            
            let found = false;
            // find if room exists
            for (let i = 0; i < rooms.length; i++) {
                if (rooms[i].id === room) {
                    found = true;
                    rooms[i].players.push(pName);
                    rooms[i].client.push(client.id)                    
                    break;
                }
            }
            // if not found
            if (found === false) {
                rooms.push({"id": room, "players": [], 'client': []});
                rooms[rooms.length-1].players.push(pName);
                rooms[rooms.length-1].client.push(client.id);
            } 
            // adds for everybody
            io.sockets.in(room).emit('roomPlayers', pName);    
        }  
        console.log(rooms)  
        
        // it's only removed in my database, 

        // displays person who joined in x room
        // io.sockets.adapter.clients([room], function(err, clients){              
        //     console.log(`${pName} has joined ${room},total clients in ${room}: %d`, clients.length);
        // })            

        // when a person leaves a specific room
        client.on('disconnect', ()=> {
            let idx;
            for (let i = 0; i < rooms.length; i++) {
                for (let j = 0; j < rooms[i].client.length;j++) {
                    if (rooms[i].client[j] === client.id) {
                        rooms[i].client.splice(j, 1);
                        rooms[i].players.splice(j, 1);
                    }
                }
            }            
        })
        
    }) 

    client.on('leave', ()=> {
        // when a person leaves a specific room
        console.log('tried to leave')
        for (let i = 0; i < rooms.length; i++) {
            for (let j = 0; j < rooms[i].client.length;j++) {
                if (rooms[i].client[j] === client.id) {
                    rooms[i].client.splice(j, 1);
                    rooms[i].players.splice(j, 1);
                    console.log('removed')
                    console.log(rooms)
                }
            }
        }     
    })
        
    setInterval(()=> {     
        for (let i = 0; i < rooms.length; i++) {
            let r = rooms[i];
            // number of players in specific room
            io.sockets.adapter.clients([r.id], function(err, clients){                   
                io.sockets.in(r.id).emit('nPlayerR', clients.length);                                       
            })
                                        
            // name of players in specific room
            io.sockets.in(r.id).emit('roomInitial', r.players);                            
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

