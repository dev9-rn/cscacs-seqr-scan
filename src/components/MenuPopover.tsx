import { View, Platform, LayoutChangeEvent, LayoutRectangle } from 'react-native'
import React, { useRef, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Button } from './ui/button'
import { Text } from './ui/text'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { EllipsisVertical } from "@/libs/icons/DotMenuIcons"
import { Separator } from './ui/separator'
import { router } from 'expo-router'
import { storage } from '@/utils/storageService'
import useAuth from '@/hooks/useAuth'

type Props = {}

const MenuPopover = ({ }: Props) => {

    const { setIsUserLoggedIn, setAuthToken, } = useAuth();

    const insets = useSafeAreaInsets();

    const [headerLayout, setHeaderLayout] = useState<LayoutRectangle | undefined>(undefined);

    const contentInsets = {
        top: insets.top + (headerLayout?.height || 0),
        bottom: insets.bottom + (headerLayout?.y || 0),
        left: 12,
        right: 12,
    };

    const handleUserLogOut = () => {
        storage.clearAll();
        setAuthToken(null);
        setIsUserLoggedIn(false);
        router.replace("/welcome");
    }

    return (
        <View
            className='flex-1 justify-center items-center p-4'
            onLayout={({ nativeEvent: { layout } }) => setHeaderLayout(layout)}
        >
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant='ghost'
                        size={"icon"}
                        className='p-0'
                    >
                        <EllipsisVertical className='text-stone-900' />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    side={Platform.OS === 'web' ? 'bottom' : 'top'}
                    insets={contentInsets}
                    className='w-1/3 p-2'
                >
                    <Button
                        variant={"ghost"}
                        size={"sm"}
                        onPress={() => {
                            router.navigate("/about")
                        }}
                    >
                        <Text className='native:text-lg'>
                            About Us
                        </Text>
                    </Button>
                    <Separator />
                    <Button
                        variant={"ghost"}
                        size={"sm"}
                        onPress={() => handleUserLogOut()}
                    >
                        <Text className='native:text-lg text-destructive'>
                            Logout
                        </Text>
                    </Button>
                </PopoverContent>
            </Popover>
        </View>
    )
}

export default MenuPopover