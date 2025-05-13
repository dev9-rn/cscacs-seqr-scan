import { Platform, View } from 'react-native'
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
import axios from 'axios';

type Props = {}

const CameraScreen = ({ }: Props) => {

    const { userDetails } = useUser();

    const [scanned, setScanned] = useState<boolean>(false);
    const [isFetchingScannedData, setIsFetchingScannedData] = useState<boolean>(false);

    const [permission, requestPermission] = useCameraPermissions();
    const toast = useToast();

    const { scanner_type } = useLocalSearchParams<{ scanner_type: BarcodeType }>();

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
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        showScannedResult(barcodeData);
        setTimeout(() => setScanned(false), 2000); // Enable scanning after 2 seconds
    };

    const showScannedResult = async (barcodeData: BarcodeScanningResult) => {
        if (scanned) return;

        setIsFetchingScannedData(true);

        const formatBarcodeData = barcodeData.data.split("\n").filter(line => line.trim() !== "");
        const sanitizeBarcodeData = formatBarcodeData.pop() || ""; // Last valid line
        const otherBarcodeData = formatBarcodeData.join("\n"); // Remaining lines combined back

        const scannedFormData = new FormData();
        scannedFormData.append("device_type", Platform.OS);
        scannedFormData.append("scanned_by", userDetails?.username || userDetails?.institute_username);
        scannedFormData.append("user_id", userDetails?.id);
        scannedFormData.append("key", sanitizeBarcodeData);

        try {
            const response = await axiosInstance.post(userDetails?.user_type === 0 ? SCAN_VERIFIER_CERT : SCAN_INSTITUTE_CERT, scannedFormData);

            if (!response.data.success) {
                toast.show(response.data?.data?.message || response.data?.message, {
                    data: response.data
                });
                setIsFetchingScannedData(false);
                return;
            };

            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
            )
            setIsFetchingScannedData(false);
            router.navigate({
                pathname: "/scan-result",
                params: {
                    scanned_results: JSON.stringify(response.data?.data),
                    qr_data: otherBarcodeData,
                }
            });
        } catch (error) {
            if (axios.isAxiosError<IServerError>(error)) {
                const errorMessage = error.response?.data?.data?.message || "An error occurred";
                toast.show(errorMessage, {
                    data: error.response?.data?.data
                });
            }
            // Delay resuming scanning
            setTimeout(() => setScanned(false), 2000);
        };
    };

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
                style={{ flex: 1, position: 'relative' }}
                barcodeScannerSettings={{
                    barcodeTypes: [scanner_type],
                }}
                onBarcodeScanned={(data) => handleBarCodeScanned(data)}
            >
                <BarcodeMask
                    width={300}
                    height={scanner_type == "qr" ? 300 : 100}
                    showAnimatedLine={false}
                    edgeRadius={8}
                />

                {isFetchingScannedData && (
                    <View className='absolute top-3/4 self-center items-center flex-row'>
                        <Text className='text-white bg-black/40 p-4 rounded-lg'>
                            Scanning your {scanner_type} data. Please wait...
                        </Text>
                    </View>
                )}
            </CameraView>
        </View>
    )
}

export default CameraScreen