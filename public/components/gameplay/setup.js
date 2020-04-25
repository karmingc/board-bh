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
            console.log(rooms[i].roles);
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
                console.log(rooms)
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
            for (let j = 0; j < rooms[i].players.length; j++) {
                let nPlayers = rooms[i].players.length;
                io.to(rooms[i].client[j]).emit('setRole', rooms[i].roles[j])
                io.to(rooms[i].client[j]).emit('start', true)    
                io.to(rooms[i].client[j]).emit('midRole', rooms[i].roles.slice(nPlayers));                                                                                          
            }
            // emit the remaining 3 roles to be sent to the middle
        }
    }  
    return rooms;    
}

module.exports = {
    remove,add,start
}