const main = require('../../../app')
const io = main.io
// each user will click
// if at that client, if it's ready, changed to false
// if it is false, then change to true;

// focus on changing it to true first
const Ready = (room, host, rooms) => {
    for (let i = 0; i < rooms.length; i++) {
        let r = rooms[i];
        if (r.id === room) {
            let hIndex = r.players.indexOf(host);
            if (r.ready[hIndex] === false) {
                r.ready[hIndex] = true;
            } else {
                r.ready[hIndex] = false;
            }
            console.log(r.ready);
            // update for every
            io.in(room).emit('roomReady', r.ready);                  
        }
    }
    return rooms;
}

module.exports = {
    Ready
}