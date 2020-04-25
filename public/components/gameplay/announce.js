const main = require('../../../app')
const io = main.io
// all the roles switching should be here

// copycat, bullies, follower, lovebirds, stalker, snake

// copycat, person can copy the same role of another person

// everything is in order
const Copycat = (room, target, host, rooms) => {
    for (let i = 0; i < rooms.length; i++) {
        let r = rooms[i];
        if (r.id === room) {
            let pIndex = r.players.indexOf(target)
            let hIndex = r.players.indexOf(host)
            // take on the role of target
            r.roles[hIndex] = r.roles[pIndex]
            // send it back to appropriate client
            io.to(r.client[hIndex]).emit('setRole', r.roles[hIndex]);                                                                                          
        }
    }
    console.log(rooms);
    return rooms;
}

// bullies + follower
const Bullies = (room, rooms) => {
    // if not inside the array, send back middle
    // more than one bully 
    let bullies = [];
    for (let i = 0; i < rooms.length; i++) {
        let r = rooms[i];
        if (r.id === room) {       
            // add list of bullies      
            for (let k = 0; k < r.roles.length; k++) {
                if (r.roles[k] === 'Bully 1' || r.roles[k] === 'Bully 2') {
                    if (k >= r.players.length) {
                        bullies.push('Middle')
                    } else {
                        bullies.push(r.players[k])
                    }
                }
            }            
            // send the list to the bullies
            for (let j = 0; j < r.players.length; j++){
                if (r.roles[j] === 'Bully 1' || r.roles[j] === 'Bully 2' || r.roles[j] === 'Follower') {                    
                    io.to(r.client[j]).emit('bulliesList', bullies);                                                                                          
                }
            }
        }
    }     
}

// lovebirds sees themselves
const Lovebirds = (room, rooms) => {
    let lovebirds = []    
    for (let i = 0; i < rooms.length; i++) {
        let r = rooms[i];
        if (r.id === room) {       
            // add list of bullies      
            for (let k = 0; k < r.roles.length; k++) {
                if (r.roles[k] === 'Lovebirds (2)') {
                    if (k >= r.players.length) {
                        lovebirds.push('Middle')
                    } else {
                        lovebirds.push(r.players[k])
                    }
                }
            }            
            // send the list to the bullies
            for (let j = 0; j < r.players.length; j++){
                if (r.roles[j] === 'Lovebirds (2)') {                    
                    io.to(r.client[j]).emit('loveList', lovebirds);                                                                                          
                }
            }
        }
    }     
}



module.exports = {
    Copycat, Bullies, Lovebirds,

}