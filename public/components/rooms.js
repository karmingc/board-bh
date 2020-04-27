const app = require('../../app')
const io = app.io
// updates the rooms as well

const join = (client, room, pName, rooms) => {
    // join room
    client.join(room)    
    
    // when somebody joins, first update their list
    for (let i = 0; i < rooms.length; i++) {
        let r = rooms[i];
        if (r.id === room) {
            io.sockets.in(room).emit('roomNames', r.players);    
        }
    }        

    // adds their name to a specific room
    if (pName !== '' ) {
        let found = false;
        // find if room exists
        for (let i = 0; i < rooms.length; i++) {
            if (rooms[i].id === room) {
                found = true;
                rooms[i].players.push(pName);
                rooms[i].client.push(client.id)  
                rooms[i].ready.push(false);
                rooms[i].vote.push('');
                // name of players in specific room
                io.sockets.in(room).emit('roomNames', rooms[i].players);    
                io.sockets.in(room).emit('roomReady', rooms[i].ready); // ready prior to players so it doesn't delay in front end                                              
                io.sockets.in(room).emit('updateRoles', rooms[i].roles);                                 
                break;                
            }
        }
        // if room doesn't exist 
        if (found === false) {
            let role = ['Regular 1', 'Snake', 'Bully 1', 'Bully 2', 'Troublemaker', 'Stalker'];
            rooms.push({"id": room, "status": "waiting", "players": [], 'client': [], 'roles': role, 'ready': [], "vote": []});
            rooms[rooms.length-1].players.push(pName);
            rooms[rooms.length-1].client.push(client.id);
            rooms[rooms.length-1].ready.push(false);
            rooms[rooms.length-1].vote.push('');
            io.sockets.in(room).emit('roomNames', rooms[rooms.length-1].players);                              
            io.sockets.in(room).emit('roomReady', rooms[rooms.length-1].ready);               
            io.sockets.in(room).emit('updateRoles', rooms[rooms.length-1].roles);                                          
        } 
    }       
    // when a person leaves a specific room
    client.on('disconnect', ()=> {            
        for (let i = 0; i < rooms.length; i++) {
            for (let j = 0; j < rooms[i].client.length;j++) {
                if (rooms[i].client[j] === client.id) {
                    rooms[i].client.splice(j, 1);
                    rooms[i].players.splice(j, 1);
                    io.sockets.in(room).emit('roomNames', rooms[i].players);                  
                }
            }
        }            
    })       
    return rooms;
}

const leave = (client, room, pName, rooms) => {
    // when a person leaves a specific room
    client.leave(room)        
    // remove from personal array
    for (let i = 0; i < rooms.length; i++) {
        for (let j = 0; j < rooms[i].client.length;j++) {
            if (rooms[i].client[j] === client.id) {
                rooms[i].client.splice(j, 1);
                rooms[i].players.splice(j, 1);
                io.sockets.in(room).emit('roomNames', rooms[i].players);                  
            }
        }
    }                              
    return rooms;    
}




module.exports = {
    join,
    leave
}

    
    // it's only removed in my database, 

    // displays person who joined in x room
    // io.sockets.adapter.clients([room], function(err, clients){              
    //     console.log(clients)
    //     console.log(`${pName} has joined ${room},total clients in ${room}: %d`, clients.length);
    // })            
