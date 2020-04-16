const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);



let given = []


io.on('connection', client => {

    let numb = Math.floor(Math.random() * 10)
    while (given.includes(numb)) {
        numb = Math.floor(Math.random() * 10)
    }    
    given.push(numb)    
    console.log(given)
    
    console.log(io.engine.clientsCount + ' of people are connected.')    
    client.emit('testing', numb)
    setInterval(()=> {
        client.emit('number', io.engine.clientsCount)
    })
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