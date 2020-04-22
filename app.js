const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);


// joining a specific room
// rooms are specifically server side

let given = []
let rooms = []

io.on('connection', client => {

    
    console.log(io.engine.clientsCount + ' of people are connected.')        
    setInterval(()=> {
        client.emit('number', io.engine.clientsCount)
    },1000)

    // joining a specific room
    client.on('join', (room, pName)=>{        
        let roomN;
        if (!rooms.includes(room)) {
            rooms.push(room)
        }
        client.join(room)             
        io.sockets.adapter.clients([room], function(err, clients){    
            roomN = clients.length;                    
            console.log(`${pName} has joined ${room},total clients in ${room}: %d`, clients.length);
        })    
        // clearly this is not working
        setInterval(()=> {
            client.emit(room, roomN)
        }, 1000)
        
    })

    // if you have an interval that emits the number in that room
    // client.emit("room", "# of people in that room")

    
    // constantly updates how many people are in the rooms
    

    client.on('connect', () => {})    
    client.on('disconnect', () => {});
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

