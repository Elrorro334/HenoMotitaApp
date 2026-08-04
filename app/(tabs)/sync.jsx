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
      Alert.alert('Sincronización UTTT', 'No hay registros offline pendientes por sincronizar.');
      return;
    }

    const crewId = activeCrew?.id || activeCrew?._id || (crews && crews[0] ? (crews[0].id || crews[0]._id) : null);
    if (!crewId) {
      Alert.alert('Sesión Requerida', 'Debes iniciar sesión con una cuenta y cuadrilla activa para enviar registros al servidor central.');
      return;
    }

    Alert.alert(
      'Enviar Registros al Servidor',
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
                  latitude: item.latitude || 20.0500,
                  longitude: item.longitude || -99.3400,
                  locationDescription: 'Campus UTTT Tula-Tepeji',
                });

                const treeId = treeRes.id || treeRes._id;

                // 2. Create Observation
                const obsRes = await createObservation(treeId, {
                  lowerThirdScore: item.lowerThirdScore ?? 1,
                  middleThirdScore: item.middleThirdScore ?? 1,
                  upperThirdScore: item.upperThirdScore ?? 1,
                  notes: item.comments || 'Sincronizado desde cola offline.',
                  observationDate: item.date || new Date().toISOString(),
                  latitude: item.latitude || 20.0500,
                  longitude: item.longitude || -99.3400,
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
              setSnackbarMsg(`¡${successCount} registros transmitidos con éxito al servidor UTTT!`);
              setSnackbarVisible(true);
            } else {
              Alert.alert(
                'Sincronización Parcial',
                `Se enviaron ${successCount} registros. ${errorCount} registros fallaron y se mantuvieron en la cola offline.`
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Info Box */}
      <View style={styles.headerCard}>
        <View style={styles.headerIconCircle}>
          <Ionicons name="cloud-upload-outline" size={26} color="#16A34A" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Evaluaciones Almacenadas Localmente</Text>
          <Text style={styles.headerSub}>
            Registros realizados sin conexión a internet en el campus UTTT listos para su envío a MongoDB Atlas.
          </Text>
        </View>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#16A34A" />
            <Text style={{ color: '#64748B', marginTop: 8, fontSize: 13 }}>Consultando registros en almacenamiento local...</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="checkmark-done-circle" size={48} color="#16A34A" />
            </View>
            <Text style={styles.emptyTitle}>Sincronización Completa</Text>
            <Text style={styles.emptySubtitle}>
              Todos los datos registrados en el dispositivo han sido transmitidos exitosamente al servidor central de la UTTT.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            <Text style={styles.pendingSectionTitle}>
              Registros Pendientes de Envío ({items.length})
            </Text>

            {items.map((item) => (
              <Card key={item.id} style={styles.card} mode="contained">
                <Card.Content style={styles.cardContent}>
                  <View style={styles.cardRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.treeIdText}>Código: {item.treeCode || item.treeId}</Text>
                      <Text style={styles.dateText}>
                        Caputra: {new Date(item.createdAt || item.date).toLocaleString('es-MX')}
                      </Text>
                    </View>

                    <View style={styles.scaleBadge}>
                      <Text style={styles.scaleText}>Hawksworth: {item.scale} / 6</Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          mode="contained" 
          onPress={handleSync}
          loading={syncing}
          disabled={syncing || items.length === 0}
          style={[
            styles.syncButton, 
            { backgroundColor: items.length > 0 ? '#16A34A' : '#CBD5E1' }
          ]}
          labelStyle={{ fontSize: 15, fontWeight: '800' }}
          contentStyle={{ paddingVertical: 8 }}
          icon={() => <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" />}
        >
          {syncing ? 'Transmitiendo a Servidor...' : `Enviar Registros al Servidor (${items.length})`}
        </Button>
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3500}
        style={{ borderRadius: 14, backgroundColor: '#16A34A' }}
      >
        {snackbarMsg}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerCard: {
    padding: 18,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '500',
    lineHeight: 16,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  pendingSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    color: '#0F172A',
  },
  dateText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  scaleBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  scaleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D97706',
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
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
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
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 6,
  },
  syncButton: {
    borderRadius: 16,
  },
});
