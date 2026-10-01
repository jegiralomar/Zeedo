import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Menu, Search, User, ShieldCheck } from 'lucide-react-native';
import { AppTheme } from '../../theme/colors';
import { useAppStore } from '../../store/useAppStore';
import { getTranslation } from '../../i18n/translations';

interface HeaderProps {
  onMenuPress?: () => void;
  onSearchChange?: (text: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuPress, onSearchChange }) => {
  const { language, currentUser, openAuthModal, setActiveTab } = useAppStore();
  const t = getTranslation(language);
  const isRtl = language !== 'en';

  return (
    <View style={styles.container}>
      {/* Top Brand Bar */}
      <View style={[styles.topBar, isRtl && styles.topBarRtl]}>
        {/* Menu Button */}
        <TouchableOpacity
          onPress={() => setActiveTab('profile')}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Menu size={22} color={AppTheme.colors.textPrimary} />
        </TouchableOpacity>

        {/* Center Brand */}
        <TouchableOpacity
          onPress={() => setActiveTab('auctions')}
          style={[styles.brandContainer, isRtl && styles.brandContainerRtl]}
          activeOpacity={0.8}
        >
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>Z</Text>
          </View>
          <Text style={styles.brandTitle}>ZEEDO</Text>
          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </TouchableOpacity>

        {/* User Profile / Login */}
        <TouchableOpacity
          onPress={() => {
            if (currentUser) {
              setActiveTab('profile');
            } else {
              openAuthModal();
            }
          }}
          style={styles.profileButton}
          activeOpacity={0.8}
        >
          {currentUser ? (
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>
                {currentUser.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          ) : (
            <View style={styles.loginPill}>
              <User size={14} color={AppTheme.colors.primary} />
              <Text style={styles.loginPillText}>{t.loginBtn}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Input Bar (Matching Home page.jpg) */}
      <View style={[styles.searchBox, isRtl && styles.searchBoxRtl]}>
        <Search size={18} color={AppTheme.colors.textMuted} style={styles.searchIcon} />
        <TextInput
          placeholder={t.searchPlaceholder}
          placeholderTextColor={AppTheme.colors.textMuted}
          onChangeText={onSearchChange}
          style={[styles.searchInput, isRtl && styles.searchInputRtl]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppTheme.colors.card,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  topBarRtl: {
    flexDirection: 'row-reverse',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: AppTheme.radius.md,
    backgroundColor: AppTheme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandContainerRtl: {
    flexDirection: 'row-reverse',
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: AppTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadgeText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 18,
    fontFamily: 'monospace',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
    color: AppTheme.colors.textPrimary,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: AppTheme.colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: AppTheme.colors.primary,
  },
  liveText: {
    fontSize: 9,
    fontWeight: '800',
    color: AppTheme.colors.primary,
  },
  profileButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AppTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  loginPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: AppTheme.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: AppTheme.radius.full,
    borderWidth: 1,
    borderColor: '#FFE4E8',
  },
  loginPillText: {
    color: AppTheme.colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.radius.md,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  searchBoxRtl: {
    flexDirection: 'row-reverse',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: AppTheme.colors.textPrimary,
    height: '100%',
  },
  searchInputRtl: {
    textAlign: 'right',
  },
});
