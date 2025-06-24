import { clsx, type ClassValue } from 'clsx';
import { Alert } from 'react-native';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
};

// export function parseOtherData(data: string) {
//     const keys = [
//         "Candidate Name",
//         "Enrollment No",
//         "Course",
//         "Framework At",
//         "Can Work As",
//         "To Work Under",
//         "Valid Upto",
//         "Batch No",
//     ];
//     const values = data.split("|").map(s => s.trim());
//     const result: Record<string, string> = {};
//     keys.forEach((key, idx) => {
//         result[key] = values[idx] || "";
//     });
//     return result;
// }

// export function parseOtherData(data: string) {
//   // Define keys for each type
//   const keyMap: Record<string, string[]> = {
//     Bronze: [
//       "Candidate Name",
//       "Enrollment No",
//       "Course",
//       "Framework At",
//       "Can Work As",
//       "To Work Under",
//       "Valid Upto",
//       "Batch No",
//     ],
//     Silver: [
//       "Candidate Name",
//       "Enrollment No",
//       "Course",
//       "Framework At",
//       "Can Work As",
//       "To Work Under",
//       "Valid Upto",
//       "Batch No",
//       // Add or change keys for Silver if needed
//     ],
//     // Add more types if needed
//   };

//   // Split and trim all values
//   const values = data.split("|").map(s => s.trim());

//   // The first value is the type (e.g., Bronze, Silver)
//   const type = values[0];
//   const keys = keyMap[type] || keyMap["Bronze"]; // fallback to Bronze keys

//   // Remove the type from values
//   const fieldValues = values.slice(1);

//   // Map keys to values
//   const result: Record<string, string> = { Type: type };
//   keys.forEach((key, idx) => {
//     result[key] = fieldValues[idx] || "";
//   });

//   return result;
// }

export function parseKeysAndValues(data: string) {
    const values = data.split('|').map(value => value.trim())
    const templateId = values[0]
    const isValidTemplete = ["1", "2", "4", "5", "6", "7", "8", "9", "10"].includes(templateId)
    // console.log(isValidTemplete, "isValidTemplete");

    // console.log(templateId, "templateId");
    if (!isValidTemplete) {
        Alert.alert(
            "Invalid QR Code Detected",               // Title
            "Kindly scan the correct QR code.", // Message
            [
                { text: "OK", onPress: () => console.log("OK Pressed") }
            ],
            { cancelable: true }
        );
        return
    }  
    const mainKeys = {
        Name: values[1] || "",
        Enrollment_No: values[2] || "",
        Has_completed_the_prescried_training: values[3] || "",
        As_per_our_Competency_Framework_at: values[4] || "",
    }

    let extraKeys = {}
    const isIncluded = ["1", "2", "4", "5", "8", "9", "10"].includes(templateId)
    if (isIncluded) {
        extraKeys = {
            Can_work_as: values[5] || "",
            To_work_under: values[6] || "",
            Valid_up_to: values[7] || "",
            Batch_Number: values[8] || "",
        }
    } else if (templateId == '7') {
        extraKeys = {
            Can_work_as: values[5] || "",
            To_work_under: values[6] || "",
            Valid_up_to: values[7] || "",
            Division_Name: values[8] || "",
            Batch_Number: values[9] || "",
        }
    } else if (templateId === "6") {
        extraKeys = {
            On: values[5] || "",
            Batch_Number: values[6] || "",
        };
    }
    return { ...mainKeys, ...extraKeys }
}