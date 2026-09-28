import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { TOKENS } from '../theme/tokens';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { isRTL } from '../i18n/translations';
import {
  Bell,
  Zap,
  Trophy,
  Package,
  Timer,
  Info,
  CheckCheck,
  X,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react-native';
import { AppNotification } from '../types';

interface NotificationCenterModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectAuction?: (auctionId: string) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  visible,
  onClose,
  onSelectAuction,
}) => {
  const { language } = useAuthStore();
  const rtl = isRTL(language);
  const { notifications, markAsRead, markAllAsRead, unreadCount } =
    useNotificationStore();

  const [activeFilter, setActiveFilter] = useState<'all' | 'bids' | 'delivery'>('all');

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'bids') return n.type === 'outbid' || n.type === 'auction_won';
    if (activeFilter === 'delivery') return n.type === 'delivery';
    return true;
  });

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'outbid':
        return <Zap size={18} color="#FFFFFF" />;
      case 'auction_won':
        return <Trophy size={18} color="#FFFFFF" />;
      case 'delivery':
        return <Package size={18} color="#FFFFFF" />;
      case 'ending_soon':
        return <Timer size={18} color="#FFFFFF" />;
      default:
        return <Info size={18} color="#FFFFFF" />;
    }
  };

  const getIconBg = (type: AppNotification['type']) => {
    switch (type) {
      case 'outbid':
        return TOKENS.colors.primary; // Red/orange alert
      case 'auction_won':
        return TOKENS.colors.secondary; // Green victory
      case 'delivery':
        return '#0284C7'; // Blue dispatch
      case 'ending_soon':
        return '#EAB308'; // Yellow timer
      default:
        return TOKENS.colors.textMuted;
    }
  };

  const handleNotificationPress = (notif: AppNotification) => {
    markAsRead(notif.id);
    if (notif.auctionId && onSelectAuction) {
      onSelectAuction(notif.auctionId);
      onClose();
    }
  };

  const count = unreadCount();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={[styles.headerRow, rtl && styles.rtlRow]}>
            <View style={[styles.titleGroup, rtl && styles.rtlRow]}>
              <View style={styles.bellIconCircle}>
                <Bell size={18} color={TOKENS.colors.primary} />
                {count > 0 && <View style={styles.headerDot} />}
              </View>
              <View>
                <View style={[styles.titleLine, rtl && styles.rtlRow]}>
                  <Text style={styles.title}>
                    {rtl ? 'ناوەندی ئاگادارییەکان' : 'Notification Center'}
                  </Text>
                  {count > 0 && (
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>{count} new</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.subtitle}>
                  {rtl ? 'ئاگاداری زیادکردنەکان و شاندنی کاڵاکان' : 'Live bidding alerts & COD delivery updates'}
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={18} color={TOKENS.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Action Row: Filter Pills + Mark All Read */}
          <View style={[styles.toolbarRow, rtl && styles.rtlRow]}>
            <View style={[styles.filterPillsRow, rtl && styles.rtlRow]}>
              <TouchableOpacity
                style={[styles.filterPill, activeFilter === 'all' && styles.filterPillActive]}
                onPress={() => setActiveFilter('all')}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    activeFilter === 'all' && styles.filterPillTextActive,
                  ]}
                >
                  {rtl ? 'هەموو' : 'All'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterPill, activeFilter === 'bids' && styles.filterPillActive]}
                onPress={() => setActiveFilter('bids')}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    activeFilter === 'bids' && styles.filterPillTextActive,
                  ]}
                >
                  {rtl ? 'زیادکردنەکان' : 'Bids'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterPill, activeFilter === 'delivery' && styles.filterPillActive]}
                onPress={() => setActiveFilter('delivery')}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    activeFilter === 'delivery' && styles.filterPillTextActive,
                  ]}
                >
                  {rtl ? 'گەیاندن' : 'Orders'}
                </Text>
              </TouchableOpacity>
            </View>

            {count > 0 && (
              <TouchableOpacity
                style={[styles.markReadBtn, rtl && styles.rtlRow]}
                onPress={markAllAsRead}
                activeOpacity={0.75}
              >
                <CheckCheck size={13} color={TOKENS.colors.secondary} />
                <Text style={styles.markReadText}>
                  {rtl ? 'خوێندنەوەی هەموو' : 'Mark all read'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Notification List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {filteredNotifications.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Bell size={36} color={TOKENS.colors.textMuted} />
                <Text style={styles.emptyTitle}>
                  {rtl ? 'هیچ ئاگادارییەک نییە' : 'No notifications yet'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {rtl
                    ? 'لەگەڵ هەبوونی زیادکردنی نوێ لێرە ئاگادار دەکرێیتەوە.'
                    : 'Real-time bidding events and courier updates will appear here.'}
                </Text>
              </View>
            ) : (
              filteredNotifications.map((notif) => {
                const titleText = notif.title[language] || notif.title.en;
                const bodyText = notif.body[language] || notif.body.en;

                return (
                  <TouchableOpacity
                    key={notif.id}
                    style={[
                      styles.card,
                      !notif.isRead && styles.unreadCard,
                      rtl && styles.rtlCard,
                    ]}
                    onPress={() => handleNotificationPress(notif)}
                    activeOpacity={0.85}
                  >
                    {/* Icon Badge */}
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: getIconBg(notif.type) },
                      ]}
                    >
                      {getIcon(notif.type)}
                    </View>

                    {/* Content */}
                    <View style={styles.cardContent}>
                      <View style={[styles.cardHeader, rtl && styles.rtlRow]}>
                        <Text style={[styles.cardTitle, rtl && styles.alignRight]}>
                          {titleText}
                        </Text>
                        <Text style={styles.timestamp}>{notif.timestamp}</Text>
                      </View>

                      <Text
                        style={[styles.cardBody, rtl && styles.alignRight]}
                        numberOfLines={3}
                      >
                        {bodyText}
                      </Text>

                      {notif.auctionId && (
                        <View style={[styles.actionPrompt, rtl && styles.rtlRow]}>
                          <Text style={styles.actionPromptText}>
                            {rtl ? 'بینینی زیادکردنەکە' : 'Open live auction'}
                          </Text>
                          {rtl ? (
                            <ChevronLeft size={12} color={TOKENS.colors.primary} />
                          ) : (
                            <ChevronRight size={12} color={TOKENS.colors.primary} />
                          )}
                        </View>
                      )}
                    </View>

                    {/* Unread dot */}
                    {!notif.isRead && <View style={styles.unreadDot} />}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    minHeight: '60%',
    paddingBottom: 28,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  alignRight: {
    textAlign: 'right',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: TOKENS.colors.cardBorder,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: TOKENS.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: TOKENS.colors.primary,
    position: 'absolute',
    top: 6,
    right: 6,
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: TOKENS.colors.textPrimary,
  },
  countBadge: {
    backgroundColor: TOKENS.colors.primaryLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: TOKENS.colors.primary,
  },
  subtitle: {
    fontSize: 11,
    color: TOKENS.colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: TOKENS.colors.cardMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.6)',
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: TOKENS.borderRadius.full,
    backgroundColor: TOKENS.colors.cardMuted,
  },
  filterPillActive: {
    backgroundColor: TOKENS.colors.primaryLight,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: TOKENS.colors.textSecondary,
  },
  filterPillTextActive: {
    color: TOKENS.colors.primary,
    fontWeight: '800',
  },
  markReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  markReadText: {
    fontSize: 11,
    fontWeight: '700',
    color: TOKENS.colors.secondary,
  },
  listContent: {
    padding: 16,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: TOKENS.borderRadius.xl,
    borderWidth: 1,
    borderColor: TOKENS.colors.cardBorder,
    ...TOKENS.shadows.card,
    position: 'relative',
  },
  unreadCard: {
    backgroundColor: '#F8FAFC',
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  rtlCard: {
    flexDirection: 'row-reverse',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: TOKENS.colors.textPrimary,
    flex: 1,
  },
  timestamp: {
    fontSize: 10,
    fontWeight: '600',
    color: TOKENS.colors.textMuted,
    marginLeft: 6,
  },
  cardBody: {
    fontSize: 12,
    color: TOKENS.colors.textSecondary,
    lineHeight: 17,
  },
  actionPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  actionPromptText: {
    fontSize: 11,
    fontWeight: '700',
    color: TOKENS.colors.primary,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: TOKENS.colors.primary,
    position: 'absolute',
    top: 14,
    right: 14,
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: TOKENS.colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 12,
    color: TOKENS.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
});
