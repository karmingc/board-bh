const main = require('../../../app')
const io = main.io

class Room {
    constructor(id, playerName, clientID, ready, vote) {
        this.id = id;
        this.status = "waiting"
        this.players = [playerName]
        this.client = [clientID]
        this.roles = ['Regular 1', 'Thief', 'Ghost 1', 'Ghost 2', 'Meddler', 'Stalker']
        this.order = 0
        this.orderRoles = []
        this.ghosts = []
        this.lovebirds = []
        this.ready = [ready]
        this.vote = [vote]
        this.chat = [new Message(playerName, " joined", "null"), new Message(playerName.slice(0,-5), " is moderator", "announcer")]
    }
    // reset room: setup.js
    resetRoom() {
        this.status = "waiting"
        this.roles = ['Regular 1', 'Thief', 'Ghost 1', 'Ghost 2', 'Meddler', 'Stalker']
        this.order = 0
        this.orderRoles = []
        this.ghosts = []
        this.lovebirds = []
        this.ready = []
        this.vote = []
        // reset ready and vote
        for (let i = 0; i < this.players.length; i++) {
            this.ready = [...this.ready, false]
            this.vote = [...this.vote, '']
        }        
        // message for new game?
    }
    // get index of target from property: rooms.js
    getIndex(prop, target) {
        let result;              
        for (let i = 0; i < this[prop].length; i++) {
            if (this[prop][i] === target) {
                result = i;
            }
        }        
        return result;
    }
    // add player to room: rooms.js
    addPlayer(playerName, clientID, ready, vote, chat) {
        this.players = [...this.players, playerName]
        this.client = [...this.client, clientID]
        this.ready = [...this.ready, ready]
        this.vote = [...this.vote, vote]
        this.chat = [...this.chat, chat]        
    }
    // remove player from room: rooms.js
    removePlayer(idx, chat) {        
        this.players.splice(idx, 1)
        this.client.splice(idx, 1)
        this.ready.splice(idx, 1) 
        this.vote.splice(idx, 1)
        this.chat = [...this.chat, chat];           
    }
    // add role to room: setup.js
    addRole(role) {
        this.roles = [...this.roles, role]
    }
    // remove role from room: setup.js
    removeRole(idx, num) {        
        this.roles.splice(idx, num);
    }
    // randomize roles in room: setup.js
    randomizeRoles() {
        let j, x, k;        
        let c = this.roles;
        for (k = this.roles.length - 1; k > 0; k--) {            
            j = Math.floor(Math.random()*(k+1))
            x = c[k]
            c[k] = c[j]
            c[j] = x
        }
        this.roles = c        
    }
    // set status of room: setup.js, announce.js, ready.js, vote.js
    setStatus(status) {
        this.status = status
    }
    // set order of announcement: setup.js
    setOrderRoles(role) {
        this.orderRoles = [...this.orderRoles, role]
    }

    // announcement simulation: announce.js
    ghostTeam(player) {
        this.ghosts = [...this.ghosts, player]
    }

    lovebirdsTeam(player) {
        this.lovebirds = [...this.lovebirds, player]
    }

    // announcement order: announce.js
    addOrder(){
        this.order += 1;     
    }
    // chat 
    addChat(msg) {
        this.chat = [...this.chat, msg]
        io.sockets.in(this.id).emit("updateChat", this.chat);                                                                                                                
    }

}



class Message {
    constructor(name, msg, time) {
        this.name = name
        this.msg = msg
        this.time = time
    }
}

module.exports = {
    Room, Message
}