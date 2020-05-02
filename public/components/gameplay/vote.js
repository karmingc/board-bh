const app = require('../../../app')
const io = app.io
// receive from everybody a list of vote
const Receive = (room, target, host, rooms) => {
    for (let i = 0; i < rooms.length; i++) {
        let r = rooms[i];
        if (r.id === room) {                        
            let hIndex = r.players.indexOf(host);
            r.vote[hIndex] = target;            
        }
        io.in(room).emit('voteResults', r.vote);
        io.in(room).emit('votePlayers', r.players);            
    }                  
    return rooms;
}

const Reveal = (room, rooms) => {
    for (let i = 0; i < rooms.length; i++) {
        let r = rooms[i];
        let nPlayers = r.players.length;
        if (r.id === room) {            
            io.in(room).emit('finalRoles', r.roles); 
            io.to(room).emit('midRole', r.roles.slice(nPlayers));                                                                                                            
        }
    }    
}

const Winner = (room, rooms) => {
    for (let i = 0; i < rooms.length; i++) {
        let r = rooms[i];
        if (r.id === room) {            
            let voted = Sort(r.vote)       
            console.log(voted);                   
            let count = Cnt(r.vote)[voted]    
            // when there's no vote                 
            let vIndex = r.players.indexOf(voted)            
            let role = r.roles[vIndex];                               
            if (Math.floor(r.players.length/2)+1 > count) {
                io.in(room).emit('finalWinner', 'ghosts + faker');   
            } else {
                if (!voted){
                    if (r.roles.slice(r.players.length).includes("Ghost 1") && r.roles.slice(r.players.length).includes("Ghost 2")) {
                        io.in(room).emit('finalWinner', 'good team!');                         
                    } else {
                        io.in(room).emit('finalWinner', 'ghosts + faker');
                    }
                } else if (role === "Ghost 1" || role === "Ghost 2") {
                    io.in(room).emit('finalWinner', 'good team!');                     
                } else if (role === "Faker"){
                    io.in(room).emit('finalWinner', 'ghosts + faker');
                } else if (role === "Douche") {
                    io.in(room).emit('finalWinner', 'douche!');   
                } else {
                    io.in(room).emit('finalWinner', 'ghosts + faker!');   
                }
            }            
        }
    }    
    console.log(rooms)   
}

const Sort = (arr) => {
    // array of people who were voted for 
    let cnts = arr.reduce((obj, val) => {
        obj[val] = (obj[val] || 0) + 1
        return obj;
    }, {});    
    let sorted = Object.keys(cnts).sort((a,b)=>{
        return cnts[b] - cnts[a];
    })          
    console.log(sorted)          
    return sorted[0];    
}
const Cnt = (arr) => {    
    let cnts = arr.reduce((obj, val) => {
        obj[val] = (obj[val] || 0) + 1
        return obj;
    }, {});       
    return cnts
}
// vote results

module.exports = {
    Receive,
    Reveal, 
    Winner
}