import { View, Text } from 'react-native'
import React from 'react'
import useAuth from '@/hooks/useAuth'
import { Redirect } from 'expo-router'

type Props = {}

const Index = ({ }: Props) => {

    const { isUserLoggedIn } = useAuth();

    if (isUserLoggedIn) {
        return (
            <Redirect href={"/home"} />
        )
    }

    return (
        <Redirect href={"/welcome"} />
    )
}

export default Index