import { Alert, Dimensions, FlatList, ScrollView, useWindowDimensions, View } from 'react-native'
import React, { useMemo } from 'react'
import Pdf from 'react-native-pdf';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/libs/utils';
import { Separator } from './ui/separator';
// import { ChevronDown } from '@/lib/icons/ChevronDown';

type Props = {
    scannedResults: IVerifierCertificate;
    barcodeData: string | string[];
};

const MIN_COLUMN_WIDTHS = [180, 180];

const ViewCertificate = ({ scannedResults, barcodeData }: Props) => {

    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    const columnWidths = useMemo(() => {
        return MIN_COLUMN_WIDTHS.map((minWidth) => {
            const evenWidth = width / MIN_COLUMN_WIDTHS.length;
            return evenWidth > minWidth ? evenWidth : minWidth;
        });
    }, [width]);

    return (
        <View className='flex-1'>
            <Card className='w-full'>
                <CardHeader>
                    <CardTitle>Document</CardTitle>
                    <CardDescription>Document overview</CardDescription>
                </CardHeader>
                <CardContent>
                    <Text className='text-base xs:text-lg'>
                        Document ID:{" "}
                        <Text className='font-semibold'>{scannedResults.serial_no}</Text>
                    </Text>
                    <Text className='text-base xs:text-lg'>
                        Status:{" "}
                        <Text className='font-semibold'>
                            {parseInt(scannedResults.status) != 0 ? "Active" : "In Active"}
                        </Text>
                    </Text>
                    {barcodeData && (
                        <Text className='text-base xs:text-lg'>
                            Data:{" "}
                            <Text className='font-semibold'>
                                {barcodeData}
                            </Text>
                        </Text>
                    )}
                </CardContent>
            </Card>

            {scannedResults.verification_type != 1 ? (
                <View className='flex-1 my-4'>
                    <Pdf
                        style={{
                            flex: 1,
                            width: "100%",
                            height: "100%",
                            backgroundColor: "#FFF"
                        }}
                        source={{ uri: scannedResults.fileUrl }}
                    />
                </View>
            ) : (
                <ScrollView
                    bounces={false}
                    showsHorizontalScrollIndicator={false}
                    className='py-4'
                >

                    <Text className='text-2xl text-card-foreground font-semibold leading-none tracking-tight'>
                        Verification Details
                    </Text>
                    <Separator className='my-2' />
                    <Table aria-labelledby='invoice-table'>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='px-0.5' style={{ width: columnWidths[0] }}>
                                    <Text>Name</Text>
                                </TableHead>
                                <TableHead style={{ width: columnWidths[1] }}>
                                    <Text>Decrypted Value</Text>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <FlatList
                                scrollEnabled={false}
                                data={scannedResults.text_verification}
                                contentContainerStyle={{
                                    paddingBottom: insets.bottom,
                                }}
                                showsVerticalScrollIndicator={false}
                                renderItem={({ item, index }) => {
                                    return (
                                        <TableRow
                                            key={item.id}
                                            className={cn(index % 2 && 'bg-muted/40 ')}
                                        >
                                            <TableCell style={{ width: columnWidths[0] }}>
                                                <Text>{item.name}</Text>
                                            </TableCell>
                                            <TableCell style={{ width: columnWidths[1] }}>
                                                <Text>{item.decrypted_value}</Text>
                                            </TableCell>
                                        </TableRow>
                                    );
                                }}
                            />
                        </TableBody>
                    </Table>
                </ScrollView>
            )}
        </View>
    )
}

export default ViewCertificate