import { View, Text, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import axiosInstance from '@/utils/axiosInstance'
import { GET_SCAN_HISTORY } from '@/utils/routes'
import useUser from '@/hooks/useUser'

type Props = {}

const ScanHistoryScreen = ({ }: Props) => {

    const [userScannedHistory, setUserScannedHistory] = useState();

    const { userDetails } = useUser();

    useEffect(() => {
        fetchDocumentScannedHistory();
    }, [])

    const fetchDocumentScannedHistory = async () => {

        console.log("INSIDE_FUNC");

        const scannedHistoryFormData = new FormData();

        scannedHistoryFormData.append("device_type", Platform.OS);
        scannedHistoryFormData.append("user_id", userDetails?.id);

        try {
            const response = await axiosInstance.post(GET_SCAN_HISTORY, scannedHistoryFormData);

            if (!response.data?.success) {
                console.log(response.data, "NON_SUCCESS");
                throw new Error(response.data?.data.message || response.data?.message);
            }
            console.log(response.data.data, "SCANNED_HISTORY");
        } catch (error) {
            throw new Error("Something went wrong" + error);
        }
    };

    return (
        <View className='p-4 bg-white flex-1'>
            <Text>ScanHistoryScreen</Text>
        </View>
    )
}

export default ScanHistoryScreen