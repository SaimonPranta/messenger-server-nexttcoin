const express = require('express');
const cors = require('cors');

const app = express();
const http = require('http');
const { Server } = require("socket.io");

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        // origin: "https://myinvestmentsite.saimonpranta.com",
        methods: ["GET", "POST", "PATCH"]
    }
});



const port = process.env.PORT || 7000

app.get('/', (req, res) => {
    res.send(`your server are ok, and it's runing on port ${port}`)
});

let userContainer = []
let user = [];

const addUser = (userId, socketID) => {
    if (!user.some(user => user.userId === userId)) {
        user.push({ userId, socketID })
    }
}

const removeUser = (socketID) => {

    user = user.filter(user => user.socketID !== socketID)
}

const findUser = (receverID) => {
    for (let i = 0; i < user.length; i++) {
        if (user[i].userId === receverID) {
            return user[i].socketID
        }
    }

}


io.on('connection', (socket) => {
    // when user are connect
    socket.on("addUser", (userID) => {
        addUser(userID, socket.id)
        io.emit("getUser", user)
    })
    // when user get message
    socket.on("send_message", ({ receverID, senderID, message, conversationID }) => {
        const filterSockedID = findUser(receverID)


        io.to(filterSockedID).emit("get_message", {
            senderID,
            message,
            conversationID,
            createdAt: new Date(),
            updatedAt: new Date()

        })
    })

    // when user are disconnect
    socket.on("disconnect", () => {
        removeUser(socket.id)
    })
});


server.listen(port, () => {
    console.log(`we are now no port ${port}`);
});