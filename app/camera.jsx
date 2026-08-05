import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import ThirdsOverlay from '../components/ThirdsOverlay';
import { colors, fonts, borderRadius } from '../constants/theme';


export default function CameraScreen() {
  const router = useRouter();
  const cameraRef = useRef(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [capturing, setCapturing] = useState(false);

  // Camera Settings
  const [facing, setFacing] = useState('back');
  const [flash, setFlash] = useState('off'); // 'off' | 'on' | 'auto'
  const [showGrid, setShowGrid] = useState(true);

  useEffect(() => {
    let subscriber = null;

    async function initLocation() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationError('Permiso GPS no concedido');
          return;
        }

        const initialLoc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(initialLoc);

        subscriber = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 2000,
            distanceInterval: 1,
          },
          (newLoc) => {
            setLocation(newLoc);
          }
        );
      } catch (err) {
        setLocationError('Buscando satélites GPS...');
      }
    }

    initLocation();

    return () => {
      if (subscriber) {
        subscriber.remove();
      }
    };
  }, []);

  const toggleFlash = () => {
    if (flash === 'off') setFlash('on');
    else if (flash === 'on') setFlash('auto');
    else setFlash('off');
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  const handleCapture = async () => {
    if (capturing) return;
    setCapturing(true);

    try {
      let imageUri = '';
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
        imageUri = photo?.uri || '';
      }

      const lat = location?.coords?.latitude ? location.coords.latitude.toFixed(4) : '20.0551';
      const lng = location?.coords?.longitude ? location.coords.longitude.toFixed(4) : '-99.3407';
      const accuracy = location?.coords?.accuracy ? Math.round(location.coords.accuracy) : 3;

      router.push({
        pathname: '/results',
        params: { imageUri, lat, lng, accuracy },
      });
    } catch (error) {
      console.warn('Error al capturar fotografía:', error);
      router.push('/results');
    } finally {
      setCapturing(false);
    }
  };

  if (!permission) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#5EEAD4" />
        <Text style={styles.loadingText}>Iniciando Visor Móvil HenoTrack...</Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, styles.center, { padding: 24 }]}>
        <View style={styles.permissionCard}>
          <View style={styles.permIconCircle}>
            <Ionicons name="camera" size={36} color="#176B52" />
          </View>
          <Text style={styles.permissionTitle}>Acceso a Cámara Requerido</Text>
          <Text style={styles.permissionSub}>
            Para evaluar el grado de infestación de Heno Motita en el dosel arbóreo, se requiere acceso a la cámara del dispositivo.
          </Text>
          <Button 
            mode="contained" 
            onPress={requestPermission}
            buttonColor="#176B52"
            style={styles.permissionBtn}
            labelStyle={{ fontWeight: '800' }}
            icon={() => <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
          >
            Permitir Uso de Cámara
          </Button>
          <Button 
            mode="text" 
            onPress={() => router.back()}
            textColor="#687A74"
            style={{ marginTop: 8 }}
          >
            Regresar
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header & Settings Toolbar */}
      <View style={styles.topToolbar}>
        <TouchableOpacity style={styles.closeIconButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.brandTitleContainer}>
          <Ionicons name="leaf-outline" size={16} color="#5EEAD4" style={{ marginRight: 6 }} />
          <Text style={styles.brandTitleText}>HENOTRACK SCANNER 3.0</Text>
        </View>

        <View style={styles.topRightControls}>
          {/* Flash Toggle */}
          <TouchableOpacity style={styles.toolIconBtn} onPress={toggleFlash}>
            <Ionicons 
              name={flash === 'on' ? 'flash' : flash === 'auto' ? 'flash-outline' : 'flash-off-outline'} 
              size={20} 
              color={flash !== 'off' ? '#FDE047' : '#E6F4F1'} 
            />
          </TouchableOpacity>

          {/* Grid Toggle */}
          <TouchableOpacity style={styles.toolIconBtn} onPress={() => setShowGrid(!showGrid)}>
            <Ionicons 
              name="grid-outline" 
              size={20} 
              color={showGrid ? '#5EEAD4' : 'rgba(255,255,255,0.4)'} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Camera Viewfinder View */}
      <View style={styles.cameraWrapper}>
        <CameraView 
          ref={cameraRef}
          style={StyleSheet.absoluteFillObject}
          facing={facing}
          enableTorch={flash === 'on'}
        />

        {/* Thirds Overlay Grid */}
        <ThirdsOverlay showGrid={showGrid} />

        {/* Telemetry GPS Overlay Banner */}
        <View style={styles.telemetryOverlay}>
          <View style={styles.telemetryHeaderRow}>
            <View style={styles.gpsSignalDot} />
            <Ionicons name="location" size={14} color="#5EEAD4" style={{ marginRight: 4 }} />
            <Text style={styles.telemetryTitle}>TELEMETRÍA GPS DE CAMPO</Text>
          </View>
          
          <Text style={styles.telemetryCoords}>
            {location 
              ? `${location.coords.latitude.toFixed(4)}°N, ${Math.abs(location.coords.longitude).toFixed(4)}°W` 
              : (locationError || 'Sincronizando satélites GPS...')}
          </Text>

          <Text style={styles.telemetryAccuracy}>
            {location 
              ? `Precisión de Ubicación: ±${Math.round(location.coords.accuracy || 3)} metros` 
              : 'Obteniendo mejor precisión disponible...'}
          </Text>
        </View>
      </View>

      {/* Bottom Shutter Controls Panel */}
      <View style={styles.bottomControls}>
        <View style={styles.shutterRow}>
          {/* Flip Camera Button */}
          <TouchableOpacity style={styles.secondaryCircleBtn} onPress={toggleFacing}>
            <Ionicons name="camera-reverse-outline" size={24} color="#E6F4F1" />
          </TouchableOpacity>

          {/* Metallic Emerald Pro Shutter Button */}
          <TouchableOpacity 
            style={[styles.outerShutterRing, capturing && { opacity: 0.6 }]}
            activeOpacity={0.7}
            onPress={handleCapture}
            disabled={capturing}
          >
            <View style={styles.innerShutterBtn}>
              {capturing ? (
                <ActivityIndicator size="small" color="#103F32" />
              ) : (
                <Ionicons name="camera" size={28} color="#103F32" />
              )}
            </View>
          </TouchableOpacity>

          {/* Flash Mode Indicator Button */}
          <TouchableOpacity style={styles.secondaryCircleBtn} onPress={toggleFlash}>
            <Ionicons 
              name={flash === 'on' ? 'flash' : flash === 'auto' ? 'flash-outline' : 'flash-off-outline'} 
              size={22} 
              color={flash !== 'off' ? '#FDE047' : '#E6F4F1'} 
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.instructionText}>
          Alinea la copa del árbol en la cuadrilla Hawksworth y captura la muestra
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A2921',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#5EEAD4',
    marginTop: 12,
    fontWeight: '700',
  },
  permissionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  permIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EDF6F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#163029',
    textAlign: 'center',
    marginBottom: 8,
  },
  permissionSub: {
    fontSize: 13,
    color: '#687A74',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  permissionBtn: {
    borderRadius: 14,
    width: '100%',
  },
  topToolbar: {
    height: 54,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0A2921',
  },
  closeIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(94, 234, 212, 0.2)',
  },
  brandTitleText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.8,
  },
  topRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraWrapper: {
    flex: 1,
    marginHorizontal: 12,
    marginTop: 4,
    marginBottom: 8,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: 'rgba(94, 234, 212, 0.3)',
    backgroundColor: '#000000',
  },
  telemetryOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(10, 41, 33, 0.88)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(94, 234, 212, 0.3)',
  },
  telemetryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  gpsSignalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 8,
  },
  telemetryTitle: {
    color: '#5EEAD4',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  telemetryCoords: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  telemetryAccuracy: {
    color: '#DCE7E1',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  bottomControls: {
    backgroundColor: '#0A2921',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    alignItems: 'center',
  },
  shutterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  secondaryCircleBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  outerShutterRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3.5,
    borderColor: '#5EEAD4',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(94, 234, 212, 0.15)',
  },
  innerShutterBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#5EEAD4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionText: {
    color: '#A3B8B0',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
