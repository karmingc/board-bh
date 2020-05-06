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
        // send results
        io.in(room).emit('voteResults', r.vote);
        io.in(room).emit('votePlayers', r.players);  
            
        if (r.id === room) {
            let count = 0;
            for (let j = 0; j < r.players.length; j++) {
                if (r.vote[j]) {
                    count += 1;
                }
                if (count === r.players.length) {
                    r.status = "results";
                    io.in(room).emit('roomStatus', r.status); 
                    io.in(room).emit('finalRoles', r.roles); 
                    io.to(room).emit('midRole', r.roles.slice(r.players.length));                                                                                                                                
                    // send winning results
                    Winner(room, rooms);                    
                }
            }
        }          
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
            let count = Cnt(r.vote)[voted]    
            // when there's no vote                 
            let vIndex = r.players.indexOf(voted)                        
            let role = r.roles[vIndex];                               
            if (Math.floor(r.players.length/2)+1 > count) {
                io.in(room).emit('finalWinner', 'Team Ghost!');   
            } else {
                if (vIndex === -1){
                    if (r.roles.slice(r.players.length).includes("Ghost 1") && r.roles.slice(r.players.length).includes("Ghost 2")) {
                        // if both ghost are inside
                        io.in(room).emit('finalWinner', 'Team Human!');                         
                    } else if (r.roles.includes("Ghost 1") && !r.roles.includes("Ghost 2") && r.roles.slice(r.players.length).includes("Ghost 1")) {
                        io.in(room).emit('finalWinner', 'Team Human!'); 
                    } else if (r.roles.includes("Ghost 2") && !r.roles.includes("Ghost 1") && r.roles.slice(r.players.length).includes("Ghost 2")) {
                        io.in(room).emit('finalWinner', 'Team Human!'); 
                    } else {
                        io.in(room).emit('finalWinner', 'Team Ghost!');
                    }
                } else if (role === "Ghost 1" || role === "Ghost 2") {
                    io.in(room).emit('finalWinner', 'Team Human!');                     
                } else if (role === "Faker"){
                    io.in(room).emit('finalWinner', 'Team Ghost!');
                } else if (role === "Douche") {
                    io.in(room).emit('finalWinner', 'Douche!');   
                } else {
                    io.in(room).emit('finalWinner', 'Team Ghost!');   
                }
            }            
        }
    }        
    // console.log(rooms)   
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