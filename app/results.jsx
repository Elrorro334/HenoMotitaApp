import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, TouchableOpacity } from 'react-native';
import { Text, Button, ProgressBar, TextInput } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { createTree, createObservation, uploadObservationImage } from '../services/api';
import { savePendingInspection } from '../services/offlineStore';

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { activeCrew, crews, user } = useAuth();

  const [saving, setSaving] = useState(false);

  // Step 1: Identification
  const [municipality, setMunicipality] = useState('');
  const [zone, setZone] = useState(activeCrew?.name || activeCrew?.institution || '');
  const [treeCode, setTreeCode] = useState(params.treeCode || '');
  const [species, setSpecies] = useState('Mezquite');
  
  const latitude = parseFloat(params.lat) || 20.0551;
  const longitude = parseFloat(params.lng) || -99.3407;
  const accuracy = params.accuracy || '3';

  // Step 2: Evaluation by Thirds (0 = Sin presencia, 1 = Ligera, 2 = Severa)
  const [upperThird, setUpperThird] = useState(2);
  const [middleThird, setMiddleThird] = useState(1);
  const [lowerThird, setLowerThird] = useState(2);

  const totalScore = upperThird + middleThird + lowerThird;

  // Step 3: Evidence & Notes
  const [comments, setComments] = useState('');
  const imageUri = params.imageUri || '';
  const imageSource = imageUri 
    ? { uri: imageUri }
    : { uri: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=800' };

  const getSeverityInfo = (score) => {
    if (score >= 4) {
      return { label: 'Afectación Severa', color: '#C75B52', bg: '#FFF0EE', rec: 'Remoción manual inmediata del heno motita e inspección quincenal.' };
    } else if (score >= 2) {
      return { label: 'Afectación Media / Moderada', color: '#D99A28', bg: '#FFF5DF', rec: 'Remoción selectiva y seguimiento quincenal.' };
    } else {
      return { label: 'Afectación Ligera / Sano', color: '#176B52', bg: '#EDF6F1', rec: 'Monitoreo preventivo quincenal.' };
    }
  };

  const severity = getSeverityInfo(totalScore);

  const handleSaveToBackend = async () => {
    if (!treeCode.trim()) {
      Alert.alert('Campo Requerido', 'Por favor ingresa el código identificador del árbol.');
      return;
    }

    setSaving(true);
    const crewId = activeCrew?.id || activeCrew?._id || (crews && crews[0] ? (crews[0].id || crews[0]._id) : null);

    if (!crewId) {
      Alert.alert('Cuadrilla No Asignada', 'No tienes una cuadrilla activa. Se almacenará en la cola offline.');
      await saveOffline();
      setSaving(false);
      return;
    }

    try {
      // 1. Create Tree in backend
      const treeRes = await createTree(crewId, {
        code: treeCode.trim(),
        commonName: species.trim() || 'Mezquite',
        scientificName: species.trim() === 'Mezquite' ? 'Prosopis laevigata' : 'Acacia farnesiana',
        latitude,
        longitude,
        locationDescription: zone.trim() ? `${zone.trim()}, ${municipality.trim()}` : municipality.trim() || 'Campus UTTT',
      });

      const treeId = treeRes.id || treeRes._id;

      // 2. Create Observation in backend
      const obsRes = await createObservation(treeId, {
        lowerThirdScore: lowerThird,
        middleThirdScore: middleThird,
        upperThirdScore: upperThird,
        notes: comments.trim() || `Formulario HenoTrack`,
        observationDate: new Date().toISOString(),
        latitude,
        longitude,
      });

      const obsId = obsRes.id || obsRes._id;

      // 3. Upload photo evidence if available
      if (imageUri && obsId) {
        await uploadObservationImage(obsId, imageUri, comments.trim()).catch((err) => {
          console.warn('Error subiendo imagen a Cloudinary:', err);
        });
      }

      Alert.alert(
        '¡Registro Guardado!',
        `La inspección del árbol ${treeCode} (Valoración ${totalScore}/6) se registró exitosamente en el sistema HenoTrack.`,
        [{ text: 'Aceptar', onPress: () => router.replace('/(tabs)/dashboard') }]
      );
    } catch (error) {
      console.warn('Error enviando a API HenoTrack, guardando offline:', error);
      await saveOffline();
    } finally {
      setSaving(false);
    }
  };

  const saveOffline = async () => {
    try {
      await savePendingInspection({
        treeCode: treeCode.trim(),
        treeId: treeCode.trim(),
        species,
        scale: totalScore,
        date: new Date().toISOString(),
        comments,
        imageUri,
        lowerThirdScore: lowerThird,
        middleThirdScore: middleThird,
        upperThirdScore: upperThird,
        latitude,
        longitude,
        municipality,
        zone,
      });

      Alert.alert(
        'Guardado en Cola Offline',
        'La inspección se ha almacenado localmente y podrá transmitirse en la pestaña "Sincronizar".',
        [{ text: 'Entendido', onPress: () => router.replace('/(tabs)/dashboard') }]
      );
    } catch (err) {
      Alert.alert('Error', 'No se pudo guardar la inspección localmente.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 36 }} showsVerticalScrollIndicator={false}>
      {/* Header Intro Banner */}
      <View style={styles.headerIntro}>
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>Formulario Estandarizado HenoTrack</Text>
        </View>
        <Text style={styles.formTitle}>Nueva Inspección de Campo</Text>
        <Text style={styles.formSub}>Registra la ubicación, valoración por tercios y evidencia fotográfica.</Text>
      </View>

      <View style={styles.content}>
        {/* Step 1: Identification */}
        <View style={styles.formCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.stepNumberCircle}><Text style={styles.stepNumberText}>1</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Identificación del Registro</Text>
              <Text style={styles.sectionSub}>Ubicación y datos del árbol asignado</Text>
            </View>
          </View>

          <TextInput
            label="Identificador del Árbol *"
            placeholder="Ej. ARB-UTTT-015"
            value={treeCode}
            onChangeText={setTreeCode}
            mode="outlined"
            outlineStyle={styles.inputOutline}
            style={styles.input}
            activeOutlineColor="#176B52"
          />

          <View style={styles.rowInputs}>
            <View style={{ flex: 1 }}>
              <TextInput
                label="Municipio"
                placeholder="Ej. Tula"
                value={municipality}
                onChangeText={setMunicipality}
                mode="outlined"
                outlineStyle={styles.inputOutline}
                style={styles.input}
                activeOutlineColor="#176B52"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <TextInput
                label="Especie *"
                placeholder="Ej. Mezquite"
                value={species}
                onChangeText={setSpecies}
                mode="outlined"
                outlineStyle={styles.inputOutline}
                style={styles.input}
                activeOutlineColor="#176B52"
              />
            </View>
          </View>

          <TextInput
            label="Zona o Institución"
            placeholder="Ej. UTTT Campus Principal"
            value={zone}
            onChangeText={setZone}
            mode="outlined"
            outlineStyle={styles.inputOutline}
            style={styles.input}
            activeOutlineColor="#176B52"
          />

          <View style={styles.gpsBadgeBox}>
            <Ionicons name="location" size={16} color="#176B52" style={{ marginRight: 6 }} />
            <Text style={styles.gpsBadgeText}>
              Coordenadas GPS: {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°W (±{accuracy}m)
            </Text>
          </View>
        </View>

        {/* Step 2: Evaluation by Thirds */}
        <View style={styles.formCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.stepNumberCircle}><Text style={styles.stepNumberText}>2</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Valoración por Tercios (Hawksworth 0-6)</Text>
              <Text style={styles.sectionSub}>Califica cada sección de la copa: 0 sano, 1 ligera, 2 severa</Text>
            </View>
          </View>

          {/* Third 1: Upper */}
          <View style={styles.thirdBlock}>
            <Text style={styles.thirdTitle}>Tercio Superior (Copa Alta)</Text>
            <View style={styles.scoreSelectorRow}>
              {[0, 1, 2].map((val) => (
                <TouchableOpacity 
                  key={val}
                  style={[styles.scoreChip, upperThird === val && styles.scoreChipActive]}
                  onPress={() => setUpperThird(val)}
                >
                  <Text style={[styles.scoreChipNum, upperThird === val && styles.scoreChipNumActive]}>{val}</Text>
                  <Text style={[styles.scoreChipText, upperThird === val && styles.scoreChipTextActive]}>
                    {val === 0 ? 'Sin presencia' : val === 1 ? 'Ligera' : 'Severa'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Third 2: Middle */}
          <View style={styles.thirdBlock}>
            <Text style={styles.thirdTitle}>Tercio Medio</Text>
            <View style={styles.scoreSelectorRow}>
              {[0, 1, 2].map((val) => (
                <TouchableOpacity 
                  key={val}
                  style={[styles.scoreChip, middleThird === val && styles.scoreChipActive]}
                  onPress={() => setMiddleThird(val)}
                >
                  <Text style={[styles.scoreChipNum, middleThird === val && styles.scoreChipNumActive]}>{val}</Text>
                  <Text style={[styles.scoreChipText, middleThird === val && styles.scoreChipTextActive]}>
                    {val === 0 ? 'Sin presencia' : val === 1 ? 'Ligera' : 'Severa'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Third 3: Lower */}
          <View style={styles.thirdBlock}>
            <Text style={styles.thirdTitle}>Tercio Inferior (Base de la Copa)</Text>
            <View style={styles.scoreSelectorRow}>
              {[0, 1, 2].map((val) => (
                <TouchableOpacity 
                  key={val}
                  style={[styles.scoreChip, lowerThird === val && styles.scoreChipActive]}
                  onPress={() => setLowerThird(val)}
                >
                  <Text style={[styles.scoreChipNum, lowerThird === val && styles.scoreChipNumActive]}>{val}</Text>
                  <Text style={[styles.scoreChipText, lowerThird === val && styles.scoreChipTextActive]}>
                    {val === 0 ? 'Sin presencia' : val === 1 ? 'Ligera' : 'Severa'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Automatic Total Hawksworth Result Banner */}
          <View style={[styles.resultBanner, { backgroundColor: severity.bg, borderLeftColor: severity.color }]}>
            <View style={styles.scoreCircleLarge}>
              <Text style={styles.scoreNumLarge}>{totalScore}</Text>
              <Text style={styles.scoreMaxText}>/ 6</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.resultKicker}>Resultado Automático Hawksworth</Text>
              <Text style={[styles.resultSeverityTitle, { color: severity.color }]}>{severity.label}</Text>
              <Text style={styles.resultRecText}>{severity.rec}</Text>
            </View>
          </View>
        </View>

        {/* Step 3: Evidence & Notes */}
        <View style={styles.formCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.stepNumberCircle}><Text style={styles.stepNumberText}>3</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Evidencia Fotográfica y Notas</Text>
              <Text style={styles.sectionSub}>Fotografía para el expediente quincenal</Text>
            </View>
          </View>

          {imageUri ? (
            <View style={styles.photoPreviewCard}>
              <Image source={imageSource} style={styles.photoPreviewImg} resizeMode="cover" />
              <View style={styles.photoBadge}>
                <Ionicons name="camera" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.photoBadgeText}>Evidencia de Campo</Text>
              </View>
            </View>
          ) : null}

          <TextInput
            label="Observaciones del Inspector"
            placeholder="Añade notas sobre el estado foliar, presencia de musgo o ramas podadas..."
            value={comments}
            onChangeText={setComments}
            mode="outlined"
            multiline
            numberOfLines={3}
            outlineStyle={styles.inputOutline}
            style={styles.input}
            activeOutlineColor="#176B52"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button 
            mode="contained" 
            onPress={handleSaveToBackend}
            loading={saving}
            disabled={saving}
            style={styles.saveButton}
            labelStyle={{ fontSize: 15, fontWeight: '800' }}
            contentStyle={{ paddingVertical: 8 }}
            icon={() => <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" />}
          >
            Guardar Inspección en Servidor API
          </Button>

          <Button 
            mode="outlined" 
            onPress={() => router.replace('/(tabs)/dashboard')}
            textColor="#687A74"
            disabled={saving}
            labelStyle={{ fontWeight: '700' }}
            style={{ marginTop: 10, borderRadius: 14, borderColor: '#DCE7E1' }}
            icon={() => <Ionicons name="trash-outline" size={18} color="#687A74" />}
          >
            Descartar Inspección
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F8F5',
  },
  headerIntro: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#DCE7E1',
  },
  stepBadge: {
    backgroundColor: '#EDF6F1',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#176B52',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#163029',
  },
  formSub: {
    fontSize: 12,
    color: '#687A74',
    marginTop: 2,
  },
  content: {
    padding: 16,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#DCE7E1',
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  stepNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#176B52',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#163029',
  },
  sectionSub: {
    fontSize: 11,
    color: '#687A74',
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#F4F8F5',
    fontSize: 13,
  },
  inputOutline: {
    borderRadius: 12,
    borderColor: '#DCE7E1',
  },
  rowInputs: {
    flexDirection: 'row',
  },
  gpsBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF6F1',
    padding: 10,
    borderRadius: 12,
    marginTop: 4,
  },
  gpsBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#176B52',
  },
  thirdBlock: {
    marginBottom: 14,
  },
  thirdTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#163029',
    marginBottom: 6,
  },
  scoreSelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  scoreChip: {
    flex: 1,
    backgroundColor: '#F4F8F5',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DCE7E1',
  },
  scoreChipActive: {
    backgroundColor: '#EDF6F1',
    borderColor: '#176B52',
  },
  scoreChipNum: {
    fontSize: 16,
    fontWeight: '900',
    color: '#687A74',
  },
  scoreChipNumActive: {
    color: '#176B52',
  },
  scoreChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#687A74',
    marginTop: 2,
  },
  scoreChipTextActive: {
    color: '#176B52',
    fontWeight: '800',
  },
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderLeftWidth: 4,
    marginTop: 6,
  },
  scoreCircleLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexDirection: 'row',
  },
  scoreNumLarge: {
    fontSize: 22,
    fontWeight: '900',
    color: '#163029',
  },
  scoreMaxText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#687A74',
  },
  resultKicker: {
    fontSize: 10,
    fontWeight: '800',
    color: '#687A74',
    textTransform: 'uppercase',
  },
  resultSeverityTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  resultRecText: {
    fontSize: 11,
    color: '#163029',
    marginTop: 2,
    lineHeight: 15,
  },
  photoPreviewCard: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
  },
  photoPreviewImg: {
    width: '100%',
    height: 180,
  },
  photoBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(23, 107, 82, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
  },
  actions: {
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: '#176B52',
    borderRadius: 16,
  },
});
