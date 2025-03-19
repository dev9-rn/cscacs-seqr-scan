import { View, TouchableOpacity } from 'react-native'
import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import useAuth from '@/hooks/useAuth'
import useUser from '@/hooks/useUser'

import { ScanQrCode } from "@/libs/icons/ScanQr"
import { router } from 'expo-router'
import { Button } from '@/components/ui/button'
import { useToast } from 'react-native-toast-notifications'
import { Text } from '@/components/ui/text'

type Props = {}

const HomeScreen = ({ }: Props) => {

    const { userDetails } = useUser();

    const goToCameraScanner = (scanner_type: string) => {
        router.navigate({
            pathname: "/camera",
            params: {
                scanner_type
            }
        });
    };

    return (
        <View className='flex-1 bg-white'>

            <View className='p-4'>
                <Text className='text-4xl font-medium'>
                    Welcome,{" "}
                    <Text className='font-bold text-3xl'>
                        {userDetails?.fullname || userDetails?.institute_username}
                    </Text>
                </Text>
            </View>

            <View className='p-4 flex-1 gap-4 items-center'>
                <TouchableOpacity onPress={() => goToCameraScanner("qr")} className='w-full'>
                    <Card className='w-full'>
                        <CardHeader>
                            <CardTitle>Scan Certificates</CardTitle>
                            <CardDescription>
                                Scan and view valid certificates
                            </CardDescription>
                        </CardHeader>
                        <CardContent className='gap-2'>
                            <ScanQrCode className='text-primary' height={"38"} width={"38"} />
                            <Text className='text-lg font-medium'>Scan QR Code</Text>
                        </CardContent>
                    </Card>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => goToCameraScanner("code128")} className='w-full'>
                    <Card className='w-full'>
                        <CardHeader>
                            <CardTitle>Card Title</CardTitle>
                            <CardDescription>Card Description</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Text>Card Content</Text>
                        </CardContent>
                        <CardFooter>
                            <Text>Card Footer</Text>
                        </CardFooter>
                    </Card>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => { router.navigate("/scan-history") }} className='w-full'>
                    <Card className='w-full'>
                        <CardHeader>
                            <CardTitle>
                                View scanned history
                            </CardTitle>
                            <CardDescription>
                                View all the recent scanned document history
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Text>Card Content</Text>
                        </CardContent>
                        <CardFooter>
                            <Text>Card Footer</Text>
                        </CardFooter>
                    </Card>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default HomeScreen