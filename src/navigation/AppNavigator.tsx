import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import Login from "../screens/Login";
import QRCodeScanner from "../screens/QRCodeScanner";

export type RootStackParamList = {
  Login: undefined;
  QRCodeScanner: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="QRCodeScanner" component={QRCodeScanner} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
