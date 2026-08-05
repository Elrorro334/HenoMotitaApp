import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, useWindowDimensions } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { colors, fonts, spacing, borderRadius, layout } from '../../constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
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
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: spacing.xxxl, alignItems: 'center' }}
      >
        <View style={[styles.mainWrapper, { maxWidth: layout.contentMaxWidthAuth }]}>
          
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
              <Ionicons name="leaf" size={14} color={colors.primary} style={{ marginRight: 5 }} />
              <Text style={styles.userRole}>{getRoleTitle(user?.role)}</Text>
            </View>

            <Text style={styles.userInst}>UNIVERSIDAD TECNOLÓGICA DE TULA-TEPEJI (UTTT)</Text>
            <Text style={styles.userEmail}>{user?.email || 'Servidor Heno Motita'}</Text>
            
            {user?.enrollment && (
              <Text style={styles.userEnrollment}>Matrícula: {user.enrollment}</Text>
            )}
          </View>

          {/* Active Crew Info */}
          <View style={styles.sectionHeader}>
            <Ionicons name="people" size={20} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Cuadrilla Activa de Trabajo</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="location" size={20} color={colors.primary} />
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


          {/* Options & Logout */}
          <View style={styles.sectionHeader}>
            <Ionicons name="options-outline" size={20} color={colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Opciones de Sesión</Text>
          </View>

          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <View style={[styles.menuIconCircle, { backgroundColor: colors.errorBg }]}>
                <Ionicons name="log-out-outline" size={20} color={colors.errorBorder} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuText, { color: colors.errorBorder }]}>Cerrar Sesión</Text>
                <Text style={styles.menuSub}>Cerrar sesión de forma segura</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.errorBorder} />
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mainWrapper: {
    width: '100%',
    alignSelf: 'center',
  },
  profileHeaderCard: {
    backgroundColor: colors.mainSurface,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.headerGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 3,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  avatarWrapper: {
    marginBottom: spacing.md,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarInitial: {
    color: colors.mainSurface,
    fontFamily: fonts.display,
    fontSize: 34,
    fontWeight: '600',
  },
  userName: {
    fontFamily: fonts.display,
    fontSize: 22,
    fontWeight: '600',
    color: colors.headerGreen,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondaryButton,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.input,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  userRole: {
    fontFamily: fonts.base,
    fontSize: 12,
    fontWeight: '650',
    color: colors.primary,
  },
  userInst: {
    fontFamily: fonts.base,
    fontSize: 11,
    fontWeight: '650',
    color: colors.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  userEmail: {
    fontFamily: fonts.base,
    fontSize: 13,
    color: colors.textPrimary,
    marginTop: 2,
    fontWeight: '500',
  },
  userEnrollment: {
    fontFamily: fonts.base,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '650',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 15,
    fontWeight: '600',
    color: colors.headerGreen,
  },
  infoCard: {
    backgroundColor: colors.mainSurface,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.input,
    backgroundColor: colors.secondaryButton,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  infoTitle: {
    fontFamily: fonts.display,
    fontSize: 15,
    fontWeight: '600',
    color: colors.headerGreen,
  },
  infoSub: {
    fontFamily: fonts.base,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusPill: {
    backgroundColor: colors.positiveBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.input,
  },
  statusPillText: {
    fontFamily: fonts.base,
    fontSize: 11,
    fontWeight: '650',
    color: colors.positiveText,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  specLabel: {
    fontFamily: fonts.base,
    fontSize: 11.5,
    fontWeight: '650',
    color: colors.textSecondary,
    flex: 1,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  specVal: {
    fontFamily: fonts.base,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 2,
    textAlign: 'right',
  },
  menuContainer: {
    backgroundColor: colors.mainSurface,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuText: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '600',
  },
  menuSub: {
    fontFamily: fonts.base,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
});
