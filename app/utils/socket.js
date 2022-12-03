import { io } from "socket.io-client";
const socket = io.connect("http://192.168.113.48:4000");
export default socket;
