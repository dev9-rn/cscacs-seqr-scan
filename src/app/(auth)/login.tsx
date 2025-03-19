import { View } from 'react-native'
import React, { useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { Controller, FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import { EyeIcon } from "../../libs/icons/EyeIcon"
import { EyeOffIcon } from "../../libs/icons/EyeOffIcon"
import { Text } from '@/components/ui/text'
import axiosInstance from '@/utils/axiosInstance'
import { INSTITUE_LOGIN, VERIFIER_LOGIN } from '@/utils/routes'
import useAuth from '@/hooks/useAuth'
import useUser from '@/hooks/useUser'

type Props = {}

type FormData = {
    userName: "";
    userPass: "";
}

const LoginScreen = ({ }: Props) => {

    const { login_type } = useLocalSearchParams();

    const { setIsUserLoggedIn, setAuthToken } = useAuth();
    const { setUserDetails } = useUser();

    const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

    const [isUserNameFocused, setIsUserNameFocused] = useState<boolean>(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState<boolean>(false);

    const { control, handleSubmit, formState: { errors, isValid } } = useForm<FormData>({
        mode: "onChange", // Enables real-time validation updates
        defaultValues: {
            userName: '',
            userPass: ''
        }
    });

    const handleUserLogin: SubmitHandler<FormData | FieldValues> = async (formData) => {
        const loginBody = new FormData();
        loginBody.append(login_type.toString().toLocaleLowerCase() != "institute" ? "username" : "institute_username", formData.userName);
        loginBody.append("password", formData.userPass);

        console.log(loginBody, "LOGIN_BODY");

        try {
            const response = await axiosInstance.post(
                login_type.toString().toLocaleLowerCase() != "institute" ? VERIFIER_LOGIN : INSTITUE_LOGIN,
                loginBody
            );
            if (!response.data?.success) {
                setIsUserLoggedIn(false);
                throw new Error(response.data?.message)
            };

            setAuthToken(response.data?.data?.access_token || response.data?.accesstoken);
            setUserDetails(response.data?.data);
            setIsUserLoggedIn(true);
            router.replace("/home");
        } catch (error) {
            throw new Error("Something went wrong while logging you in " + error);
        };
    };

    return (
        <View className='flex-1 bg-white'>
            <View className='p-4 gap-8'>
                <Text className='text-4xl font-semibold text-secondary'>
                    Welcome back,
                    <Text className='capitalize text-4xl font-semibold text-secondary'>
                        {login_type}
                    </Text>
                </Text>

                <View className=''>
                    {/* Form Actions */}
                    <View className='gap-6'>
                        <View className='gap-2'>
                            <Text className='text-lg text-secondary'>Username</Text>
                            <Controller
                                control={control}
                                name='userName'
                                rules={{
                                    required: true,
                                }}
                                render={({ field: { onBlur, onChange, value } }) => (
                                    <View className={`border rounded-lg ${isUserNameFocused ? "border-primary" : "border-input"}`}>
                                        <Input
                                            className='border-0'
                                            placeholder='Enter your username'
                                            keyboardType='default'
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={() => {
                                                onBlur();
                                                setIsUserNameFocused(false);
                                            }}
                                            onFocus={() => {
                                                setIsUserNameFocused(true);
                                            }}
                                        />
                                    </View>
                                )}
                            />
                        </View>

                        <View className='gap-2'>
                            <Text className='text-lg text-secondary'>Password</Text>
                            <Controller
                                control={control}
                                name='userPass'
                                rules={{
                                    required: true,
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <View className={`flex-row items-center border rounded-lg ${isPasswordFocused ? "border-primary" : "border-input"}`}>
                                        <Input
                                            className='border-0 flex-1'
                                            placeholder='Enter your password'
                                            keyboardType='default'
                                            secureTextEntry={!isPasswordVisible}
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={() => {
                                                onBlur();
                                                setIsPasswordFocused(false);
                                            }}
                                            onFocus={() => {
                                                setIsPasswordFocused(true);
                                            }}
                                        />
                                        <Button
                                            className='ml-auto'
                                            variant={"ghost"}
                                            size={"icon"}
                                            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                                        >
                                            {isPasswordVisible ? (
                                                <EyeIcon className='text-primary' />
                                            ) : (
                                                <EyeOffIcon className='text-primary' />
                                            )}
                                        </Button>
                                    </View>
                                )}
                            />
                        </View>
                    </View>

                    {login_type.toString().toLocaleLowerCase() != "institute" && (
                        <View className='flex-row items-center justify-between my-2'>
                            <View className='flex-row items-center gap-1'>
                                <Text>Don't have an account ?</Text>
                                <Button
                                    variant={"ghost"}
                                    size={"sm"}
                                    className='p-0'
                                    onPress={() => router.navigate("/sign-up")}
                                >
                                    <Text className='text-primary'>
                                        Sign Up
                                    </Text>
                                </Button>
                            </View>
                            <Button
                                variant={"ghost"}
                                size={"sm"}
                                className='p-0'
                            >
                                <Text className='text-destructive'>
                                    Forgot password
                                </Text>
                            </Button>
                        </View>
                    )}
                </View>

                {/* Submit button */}
                <Button
                    onPress={handleSubmit(handleUserLogin)}
                >
                    <Text>
                        Login
                    </Text>
                </Button>
            </View>
        </View>
    )
}

export default LoginScreen