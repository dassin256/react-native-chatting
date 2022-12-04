const express = require("express");
const app = express();
const http = require("http").Server(app);
const cors = require("cors");
const PORT = 4000;
const socketIO = require("socket.io")(http, {
	cors: {
		origin: ['http://localhost:19006', 'http://192.168.113.48:19006','exp://192.168.113.48:19000']
	},
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());



const generateID = () => Math.random().toString(36).substring(2, 10);
let chatRooms = [];

socketIO.on("connection", (socket) => {
	console.log(`⚡: ${socket.id} user just connected!`);

	socket.on("createRoom", (name) => {
		chatRooms.unshift({ id: generateID(), name, messages: [] });
		socketIO.emit("roomsList", chatRooms);
	});

	socket.on("findRoom", (id) => {
		let result = chatRooms.filter((room) => room.id == id);
		socket.join(result[0].name)
		socket.emit("foundRoom", result[0].messages);
	});

	socket.on("newMessage", (data) => {
		const { room_id, message, user, timestamp } = data;
		let result = chatRooms.filter((room) => room.id == room_id);
		const newMessage = {
			id: generateID(),
			text: message,
			user,
			time: `${timestamp.hour}:${timestamp.mins}`,
		};

		result[0].messages.push(newMessage);

		socket.emit("roomsList", chatRooms);
		socket.broadcast.to(result[0].name).emit("roomsList", chatRooms)
		socket.emit("foundRoom", result[0].messages);
		socket.broadcast.to(result[0].name).emit("foundRoom", result[0].messages)
	});
	
	socket.on("disconnect", () => {
		socket.disconnect();
		console.log("🔥: A user disconnected");
	});
});

app.get("/api", (req, res) => {
	res.json(chatRooms);
});

http.listen(PORT, () => {
	console.log(`Server listening on ${PORT}`);
});
