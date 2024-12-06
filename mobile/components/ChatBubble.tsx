import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Avatar, Card, Colors } from "react-native-ui-lib";
import Markdown from "react-native-markdown-display";
import CloudIA from "@/assets/images/cloudia.png";
import { FontAwesome6 } from "@expo/vector-icons";

interface Props {
	side: "left" | "right";
	name: string;
	message: string;
	hour: string;
	extraData?: Array<{ pdf: string; data: Record<string, any> }>;
	loading?: boolean;
	files?: Array<{ name: string; data: string }>;
}

const ChatBubble: React.FC<Props> = ({ side, name, message, hour, extraData, loading, files }) => {
	function getColumnsFromExtraData(pdfData: Record<string, any>) {
		if (!pdfData) return [];
		return Object.keys(pdfData).map((key) => ({
			field: key,
			header: key,
		}));
	}

	function parseTitle(title: string) {
		const convert: Record<string, string> = {
			coes: "ções",
			encias: "ências",
		};

		let replaced = title.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

		for (const key in convert) {
			if (replaced.includes(key)) replaced = replaced.replace(key, convert[key]);
		}

		return replaced;
	}

	return (
		<View style={styles.container}>
			<View style={[styles.chat, side === "left" ? styles.chatStart : styles.chatEnd]}>
				{side === "left" ? (
					<Avatar source={CloudIA} size={50} containerStyle={styles.avatar} />
				) : (
					<View style={styles.avatar}>
						<FontAwesome6 name="user-circle" size={50} color={Colors.grey40} />
					</View>
				)}
				<View style={styles.messageContainer}>
					{!loading ? (
						<>
							<Text style={styles.header}>
								{name} <Text style={styles.time}>{hour}</Text>
							</Text>
							<Markdown>{message}</Markdown>
						</>
					) : (
						<ActivityIndicator size="small" color={Colors.grey30} />
					)}

					{files && (
						<View style={styles.filesContainer}>
							{files.map((file, index) => (
								<View key={index} style={styles.fileItem}>
									<Text style={styles.fileName}>📄 {file.name}</Text>
								</View>
							))}
						</View>
					)}

					{extraData &&
						extraData.map((pdf, index) => (
							<View key={index} style={styles.extraDataContainer}>
								<Text style={styles.extraHeader}>Detalhes do arquivo: {pdf.pdf}</Text>
								{getColumnsFromExtraData(pdf.data).map((column, colIndex) => (
									<Card key={colIndex} style={styles.card}>
										<Text style={styles.cardTitle}>{parseTitle(column.header)}</Text>
										<Text style={styles.cardContent}>{pdf.data[column.field] || "Sem dados"}</Text>
									</Card>
								))}
							</View>
						))}
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 10,
	},
	chat: {
		flexDirection: "row",
		alignItems: "flex-start",
		marginVertical: 5,
	},
	chatStart: {
		justifyContent: "flex-start",
	},
	chatEnd: {
		justifyContent: "flex-end",
	},
	avatar: {
		marginRight: 10,
	},
	messageContainer: {
		maxWidth: "80%",
		padding: 8,
		borderRadius: 10,
		backgroundColor: Colors.grey60,
	},
	header: {
		fontWeight: "bold",
		fontSize: 14,
		color: Colors.grey10,
	},
	time: {
		fontSize: 10,
		color: Colors.grey40,
	},
	message: {
		fontSize: 16,
		color: Colors.grey20,
	},
	filesContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		marginTop: 5,
	},
	fileItem: {
		backgroundColor: Colors.grey50,
		padding: 5,
		borderRadius: 5,
		marginRight: 5,
		marginTop: 5,
	},
	fileName: {
		fontSize: 14,
		color: Colors.grey20,
	},
	extraDataContainer: {
		marginTop: 10,
	},
	extraHeader: {
		fontSize: 14,
		fontWeight: "bold",
	},
	card: {
		backgroundColor: Colors.grey70,
		padding: 8,
		marginVertical: 5,
		borderRadius: 5,
	},
	cardTitle: {
		fontWeight: "bold",
	},
	cardContent: {
		fontSize: 14,
	},
});

export default ChatBubble;
