import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, useWindowDimensions } from 'react-native';
import { Text, Button, ProgressBar, TextInput } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { createTree, createObservation, uploadObservationImage, getTreesByCrew } from '../services/api';
import { savePendingInspection } from '../services/offlineStore';
import { colors, fonts, spacing, borderRadius, layout } from '../constants/theme';

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { width } = useWindowDimensions();
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
      return { 
        label: 'Afectación Severa', 
        color: colors.errorText, 
        border: colors.errorBorder,
        bg: colors.errorBg, 
        rec: 'Remoción manual inmediata del heno motita e inspección quincenal.' 
      };
    } else if (score >= 2) {
      return { 
        label: 'Afectación Media / Moderada', 
        color: colors.warningText, 
        border: colors.warningText,
        bg: colors.warningBg, 
        rec: 'Remoción selectiva y seguimiento quincenal.' 
      };
    } else {
      return { 
        label: 'Afectación Ligera / Sano', 
        color: colors.positiveText, 
        border: colors.positiveText,
        bg: colors.positiveBg, 
        rec: 'Monitoreo preventivo quincenal.' 
      };
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
      let treeId = null;
      const targetCode = treeCode.trim();

      // 1. Try creating or resolving existing tree
      try {
        const treeRes = await createTree(crewId, {
          code: targetCode,
          commonName: species.trim() || 'Mezquite',
          scientificName: species.trim() === 'Huizache' ? 'Acacia farnesiana' : 'Prosopis laevigata',
          latitude,
          longitude,
          locationDescription: zone.trim() ? `${zone.trim()}, ${municipality.trim()}` : municipality.trim() || 'Campus UTTT',
        });
        treeId = treeRes?.id || treeRes?._id || treeRes?.tree?.id || treeRes?.tree?._id || treeRes?.data?.id || treeRes?.data?._id;
      } catch (createErr) {
        // If tree already exists (409 Conflict), fetch crew trees to find its ID
        const existingTrees = await getTreesByCrew(crewId).catch(() => []);
        const treeList = Array.isArray(existingTrees) ? existingTrees : (existingTrees.trees || existingTrees.data || []);
        const found = treeList.find(t => (t.code || t.treeCode || '').toLowerCase() === targetCode.toLowerCase());
        if (found) {
          treeId = found.id || found._id;
        } else {
          throw createErr;
        }
      }

      if (!treeId) {
        throw new Error(`No se pudo resolver el ID para el árbol ${targetCode}`);
      }

      // 2. Create Observation in backend
      const obsRes = await createObservation(treeId, {
        observationDate: new Date().toISOString(),
        upperThirdScore: upperThird,
        middleThirdScore: middleThird,
        lowerThirdScore: lowerThird,
        notes: comments.trim() ? comments.trim() : undefined,
      });

      const obsId = obsRes?.id || obsRes?._id || obsRes?.observation?.id || obsRes?.observation?._id;

      // 3. Upload Image if available
      if (imageUri && obsId) {
        await uploadObservationImage(obsId, imageUri, 'evidencia_fitosanitaria.jpg').catch(err => {
          console.warn('Imagen no subida:', err);
        });
      }

      Alert.alert(
        '¡Inspección Registrada!',
        `La evaluación para el árbol ${targetCode} fue enviada al servidor API institucional.`,
        [{ text: 'Ver Panel', onPress: () => router.replace('/(tabs)/dashboard') }]
      );

    } catch (error) {
      console.warn('Error al guardar en backend, guardando offline:', error);
      await saveOffline();
    } finally {
      setSaving(false);
    }
  };

  const saveOffline = async () => {
    try {
      await savePendingInspection({
        treeCode: treeCode.trim() || `ARB-UTTT-${Math.floor(Math.random() * 1000)}`,
        species: species.trim() || 'Mezquite',
        municipality: municipality.trim() || 'Tula de Allende',
        zone: zone.trim() || 'Campus UTTT',
        latitude,
        longitude,
        accuracy,
        upperThirdScore: upperThird,
        middleThirdScore: middleThird,
        lowerThirdScore: lowerThird,
        scale: totalScore,
        comments: comments.trim(),
        imageUri,
      });

      Alert.alert(
        'Guardado Local Offline',
        'No se pudo conectar con el servidor central. El informe fue guardado en la cola local y podrás sincronizarlo desde la pestaña Sincronizar.',
        [{ text: 'Entendido', onPress: () => router.replace('/(tabs)/dashboard') }]
      );
    } catch (err) {
      Alert.alert('Error', 'No se pudo guardar la inspección offline.');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.mainWrapper, { maxWidth: layout.contentMaxWidthAuth }]}>

          {/* Section 1: Identification & Location */}
          <View style={styles.cardSection}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.stepNumberCircle}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Identificación del Árbol y Ubicación</Text>
                <Text style={styles.sectionSub}>Ingresa el código identificador y geolocalización GPS</Text>
              </View>
            </View>

            <TextInput
              label="Código Identificador del Árbol *"
              placeholder="Ej: ARB-UTTT-042"
              value={treeCode}
              onChangeText={setTreeCode}
              mode="outlined"
              outlineStyle={styles.inputOutline}
              style={styles.input}
              activeOutlineColor={colors.focusGreen}
              outlineColor={colors.borderLight}
              left={<TextInput.Icon icon={() => <Ionicons name="qr-code-outline" size={18} color={colors.textSecondary} />} />}
            />

            <View style={styles.rowInputs}>
              <TextInput
                label="Especie del Árbol"
                value={species}
                onChangeText={setSpecies}
                mode="outlined"
                outlineStyle={styles.inputOutline}
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                activeOutlineColor={colors.focusGreen}
                outlineColor={colors.borderLight}
              />
              <TextInput
                label="Municipio / Zona"
                value={municipality}
                onChangeText={setMunicipality}
                placeholder="Tula de Allende"
                mode="outlined"
                outlineStyle={styles.inputOutline}
                style={[styles.input, { flex: 1 }]}
                activeOutlineColor={colors.focusGreen}
                outlineColor={colors.borderLight}
              />
            </View>

            <View style={styles.gpsBadgeBox}>
              <Ionicons name="location-sharp" size={16} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.gpsBadgeText}>
                GPS: {latitude}, {longitude} (Precisión: ±{accuracy}m)
              </Text>
            </View>
          </View>

          {/* Section 2: Hawksworth Evaluation by Thirds */}
          <View style={styles.cardSection}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.stepNumberCircle}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Evaluación Escala Hawksworth (0 a 6)</Text>
                <Text style={styles.sectionSub}>Evalúa la densidad del Heno Motita en cada tercio del dosel</Text>
              </View>
            </View>

            {/* Upper Third */}
            <View style={styles.thirdBlock}>
              <Text style={styles.thirdTitle}>Tercio Superior (Copa ALTA):</Text>
              <View style={styles.scoreSelectorRow}>
                {[
                  { score: 0, label: '0: Sin Presencia' },
                  { score: 1, label: '1: Afectación Ligera' },
                  { score: 2, label: '2: Afectación Severa' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.score}
                    style={[styles.scoreChip, upperThird === item.score && styles.scoreChipActive]}
                    onPress={() => setUpperThird(item.score)}
                  >
                    <Text style={[styles.scoreChipNum, upperThird === item.score && styles.scoreChipNumActive]}>
                      {item.score}
                    </Text>
                    <Text style={[styles.scoreChipText, upperThird === item.score && styles.scoreChipTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Middle Third */}
            <View style={styles.thirdBlock}>
              <Text style={styles.thirdTitle}>Tercio Medio (Copa MEDIA):</Text>
              <View style={styles.scoreSelectorRow}>
                {[
                  { score: 0, label: '0: Sin Presencia' },
                  { score: 1, label: '1: Afectación Ligera' },
                  { score: 2, label: '2: Afectación Severa' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.score}
                    style={[styles.scoreChip, middleThird === item.score && styles.scoreChipActive]}
                    onPress={() => setMiddleThird(item.score)}
                  >
                    <Text style={[styles.scoreChipNum, middleThird === item.score && styles.scoreChipNumActive]}>
                      {item.score}
                    </Text>
                    <Text style={[styles.scoreChipText, middleThird === item.score && styles.scoreChipTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Lower Third */}
            <View style={styles.thirdBlock}>
              <Text style={styles.thirdTitle}>Tercio Inferior (Copa BAJA):</Text>
              <View style={styles.scoreSelectorRow}>
                {[
                  { score: 0, label: '0: Sin Presencia' },
                  { score: 1, label: '1: Afectación Ligera' },
                  { score: 2, label: '2: Afectación Severa' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.score}
                    style={[styles.scoreChip, lowerThird === item.score && styles.scoreChipActive]}
                    onPress={() => setLowerThird(item.score)}
                  >
                    <Text style={[styles.scoreChipNum, lowerThird === item.score && styles.scoreChipNumActive]}>
                      {item.score}
                    </Text>
                    <Text style={[styles.scoreChipText, lowerThird === item.score && styles.scoreChipTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Total Severity Banner */}
            <View style={[styles.resultBanner, { backgroundColor: severity.bg, borderLeftColor: severity.border }]}>
              <View style={styles.scoreCircleLarge}>
                <Text style={[styles.scoreNumLarge, { color: severity.color }]}>{totalScore}</Text>
                <Text style={styles.scoreMaxText}>/6</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.resultKicker}>DIAGNÓSTICO FITOSANITARIO</Text>
                <Text style={[styles.resultSeverityTitle, { color: severity.color }]}>{severity.label}</Text>
                <Text style={styles.resultRecText}>{severity.rec}</Text>
              </View>
            </View>
          </View>

          {/* Section 3: Photo Evidence & Observations */}
          <View style={styles.cardSection}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.stepNumberCircle}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Evidencia Fotográfica y Notas</Text>
                <Text style={styles.sectionSub}>Fotografía capturada e información técnica adicional</Text>
              </View>
            </View>

            <View style={styles.photoPreviewCard}>
              <Image source={imageSource} style={styles.photoPreviewImg} resizeMode="cover" />
              <View style={styles.photoBadge}>
                <Ionicons name="camera-outline" size={14} color={colors.textOnGreen} style={{ marginRight: 4 }} />
                <Text style={styles.photoBadgeText}>Evidencia Fotográfica Adjunta</Text>
              </View>
            </View>

            <TextInput
              label="Notas u Observaciones del Inspector"
              placeholder="Ej: Ramas secas en tercio medio. Se requiere poda preventiva..."
              value={comments}
              onChangeText={setComments}
              mode="outlined"
              multiline
              numberOfLines={3}
              outlineStyle={styles.inputOutline}
              style={styles.input}
              activeOutlineColor={colors.focusGreen}
              outlineColor={colors.borderLight}
            />

            <View style={styles.actions}>
              <Button
                mode="contained"
                onPress={handleSaveToBackend}
                loading={saving}
                disabled={saving || !treeCode.trim()}
                buttonColor={colors.primary}
                style={styles.saveButton}
                labelStyle={{ fontFamily: fonts.base, fontWeight: '650', fontSize: 15 }}
                contentStyle={{ paddingVertical: 10 }}
                icon={() => <Ionicons name="cloud-upload-outline" size={20} color={colors.mainSurface} />}
              >
                Enviar e Inspeccionar Árbol
              </Button>
            </View>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    alignItems: 'center',
  },
  mainWrapper: {
    width: '100%',
    alignSelf: 'center',
  },
  cardSection: {
    backgroundColor: colors.mainSurface,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderLeftWidth: layout.panelAccentBorderWidth,
    borderLeftColor: colors.accentGreen,
    shadowColor: colors.headerGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  stepNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  stepNumberText: {
    color: colors.mainSurface,
    fontFamily: fonts.display,
    fontWeight: '600',
    fontSize: 13,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '600',
    color: colors.headerGreen,
  },
  sectionSub: {
    fontFamily: fonts.base,
    fontSize: 12,
    color: colors.textSecondary,
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: colors.panelSurface,
    fontSize: 13,
    fontFamily: fonts.base,
  },
  inputOutline: {
    borderRadius: borderRadius.input, // 8px
    borderColor: colors.borderLight,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  gpsBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondaryButton,
    padding: spacing.md,
    borderRadius: borderRadius.input,
    marginTop: 4,
  },
  gpsBadgeText: {
    fontFamily: fonts.base,
    fontSize: 12,
    fontWeight: '650',
    color: colors.primary,
  },
  thirdBlock: {
    marginBottom: spacing.md,
  },
  thirdTitle: {
    fontFamily: fonts.base,
    fontSize: 13,
    fontWeight: '650',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  scoreSelectorRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  scoreChip: {
    flex: 1,
    backgroundColor: colors.panelSurface,
    borderRadius: borderRadius.select, // 12px
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  scoreChipActive: {
    backgroundColor: colors.secondaryButton,
    borderColor: colors.primary,
  },
  scoreChipNum: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  scoreChipNumActive: {
    color: colors.primary,
  },
  scoreChipText: {
    fontFamily: fonts.base,
    fontSize: 10,
    fontWeight: '650',
    color: colors.textSecondary,
    marginTop: 2,
  },
  scoreChipTextActive: {
    color: colors.primary,
    fontWeight: '650',
  },
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.card,
    borderLeftWidth: layout.panelAccentBorderWidth,
    marginTop: 6,
  },
  scoreCircleLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.mainSurface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexDirection: 'row',
  },
  scoreNumLarge: {
    fontFamily: fonts.display,
    fontSize: 22,
    fontWeight: '600',
  },
  scoreMaxText: {
    fontFamily: fonts.base,
    fontSize: 11,
    fontWeight: '650',
    color: colors.textSecondary,
  },
  resultKicker: {
    fontFamily: fonts.base,
    fontSize: 10,
    fontWeight: '650',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  resultSeverityTitle: {
    fontFamily: fonts.display,
    fontSize: 15,
    fontWeight: '600',
  },
  resultRecText: {
    fontFamily: fonts.base,
    fontSize: 11.5,
    color: colors.textPrimary,
    marginTop: 2,
    lineHeight: 16,
  },
  photoPreviewCard: {
    position: 'relative',
    borderRadius: borderRadius.card,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  photoPreviewImg: {
    width: '100%',
    height: 180,
  },
  photoBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(23, 53, 38, 0.88)',
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: borderRadius.input,
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoBadgeText: {
    color: colors.textOnGreen,
    fontWeight: '650',
    fontFamily: fonts.base,
    fontSize: 11,
  },
  actions: {
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.button,
  },
});
