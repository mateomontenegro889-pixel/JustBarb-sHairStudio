import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RecordScreen from "@/screens/RecordScreen";
import ConfirmOrderScreen from "@/screens/ConfirmOrderScreen";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type RecordStackParamList = {
  Record: undefined;
  ConfirmOrder: { audioUri: string; transcribedText: string };
};

const Stack = createNativeStackNavigator<RecordStackParamList>();

export default function RecordStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{ ...getCommonScreenOptions({ theme, isDark }) }}
    >
      <Stack.Screen
        name="Record"
        component={RecordScreen}
        options={{
          headerTitle: "New Order",
          headerTransparent: false,
        }}
      />
      <Stack.Screen
        name="ConfirmOrder"
        component={ConfirmOrderScreen}
        options={{
          headerTitle: "Confirm Order",
          presentation: "modal",
          headerTransparent: false,
        }}
      />
    </Stack.Navigator>
  );
}
