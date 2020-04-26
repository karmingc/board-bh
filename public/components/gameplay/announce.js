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
            let tIndex = r.players.indexOf(target)
            let hIndex = r.players.indexOf(host)
            if (r.roles[tIndex] === "Irregular" || r.roles[hIndex] === "Irregular") {                
                io.to(r.client[hIndex]).emit('updateRole', r.roles[hIndex]);                                                                                          
            } else {
                // take on the role of target
                r.roles[hIndex] = r.roles[tIndex]
                // send it back to appropriate client
                io.to(r.client[hIndex]).emit('updateRole', r.roles[hIndex]);                                                                                          
            }            
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
            // add list of lovebirds   
            for (let k = 0; k < r.roles.length; k++) {
                if (r.roles[k] === 'Lovebirds (2)') {
                    if (k >= r.players.length) {
                        lovebirds.push('Middle')
                    } else {
                        lovebirds.push(r.players[k])
                    }
                }
            }            
            // send the list to the lovebirds
            for (let j = 0; j < r.players.length; j++){
                if (r.roles[j] === 'Lovebirds (2)') {                    
                    io.to(r.client[j]).emit('loveList', lovebirds);                                                                                          
                }
            }
        }
    }     
}

// stalker - view one person's card or two in the middle
const Stalker = (room, target, host, rooms) => {       
    let result = [];
    for (let i = 0; i < rooms.length; i++) {
        let r = rooms[i];
        if (r.id === room) {
            let tIndex = r.players.indexOf(target);
            let hIndex = r.players.indexOf(host);
            if (target !== 'middle') {                
                result.push(r.roles[tIndex])
                io.to(r.client[hIndex]).emit('stalkList', result);                
            } else {
                result.push(r.roles[r.roles.length-1])
                result.push(r.roles[r.roles.length-2])
                io.to(r.client[hIndex]).emit('stalkList', result);                
            }
        }
    }      
}

// snake - choose one person to swap cards switch
const Snake = (room, target, host, rooms) => {    
    for (let i = 0; i < rooms.length; i++) {
        let r = rooms[i];
        let temp;
        if (r.id === room) {
            let tIndex = r.players.indexOf(target)
            let hIndex = r.players.indexOf(host)
            // take on the role of target
            if (r.roles[tIndex] === "Irregular" || r.roles[hIndex] === "Irregular") {
                io.to(r.client[hIndex]).emit('updateRole', r.roles[hIndex]);                                                                                          
                io.to(r.client[tIndex]).emit('updateRole', r.roles[tIndex]);                                                                                          
            } else {
                temp = r.roles[hIndex];
                r.roles[hIndex] = r.roles[tIndex];
                r.roles[tIndex] = temp;            
                io.to(r.client[hIndex]).emit('updateRole', r.roles[hIndex]);                                                                                          
                io.to(r.client[tIndex]).emit('updateRole', r.roles[tIndex]);                                                                                          
            }                                    
        }
    }    
    return rooms; 
}

// random view authorization, used with snake atm
const View = (room, target, host, rooms) => {    
    for (let i = 0; i < rooms.length; i++) {
        let r = rooms[i];        
        if (r.id === room) {
            let tIndex = r.players.indexOf(target)
            let hIndex = r.players.indexOf(host)                                                                                                     
            if (r.roles[tIndex] === "Irregular" || r.roles[hIndex] === "Irregular") {
                io.to(r.client[hIndex]).emit('updateRole', r.roles[hIndex]);                                                                                                                                                                                                    
            } else {
                io.to(r.client[hIndex]).emit('newRole', r.roles[tIndex]);                                                                                          
            }
        }
    }    
}

// troublemaker, change two roles
const Troublemaker = (room, target, target2, rooms) => { 
    for (let i = 0; i < rooms.length; i++) {
        let r = rooms[i];
        let temp;
        if (r.id === room) {
            console.log(r.roles)
            let tIndex = r.players.indexOf(target)
            let t2Index = r.players.indexOf(target2)
            if (r.roles[tIndex] === "Irregular" || r.roles[hIndex] === "Irregular") {
                io.to(r.client[tIndex]).emit('updateRole', r.roles[tIndex]);
                io.to(r.client[t2Index]).emit('updateRole', r.roles[t2Index]);                                                                                                                                                                                                                
            } else {
                temp = r.roles[t2Index];
                r.roles[t2Index] = r.roles[tIndex];
                r.roles[tIndex] = temp;            
                // send it back to appropriate client
                io.to(r.client[tIndex]).emit('updateRole', r.roles[tIndex]);
                io.to(r.client[t2Index]).emit('updateRole', r.roles[t2Index]);                                                                                                                                                                                                                
            }            
            // take on the role of target
            console.log(r.roles)
        }
    }    
    return rooms;     
}

module.exports = {
    View,
    Copycat, Bullies, Lovebirds,
    Stalker, Snake, Troublemaker

}