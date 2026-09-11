import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function QRCodeScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  // Aguardando carregamento da permissão
  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );  }

  // Se a permissão não foi concedida
  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.messageText}>Precisamos da sua permissão para usar a câmera.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Conceder Permissão</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Função disparada ao identificar um código
  const handleBarcodeScanned = ({ type, data }) => {
    setScanned(true); // Bloqueia novas leituras imediatamente
    
    Alert.alert(
      'QR Code Encontrado!',
      data,
      [
        {
          text: 'Escanear Novamente',
          // Ao fechar o alerta, libera para ler outro QR code
          onPress: () => setScanned(false), 
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'], // Foca apenas em QR Codes para maior performance
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      >
        {/* Camada de Overlay (Máscara do Escâner) */}
        <View style={styles.overlay}>
          {/* Parte superior escura */}
          <View style={styles.unfocusedContainer} />
          
          {/* Linha do meio com o quadrado transparente */}
          <View style={styles.middleContainer}>
            <View style={styles.unfocusedContainer} />
            
            <View style={styles.focusedBox}>
              {/* Efeitos de borda nos cantos para ficar mais bonito */}
              <View style={[styles.corner, styles.topLeftCorner]} />
              <View style={[styles.corner, styles.topRightCorner]} />
              <View style={[styles.corner, styles.bottomLeftCorner]} />
              <View style={[styles.corner, styles.bottomRightCorner]} />
            </View>
            
            <View style={styles.unfocusedContainer} />
          </View>
          
          {/* Parte inferior escura com texto */}
          <View style={styles.unfocusedContainer}>
            <Text style={styles.instructionText}>
              Centralize o QR Code no quadrado para escanear
            </Text>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const overlayColor = 'rgba(0, 0, 0, 0.65)'; // Cor do fundo escurecido

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  messageText: {
    color: '#333',
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  /* Estilos do Overlay (Máscara) */
  overlay: {
    flex: 1,
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: overlayColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleContainer: {
    flexDirection: 'row',
    height: 250, // Altura do quadrado de escaneamento
  },
  focusedBox: {
    width: 250, // Largura do quadrado de escaneamento
    height: 250,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  instructionText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 30,
  },

  /* Detalhes visuais dos cantos do escâner */
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#00FF00', // Cor verde neon típica de escâner
    borderWidth: 4,
  },
  topLeftCorner: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 10,
  },
  topRightCorner: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 10,
  },
  bottomLeftCorner: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 10,
  },
  bottomRightCorner: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 10,
  },
});