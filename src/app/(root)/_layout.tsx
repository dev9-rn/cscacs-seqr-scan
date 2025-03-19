import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { Stack, useRouter } from 'expo-router'
import Header from '@/components/Header'
import useAuth from '@/hooks/useAuth'

type Props = {}

const RootLayout = ({ }: Props) => {

    const { isUserLoggedIn } = useAuth();

    const router = useRouter();

    return (
        <Stack>

            <Stack.Screen
                name="home"
                options={{
                    headerBackVisible: false,
                    headerShadowVisible: false,
                    header: () => (
                        <Header isLogoVisible headerTitle='Demo SeQR Docs' />
                    )
                }}
            />

            <Stack.Screen
                name='about'
                options={{
                    headerBackVisible: false,
                    headerShadowVisible: false,
                    header: () => (
                        <Header isBackVisible headerTitle='About Us' />
                    )
                }}
            />

            <Stack.Screen
                name='camera'
                options={{
                    headerBackVisible: false,
                    headerShadowVisible: false,
                    headerTransparent: true,
                }}
            />

            <Stack.Screen
                name='scan-result'
                options={{
                    headerBackVisible: false,
                    headerShadowVisible: false,
                    header: () => (
                        <Header isBackVisible headerTitle='Scanned Details' />
                    )
                }}
            />

            <Stack.Screen
                name='scan-history'
                options={{
                    headerBackVisible: false,
                    headerShadowVisible: false,
                    header: () => (
                        <Header isBackVisible headerTitle='Scanned History' />
                    )
                }}
            />

        </Stack>
    )
}

export default RootLayout