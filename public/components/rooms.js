const app = require('../../app')
const io = app.io
const c = require('./list/classes')


const join = (client, room, pName, rooms) => {
    // join room
    client.join(room)    
    
    for (r of rooms) {        
        if (r.id === room) {
            io.sockets.in(room).emit('roomNames', r.players);                
        }
    }

    // adds their name to a specific room
    if (pName !== '' ) {
        let found = false;
        // // find if room exists
        for (r of rooms) {
            if (r.id === room) {                
                found = true;
                if (r.players.length < 10) {
                    r.addPlayer(pName, client.id, false, '', new c.Message(pName, " joined", "null") )                                        
                }                
                // name of players in specific room                
                io.sockets.in(room).emit('roomNames', r.players);    
                // io.sockets.in(room).emit('roomReady', rooms[i].ready); // ready prior to players so it doesn't delay in front end                                              
                io.sockets.in(room).emit('updateRoles', r.roles);   
                io.sockets.in(room).emit("updateChat", r.chat);                                                                                                                
                break   
            }
        }

        // if room doesn't exist 
        if (found === false) {            
            let newRoom = new c.Room(room, pName, client.id, false, '')
            rooms.push(newRoom)                               
            io.sockets.in(room).emit('roomNames', rooms[rooms.length-1].players);                                          
            io.sockets.in(room).emit('updateRoles', rooms[rooms.length-1].roles);                                          
            io.sockets.in(room).emit("updateChat", rooms[rooms.length-1].chat);                                                                                                            
            io.to(client.id).emit('master', true);                  
        } 
    }                         
    return rooms;
}

const leave = (client, room, rooms) => {
    // when a person leaves a specific room 
    client.leave(room)        
    
    // remove player
    for (let i = 0; i < rooms.length; i++) {
        let r = rooms[i]
        if (r.id === room) {
            for (rc of r.client) {
                if (rc === client.id) {
                    // get index
                    let idx = r.getIndex('client', rc);                    
                    // remove player from Room
                    r.removePlayer(idx, new c.Message(r.players[idx], " left", "null") )                    
                    io.sockets.in(room).emit('roomNames', r.players);  
                    io.sockets.in(room).emit("updateChat", r.chat);                                                                                                                
                    io.to(r.client[0]).emit('master', true);                                     
                    if (r.players.length === 0) {
                        rooms.splice(i, 1)                            
                    }  
                    break
                }
            }
        }
    }
    return rooms;    
}


const view = (client, room, rooms) => {    
    client.join(room)

    for (r of rooms) {
        if (r.id === room) {
            // clients in a specific room
            io.sockets.adapter.clients([r.id], (err, clients) => {
                // for viewers not playing                   
                for (rc of clients) {
                    if (!r.client.includes(rc)) {
                        io.to(rc).emit('initView', r.players)
                        io.to(rc).emit('roomStatus', r.status)
                        break
                    }
                }

            }) 
        }
    }
}

const kick = (room, rooms, target) => {      
    // remove kicked player
    for (r of rooms) {
        if (r.id === room) {
            for (rp of r.players) {
                if (rp === target) {
                    let idx = r.getIndex('players', rp)
                    io.to(r.client[idx]).emit('kicked', true);
                    io.sockets.connected[r.client[idx]].leave(room);  
                    r.removePlayer(idx, new c.Message(rp, " been kicked", "null"))
                    io.sockets.in(room).emit('roomNames', r.players)
                    io.sockets.in(room).emit('updateChat', r.chat)
                }
            }
        }
    }
    return rooms;
}

module.exports = {
    join, kick, 
    leave, view
}