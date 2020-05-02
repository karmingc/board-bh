const main = require('../../../app');
const io = main.io;
const list = require('../list/characters');
const orders = list.orders;
// initial setup for roles in the games
const add = (client, room, role, rooms) => {
    for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].id === room) {
            // add roles               
            if (role === "Lovebirds (2)") {
                rooms[i].roles.push(role);                  
                rooms[i].roles.push(role);                      
            } else {
                rooms[i].roles.push(role);                  
            }                                   
            io.in(room).emit('updateRoles', rooms[i].roles);                  
            break;
        }
    }
    return rooms;
}
const remove = (client, room, role, rooms) =>  {
    for (let i = 0; i < rooms.length; i++) {
        for (let j = 0; j < rooms[i].roles.length;j++) {
            if (rooms[i].id === room && rooms[i].roles[j] === role) {
                if (role === "Lovebirds (2)") {
                    rooms[i].roles.splice(j, 2);
                } else {
                    rooms[i].roles.splice(j, 1);
                }                
                io.in(room).emit('updateRoles', rooms[i].roles);                  
                break;
            }
        }
    }
    return rooms;
}

const start = (client, room, rooms) => {
    // randomizes the roles
    for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].id === room) {
            let j, x, k;
            for(k = rooms[i].roles.length - 1; k > 0; k--) {
                a = rooms[i].roles
                j = Math.floor(Math.random()*(k+i))
                x = a[k]
                a[k] = a[j]
                a[j] = x                     
            }                
        }
    }     
    // emit to every client in the same room their unique roles
    // can use the index of it     
    for (let i = 0; i < rooms.length; i++) {
        let r = rooms[i];
        if (r.id === room) {            
            r.status = "started"            
            let mid = ['*', '*', '*']    
            for (let j = 0; j < r.players.length; j++) {                                            
                // send fake mid roles, so no reveal                                   
                // send to playing ones, send roles first   
                io.to(r.client[j]).emit('setRole', r.roles[j])                                    
            }                     
            // send to everyone
            io.sockets.in(room).emit('roomStatus', r.status)                                            
            io.sockets.in(room).emit('midRole', mid);  
            
            let arr = []
            for (let i = 0; i < orders.length; i++) {
                if (orders[i].role === "Ghosts" && (r.roles.includes("Ghost 1") || r.roles.includes("Ghost 2")))  {
                    arr.push(orders[i].role)                
                }
                if (orders[i].role === "Lovebirds" && r.roles.includes("Lovebirds (2)"))  {
                    arr.push(orders[i].role)
                }
                if (r.roles.includes(orders[i].role)) {
                    arr.push(orders[i].role)
                }
            }   
            r.orderRoles = arr;

        }
    }  
    console.log(rooms)               
    // add order of roles 
    return rooms;    
}

const restart = (room, rooms) => {
    // set roomStatus to waiting
    // reset basic roles
    let Role = ['Regular 1', 'Snake', 'Ghost 1', 'Ghost 2', 'Meddler', 'Stalker']
    // reset ready    
    // reset all vote to empty
    // emit to everybody
    for (let i = 0; i < rooms.length; i++) {
        let r = rooms[i]
        if (r.id === room) {
            for (let j = 0; j < r.players.length; j++) {
                r.ready[j] = false
                r.vote[j] = ''
                
            }
            // r.order = 0;
            r.roles = Role
            r.status = "waiting"
            io.in(room).emit('roomStatus', "restart");               
            io.in(room).emit('updateRoles', r.roles);                                                      
            io.in(room).emit('roomReady', r.ready);   
            io.in(room).emit('voteResults', r.vote);                                 
        }
    }
    return rooms;
}

module.exports = {
    remove,add,start, restart
}