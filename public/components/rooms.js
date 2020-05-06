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
                // if less than 10, that player will added, 
                if (rooms[i].players.length < 10) {
                    rooms[i].players.push(pName);
                    rooms[i].client.push(client.id)  
                    rooms[i].ready.push(false);
                    rooms[i].vote.push('');
                }                
                // name of players in specific room                
                io.sockets.in(room).emit('roomNames', rooms[i].players);    
                // io.sockets.in(room).emit('roomReady', rooms[i].ready); // ready prior to players so it doesn't delay in front end                                              
                io.sockets.in(room).emit('updateRoles', rooms[i].roles);                                                                                                   
                break;                
            }
        }
        // if room doesn't exist 
        if (found === false) {
            let role = ['Regular 1', 'Thief', 'Ghost 1', 'Ghost 2', 'Meddler', 'Stalker'];
            rooms.push({
                "id": room, "status": "waiting", "players": [], 
                'client': [], 'roles': role, "order": 0, "orderRoles": [], "ghosts": [], "lovebirds": [], 'ready': [], 
                "vote": []});
            rooms[rooms.length-1].players.push(pName);
            rooms[rooms.length-1].client.push(client.id);
            rooms[rooms.length-1].ready.push(false);
            rooms[rooms.length-1].vote.push('');
            io.sockets.in(room).emit('roomNames', rooms[rooms.length-1].players);                              
            // io.sockets.in(room).emit('roomReady', rooms[rooms.length-1].ready);               
            io.sockets.in(room).emit('updateRoles', rooms[rooms.length-1].roles);                                          
            // emit master role
            io.to(client.id).emit('master', true);      
            
        } 
    }   
    console.log(rooms);                      
    return rooms;
}

const leave = (client, room, rooms) => {
    // when a person leaves a specific room 
    client.leave(room)        
    // remove from personal array
    for (let i = 0; i < rooms.length; i++) {
        let r = rooms[i]
        for (let j = 0; j < r.client.length;j++) {
            if (r.client[j] === client.id) {
                r.client.splice(j, 1);
                r.players.splice(j, 1);
                r.ready.splice(j, 1);
                r.vote.splice(j, 1);
                io.sockets.in(room).emit('roomNames', rooms[i].players);                  
                io.to(rooms[i].client[0]).emit('master', true);  
                if (r.players.length === 0) {
                    rooms.splice(i, 1)                            
                }  
            }
        }
    }             
    return rooms;    
}


const view = (client, room, rooms) => {    
    client.join(room)
    for (let i = 0; i < rooms.length; i++) {
        let r = rooms[i];        
        if (r.id === room) {
            io.sockets.adapter.clients([r.id], (err, clients) => {   
                // array of clients connected to room
                for (let j = 0; j < clients.length; j++) {  
                    // if they have not joined the game
                    // so the ones who are playing aren't affected                  
                    if (!r.client.includes(clients[j])) {
                        io.to(clients[j]).emit('initView', r.players)
                        io.to(clients[j]).emit('roomStatus', r.status)                        
                    }
                }                
            })                          
            
        }
    }        
}

const kick = (room, rooms, target) => {
    for (let i = 0; i < rooms.length; i++) {
        let r = rooms[i];
        if (r.id === room) {
            for (let j = 0; j < r.players.length; j++) {
                if (r.players[j] === target) {
                    io.to(r.client[j]).emit('kicked', true);
                    io.sockets.connected[r.client[j]].leave(room);                    
                    r.client.splice(j, 1);
                    r.players.splice(j, 1);
                    r.ready.splice(j, 1);
                    r.vote.splice(j, 1);
                    io.sockets.in(room).emit('roomNames', rooms[i].players);                        
                    
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

    
    // it's only removed in my database, 

    // displays person who joined in x room
    // io.sockets.adapter.clients([room], function(err, clients){              
    //     console.log(clients)
    //     console.log(`${pName} has joined ${room},total clients in ${room}: %d`, clients.length);
    // })            
