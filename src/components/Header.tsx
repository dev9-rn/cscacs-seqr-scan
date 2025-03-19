import { View, Text, Image } from 'react-native'
import React from 'react'
import { Button } from './ui/button'
import { ChevronLeft } from "../libs/icons/ChevronLeft"
import { router } from 'expo-router'
import MenuPopover from './MenuPopover'
import { useRoute } from '@react-navigation/native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

type Props = {
    isBackVisible?: boolean;
    headerTitle?: string;
    isLogoVisible?: boolean;
}

const Header = ({ isBackVisible = false, headerTitle, isLogoVisible }: Props) => {

    const route = useRoute();
    const insets = useSafeAreaInsets();

    return (
        <View className={`flex-row items-center justify-between w-full bg-white px-4`} style={{ paddingTop: insets.top }}>

            {isLogoVisible && !headerTitle && (
                <Image
                    className='size-16'
                    source={require("@/assets/images/logos/se_doc_logo.png")}
                    resizeMode='contain'
                />
            )}

            {isBackVisible && !headerTitle && (
                <Button
                    className='gap-4 flex-row items-center'
                    variant={"ghost"}
                    size={"icon"}
                    onPress={() => router.back()}
                >
                    <ChevronLeft className={`text-stone-900 ${route.name == "camera" && "text-white"}`} />
                </Button>
            )}

            {isBackVisible && headerTitle && (
                <View className='flex-row items-center gap-2'>
                    <Button
                        className='gap-4 flex-row items-center p-0'
                        onPress={() => router.back()}
                        variant={"ghost"}
                        size={"icon"}
                    >
                        <ChevronLeft className={`text-stone-900 ${route.name == "camera" && "text-white"}`} />
                    </Button>
                    <View>
                        <Text className={`text-base xs:text-lg font-semibold text-black ${route.name == "camera" && "text-white"}`}>
                            {headerTitle}
                        </Text>
                    </View>
                </View>
            )}

            {isLogoVisible && headerTitle && (
                <View className='flex-row items-center gap-2'>
                    <Image
                        className='size-16'
                        source={require("@/assets/images/logos/se_doc_logo.png")}
                        resizeMode='contain'
                    />
                    <View>
                        <Text className={`text-base xs:text-xl text-black`}>
                            Demo SeQR Docs
                        </Text>
                    </View>
                </View>
            )}

            {route.name === "home" && (
                <View className='items-end'>
                    <MenuPopover />
                </View>
            )}
        </View>
    )
}

export default Header