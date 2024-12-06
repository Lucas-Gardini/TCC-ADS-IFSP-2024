import ChatBubble from "@/components/ChatBubble";
import Axios from "@/constants/Axios";
import { isAxiosError } from "axios";
import { DateTime } from "luxon";
import React, { useState } from "react";
import { FlatList, StyleSheet, View, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { Button, Colors, Text, TextField } from "react-native-ui-lib";

interface IChatData {
	who: "user" | "assistant" | "loading";
	message: string;
	time: string;
	extraData?: any;
	files?: { name: string; data: string }[];
}

const nowHourMinutesSeconds = DateTime.now().toLocaleString({ hour: "2-digit", minute: "2-digit", second: "2-digit" });

export default function Chat({ onLogout }: { onLogout: () => void }) {
	const [messages, setMessages] = useState<IChatData[]>([]);
	const [input, setInput] = useState("");
	const [sending, setSending] = useState(false);

	const handleSend = async () => {
		if (!input.trim()) return;

		setSending(true);

		try {
			const message = {
				who: "user",
				message: input,
				time: DateTime.now().toLocaleString({ hour: "2-digit", minute: "2-digit", second: "2-digit" }),
			} as IChatData;

			const copy = [...messages];

			setInput("");
			setMessages([...messages, message]);

			const { data } = await Axios.post("openai/chat-bot", {
				previousMessages: copy.map((m) => ({
					role: m.who,
					content: m.message,
				})),
				newMessage: message.message,
				files: [],
			});

			copy.push(message);

			if (data.data) {
				const message = data.data.resposta;
				copy.push({
					who: "assistant",
					message: message,
					time: DateTime.now().toLocaleString({ hour: "2-digit", minute: "2-digit", second: "2-digit" }),
				});
			}

			setMessages(copy);
		} catch (err) {
			if (isAxiosError(err)) console.log(err.response?.data);
			console.log(err);
		} finally {
			setSending(false);
		}
	};

	const renderMessage = ({ item }: { item: IChatData }) => (
		<ChatBubble
			side={item.who === "user" ? "right" : "left"}
			name={item.who === "user" ? "Você" : "CloudIA"}
			hour={item.time}
			message={item.message}
			extraData={item.extraData}
		/>
	);

	const resetChat = () => {
		setMessages([]);
		setInput("");
	};

	return (
		<View style={styles.container}>
			<FlatList
				scrollEnabled
				data={messages}
				ListHeaderComponent={
					<View>
						<TouchableOpacity onPress={onLogout} style={{ padding: 10, alignItems: "center" }}>
							<Text>Sair</Text>
						</TouchableOpacity>

						<ChatBubble side="left" name="CloudIA" hour={nowHourMinutesSeconds} message="Como posso te ajudar hoje?" loading={false} />
					</View>
				}
				ListFooterComponent={
					messages.length > 0 ? (
						<TouchableOpacity onPress={resetChat} style={{ padding: 10, alignItems: "center" }}>
							<Text>Resetar Conversa</Text>
						</TouchableOpacity>
					) : null
				}
				renderItem={renderMessage}
				keyExtractor={(item) => item.time}
				contentContainerStyle={styles.messagesList}
			/>

			<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.inputContainer}>
				<TextField
					placeholder="Digite uma mensagem..."
					value={input}
					onChangeText={(text: string) => setInput(text)}
					containerStyle={styles.textField}
				/>
				<Button disabled={sending} label="Enviar" onPress={handleSend} backgroundColor={Colors.blue30} />
			</KeyboardAvoidingView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.white,
	},
	messagesList: {
		paddingBottom: 60, // Espaço para o campo de input
	},
	inputContainer: {
		position: "absolute",
		bottom: 0,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 10,
		borderTopWidth: 1,
		borderTopColor: Colors.grey50,
		width: "100%",
		backgroundColor: Colors.white,
	},
	textField: {
		flex: 1,
		marginRight: 10,
	},
});
