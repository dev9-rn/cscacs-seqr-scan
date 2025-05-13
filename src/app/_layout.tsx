import { Stack } from "expo-router";
import AuthProvider from "@/providers/AuthProvider";
import { PortalHost } from '@rn-primitives/portal';
import UserProvider from "@/providers/UserProvider";
import { ToastProvider } from 'react-native-toast-notifications'
import { KeyboardProvider } from 'react-native-keyboard-controller';

import "@/app/globals.css";
import ToastNotification from "@/components/ToastNotification";
import { ThemeProvider, DarkTheme } from "@react-navigation/native";

if (__DEV__) {
	require("../../ReactotronConfig");
}

export default function RootLayout() {

	return (
		<ThemeProvider value={DarkTheme}>
			<UserProvider>
				<AuthProvider>
					<KeyboardProvider>
						<ToastProvider
							offsetBottom={40}
							swipeEnabled={true}
							renderToast={(props) => <ToastNotification toastData={props} />}
						>
							<Stack
								screenOptions={{
									headerShown: false
								}}
							>
								<Stack.Screen
									name="(root)"
								/>
								<Stack.Screen
									name="(auth)"
								/>
							</Stack>
						</ToastProvider>
					</KeyboardProvider>
				</AuthProvider>
			</UserProvider >
			<PortalHost />
		</ThemeProvider>
	);
}
