import { View, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useRef, useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'

import PagerView from 'react-native-pager-view';
import ViewCertificate from '@/components/ViewCertificate';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

type Props = {}

const TABS = [
    {
        id: 1,
        name: "View Certificate",
    },
    {
        id: 2,
        name: "View Printing Details",
    }
]

const ScanResultScreen = ({ }: Props) => {

    const [activeTabIndex, setActiveTabIndex] = useState<number>(0);

    const { scanned_results, qr_data } = useLocalSearchParams();

    const pagerRef = useRef<PagerView>(null);

    const handleTabSwitch = (index: number) => {
        setActiveTabIndex(index);
        pagerRef.current?.setPage(index);
    }

    return (
        <View className='flex-1 bg-white'>

            <View className='flex-row items-center justify-around py-4'>
                {TABS.map((tab, index) => (
                    <TouchableOpacity key={tab.id} className={`flex-1 py-2 ${activeTabIndex == index ? "border-b-2 border-primary" : "border-0"} `} onPress={() => handleTabSwitch(index)}>
                        <Text className={`text-center text-base xs:text-lg ${activeTabIndex == index ? "text-primary font-medium" : ""}`}>
                            {tab.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <PagerView
                ref={pagerRef}
                style={styles.pagerView}
                initialPage={0}
                onPageSelected={(e) => setActiveTabIndex(e.nativeEvent.position)}
                className='p-4'
            >
                <View key="1" className='p-4'>
                    <ViewCertificate
                        scannedResults={JSON.parse(scanned_results)}
                        barcodeData={qr_data}
                    />
                </View>
                <View key="2" className='items-center justify-center gap-2'>
                    <Text className='text-center text-xl font-medium max-w-md'>
                        Go to the 1D Barcode Scanner and view the printing details.
                    </Text>

                    <Button
                        onPress={() => router.push({
                            pathname: "/camera",
                            params: {
                                scanner_type: "code128"
                            }
                        })}
                    >
                        <Text>Go to 1D Scanner</Text>
                    </Button>
                </View>
            </PagerView>
        </View>
    )
}

export default ScanResultScreen

const styles = StyleSheet.create({
    pagerView: {
        flex: 1,
    },
});