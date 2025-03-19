import React from "react";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { router } from "expo-router";
import { Image, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {}

const WelcomeScreen = ({ }: Props) => {

    const handleLoginWithUserType = ({ login_type }: { login_type: string }) => {
        router.navigate({
            pathname: "/login",
            params: {
                login_type
            }
        })
    }

    return (
        <SafeAreaView className='flex-1 bg-blue-50'>
            <View className='p-4 items-center justify-around flex-1'>

                <View>
                    <Text className='text-2xl font-semibold text-secondary'>
                        Welcome to Demo SeQR Scan
                    </Text>
                </View>

                <View className=''>
                    <View>
                        <Image
                            className='size-72'
                            source={require("@/assets/images/logos/se_doc_logo.png")}
                            resizeMode='cover'
                        />
                    </View>

                    <View className='items-center'>
                        <Text className='text-xs'>
                            Powered by
                        </Text>
                        <Text className='text-sm text-primary'>
                            Security Software & Solutions LLP
                        </Text>
                    </View>
                </View>

                <View className='gap-4 w-full'>
                    <Button
                        onPress={() => handleLoginWithUserType({ login_type: "verifier" })}
                    >
                        <Text>Login as verifier</Text>
                    </Button>

                    <Button
                        variant={"outline"}
                        onPress={() => handleLoginWithUserType({ login_type: "institute" })}
                    >
                        <Text className='text-secondary'>Login as institute</Text>
                    </Button>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default WelcomeScreen