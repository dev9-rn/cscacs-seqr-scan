import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import Icon from "@/libs/LucideIcon";
import { parseKeysAndValues, parseOtherData } from "@/libs/utils";
type Props = {};

const offlineUserData = (props: Props) => {
  const { imageUri, otherData } = useLocalSearchParams<{
    imageUri: string;
    otherData: string;
  }>();
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  useEffect(() => {
    if (imageUri) {
      Image.getSize(imageUri, (width, height) => {
        setImageDimensions({ width, height });
      }, (error) => {
        console.error("Failed to get image size", error);
      });
    }
  }, [imageUri]);
  
  // const parsedData = React.useMemo(() => {
  //   try {
  //     return JSON.parse(otherData || "[]");
  //   } catch (err) {
  //     console.error("Failed to parse otherData:", err);
  //     return [];
  //   }
  // }, [otherData]);

  // const entries = Object.entries(parsedData).filter(
  //   ([key]) => key !== "imageUri"
  // );
  const parsedData = React.useMemo(() => {
    if (!otherData) return {};
    // Remove leading/trailing quotes if present
    const sanitized = otherData.replace(/^"(.*)"$/, "$1");
    return parseKeysAndValues(sanitized);
    // if (verifiedUser) {
    //   return verifiedUser
    // } else {
    //   return {}
    // }

  }, [otherData]);

  const entries = Object?.entries(parsedData);

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-white rounded-2xl shadow-lg p-6 mx-4 my-5 shadow-blue-100">
        <View className="flex-row justify-center items-center p-4 space-x-2">
          <Icon name="BadgeCheck" color="green" size={35} />
          <Text className="text-[18px] font-semibold text-gray-900 m-2">
            Verified
          </Text>
        </View>

        {imageUri && (
          <View className="items-center mb-6 rounded-[8px]">
            <Image
              source={{ uri: imageUri }}
              style={{
                width: imageDimensions.width,
                height: 90,
                borderRadius: 8,
                alignSelf: 'center',
                marginBottom: 8,
              }}
              resizeMode="contain"
            />
          </View>
        )}

        {entries.map(([key, value]) => {
          // Transform key: replace _ with space and capitalize each word
          const formattedKey = key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());

          return (
            <View
              key={key}
              className="flex-row justify-between items-start py-3 px-1 border-b border-gray-100 last:border-b-0"
            >
              <Text className="font-medium text-[16px] text-gray-700 w-[40%]">
                {formattedKey}
              </Text>
              <Text className="text-[16px] text-gray-900 w-[55%] font-normal leading-5">
                {value}
              </Text>
            </View>
          );
        })}

        <View className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-400 to-blue-200 rounded-t-2xl" />
      </View>
    </ScrollView>
  );
};

export default offlineUserData;

const styles = StyleSheet.create({});
