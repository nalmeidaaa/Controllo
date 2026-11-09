import { useMemo } from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { TemaProvider, useTema } from "./src/theme/tema.jsx";

import LoginScreen from "./src/screens/Login";
import AdministracaoScreen from "./src/screens/Administracao";
import ManutencaoScreen from "./src/screens/Manutencao";
import GeralScreen from "./src/screens/Geral";
import SalasScreen from "./src/screens/Salas";
import SalaDetalheScreen from "./src/screens/SalaDetalhe";
import ItensPendentesScreen from "./src/screens/ItensPendentes";
import CadastroScreen from "./src/screens/Cadastro";
import NovaRequisicaoScreen from "./src/screens/NovaRequisicao";
import RequisicaoDetalheScreen from "./src/screens/RequisicaoDetalhe";
import ManutencaoRequisicoesScreen from "./src/screens/ManutencaoRequisicoes";
import ManutencaoRequisicaoDetalheScreen from "./src/screens/ManutencaoRequisicaoDetalhe";
import TodasAtualizacoesScreen from "./src/screens/TodasAtualizacoes";
// import PosicaoGPS from "./src/screens/PosicaoGPS";
// import RedesScreen from "./src/screens/RedesWifi";

const Stack = createNativeStackNavigator()

export default function App() {
  return (
    <TemaProvider>
      <Navegacao />
    </TemaProvider>
  );
}

function Navegacao() {
  const { cores, escuro } = useTema();

  // Tema do React Navigation acompanha o tema do app (fundo, bordas, textos)
  const temaNavegacao = useMemo(() => {
    const base = escuro ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: cores.marca,
        background: cores.fundo,
        card: cores.superficie,
        text: cores.texto,
        border: cores.borda,
      },
    };
  }, [escuro, cores]);

  return (
    <NavigationContainer theme={temaNavegacao}>
      {/* Ícones da barra de status claros no tema escuro e escuros no claro */}
      <StatusBar style={escuro ? "light" : "dark"} />
      <Stack.Navigator
        initialRouteName="LoginScreen"
        screenOptions={{ contentStyle: { backgroundColor: cores.fundo } }}
      >
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
          name="SalasScreen"
          component={SalasScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SalaDetalheScreen"
          component={SalaDetalheScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ItensPendentesScreen"
          component={ItensPendentesScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CadastroScreen"
          component={CadastroScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="NovaRequisicaoScreen"
          component={NovaRequisicaoScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RequisicaoDetalheScreen"
          component={RequisicaoDetalheScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ManutencaoRequisicoesScreen"
          component={ManutencaoRequisicoesScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ManutencaoRequisicaoDetalheScreen"
          component={ManutencaoRequisicaoDetalheScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TodasAtualizacoesScreen"
          component={TodasAtualizacoesScreen}
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