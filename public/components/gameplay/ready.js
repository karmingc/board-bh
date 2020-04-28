const main = require('../../../app')
const io = main.io

// ready updates for everybody
// frontend switches its index to 0, does not affect backend
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
            // update for every            
            io.in(room).emit('roomReady', r.ready);                      
            // if every1 is ready, pass to vote
            let count = 0;
            for (let j = 0; j < r.ready.length; j++) {                                
                if (r.ready[j] === true) {
                    count+=1;                    
                    if (count === r.ready.length) {
                        r.status = "vote"
                        io.to(r.id).emit('roomStatus', r.status);  
                        console.log('everybody is ready!')
                    }
                }                
            }
        }
    }
    return rooms;
}

module.exports = {
    Ready
}