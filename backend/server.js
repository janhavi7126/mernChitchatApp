const express = require("express");
const dotenv = require("dotenv");
const { chats } = require("../backend/data/data");
const connectdb = require("../backend/config/db");
const colors = require("colors");
const userRoutes = require("../backend/routes/userRoutes");
const chatRoutes = require("../backend/routes/chatRoutes");
const messageRoutes = require("../backend/routes/messageRoutes");
const { notFound, errorHandler } = require("./middlewares/errormiddleware");
const { Socket } = require("socket.io");
const path = require("path");

dotenv.config();
connectdb();
const app = express();

app.use(express.json());

console.log("fg");

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/messages", messageRoutes);

const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/app/frontend/build/")));
  console.log(
    path.resolve(__dirname1, "app", "frontend", "build", "index.html")
  );
  app.get("*", (req, res) =>
    res.sendFile(
      path.join(__dirname1, "app", "frontend", "build", "index.html")
    )
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

// app.post('/api/chat',(req,res) => {
//     console.log(req.body);
// })

// app.get('/api/chat/:id',(req,res) =>{
//     console.log(req.params.id)
// })

// app.get('/api/chat/:id',(req,res) =>{
//    const Singlechat = chats.find((c) => c._id === req.params.id);
//    res.send(Singlechat);
// })

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(
  PORT,
  console.log(`Server started on port ${PORT}`.yellow.bold)
);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    orgin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    // console.log(userData._id)
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
