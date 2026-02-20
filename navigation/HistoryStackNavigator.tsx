import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HistoryListScreen from "@/screens/HistoryListScreen";
import OrderDetailScreen from "@/screens/OrderDetailScreen";
import RecordMoreScreen from "@/screens/RecordMoreScreen";
import ConfirmAddItemsScreen from "@/screens/ConfirmAddItemsScreen";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type HistoryStackParamList = {
  HistoryList: undefined;
  OrderDetail: { orderId: string };
  RecordMore: { existingOrderId: string };
  ConfirmAddItems: { audioUri: string; transcribedText: string; existingOrderId: string };
};

const Stack = createNativeStackNavigator<HistoryStackParamList>();

export default function HistoryStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator screenOptions={{ ...getCommonScreenOptions({ theme, isDark }) }}>
      <Stack.Screen
        name="HistoryList"
        component={HistoryListScreen}
        options={{
          headerTitle: "Orders",
          headerTransparent: false,
        }}
      />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{
          headerTitle: "Order Details",
          headerTransparent: false,
        }}
      />
      <Stack.Screen
        name="RecordMore"
        component={RecordMoreScreen}
        options={{
          headerTitle: "Record More Items",
          headerTransparent: false,
        }}
      />
      <Stack.Screen
        name="ConfirmAddItems"
        component={ConfirmAddItemsScreen}
        options={{
          headerTitle: "Add Items",
          headerTransparent: false,
        }}
      />
    </Stack.Navigator>
  );
}
