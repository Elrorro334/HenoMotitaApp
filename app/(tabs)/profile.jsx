import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, activeCrew, logoutUser } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Deseas salir del sistema fitosanitario institucional?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await logoutUser();
            router.replace('/');
          },
        },
      ]
    );
  };

  const getRoleTitle = (role) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Administrador API';
      case 'CREW_MANAGER': return 'Encargado Técnico de Cuadrilla';
      case 'STUDENT': return 'Alumno Inspector Fitosanitario';
      default: return 'Inspector Fitosanitario';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 36 }}>
      {/* User Institutional Profile Header */}
      <View style={styles.profileHeaderCard}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{(user?.name || 'U').charAt(0).toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.userName}>{user?.name || 'Usuario Fitosanitario'}</Text>
        
        {/* Role Badge */}
        <View style={styles.roleBadge}>
          <Ionicons name="leaf" size={14} color="#176B52" style={{ marginRight: 5 }} />
          <Text style={styles.userRole}>{getRoleTitle(user?.role)}</Text>
        </View>

        <Text style={styles.userInst}>UNIVERSIDAD TECNOLÓGICA DEL VALLE DEL MEZQUITAL (UTTT)</Text>
        <Text style={styles.userEmail}>{user?.email || 'Servidor Heno Motita'}</Text>
        
        {user?.enrollment && (
          <Text style={styles.userEnrollment}>Matrícula: {user.enrollment}</Text>
        )}
      </View>

      {/* Active Crew Info */}
      <View style={styles.sectionHeader}>
        <Ionicons name="people" size={20} color="#176B52" style={{ marginRight: 6 }} />
        <Text style={styles.sectionTitle}>Cuadrilla Activa de Trabajo</Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <View style={styles.infoIconBox}>
            <Ionicons name="location" size={20} color="#176B52" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>{activeCrew?.name || activeCrew?.code || 'Cuadrilla Campus UTTT'}</Text>
            <Text style={styles.infoSub}>Zona: {activeCrew?.zone || activeCrew?.institution || 'Campus Principal Tula-Tepeji'}</Text>
          </View>
          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>{activeCrew?.status || 'ACTIVA'}</Text>
          </View>
        </View>
      </View>

      {/* Institutional Research Project Info */}
      <View style={styles.sectionHeader}>
        <Ionicons name="flask-outline" size={20} color="#176B52" style={{ marginRight: 6 }} />
        <Text style={styles.sectionTitle}>Proyecto de Investigación UTTT</Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Investigación:</Text>
          <Text style={styles.specVal}>Monitoreo y Control Fitosanitario de Heno Motita (*Tillandsia recurvata*)</Text>
        </View>
        <Divider style={{ marginVertical: 8 }} />
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Docentes Lideres:</Text>
          <Text style={styles.specVal}>Dra. Marisol Reséndiz & Mtra. Odi</Text>
        </View>
        <Divider style={{ marginVertical: 8 }} />
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Desarrollo:</Text>
          <Text style={styles.specVal}>Estudiantes de Tecnologías de la Información (UTTT)</Text>
        </View>
        <Divider style={{ marginVertical: 8 }} />
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Municipios (8):</Text>
          <Text style={styles.specVal}>Tula, Tepeji, Atitalaquia, Tlaxcoapan, Tepetitlán, Tezontepec, Tlahuelilpan, Atotonilco</Text>
        </View>
        <Divider style={{ marginVertical: 8 }} />
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Especies Evaluadas:</Text>
          <Text style={styles.specVal}>Mezquites, Huizaches, Nopales y especies infestadas</Text>
        </View>
        <Divider style={{ marginVertical: 8 }} />
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Red de Instituciones:</Text>
          <Text style={styles.specVal}>UTTT, CECYTE, CETAC 2, COBAEH, UAEH</Text>
        </View>
        <Divider style={{ marginVertical: 8 }} />
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Frecuencia de Inspección:</Text>
          <Text style={styles.specVal}>Cada 15 Días (Escala Hawksworth 0 a 6)</Text>
        </View>
      </View>

      {/* System Specifications */}
      <View style={styles.sectionHeader}>
        <Ionicons name="shield-checkmark-outline" size={20} color="#176B52" style={{ marginRight: 6 }} />
        <Text style={styles.sectionTitle}>Metadatos del Sistema</Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Aplicación Móvil:</Text>
          <Text style={styles.specVal}>HenoTrack v1.0 (Bare Native)</Text>
        </View>
        <Divider style={{ marginVertical: 8 }} />
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Estado de Servicio:</Text>
          <Text style={styles.specVal}>Conexión Activa a Plataforma Central</Text>
        </View>
      </View>

      {/* Options & Logout */}
      <View style={styles.sectionHeader}>
        <Ionicons name="options-outline" size={20} color="#64748B" style={{ marginRight: 6 }} />
        <Text style={styles.sectionTitle}>Opciones de Sesión</Text>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <View style={[styles.menuIconCircle, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.menuText, { color: '#DC2626' }]}>Cerrar Sesión</Text>
            <Text style={styles.menuSub}>Desconectar token JWT y salir del sistema</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#DC2626" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  profileHeaderCard: {
    backgroundColor: '#FFFFFF',
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  avatarWrapper: {
    marginBottom: 12,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#176B52',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#176B52',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
  },
  userName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF6F1',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
    marginBottom: 8,
  },
  userRole: {
    fontSize: 12,
    fontWeight: '800',
    color: '#176B52',
  },
  userInst: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  userEmail: {
    fontSize: 13,
    color: '#334155',
    marginTop: 2,
    fontWeight: '600',
  },
  userEnrollment: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#163029',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EDF6F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  infoSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  specLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    flex: 1,
  },
  specVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    flex: 2,
    textAlign: 'right',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '800',
  },
  menuSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 1,
  },
});
