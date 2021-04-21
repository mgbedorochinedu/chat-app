const path = require("path")
const http = require("http") 
const express = require("express")
const socketio = require("socket.io")
const Filter = require("bad-words") 
const { generateMessage, generateLocationMessage } = require("../src/utils/messages") 
const { addUser, removeUser, getUser, getUsersInRoom } = require("./utils/users") 


//Initialize
const app = express()
const server = http.createServer(app) 
const io = socketio(server) 

//Create a PORT
const port = process.env.PORT || 3000

//Define paths for Express config
const publicDirPath = path.join(__dirname, "../public")

//Setup static directory to server 
app.use(express.static(publicDirPath))

//This codes runs when a user join room
io.on("connection", (socket) => {
    console.log("New websocket connection") 
    socket.on("join", (options, callback) => { 

        const { error, user } = addUser({ id: socket.id, ...options}) 

      if(error) { 
            return callback(error) 
        }
   socket.join(user.room)
   socket.emit("message", generateMessage("Admin", "Welcome!"))
   socket.broadcast.to(user.room).emit("message", generateMessage("Admin", `${user.username} has joined!`))

        io.to(user.room).emit("roomData", { 
            room: user.room, 
            users: getUsersInRoom(user.room) 
        })    
         callback() 
 }) 

 //sendMessage event listener 
 socket.on("sendMessage", (msg, callback) => { 

    const user = getUser(socket.id) 
    const filter = new Filter() 

    if(filter.isProfane(msg)) {     
        return callback("Profanity is not allowed") 
    }
    io.to(user.room).emit("message", generateMessage(user.username, msg)) 
        callback() 
})

//sendLocation event listener
    socket.on("sendLocation", (coords, callback) => { 
        const user = getUser(socket.id) 

        io.to(user.room).emit("locationMessage", generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`)) 

        callback() 
    })

//This socket runs when the user leaves the chat room
    socket.on("disconnect", () => { 
     const user = removeUser(socket.id) 

          if(user) { 
             io.to(user.room).emit("message", generateMessage("Admin", `${user.username} has left`))

             io.to().emit("roomData", { 
                room: user.room,
                users: getUsersInRoom(user.room) 
             }) 
        }
    })
}) 


 














server.listen(port, () => { 
    console.log(`Server is up at port ${port}`)
})