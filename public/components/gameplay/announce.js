const main = require('../../../app')
const io = main.io

// all the roles switching should be here
// everything is in order

const Copycat = (room, target, host, rooms) => {
    for (r of rooms) {
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
    // send ghost list to other ghost + faker
    let ghosts = []
    for (r of rooms) {
        // r.ghosts.length === 0 so only iterate once
        if (r.id === room && r.ghosts.length === 0) {            
            for (let k = 0; k < r.roles.length; k++) {
                if (r.roles[k] === 'Ghost 1' || r.roles[k] === 'Ghost 2') {                    
                    if (k >= r.players.length) {
                        ghosts = [...ghosts, 'Middle']                        
                    } else {
                        ghosts = [...ghosts, r.players[k]]                        
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
    let lb = []
    for (r of rooms) {
        if (r.id === room && r.lovebirds.length === 0) {
            // add list of lovebirds   
            for (let k = 0; k < r.roles.length; k++) {
                if (r.roles[k] === 'Lovebirds (2)') {
                    if (k >= r.players.length) {   
                        lb = [...lb, 'Middle']                                             
                    } else {                        
                        lb = [...lb, r.players[k]]                                             
                    }
                }
            }            
            // send the list to the lovebirds
            for (let j = 0; j < r.players.length; j++){
                if (r.roles[j] === 'Lovebirds (2)') {                    
                    io.to(r.client[j]).emit('loveList', lb);                                                                                          
                }
            }            
        }
    }
}

// stalker - view one person's card or two in the middle
const Stalker = (room, target, host, rooms) => {       
    let result = [];
    for (r of rooms) {        
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

// thief - choose one person to swap cards switch
const Thief = (room, target, host, rooms) => {    
    for (r of rooms) {        
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

// random view authorization, used with thief atm
const View = (room, target, host, rooms) => {    
    for (r of rooms) {             
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
    for (r of rooms) {        
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

const Clueless = (room, rooms, initHost) =>   {  
    for (r of rooms) {        
        if (r.id === room) {
            for (let j = 0; j < r.players.length; j++) {
                if (r.players[j] === initHost) {
                    io.to(r.client[j]).emit('updateRole', r.roles[j]);    
                }
            }
        }
    }
}


const RoleAction = (client, room, rooms, role) => {
    for (r of rooms) {        
        if (r.id === room) {            
            if (role === "Lovebirds (2)") {
                let required = 0;                 
                if (!r.lovebirds.includes(client.id)) {
                    r.lovebirdsTeam(client.id)                    
                    for (let k = 0; k < r.players.length; k++) {
                        if (r.roles[k] === "Lovebirds (2)") {
                            required += 1;
                        }
                    }
                    if (required === r.lovebirds.length) {
                        // can't double click
                        let newOrder = r.order + 1;
                        if (r.orderRoles[newOrder - 1] === "Lovebirds") {
                            r.addOrder()                            
                        }
                        io.in(room).emit('NextRole', r.order);
                    }                        
                }                
            } else if (role === "Ghost 1" || role === "Ghost 2") {
                let required = 0; 
                if (!r.ghosts.includes(client.id)) {
                    r.ghostTeam(client.id)                    
                    for (let k = 0; k < r.players.length; k++) {
                        if (r.roles[k] === "Ghost 1" || r.roles[k] === "Ghost 2") {
                            required += 1;
                        }                            
                    }                        
                    if (required === r.ghosts.length) {  
                        // can't double click                          
                        let newOrder = r.order + 1;                            
                        if (r.orderRoles[newOrder - 1] === "Ghosts") {
                            r.addOrder()
                        }                          
                        io.in(room).emit('NextRole', r.order);
                    }                     
                }                  
            } else {
                // only 1 person role, troubleshoot for copycat when he copies another role      
                // can't double click              
                let newOrder = r.order + 1;                    
                if (r.orderRoles[newOrder - 1] === role) {
                    r.addOrder()
                }
                io.in(room).emit('NextRole', r.order);                 
            }
            if (r.order >= r.orderRoles.length) {
                r.setStatus('vote')                
                io.in(room).emit('roomStatus', r.status);                                                              
            } 
        }
    }    
    return rooms;
}

const NoRoleAction = (room, rooms, role) => {    
    // all clients are sending at the same time
    let rnd = Math.floor(Math.random() * 3000) + 4000 + Math.floor(Math.random() * 3000)    
    for (r of rooms) {        
        if (r.id === room) {
            if (role === "Ghosts" 
            && !r.roles.slice(0, r.players.length).includes("Ghost 1") 
            && !r.roles.slice(0, r.players.length).includes("Ghost 2") 
            && (r.roles.includes("Ghost 1") || r.roles.includes("Ghost 2"))) {                
                let newOrder = r.order + 1;
                if (r.orderRoles[newOrder - 1] === "Ghosts") {                    
                    r.addOrder()                                                            
                }
                setTimeout(()=>{
                    io.in(room).emit('NextRole', r.order);                
                }, rnd)                                                     
            } else if (role === "Lovebirds" 
            && r.roles.includes("Lovebirds (2)") 
            && !r.roles.slice(0, r.players.length).includes("Lovebirds (2)")) {                
                let newOrder = r.order + 1;
                if (r.orderRoles[newOrder - 1] === "Lovebirds") {                    
                    r.addOrder()                
                }
                setTimeout(()=>{
                    io.in(room).emit('NextRole', r.order);                
                }, rnd)  
            } else if (r.roles.slice(r.players.length).includes(role)) { 
                let newOrder = r.order + 1;
                if (r.orderRoles[newOrder - 1] === role) {
                    r.addOrder()     
                }
                setTimeout(()=>{
                    io.in(room).emit('NextRole', r.order);                
                }, rnd)                                                           
            }
            if (r.order >= r.orderRoles.length) {
                r.setStatus('vote')                
                setTimeout(()=>{
                    io.in(room).emit('roomStatus', r.status)
                }, rnd)
            }           
        }        
    }            
    return rooms;
}

module.exports = {
    View, Clueless, 
    Copycat, Ghosts, Lovebirds,
    Stalker, Thief, Meddler,
    RoleAction, NoRoleAction
}