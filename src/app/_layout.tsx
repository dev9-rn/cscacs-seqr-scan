import { Stack } from "expo-router";
import AuthProvider from "@/providers/AuthProvider";
import { PortalHost } from '@rn-primitives/portal';
import UserProvider from "@/providers/UserProvider";
import { ToastProvider } from 'react-native-toast-notifications'
import { KeyboardProvider } from 'react-native-keyboard-controller';

import "@/app/globals.css";
import ToastNotification from "@/components/ToastNotification";
import { Alert, Appearance, AppState, Linking, Platform, StatusBar } from "react-native";
import { useEffect, useRef, useState } from "react";
import { isUpdateRequired } from "@/libs/utils";
import * as Application from 'expo-application';
// ...existing code...

if (__DEV__) {
    require("../../ReactotronConfig");
}
const IOS_APP_ID = process.env.EXPO_PUBLIC_IOS_APP_ID;
const ANDROID_PACKAGE = process.env.EXPO_PUBLIC_ANDROID_PACKAGE;

const IOS_STORE_URL = `https://apps.apple.com/app/id${IOS_APP_ID}`;
const ANDROID_STORE_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;

export default function RootLayout() {
    const colorScheme = Appearance.getColorScheme();

    const [appState, setAppState] = useState(AppState.currentState);
    const isAlertVisible = useRef(false);


    const getLatestAndroidVersion = async (): Promise<string | null> => {
        try {
            const response = await fetch(
                `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}&hl=en&gl=US`
            );
            const text = await response.text();
            const match = text.match(/\[\[\["([0-9.]+)"\]\]/);
            return match?.[1] ?? null;
        } catch {
            return null;
        }
    };

    const getLatestIOSVersion = async (): Promise<string | null> => {
        try {
            const res = await fetch(
                `https://itunes.apple.com/lookup?id=${IOS_APP_ID}&country=IN`
            );
            const json = await res.json();
            return json?.results?.[0]?.version ?? null;
        } catch {
            return null;
        }
    };

    const getApplicationVersion = async () => {
        try {
            const latestVersion =
                Platform.OS === 'ios'
                    ? await getLatestIOSVersion()
                    : await getLatestAndroidVersion();

            const currentVersion = Application.nativeApplicationVersion;

            if (
                isUpdateRequired(currentVersion, latestVersion)
            ) {
                if (isAlertVisible.current) return;

                isAlertVisible.current = true;

                Alert.alert(
                    'Update Required',
                    'A new version of the app is available. Please update to continue using the app.',
                    [
                        {
                            text: 'Update Now',
                            onPress: () => {
                                const url =
                                    Platform.OS === 'ios'
                                        ? IOS_STORE_URL
                                        : ANDROID_STORE_URL;

                                Linking.openURL(url);

                                // Reset flag so alert can show again
                                setTimeout(() => {
                                    isAlertVisible.current = false;
                                }, 1000);
                            },
                        },
                    ],
                    { cancelable: false }
                );
            }
        } catch (error) {
            console.error('Version check failed:', error);
        }
    };


    useEffect(() => {
        const handleAppStateChange = (nextAppState: any) => {
            console.log('AppState change:', nextAppState); // To monitor state changes
            setAppState(nextAppState);
        };

        const subscription = AppState.addEventListener(
            'change',
            handleAppStateChange,
        );

        return () => {
            subscription.remove();
            // unsubscribe
        };
    }, []);

    useEffect(() => {
        if (appState === 'active') {
            getApplicationVersion();
        }
    }, [appState]);

    return (
        <>
            <StatusBar
                barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
                backgroundColor={colorScheme === "dark" ? "#fff" : "#2c2c2c"}
            />
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
        </>
        //    <PortalHost />
    );
}