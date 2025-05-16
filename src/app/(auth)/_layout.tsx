import React from 'react'
import { Stack } from 'expo-router'
import Header from '@/components/Header'
import { SafeAreaView } from 'react-native-safe-area-context'

type Props = {}

const AuthLayout = ({ }: Props) => {
    return (
        <Stack>
            <Stack.Screen
                name='welcome'
                options={{
                    headerShown: false,
                }}
            />

            <Stack.Screen
                name="login"
                options={{
                    headerBackVisible: false,
                    headerShadowVisible: false,
                    header: () => (
                        <Header isBackVisible />
                    )
                }}
            />

            <Stack.Screen
                name='sign-up'
                options={{
                    headerBackVisible: false,
                    headerShadowVisible: false,
                    header: () => (
                        <Header isBackVisible headerTitle='Resgister User' />
                    )
                }}
            />

            <Stack.Screen
                name='otp-verify'
                options={{
                    headerBackVisible: false,
                    headerShadowVisible: false,
                    header: () => (
                        <Header isBackVisible headerTitle='Verify OTP' />
                    )
                }}
            />
        </Stack>
    )
}

export default AuthLayout