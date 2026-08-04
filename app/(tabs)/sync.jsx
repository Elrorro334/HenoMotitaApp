import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Text, Button, Card, Snackbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getPendingQueue, clearPendingQueue, removePendingItem } from '../../services/offlineStore';
import { createTree, createObservation, uploadObservationImage } from '../../services/api';

export default function SyncScreen() {
  const { activeCrew, crews } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  const loadQueue = async () => {
    setLoading(true);
    try {
      const queue = await getPendingQueue();
      setItems(queue);
    } catch (err) {
      console.warn('Error loading pending queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleSync = async () => {
    if (items.length === 0) {
      Alert.alert('Sincronización HenoTrack', 'No hay registros offline pendientes por transmitir.');
      return;
    }

    const crewId = activeCrew?.id || activeCrew?._id || (crews && crews[0] ? (crews[0].id || crews[0]._id) : null);
    if (!crewId) {
      Alert.alert('Sesión Requerida', 'Debes iniciar sesión con una cuenta de alumno y cuadrilla activa para transmitir registros.');
      return;
    }

    Alert.alert(
      'Enviar Registros al Servidor HenoTrack',
      `¿Deseas enviar ${items.length} evaluaciones almacenadas localmente al servidor institucional en Render?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar Ahora',
          onPress: async () => {
            setSyncing(true);
            let successCount = 0;
            let errorCount = 0;

            for (const item of items) {
              try {
                // 1. Create Tree
                const treeRes = await createTree(crewId, {
                  code: item.treeCode || item.treeId || `ARB-UTTT-${Math.floor(Math.random() * 1000)}`,
                  commonName: item.species || 'Mezquite',
                  scientificName: 'Prosopis laevigata',
                  latitude: item.latitude || 20.0551,
                  longitude: item.longitude || -99.3407,
                  locationDescription: item.zone ? `${item.zone}, ${item.municipality || 'Tula'}` : 'Campus UTTT Tula-Tepeji',
                });

                const treeId = treeRes.id || treeRes._id;

                // 2. Create Observation
                const obsRes = await createObservation(treeId, {
                  lowerThirdScore: item.lowerThirdScore ?? 1,
                  middleThirdScore: item.middleThirdScore ?? 1,
                  upperThirdScore: item.upperThirdScore ?? 1,
                  notes: item.comments || 'Sincronizado desde cola offline HenoTrack.',
                  observationDate: item.date || new Date().toISOString(),
                  latitude: item.latitude || 20.0551,
                  longitude: item.longitude || -99.3407,
                });

                const obsId = obsRes.id || obsRes._id;

                // 3. Upload Image if available
                if (item.imageUri && obsId) {
                  await uploadObservationImage(obsId, item.imageUri, item.comments).catch(() => null);
                }

                await removePendingItem(item.id);
                successCount++;
              } catch (err) {
                console.warn('Error syncing item:', item.id, err);
                errorCount++;
              }
            }

            await loadQueue();
            setSyncing(false);

            if (errorCount === 0) {
              setSnackbarMsg(`¡Se sincronizaron exitosamente ${successCount} registros con MongoDB Atlas!`);
            } else {
              setSnackbarMsg(`Se enviaron ${successCount} registros. ${errorCount} no pudieron procesarse.`);
            }
            setSnackbarVisible(true);
          },
        },
      ]
    );
  };

  const handleClearAll = async () => {
    Alert.alert(
      'Vaciar Cola Offline',
      '¿Deseas eliminar todos los borradores locales? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Vaciar Todo',
          style: 'destructive',
          onPress: async () => {
            await clearPendingQueue();
            await loadQueue();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Intro */}
      <View style={styles.headerBanner}>
        <View style={styles.badgeRow}>
          <Ionicons name="cloud-upload" size={14} color="#176B52" style={{ marginRight: 4 }} />
          <Text style={styles.badgeText}>Sincronización HenoTrack · Offline First</Text>
        </View>
        <Text style={styles.title}>Transmisión a Servidor API</Text>
        <Text style={styles.subtitle}>
          Inspecciones guardadas en almacenamiento local cuando no hay conexión a internet.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#176B52" />
            <Text style={{ color: '#687A74', marginTop: 8, fontSize: 12 }}>Consultando cola offline local...</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="cloud-done" size={40} color="#176B52" />
            </View>
            <Text style={styles.emptyTitle}>Todo Sincronizado</Text>
            <Text style={styles.emptySubtitle}>
              No hay inspecciones pendientes en tu dispositivo. Todas las capturas de campo están almacenadas en el servidor de MongoDB Atlas.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.summaryBar}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="documents-outline" size={18} color="#176B52" style={{ marginRight: 6 }} />
                <Text style={styles.summaryText}>{items.length} Pendiente{items.length > 1 ? 's' : ''} de Envío</Text>
              </View>

              <Button mode="text" onPress={handleClearAll} textColor="#C75B52" compact labelStyle={{ fontSize: 12 }}>
                Vaciar Cola
              </Button>
            </View>

            {items.map((item) => (
              <Card key={item.id} style={styles.card} elevation={1}>
                <Card.Content style={styles.cardContent}>
                  <View style={styles.cardRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.treeIdText}>{item.treeCode || item.treeId || 'Sin Código'}</Text>
                      <Text style={styles.dateText}>
                        {new Date(item.createdAt || item.date).toLocaleString('es-MX')} · {item.species || 'Mezquite'}
                      </Text>
                    </View>

                    <View style={styles.scaleBadge}>
                      <Text style={styles.scaleText}>Hawksworth {item.scale ?? (item.lowerThirdScore + item.middleThirdScore + item.upperThirdScore)}/6</Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </>
        )}
      </ScrollView>

      {items.length > 0 && (
        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={handleSync}
            loading={syncing}
            disabled={syncing}
            buttonColor="#176B52"
            style={styles.syncButton}
            labelStyle={{ fontWeight: '900', fontSize: 15 }}
            contentStyle={{ paddingVertical: 8 }}
            icon={() => <Ionicons name="cloud-upload" size={20} color="#FFFFFF" />}
          >
            Transmitir {items.length} Registro{items.length > 1 ? 's' : ''} a la API
          </Button>
        </View>
      )}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        style={{ backgroundColor: '#103F32' }}
      >
        {snackbarMsg}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F8F5',
  },
  headerBanner: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#DCE7E1',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF6F1',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#176B52',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#163029',
  },
  subtitle: {
    fontSize: 12,
    color: '#687A74',
    marginTop: 2,
    lineHeight: 16,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#163029',
  },
  card: {
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCE7E1',
  },
  cardContent: {
    padding: 14,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  treeIdText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#163029',
  },
  dateText: {
    fontSize: 12,
    color: '#687A74',
    marginTop: 2,
  },
  scaleBadge: {
    backgroundColor: '#FFF5DF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  scaleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D99A28',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 48,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EDF6F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#163029',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#687A74',
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '500',
    lineHeight: 18,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#103F32',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#DCE7E1',
  },
  syncButton: {
    borderRadius: 16,
  },
});
