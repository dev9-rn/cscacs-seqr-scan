import { View, Text, ActivityIndicator } from 'react-native'
import React from 'react'
import { ToastProps } from 'react-native-toast-notifications/lib/typescript/toast';

import { CircleCheckIcon } from "@/libs/icons/CircleCheckIcon"
import { CircleAlertIcon } from "@/libs/icons/CircleAlertIcon"

type Props = {
    toastData: ToastProps;
}

const ToastNotification = ({ toastData }: Props) => {

    const isActionSuccess = (toastData.data?.status || 0) <= 200
    const isActionPending = toastData.data.status === "pending"

    return (
        <View className='android:shadow-lg ios:shadow-md bg-white p-4 rounded-lg mx-4'>

            <View className='flex-row items-center gap-2'>
                {isActionPending ? (
                    <ActivityIndicator size={"small"} color={"#0042EB"} />
                ) : (
                    isActionSuccess ? (
                        <CircleCheckIcon className='text-green-600' />
                    ) : (
                        <CircleAlertIcon className='text-neutral-900' />
                    )
                )}

                <Text className={`font-medium`}>
                    {toastData.message}
                </Text>
            </View>
        </View>
    )
}

export default ToastNotification