import { FontAwesome6 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { View, Modal, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { Text, TextField, Button, Checkbox, Icon, Colors, Assets, Dialog, PanningProvider } from "react-native-ui-lib";
import AppIcon from "@/assets/images/icon.png";
import Axios from "@/constants/Axios";
import { IServiceResponse } from "semantic-response";
import UserData from "@/constants/UserData";

export interface IUserAuthData {
	_id: string;
	email: string;
	nomeExibicao: string;
	permissoes: string[];
	ativo: boolean;
	token: string;
	verificado: boolean;
	criadoEm: string;
	atualizadoEm: string;
	empresa: any;
}

export default function Auth({ onAuth }: { onAuth: () => void }) {
	// Variáveis de estado
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [rememberMe, setRememberMe] = useState(false);
	const [apiAddress, setApiAddress] = useState("");
	const [modalVisible, setModalVisible] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		// Carregar o endereço da API salvo no AsyncStorage
		AsyncStorage.getItem("apiAddress").then((value) => setApiAddress(value ?? ""));
		AsyncStorage.getItem("email").then((value) => {
			if (value) {
				setEmail(value);
				setRememberMe(true);
			}
		});
	}, []);

	useEffect(() => {
		Axios.defaults.baseURL = apiAddress;
	}, [apiAddress]);

	const handleLogin = async () => {
		if (!apiAddress) {
			alert("Por favor, configure o endereço da API.");
			return;
		}

		setIsLoading(true);

		try {
			const { data } = await Axios.post<IServiceResponse<IUserAuthData>>("/auth/login", {
				email,
				senha: password,
			});

			if (data?.data?.verificado) {
				for (const key in data.data) {
					(UserData as any)[key] = (data.data as any)[key] as any;
				}

				if (rememberMe) {
					AsyncStorage.setItem("email", email);
				}

				onAuth();
			} else {
				Alert.alert("Erro", data.message);
			}
		} catch (error) {
			console.log(JSON.stringify(error));
			Alert.alert("Erro", "Ocorreu um erro ao tentar fazer login.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			{/* Modal de carregamento */}
			<Dialog visible={isLoading} center ignoreBackgroundPress>
				<ActivityIndicator size="large" color={Colors.$iconPrimary} />
			</Dialog>

			{/* Ícone da aplicação */}
			<View style={styles.iconContainer}>
				<Icon source={AppIcon} size={100} />
			</View>

			{/* Campo de E-mail */}
			<TextField placeholder="Email" onChangeText={setEmail} value={email} floatingPlaceholder floatOnFocus />

			{/* Campo de Senha */}
			<TextField placeholder="Senha" onChangeText={setPassword} value={password} secureTextEntry floatingPlaceholder floatOnFocus />

			{/* Checkbox "Lembrar de Mim" */}
			<View style={styles.checkboxContainer}>
				<Checkbox value={rememberMe} onValueChange={setRememberMe} color={Colors.$iconPrimary} />
				<Text marginL-10>Lembrar de mim</Text>
			</View>

			{/* Botão "Entrar" */}
			<Button label="Entrar" marginT-20 onPress={handleLogin} />

			{/* Ícone de engrenagem no topo superior direito */}
			<View style={styles.settingsIconContainer}>
				<FontAwesome6 name="gear" size={30} color={Colors.grey30} onPress={() => setModalVisible(true)} />
			</View>

			{/* Modal com campo de texto para endereço da API */}
			<Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
				<View style={styles.modalBackground}>
					<View style={styles.modalContent}>
						<Text center marginB-10>
							Endereço da API
						</Text>
						<TextField placeholder="http://api.seudominio.com" onChangeText={setApiAddress} value={apiAddress} />
						<Button
							label="Salvar"
							marginT-20
							onPress={() => {
								setModalVisible(false);
								AsyncStorage.setItem("apiAddress", apiAddress);
							}}
						/>
					</View>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 25,
		paddingTop: 120,
	},
	iconContainer: {
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 20,
	},
	checkboxContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 10,
	},
	settingsIconContainer: {
		position: "absolute",
		top: 20,
		right: 20,
	},
	modalBackground: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.5)",
	},
	modalContent: {
		padding: 20,
		backgroundColor: "white",
		borderRadius: 10,
		width: "80%",
	},
});
