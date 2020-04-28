const main = require('../../../app')
const io = main.io
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
            console.log('added role')            
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
                console.log('removed role')
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
        if (rooms[i].id === room) {
            rooms[i].status = "started"
            for (let j = 0; j < rooms[i].players.length; j++) {                
                // io.sockets.adapter.clients([rooms[i].id], (err,clients) => {   
                //     // array of clients connected to room
                //     for (let k = 0; k < clients.length; k++) {                    
                //         io.to(clients[k]).emit('setRole', rooms[i].roles[j])
                //         io.to(clients[k]).emit('roomStatus', rooms[i].status);    
                //         // send fake mid roles       
                //         let mid = ['*', '*', '*']                                                                                
                //         io.to(clients[k]).emit('midRole', mid);                                                                                                          
                //     }                
                // }) 
                // order is important, didn't work if status was after mid
                io.to(rooms[i].client[j]).emit('setRole', rooms[i].roles[j])
                io.to(rooms[i].client[j]).emit('roomStatus', rooms[i].status);    
                // send fake mid roles       
                let mid = ['*', '*', '*']                                                                                
                io.to(rooms[i].client[j]).emit('midRole', mid);                                                                                                          
            }
            // emit the remaining 3 roles to be sent to the middle
        }
    }  
    return rooms;    
}

const restart = (room, rooms) => {
    // set roomStatus to waiting
    // reset basic roles
    let Role = ['Regular 1', 'Snake', 'Bully 1', 'Bully 2', 'Troublemaker', 'Stalker']
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
            r.roles = Role
            r.status = "waiting"
            io.in(room).emit('roomStatus', r.status);               
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