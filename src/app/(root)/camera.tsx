import { Alert, Platform, View } from 'react-native'
import React, { useEffect, useState } from 'react'

import { CameraView, useCameraPermissions, BarcodeScanningResult, BarcodeType } from 'expo-camera';
import { Button } from '@/components/ui/button';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import Header from '@/components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import BarcodeMask from 'react-native-barcode-mask';

import * as Haptics from 'expo-haptics';
import axiosInstance from '@/utils/axiosInstance';
import { SCAN_INSTITUTE_CERT, SCAN_VERIFIER_CERT } from '@/utils/routes';
import useUser from '@/hooks/useUser';
import { useToast } from 'react-native-toast-notifications';
import axios, { AxiosError } from 'axios';

type Props = {}

const CameraScreen = ({ }: Props) => {

    const { userDetails } = useUser();

    const [scanned, setScanned] = useState<boolean>(false);
    const [barcodeResult, setBarcodeResult] = useState();

    const [permission, requestPermission] = useCameraPermissions();
    const toast = useToast();

    const { scanner_type } = useLocalSearchParams();

    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({
            header: () => (
                <Header isBackVisible headerTitle='Scan QR' />
            )
        })
    }, []);

    const handleBarCodeScanned = (barcodeData: BarcodeScanningResult) => {
        setScanned(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid)
        console.log(barcodeData);
        showScannedResult(barcodeData);
    };

    const showScannedResult = async (barcodeData: BarcodeScanningResult) => {

        const formatBarcodeData = barcodeData.data.split("\n").filter(line => line.trim() !== "");

        const sanitizeBarcodeData = formatBarcodeData.pop() || ""; // Last valid line
        const otherBarcodeData = formatBarcodeData.join("\n"); // Remaining lines combined back

        const scannedFormData = new FormData();

        scannedFormData.append("device_type", Platform.OS);
        //@ts-ignore
        scannedFormData.append("scanned_by", userDetails?.username || userDetails?.institute_username);
        //@ts-ignore
        scannedFormData.append("user_id", userDetails?.id)
        scannedFormData.append("key", sanitizeBarcodeData);

        try {
            const response = await axiosInstance.post(userDetails?.user_type === 0 ? SCAN_VERIFIER_CERT : SCAN_INSTITUTE_CERT, scannedFormData);

            if (!response.data.success) {
                setTimeout(() => {
                    setScanned(false);
                }, 2000);
                return toast.show(response.data?.data?.message || response.data?.message);
            };

            console.log(response.data, "BARCODE_API_RES");
            setScanned(false);
            router.navigate({
                pathname: "/scan-result",
                params: {
                    scanned_results: JSON.stringify(response.data?.data),
                    qr_data: otherBarcodeData,
                }
            })

        } catch (error) {
            setScanned(false);
            if (axios.isAxiosError<IServerError>(error)) {
                console.log(error.response?.data, "ERROR_AXIOS");
                const errorMessage = error.response?.data?.data?.message || "An error occurred";
                toast.show(errorMessage);
                return; // Ensure the function exits after handling the error
            }
            // Fallback for non-Axios errors
            toast.show(error?.message || "An unexpected error occurred");
        }
    }

    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <SafeAreaView className='flex-1 items-center justify-center bg-stone-900'>
                <Text className='text-white'>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} >
                    <Text>Grant permission</Text>
                </Button>
            </SafeAreaView>
        );
    };

    return (
        <View className='flex-1 justify-center'>
            <CameraView
                style={{ flex: 1, }}
                barcodeScannerSettings={{
                    barcodeTypes: [scanner_type as BarcodeType],
                }}
                onBarcodeScanned={(data) => {
                    scanned ? undefined : handleBarCodeScanned(data)
                }}
            >
                <BarcodeMask width={300} height={scanner_type == "qr" ? 300 : 100} showAnimatedLine={false} edgeRadius={8} />
            </CameraView>
        </View>
    )
}

export default CameraScreen