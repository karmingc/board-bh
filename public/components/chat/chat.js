const app = require('../../../app')
const io = app.io
const c = require('../list/classes')

const getChat = (room, rooms, name) => {
    for (r of rooms) {        
        if (r.id === room) {
            for (let j = 0; j < r.players.length; j++) {
                if (r.players[j] === name) {
                    io.to(r.client[j]).emit("updateChat", r.chat);
                }
            }
        }
    }
}

const sendMsg = (room, rooms, name, msg) => {
    let d = new Date(); 
    let h = d.getHours(); 
    let m = d.getMinutes();     
    let min = m < 10? "0" + m: m
    let time = h + ":" + min;        
    for (r of rooms) {        
        if (r.id === room) {     
            r.addChat(new c.Message(name, msg, time))                   
            io.sockets.in(room).emit("updateChat", r.chat);
        }
    }        
    return rooms;
}

module.exports = {
    getChat, sendMsg
}