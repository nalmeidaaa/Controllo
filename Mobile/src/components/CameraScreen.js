// import React, { useState, useEffect, useRef } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
// import { CameraView, useCameraPermissions } from 'expo-camera';

// export default function CameraScreen({ onPhotoTaken }) {
//   const [cameraPermission, requestCameraPermission] = useCameraPermissions();
//   const [locationPermission, setLocationPermission] = useState(null);
//   const [location, setLocation] = useState(null);
//   const [address, setAddress] = useState('');
//   const [loadingLocation, setLoadingLocation] = useState(true);
//   const cameraRef = useRef(null);

//   useEffect(() => {
//     let locationSubscription = null;

//     async function initLocation() {
//       try {
//         // Solicitação de permissão de localização em tempo de execução
//         const { status } = await Location.requestForegroundPermissionsAsync();
//         const granted = status === 'granted';
//         setLocationPermission(granted);

//         if (!granted) {
//           Alert.alert('Permissão negada', 'O acesso à localização é necessário.');
//           setLoadingLocation(false);
//           return;
//         }

//         // Verificação de hardware (GPS ativado)
//         const isGpsEnabled = await Location.hasServicesEnabledAsync();
//         if (!isGpsEnabled) {
//           Alert.alert('GPS Desativado', 'Por favor, ative a localização do seu aparelho.');
//         }

//         // Obtenção da posição inicial
//         const currentLoc = await Location.getCurrentPositionAsync({
//           accuracy: Location.Accuracy.High,
//         });
//         setLocation(currentLoc.coords);

//         // Geocodificação reversa para obter endereço
//         const [geo] = await Location.reverseGeocodeAsync({
//           latitude: currentLoc.coords.latitude,
//           longitude: currentLoc.coords.longitude,
//         });

//         if (geo) {
//           setAddress(`${geo.street || ''}, ${geo.streetNumber || ''} - ${geo.subregion || geo.city || ''}`);
//         }

//         // Assinatura contínua com intervalo otimizado para economia de bateria
//         locationSubscription = await Location.watchPositionAsync(
//           {
//             accuracy: Location.Accuracy.Balanced,
//             timeInterval: 5000,
//             distanceInterval: 10,
//           },
//           (newLoc) => {
//             setLocation(newLoc.coords);
//           }
//         );
//       } catch (error) {
//         Alert.alert('Erro', 'Ocorreu uma falha ao obter a localização.');
//       } finally {
//         setLoadingLocation(false);
//       }
//     }

//     initLocation();

//     // Cleanup: Remoção de listener de sensor para prevenir vazamento de memória
//     return () => {
//       if (locationSubscription) {
//         locationSubscription.remove();
//       }
//     };
//   }, []);

//   if (!cameraPermission || locationPermission === null) {
//     return (
//       <View style={styles.centerContainer}>
//         <ActivityIndicator size="large" color="#007AFF" />
//       </View>
//     );
//   }

//   if (!cameraPermission.granted) {
//     return (
//       <View style={styles.centerContainer}>
//         <Text style={styles.messageText}>Permissão de câmera necessária.</Text>
//         <TouchableOpacity style={styles.button} onPress={requestCameraPermission}>
//           <Text style={styles.buttonText}>Conceder Permissão</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   const takePicture = async () => {
//     if (cameraRef.current) {
//       try {
//         const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
//         onPhotoTaken({
//           uri: photo.uri,
//           location,
//           address,
//         });
//       } catch (error) {
//         Alert.alert('Erro', 'Não foi possível capturar a foto.');
//       }
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <CameraView style={styles.camera} ref={cameraRef}>
//         <View style={styles.overlayInfo}>
//           {loadingLocation ? (
//             <Text style={styles.infoText}>Buscando GPS...</Text>
//           ) : location ? (
//             <>
//               <Text style={styles.infoTextBold}>
//                 Lat: {location.latitude.toFixed(5)} | Lon: {location.longitude.toFixed(5)}
//               </Text>
//               {address ? <Text style={styles.infoText}>{address}</Text> : null}
//             </>
//           ) : (
//             <Text style={styles.infoText}>Localização indisponível</Text>
//           )}
//         </View>

//         <View style={styles.controls}>
//           <TouchableOpacity style={styles.captureBtn} onPress={takePicture}>
//             <View style={styles.captureBtnInner} />
//           </TouchableOpacity>
//         </View>
//       </CameraView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#000' },
//   centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
//   camera: { flex: 1, justifyContent: 'space-between' },
//   overlayInfo: {
//     backgroundColor: 'rgba(0, 0, 0, 0.65)',
//     padding: 15,
//     margin: 20,
//     marginTop: 50,
//     borderRadius: 8,
//   },
//   infoTextBold: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
//   infoText: { color: '#FFF', fontSize: 12, marginTop: 4 },
//   messageText: { color: '#333', fontSize: 16, marginBottom: 15, textAlign: 'center' },
//   button: { backgroundColor: '#007AFF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6 },
//   buttonText: { color: '#FFF', fontWeight: 'bold' },
//   controls: { alignItems: 'center', marginBottom: 30 },
//   captureBtn: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//     borderWidth: 4,
//     borderColor: '#FFF',
//     justify: 'center',
//     alignItems: 'center',
//   },
//   captureBtnInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#FFF' },
// });