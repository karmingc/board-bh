const main = require('../../../app')
const io = main.io
// all the roles switching should be here

// copycat, ghosts, faker, lovebirds, stalker, snake

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
    return rooms;
}

// ghosts + faker
const Ghosts = (room, rooms) => {
    // if not inside the array, send back middle
    // more than one bully 
    let ghosts = [];
    for (let i = 0; i < rooms.length; i++) {
        let r = rooms[i];
        if (r.id === room) {       
            // add list of ghosts      
            for (let k = 0; k < r.roles.length; k++) {
                if (r.roles[k] === 'Ghost 1' || r.roles[k] === 'Ghost 2') {
                    if (k >= r.players.length) {
                        ghosts.push('Middle')
                    } else {
                        ghosts.push(r.players[k])
                    }
                }
            }            
            // send the list to the spirit team
            for (let j = 0; j < r.players.length; j++){
                if (r.roles[j] === 'Ghost 1' || r.roles[j] === 'Ghost 2' || r.roles[j] === 'Faker') {                    
                    io.to(r.client[j]).emit('ghostsList', ghosts);                                                                                          
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
            if (r.roles[tIndex] !== "Irregular") {
                temp = r.roles[hIndex];
                r.roles[hIndex] = r.roles[tIndex];
                r.roles[tIndex] = temp;                      
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
                io.to(r.client[hIndex]).emit('newRole', 'nope');                                                                                                                                                                                                    
            } else {
                io.to(r.client[hIndex]).emit('newRole', 'nope');                                                                                          
            }
        }
    }    
}

// meddler, change two roles
const Meddler = (room, target, target2, rooms) => { 
    for (let i = 0; i < rooms.length; i++) {
        let r = rooms[i];
        let temp;
        if (r.id === room) {            
            let tIndex = r.players.indexOf(target)
            let t2Index = r.players.indexOf(target2)
            // do nothing if irregular
            if (r.roles[tIndex] !== "Irregular" && r.roles[t2Index] !== "Irregular") {
                temp = r.roles[t2Index];
                r.roles[t2Index] = r.roles[tIndex];
                r.roles[tIndex] = temp;            
            }
        }
    }    
    return rooms;     
}

const RoleAction = (client, room, rooms) => {
    for (let i = 0; i < rooms.length; i++) {
        let r = rooms[i];
        if (r.id === room) {
            for (let j = 0; j < r.players.length; j++) {
                if (r.client[j] === client.id && r.roles[j] === "Lovebirds (2)") {                    
                    let required; 
                    if (!r.lovebirds.includes(client.id)) {
                        r.lovebirds.push(client.id)
                        for (let k = 0; k < r.players.length; k++) {
                            if (r.roles[k] === "Lovebirds") {
                                required += 1;
                            }
                        }
                        if (required === r.lovebirds.length) {
                            r.order += 1;
                            io.in(room).emit('NextRole', r.order);
                        }
                    }   
                    console.log(`lovebirds will increase, curr ${r.order}`)                 
                } else if (r.client[j] === client.id && (r.roles[j] === "Ghost 1" || r.roles[j] === "Ghost 2")) {                    
                    let required = 0; 
                    if (!r.ghosts.includes(client.id)) {
                        r.ghosts.push(client.id)
                        for (let k = 0; k < r.players.length; k++) {
                            if (r.roles[k] === "Ghost 1" || r.roles[k] === "Ghost 2") {
                                required += 1;
                            }                            
                        }
                        if (required === r.ghosts.length) {                            
                            r.order += 1;
                            io.in(room).emit('NextRole', r.order);
                        }                             
                    }   
                    console.log(`ghosts will increase, curr ${r.order}`)    
                } else if (r.client[j] === client.id) {
                    // only 1 person role
                    r.order += 1;
                    io.in(room).emit('NextRole', r.order);                      
                    console.log(`random will increase, curr ${r.order}`)    
                }                
            }
            // do something for middle
        }
    }    
    return rooms;    
}

const NoRoleAction = (room, rooms, role) => {    
    // all clients are sending at the same time
    for (let i = 0; i < rooms.length; i++) {
        let r = rooms[i];
        if (r.id === room) {
            if (role === "Ghosts" && !r.roles.slice(0, r.players.length).includes("Ghost 1") && !r.roles.slice(0, r.players.length).includes("Ghost 2")) {
                r.order += 1;
                setTimeout(()=>{
                    io.in(room).emit('NextRole', r.order);                
                }, 10000)    
                console.log('ghostsssssss')                 
                console.log(r.order)
            } else if (r.roles.slice(r.players.length).includes(role)) {
                r.order += 1;
                setTimeout(()=>{
                    io.in(room).emit('NextRole', r.order);                
                }, 10000)   
                console.log('nobody is that player')        
                console.log(r.order)         
            }
        }
        
    }    
    return rooms;
}

module.exports = {
    View,
    Copycat, Ghosts, Lovebirds,
    Stalker, Snake, Meddler,
    RoleAction, NoRoleAction

}