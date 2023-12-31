import React, { useEffect, useLayoutEffect, useState } from "react";
import { View, TextInput, Text, FlatList, Pressable } from "react-native";
import { Icon } from '@rneui/themed';
import socket from "../utils/socket";
import MessageComponent from "../component/MessageComponent";
import { styles } from "../utils/styles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import EmojiPicker from 'rn-emoji-keyboard';
const Messaging = ({ route, navigation }) => {
	const [user, setUser] = useState("");
	const { name, id } = route.params;

	const [chatMessages, setChatMessages] = useState([]);
	const [message, setMessage] = useState("");
	const [emojiModel, setEmojiModel] = useState(false)

	const getUsername = async () => {
		try {
			const value = await AsyncStorage.getItem("username");
			if (value !== null) {
				setUser(value);
			}
		} catch (e) {
			console.error("Error while loading username!");
		}
	};

	const handleNewMessage = () => {
		const hour =
			new Date().getHours() < 10
				? `0${new Date().getHours()}`
				: `${new Date().getHours()}`;

		const mins =
			new Date().getMinutes() < 10
				? `0${new Date().getMinutes()}`
				: `${new Date().getMinutes()}`;

		if (user && message) {
			socket.emit("newMessage", {
				message,
				room_id: id,
				user,
				timestamp: { hour, mins },
			});
			setMessage("")
		}
	};

	const handleEmojiSelect = (emoji) => {
		setMessage(message + emoji.emoji)
	}


	useLayoutEffect(() => {
		navigation.setOptions({ title: name });
		getUsername();
		socket.emit("findRoom", id);
		socket.on("foundRoom", (roomChats) => setChatMessages(roomChats));
	}, []);

	useEffect(() => {
		socket.on("foundRoom", (roomChats) => setChatMessages(roomChats));
	}, [socket]);

	return (
		<View style={styles.messagingscreen}>
			<View
				style={[
					styles.messagingscreen,
					{ paddingVertical: 15, paddingHorizontal: 10 },
				]}
			>
				{chatMessages[0] ? (
					<FlatList
						style={{
							flexDirection:"column-reverse"
						}}
						data={chatMessages}
						renderItem={({ item }) => (
							<MessageComponent item={item} user={user} />
						)}
						keyExtractor={(item) => item.id}
					/>
				) : (
					<Text></Text>
				)}
			</View>
			<View style={styles.messaginginputContainer}>
				<EmojiPicker
					onEmojiSelected={handleEmojiSelect}
					open={emojiModel}
					onClose={() => setEmojiModel(false)} 
				/>
				<View style={styles.messageinputiconcontainer}>
					<Icon name="insert-emoticon" style={styles.insertemoji} size={20} color="#000"  onPress={() => setEmojiModel((prev) => !prev)}/>
					<TextInput
						style={styles.messaginginput}
						onChangeText={(value) => {setMessage(value)}}
						value={message}
						onKeyPress={(e) => {
							if (e.code == "Enter") {
								handleNewMessage()
							}
						}}
					/>
				</View>
				<Pressable
					style={styles.messagingbuttonContainer}
					onPress={handleNewMessage}
				>
					<View>
						<Text style={{ color: "#f2f0f1", fontSize: 20 }}>SEND</Text>
					</View>
				</Pressable>
			</View>
		</View>
	);
};

export default Messaging;
