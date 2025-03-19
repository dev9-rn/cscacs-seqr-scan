import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native'
import React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/text'
import { useForm } from 'react-hook-form'
import { KeyboardAwareScrollView, KeyboardToolbar } from 'react-native-keyboard-controller';

type Props = {}

type SignUpForm = {
    userFullName: string;
    userEmail: string;
    userPhone: string;
    userName: string;
    userNewPassword: string;
    userConfirmPassword: string;
}

const SignUpScreen = ({ }: Props) => {

    const inset = useSafeAreaInsets();

    const { control, handleSubmit, formState: { errors } } = useForm<SignUpForm>({
        defaultValues: {
            userFullName: '',
            userEmail: '',
            userName: "",
            userNewPassword: "",
            userPhone: "",
            userConfirmPassword: "",
        }
    });

    const handleUserSignUp = () => {
        
    }
    return (
        <>
            <View className='flex-1 p-4 bg-white' style={{ paddingBottom: inset.bottom }}>

                <KeyboardAwareScrollView bottomOffset={62}>
                    <>
                        <View className='mb-6'>
                            <Text className='text-center text-sm xs:text-base text-gray-500'>
                                Please complete all information to create your account on{" "}
                                <Text className='font-medium'>
                                    Demo SeQR Docs
                                </Text>
                            </Text>
                        </View>

                        <View className='gap-4'>
                            <View>
                                <Text className='signUpFormText'>
                                    Full Name
                                </Text>
                                <Input
                                    placeholder='Enter your full name'
                                    className='signUpInputs'
                                    keyboardType='default'
                                />
                            </View>
                            <View>
                                <Text className='signUpFormText'>
                                    Email Address
                                </Text>
                                <Input
                                    placeholder='Enter your email'
                                    keyboardType='email-address'
                                />
                            </View>
                            <View>
                                <Text className='signUpFormText'>
                                    Phone Number
                                </Text>
                                <Input
                                    placeholder='Enter your phone number'
                                    keyboardType='phone-pad'
                                />
                            </View>
                            <View>
                                <Text className='signUpFormText'>
                                    Username
                                </Text>
                                <Input placeholder='Enter your username' />
                            </View>
                            <View>
                                <Text className='signUpFormText'>
                                    New Password
                                </Text>
                                <Input placeholder='Enter your password' />
                            </View>
                            <View>
                                <Text className='signUpFormText'>
                                    Confirm Password
                                </Text>
                                <Input placeholder='Confirm your password' />
                            </View>
                        </View>
                    </>
                </KeyboardAwareScrollView>
                <View className='mt-auto'>
                    <Button>
                        <Text>Sign Up</Text>
                    </Button>
                </View>
            </View>
            <KeyboardToolbar />
        </>
    )
}

export default SignUpScreen