import { View, StyleSheet } from 'react-native'
import React from 'react'
import { Controller, FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import { OtpInput } from "react-native-otp-entry";
import { router, useLocalSearchParams } from 'expo-router';
import axiosInstance from '@/utils/axiosInstance';
import { VERIFY_OTP } from '@/utils/routes';
import axios, { AxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useToast } from 'react-native-toast-notifications';
import useAuth from '@/hooks/useAuth';
import useUser from '@/hooks/useUser';

type Props = {}

type FormData = {
    userOtp: string;
}

const OtpVerificationScreen = ({ }: Props) => {


    const { setAuthToken, setIsUserLoggedIn, } = useAuth();
    const { setUserDetails } = useUser();

    const { userPhone } = useLocalSearchParams<{ userPhone: string }>();
    const toast = useToast();

    const { control, handleSubmit, setError, formState: { errors } } = useForm<FormData | FieldValues>({
        defaultValues: {
            userOtp: ""
        }
    });

    const handleUserVerification: SubmitHandler<FormData | FieldValues> = async (formData) => {

        const verifyOtpFormData = new FormData();
        verifyOtpFormData.append('mobile_no', userPhone);
        verifyOtpFormData.append('otp', formData.userOtp);

        try {
            const response = await axiosInstance.post(VERIFY_OTP, verifyOtpFormData);

            if (response.data.status != 200) {
                toast.show(response.data?.message);
                return;
            };

            setAuthToken(response.data?.data?.access_token || response.data?.accesstoken || response.headers.accesstoken);
            setUserDetails(response.data?.data);
            setIsUserLoggedIn(true);
            router.replace("/home");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.log(error.response?.data.message);
            };
        }
    }

    return (
        <View className='flex-1 bg-white p-4'>

            <View className='p-4 flex-1'>
                <Text className='text-3xl font-semibold'>
                    Verify your phone number
                </Text>

                <View className='my-10 gap-4'>
                    <Text className='text-lg font-medium'>
                        Enter the 4-digit code sent to you at{"\n"}
                        <Text className='text-primary font-semibold text-lg'>
                            +91 {userPhone}
                        </Text>
                    </Text>
                    <Controller
                        control={control}
                        name='userOtp'
                        render={({ field: { onBlur, onChange, value } }) => (
                            <OtpInput
                                numberOfDigits={5}
                                focusColor={"#14479c"}
                                blurOnFilled={true}
                                type='numeric'
                                onTextChange={onChange}
                                onBlur={onBlur}
                                theme={{
                                    containerStyle: styles.container,
                                    pinCodeContainerStyle: errors.userOtp ? { ...styles.pinCodeContainer, borderColor: "#ef4444", borderWidth: 2 } : styles.pinCodeContainer,
                                }}
                            />
                        )}
                    />
                </View>

                <Button onPress={handleSubmit(handleUserVerification)}>
                    <Text>Verify</Text>
                </Button>
            </View>
        </View>
    )
}

export default OtpVerificationScreen

const styles = StyleSheet.create({
    container: {
        gap: 16,
    },
    pinCodeContainer: {
        flexGrow: 1,
    },
})