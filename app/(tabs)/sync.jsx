import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { Text, Button, Card, Snackbar, Portal, Modal, Chip, Divider } from 'react-native-paper';
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

  // Report Details Modal State
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

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

  const handleOpenDetails = (item) => {
    setSelectedItem(item);
    setDetailsVisible(true);
  };

  const handleCloseDetails = () => {
    setDetailsVisible(false);
    setSelectedItem(null);
  };

  const handleRemoveSingle = async (itemId) => {
    Alert.alert(
      'Eliminar Registro',
      '¿Deseas eliminar esta captura de la cola local?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await removePendingItem(itemId);
            handleCloseDetails();
            await loadQueue();
            setSnackbarMsg('Registro eliminado de la cola local.');
            setSnackbarVisible(true);
          },
        },
      ]
    );
  };

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
      'Enviar Registros al Sistema HenoTrack',
      `¿Deseas enviar ${items.length} evaluaciones almacenadas localmente a la plataforma HenoTrack?`,
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
              setSnackbarMsg(`¡Se sincronizaron exitosamente ${successCount} registros en la plataforma!`);
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
        <Text style={styles.title}>Sincronización de Datos</Text>
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
              No hay inspecciones pendientes en tu dispositivo. Todas las capturas de campo están almacenadas al corriente en el sistema HenoTrack.
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

            {items.map((item) => {
              const totalScore = item.scale ?? ((item.lowerThirdScore || 0) + (item.middleThirdScore || 0) + (item.upperThirdScore || 0));
              return (
                <Card 
                  key={item.id} 
                  style={styles.card} 
                  elevation={1}
                  onPress={() => handleOpenDetails(item)}
                >
                  <Card.Content style={styles.cardContent}>
                    <View style={styles.cardRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.treeIdText}>{item.treeCode || item.treeId || 'Sin Código'}</Text>
                        <Text style={styles.dateText}>
                          {new Date(item.createdAt || item.date).toLocaleString('es-MX')} · {item.species || 'Mezquite'}
                        </Text>
                      </View>

                      <View style={styles.scaleBadge}>
                        <Text style={styles.scaleText}>Hawksworth {totalScore}/6</Text>
                      </View>
                    </View>

                    <View style={styles.cardActionRow}>
                      <TouchableOpacity 
                        style={styles.detailsBtn} 
                        onPress={() => handleOpenDetails(item)}
                      >
                        <Ionicons name="eye-outline" size={16} color="#176B52" style={{ marginRight: 4 }} />
                        <Text style={styles.detailsBtnText}>Ver Detalles del Reporte</Text>
                      </TouchableOpacity>
                    </View>
                  </Card.Content>
                </Card>
              );
            })}
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
            Transmitir {items.length} Registro{items.length > 1 ? 's' : ''} al Sistema
          </Button>
        </View>
      )}

      {/* Report Details Modal */}
      <Portal>
        <Modal
          visible={detailsVisible}
          onDismiss={handleCloseDetails}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedItem && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>Detalles de la Inspección</Text>
                  <Text style={styles.modalSubtitle}>Código de Árbol: {selectedItem.treeCode || selectedItem.treeId || 'Sin Código'}</Text>
                </View>
                <TouchableOpacity onPress={handleCloseDetails} style={styles.closeBtn}>
                  <Ionicons name="close" size={24} color="#687A74" />
                </TouchableOpacity>
              </View>

              <Divider style={{ marginVertical: 12 }} />

              {/* Photo Evidence Preview */}
              {selectedItem.imageUri ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: selectedItem.imageUri }} style={styles.previewImage} resizeMode="cover" />
                  <View style={styles.imageBadge}>
                    <Ionicons name="camera" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={styles.imageBadgeText}>Fotografía Adjunta</Text>
                  </View>
                </View>
              ) : null}

              {/* Information Badges */}
              <View style={styles.detailRow}>
                <Ionicons name="leaf-outline" size={18} color="#176B52" style={{ marginRight: 8 }} />
                <Text style={styles.detailLabel}>Especie de Árbol:</Text>
                <Text style={styles.detailValue}>{selectedItem.species || 'Mezquite'}</Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={18} color="#176B52" style={{ marginRight: 8 }} />
                <Text style={styles.detailLabel}>Fecha y Hora:</Text>
                <Text style={styles.detailValue}>
                  {new Date(selectedItem.createdAt || selectedItem.date).toLocaleString('es-MX')}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={18} color="#176B52" style={{ marginRight: 8 }} />
                <Text style={styles.detailLabel}>Coordenadas GPS:</Text>
                <Text style={styles.detailValue}>
                  {selectedItem.latitude ? Number(selectedItem.latitude).toFixed(4) : '20.0551'}, {selectedItem.longitude ? Number(selectedItem.longitude).toFixed(4) : '-99.3407'}
                </Text>
              </View>

              <Divider style={{ marginVertical: 14 }} />

              {/* Hawksworth Breakdown */}
              <Text style={styles.sectionHeaderTitle}>Evaluación por Tercios (Hawksworth)</Text>
              
              <View style={styles.thirdsContainer}>
                <View style={styles.thirdBox}>
                  <Text style={styles.thirdBoxLabel}>Superior</Text>
                  <Text style={styles.thirdBoxScore}>{selectedItem.upperThirdScore ?? 0} / 2</Text>
                </View>
                <View style={styles.thirdBox}>
                  <Text style={styles.thirdBoxLabel}>Medio</Text>
                  <Text style={styles.thirdBoxScore}>{selectedItem.middleThirdScore ?? 0} / 2</Text>
                </View>
                <View style={styles.thirdBox}>
                  <Text style={styles.thirdBoxLabel}>Inferior</Text>
                  <Text style={styles.thirdBoxScore}>{selectedItem.lowerThirdScore ?? 0} / 2</Text>
                </View>
              </View>

              <View style={styles.totalScoreRow}>
                <Text style={styles.totalScoreLabel}>Afectación Total:</Text>
                <Chip style={styles.totalScoreChip} textStyle={{ color: '#D99A28', fontWeight: '800' }}>
                  {selectedItem.scale ?? ((selectedItem.lowerThirdScore || 0) + (selectedItem.middleThirdScore || 0) + (selectedItem.upperThirdScore || 0))} / 6 Puntos
                </Chip>
              </View>

              {/* Comments / Notes */}
              {selectedItem.comments ? (
                <View style={styles.commentsBox}>
                  <Text style={styles.commentsTitle}>Notas del Inspector:</Text>
                  <Text style={styles.commentsBody}>{selectedItem.comments}</Text>
                </View>
              ) : null}

              {/* Modal Actions */}
              <View style={styles.modalActionsRow}>
                <Button 
                  mode="outlined" 
                  onPress={() => handleRemoveSingle(selectedItem.id)} 
                  textColor="#C75B52"
                  style={{ borderColor: '#F9DCDA', borderRadius: 12, flex: 1 }}
                  icon={() => <Ionicons name="trash-outline" size={18} color="#C75B52" />}
                >
                  Eliminar
                </Button>
                <Button 
                  mode="contained" 
                  onPress={handleCloseDetails} 
                  buttonColor="#176B52"
                  style={{ borderRadius: 12, flex: 1, marginLeft: 8 }}
                >
                  Cerrar
                </Button>
              </View>
            </ScrollView>
          )}
        </Modal>
      </Portal>

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
    marginBottom: 12,
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
    fontSize: 16,
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
  cardActionRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#F0F5F2',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF6F1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  detailsBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#176B52',
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
  // Modal Details Styles
  modalContainer: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#163029',
  },
  modalSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#176B52',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
  },
  imageBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(16, 63, 50, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#687A74',
    marginRight: 6,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#163029',
    flex: 1,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#163029',
    marginBottom: 10,
  },
  thirdsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  thirdBox: {
    flex: 1,
    backgroundColor: '#F4F8F5',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DCE7E1',
  },
  thirdBoxLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#687A74',
    marginBottom: 2,
  },
  thirdBoxScore: {
    fontSize: 14,
    fontWeight: '900',
    color: '#176B52',
  },
  totalScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  totalScoreLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#163029',
  },
  totalScoreChip: {
    backgroundColor: '#FFF5DF',
  },
  commentsBox: {
    backgroundColor: '#F4F8F5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#176B52',
  },
  commentsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#176B52',
    marginBottom: 4,
  },
  commentsBody: {
    fontSize: 13,
    color: '#3F4E4A',
    lineHeight: 18,
  },
  modalActionsRow: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 4,
  },
});
