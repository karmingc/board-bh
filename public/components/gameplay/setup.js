const main = require('../../../app');
const io = main.io;
const list = require('../list/characters');
const orders = list.orders;
const c = require('../list/classes')


// initial setup for roles in the games
const add = (room, rooms, role) => {
    // add role to room
    for (r of rooms) {
        if (r.id === room) {
            if (role === "Lovebirds (2)") {
                // add twice
                r.addRole(role)
                r.addRole(role)
            } else {
                r.addRole(role)
            }
            io.in(room).emit('updateRoles', r.roles)
            break
        }
    }
    return rooms;
}
const remove = (room, rooms, role) =>  {
    // remove role from room
    for (r of rooms) {
        if (r.id === room) {
            for (let j = 0; j < r.roles.length; j++) {
                if (r.roles[j] === role) {
                    if (role === "Lovebirds (2)") {
                        r.removeRole(j, 2)   
                    } else {
                        r.removeRole(j, 1)
                    }
                    io.in(room).emit('updateRoles', r.roles);
                    break
                }
            }
        }
    }
    return rooms;
}

const start = (room, rooms) => {
    // randomizes the roles
    for (r of rooms) {
        if (r.id === room) {
            r.randomizeRoles()
        }
    }
    // // emit to every client in the same room their unique roles
    for (r of rooms) {
        if (r.id === room) {
            r.setStatus("started")
            // hide mid for clients
            let mid = ['*', '*', '*']
            for (let j = 0; j < r.client.length; j++) {                                            
                // send roles to players                  
                io.to(r.client[j]).emit('setRole', r.roles[j])                                    
            }    
            io.sockets.in(room).emit('roomStatus', r.status)                                            
            io.sockets.in(room).emit('midRole', mid);              
            r.addChat(new c.Message("Roles", " have been distributed. Please click ready to start the night simulation.", "announcer"))            
            // set order of game based on roles chosen
            for (order of orders) {
                if (order.role === "Ghosts" && (r.roles.includes("Ghost 1") || r.roles.includes("Ghost 2")))  {                    
                    r.setOrderRoles(order.role)           
                }
                if (order.role === "Lovebirds" && r.roles.includes("Lovebirds (2)"))  {
                    r.setOrderRoles(order.role)
                }
                if (r.roles.includes(order.role)) {                    
                    r.setOrderRoles(order.role)
                }
            }               
        }
    }    
    return rooms;    
}

const restart = (room, rooms) => {
    // reset game
    for (r of rooms) {
        if (r.id === room) {
            r.resetRoom();
            r.addChat(new c.Message("Game", " has been reset.", "announcer"))            
            io.in(room).emit('roomStatus', "restart");               
            io.in(room).emit('updateRoles', r.roles);   
            io.in(room).emit('roomNames', r.players);                                                        
            io.in(room).emit('roomReady', r.ready);   
            io.in(room).emit('voteResults', r.vote);                                 
        }
    }    
    return rooms;
}

module.exports = {
    remove,add,start, restart
}