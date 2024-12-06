import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";

import { Colors as AppColors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import React from "react";
import { Colors, View } from "react-native-ui-lib";
import Auth from "./auth";
import Chat from "./chat";

// Definindo a cor primária
Colors.loadColors({
	primaryColor: AppColors.light.tint,
	$backgroundPrimaryHeavy: AppColors.light.tint,
	$backgroundPrimaryLight: AppColors.light.tint,
	$backgroundPrimaryMedium: AppColors.light.tint,
	$outlinePrimary: AppColors.light.tint,
	$outlinePrimaryMedium: AppColors.light.tint,
	$iconPrimary: AppColors.light.tint,
	$textPrimary: AppColors.light.tint,
	$iconPrimaryLight: AppColors.light.tint,
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const [loggedin, setLoggedin] = useState(false);
	const [loaded] = useFonts({
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
	});

	useEffect(() => {
		if (loaded) SplashScreen.hideAsync();
	}, [loaded]);

	if (!loaded) return null;

	return (
		<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
			<View flex>{loggedin ? <Chat onLogout={() => setLoggedin(false)} /> : <Auth onAuth={() => setLoggedin(true)} />}</View>
		</ThemeProvider>
	);
}
