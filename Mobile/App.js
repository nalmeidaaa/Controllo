import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "./src/screens/Login";
import AdministracaoScreen from "./src/screens/Administracao";
import ManutencaoScreen from "./src/screens/Manutencao";
import GeralScreen from "./src/screens/Geral";
import QrCodeScreen from "./src/screens/Camera";
// import PosicaoGPS from "./src/screens/PosicaoGPS";
// import RedesScreen from "./src/screens/RedesWifi";

const Stack = createNativeStackNavigator()

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginScreen">
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AdministracaoScreen"
          component={AdministracaoScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ManutencaoScreen"
          component={ManutencaoScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="GeralScreen"
          component={GeralScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="QrCodeScreen"
          component={QrCodeScreen}
          options={{ title: "Leitura de QR Code" }}
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
