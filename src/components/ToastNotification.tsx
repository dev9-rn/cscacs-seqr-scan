import { View, Text } from 'react-native'
import React from 'react'
import { ToastProps } from 'react-native-toast-notifications/lib/typescript/toast';

type Props = {
    toastData: ToastProps;
}

const ToastNotification = ({ toastData }: Props) => {
    return (
        <View className='android:shadow-lg ios:shadow-md bg-white p-4 rounded-lg'>
            <Text>
                {toastData.message}
            </Text>
            {/* <Text>{toastData.data}</Text> */}
        </View>
    )
}

export default ToastNotification