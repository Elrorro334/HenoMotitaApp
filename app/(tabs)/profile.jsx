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
          <Ionicons name="leaf" size={14} color="#16A34A" style={{ marginRight: 5 }} />
          <Text style={styles.userRole}>{getRoleTitle(user?.role)}</Text>
        </View>

        <Text style={styles.userInst}>UNIVERSIDAD TECNOLÓGICA DE TULA-TEPEJI</Text>
        <Text style={styles.userEmail}>{user?.email || 'Servidor Heno Motita'}</Text>
        
        {user?.enrollment && (
          <Text style={styles.userEnrollment}>Matrícula: {user.enrollment}</Text>
        )}
      </View>

      {/* Active Crew Info */}
      <View style={styles.sectionHeader}>
        <Ionicons name="people" size={20} color="#16A34A" style={{ marginRight: 6 }} />
        <Text style={styles.sectionTitle}>Cuadrilla Activa de Trabajo</Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <View style={styles.infoIconBox}>
            <Ionicons name="location" size={20} color="#16A34A" />
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

      {/* System Information */}
      <View style={styles.sectionHeader}>
        <Ionicons name="shield-checkmark-outline" size={20} color="#176B52" style={{ marginRight: 6 }} />
        <Text style={styles.sectionTitle}>Información de la Aplicación</Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Sistema:</Text>
          <Text style={styles.specVal}>HenoTrack Móvil v1.0</Text>
        </View>
        <Divider style={{ marginVertical: 8 }} />
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Estado de Conexión:</Text>
          <Text style={styles.specVal}>Servicio Activo</Text>
        </View>
        <Divider style={{ marginVertical: 8 }} />
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Institución:</Text>
          <Text style={styles.specVal}>UTTT - Valle del Mezquital</Text>
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
            <Text style={styles.menuSub}>Desconectar token JWT y salir</Text>
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
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#16A34A',
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
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginTop: 6,
  },
  userRole: {
    fontSize: 13,
    fontWeight: '800',
    color: '#16A34A',
  },
  userInst: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 6,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  userEnrollment: {
    fontSize: 12,
    color: '#0284C7',
    marginTop: 2,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DCFCE7',
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
    color: '#16A34A',
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  specVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  menuContainer: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  menuItem: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  menuSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
});
