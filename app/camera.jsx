import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import ThirdsOverlay from '../components/ThirdsOverlay';

export default function CameraScreen() {
  const router = useRouter();
  const cameraRef = useRef(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    let subscriber = null;

    async function initLocation() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationError('Permiso de GPS denegado');
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
        setLocationError('Buscando señal GPS...');
      }
    }

    initLocation();

    return () => {
      if (subscriber) {
        subscriber.remove();
      }
    };
  }, []);

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
      console.warn('Error tomando foto:', error);
      router.push('/results');
    } finally {
      setCapturing(false);
    }
  };

  if (!permission) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#176B52" />
        <Text style={styles.loadingText}>Cargando módulo de cámara HenoTrack...</Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, styles.center, { padding: 24 }]}>
        <View style={styles.permissionCard}>
          <View style={styles.permIconCircle}>
            <Ionicons name="camera-outline" size={36} color="#176B52" />
          </View>
          <Text style={styles.permissionTitle}>Permiso de Cámara Requerido</Text>
          <Text style={styles.permissionSub}>
            Para realizar la captura del dosel arbóreo y registrar la evidencia en el expediente quincenal, es necesario otorgar acceso a la cámara.
          </Text>
          <Button 
            mode="contained" 
            onPress={requestPermission}
            buttonColor="#176B52"
            style={styles.permissionBtn}
            labelStyle={{ fontWeight: '800' }}
            icon={() => <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
          >
            Otorgar Permiso de Cámara
          </Button>
          <Button 
            mode="text" 
            onPress={() => router.back()}
            textColor="#687A74"
            style={{ marginTop: 8 }}
          >
            Cancelar y Regresar
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Real Camera Viewfinder Container */}
      <View style={styles.cameraWrapper}>
        <CameraView 
          ref={cameraRef}
          style={StyleSheet.absoluteFillObject}
          facing="back"
        />

        <ThirdsOverlay />

        {/* Top Header Overlay */}
        <View style={styles.topControls}>
          <View style={styles.modeBadge}>
            <Ionicons name="leaf-outline" size={14} color="#EDF6F1" style={{ marginRight: 6 }} />
            <Text style={styles.modeText}>HENOTRACK • CÁMARA MÓVIL</Text>
          </View>

          <TouchableOpacity style={styles.cancelPill} onPress={() => router.back()}>
            <Ionicons name="close" size={16} color="#FFFFFF" style={{ marginRight: 2 }} />
            <Text style={styles.cancelPillText}>CERRAR</Text>
          </TouchableOpacity>
        </View>

        {/* GPS Badge Overlay */}
        <View style={styles.gpsContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="location" size={16} color="#176B52" style={{ marginRight: 6 }} />
            <Text style={styles.gpsText}>
              GPS Real: {location 
                ? `${location.coords.latitude.toFixed(4)}°N, ${location.coords.longitude.toFixed(4)}°W` 
                : (locationError || 'Obteniendo GPS...')}
            </Text>
          </View>
          <Text style={styles.gpsSignal}>
            {location 
              ? `Precisión de Lectura: ±${Math.round(location.coords.accuracy || 3)}m` 
              : 'Conectando con sensor de ubicación...'}
          </Text>
        </View>
      </View>

      {/* Shutter Action Bar */}
      <View style={styles.controls}>
        <Text style={styles.instruction}>Encuadre la copa del árbol en los tres niveles de guía</Text>
        
        <TouchableOpacity 
          style={[styles.captureBtn, capturing && { opacity: 0.6 }]} 
          activeOpacity={0.8} 
          onPress={handleCapture}
          disabled={capturing}
        >
          {capturing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="camera" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.captureBtnText}>TOMAR FOTOGRAFÍA DE MUESTRA</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#103F32',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#DCE7E1',
    marginTop: 12,
    fontWeight: '600',
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
  cameraWrapper: {
    flex: 1,
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: '#000',
  },
  topControls: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  modeBadge: {
    backgroundColor: 'rgba(16, 63, 50, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  cancelPill: {
    backgroundColor: 'rgba(16, 63, 50, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelPillText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
  },
  controls: {
    height: 120,
    backgroundColor: '#103F32',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  instruction: {
    color: '#DCE7E1',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  captureBtn: {
    width: '100%',
    backgroundColor: '#176B52',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  gpsContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(16, 63, 50, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#176B52',
  },
  gpsText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  gpsSignal: {
    color: '#DCE7E1',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
});
