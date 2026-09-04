import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./src/screens/Home";
// import PosicaoGPS from "./src/screens/PosicaoGPS";
// import RedesScreen from "./src/screens/RedesWifi";

const Stack = createNativeStackNavigator()

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        {/* <Stack.Screen
          name="PosicaoGPS"
          component={PosicaoGPS}
          options={{ title: 'Posição atual' }}
        />
        <Stack.Screen
          name="RedesScreen"
          component={RedesScreen}
          options={{ title: 'Redes Wifi' }}
        /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}