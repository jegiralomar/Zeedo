import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { TOKENS } from '../theme/tokens';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { isRTL } from '../i18n/translations';
import { TicketStatus, SupportTicket } from '../types';
import {
  Headphones,
  Send,
  X,
  ShieldCheck,
  Package,
  Timer,
  UserCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react-native';

interface Message {
  id: string;
  sender: 'bot' | 'user' | 'agent';
  senderName?: string;
  text: string;
  timestamp: string;
}

interface LiveChatSupportModalProps {
  visible: boolean;
  onClose: () => void;
  initialContext?: string;
}

export const LiveChatSupportModal: React.FC<LiveChatSupportModalProps> = ({
  visible,
  onClose,
  initialContext,
}) => {
  const { language, buyer } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const rtl = isRTL(language);
  const scrollViewRef = useRef<ScrollView>(null);

  // Active Support Ticket State
  const [ticketNumber, setTicketNumber] = useState<string>('TKT-202609-101');
  const [ticketStatus, setTicketStatus] = useState<TicketStatus>('open');

  const getWelcomeMessage = (): string => {
    switch (language) {
      case 'ckb':
        return `سڵاو بەڕێز ${buyer.name}! بەخێربێیت بۆ خزمەتگوزاری ڕاستەوخۆی ZEEDO لە هەولێر و شارەکانی تری عێراق. چۆن دەتوانم یارمەتیت بدەم لە پرۆسەی زیادکردن یان گەیاندن؟`;
      case 'badini':
        return `سلاڤ کاک ${buyer.name}! ب خێرهاتی بۆ پشتەڤانیا ڕاستەوخۆ یا ZEEDO. ئەز چەوا دشێم هاریکاریا تە بکەم دەربارەی زێدەکرن یان گەهاندنێ؟`;
      case 'ar':
        return `مرحباً بك أستاذ ${buyer.name}! أهلاً بك في الدعم المباشر لمنصة زيدو في العراق. كيف يمكنني مساعدتك اليوم في المزايدة أو التوصيل؟`;
      default:
        return `Hello ${buyer.name}! Welcome to ZEEDO Live Concierge Support (Erbil & Baghdad). How can we assist you with bidding, delivery, or inspection today?`;
    }
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      sender: 'bot',
      senderName: 'ZEEDO Concierge',
      text: getWelcomeMessage(),
      timestamp: 'Just now',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Broadcast sync helper
  const syncWithAdminPanel = (type: string, payload: any) => {
    if (typeof window !== 'undefined') {
      try {
        const syncData = { type, ...payload, timestamp: Date.now() };
        window.localStorage.setItem('zeedo_support_sync', JSON.stringify(syncData));
      } catch (e) {}
    }
  };

  // Cross-client live listener from Admin Panel
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'zeedo_support_sync' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          if (data.type === 'NEW_AGENT_MESSAGE') {
            const agentMsg: Message = {
              id: data.message?.id || `msg-${Date.now()}`,
              sender: 'agent',
              senderName: data.message?.senderName || 'Admin Specialist (Erbil Hub)',
              text: data.message?.text || '',
              timestamp: data.message?.timestamp || 'Just now',
            };
            setMessages((prev) => [...prev, agentMsg]);
            setTicketStatus('in_progress');
            scrollViewRef.current?.scrollToEnd({ animated: true });

            // Trigger In-App Notification
            addNotification({
              type: 'system',
              title: {
                en: `⚡ Reply on Ticket #${ticketNumber}`,
                ar: `⚡ رد جديد على التذكرة #${ticketNumber}`,
                ckb: `⚡ وەڵامێکی نوێ بۆ تیکێتی #${ticketNumber}`,
                badini: `⚡ بەرسڤەکا نووی بۆ تیکێتا #${ticketNumber}`,
              },
              body: {
                en: `${agentMsg.senderName}: "${agentMsg.text.slice(0, 70)}..."`,
                ar: `${agentMsg.senderName}: "${agentMsg.text.slice(0, 70)}..."`,
                ckb: `${agentMsg.senderName}: "${agentMsg.text.slice(0, 70)}..."`,
                badini: `${agentMsg.senderName}: "${agentMsg.text.slice(0, 70)}..."`,
              },
            });
          } else if (data.type === 'STATUS_UPDATE') {
            if (data.status) {
              setTicketStatus(data.status);
            }
          }
        } catch (err) {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [ticketNumber, addNotification]);

  const quickQuestions = [
    {
      id: 'q-inspect',
      icon: ShieldCheck,
      label: rtl ? 'پشکنینی بەردەم دەرگا' : 'Doorstep Inspection',
      answer: {
        en: 'ZEEDO 100% COD Policy: You have the right to open and inspect package contents in the courier’s presence before paying physical cash. Once cash is exchanged and accepted, the sale is final.',
        ar: 'ضمان الدفع عند الاستلام من زيدو: يحق لك فتح وفحص محتويات الطرد بحضور المندوب قبل دفع المبلغ نقداً. بمجرد استلام الطرد ودفع الكاش، تعتبر الصفقة نهائية.',
        ckb: 'ڕێسای ١٠٠٪ پارەدان لە کاتی وەرگرتن: مافی تەواوت هەیە کارتۆن و کەلوپەلەکە لە بەردەم شۆفێری گەیاندن بکەیتەوە و بیپشکنیت پێش ئەوەی پارەی کاش بدەیت. پاش ڕادەستکردنی کاش و وەرگرتن، مامەڵەکە کۆتایی دێت.',
        badini: 'یاسایا ١٠٠٪ پارەدان دەمێ وەرگرتنێ: مافێ تەیە کەلوپەلی ل بەر دەستێ شۆفێری بپشکنیت بەری کاش بدەی. پشتی دانانا پارەی، فرۆتن تمام دبیت.',
      },
    },
    {
      id: 'q-courier',
      icon: Package,
      label: rtl ? 'شاندنی کۆمپانیا و شۆفێر' : 'Courier Tracking & Calls',
      answer: {
        en: 'Our 3PL couriers navigate directly to your Gate 2 Rooftop GPS Pin and Landmark. The driver will call your registered phone upon reaching your street.',
        ar: 'تعتمد شركات التوصيل المعتمدة لدينا على إحداثيات موقع منزلك والمعلم المحدد في البوابة 2. سيتصل بك السائق هاتفياً فور وصوله لشارعك.',
        ckb: 'کۆمپانیاکانی گەیاندن ڕاستەوخۆ بەپێی نەخشەی سەربان (Gate 2) و شوێنە دیاریکراوەکەت دەگەن. شۆفێر پەیوەندی بە ژمارە مۆبایلەکەتەوە دەکات.',
        badini: 'کۆمپانیێت گەهاندنێ ل دووڤ جهێ خانیێ تە و نیشانا تە دئێن. شۆفێر دێ پەیوەندیێ کەت دەمێ دگەهیتە نێزیکی تە.',
      },
    },
    {
      id: 'q-anti-sniping',
      icon: Timer,
      label: rtl ? 'ڕێسای درێژکردنەوەی کات' : 'Anti-Sniping Rule',
      answer: {
        en: 'To prevent bots and last-second bid sniping, any bid placed within the final 30 seconds automatically extends the auction clock by +60 seconds.',
        ar: 'لحماية المزايدين من سرقة اللحظة الأخيرة، أي مزايدة تتم في آخر 30 ثانية تضيف تلقائياً +60 ثانية للعد التنازلي لإتاحة فرصة عادلة للجميع.',
        ckb: 'بۆ ڕێگری لە دزینی چرکەی کۆتایی، هەر زیادکردنێک لە ٣٠ چرکەی کۆتاییدا بکرێت، کاتژمێرەکە بە شێوەیەکی ئۆتۆماتیکی +٦٠ چرکە درێژ دەبێتەوە.',
        badini: 'بۆ ڕێگری ل زێدەکرنا چڕکا دوماهیێ، هەر نرخەک د ٣٠ چڕکێت دوماهیێ دا بهێتە دانان، +٦٠ چڕکە ل دەمژمێرێ زێدە دبن.',
      },
    },
    {
      id: 'q-agent',
      icon: UserCheck,
      label: rtl ? 'پەیوەندی بە کارمەندی ڕاستەوخۆ' : 'Human Concierge',
      answer: {
        en: `Ticket #${ticketNumber} created in Admin Panel! Connecting you to ZEEDO Concierge Agent (Erbil Operations Hub). A specialist is reviewing your account and will message you shortly.`,
        ar: `تم فتح التذكرة #${ticketNumber} في لوحة الإدارة! جاري تحويلك إلى موظف خدمة العملاء في أربيل. سيقوم المساعد بالرد عليك هنا مباشرة.`,
        ckb: `تیکێتی #${ticketNumber} لە پانێڵی بەڕێوەبەرایەتی تۆمارکرا! پەیوەندیت دەبەسترێت بە کارمەندی خزمەتگوزاری ZEEDO لە هەولێر. ئێستا کارمەندێک وەڵامت دەداتەوە.`,
        badini: `تیکێتا #${ticketNumber} هاتە ڤەکرن د پانێلا ئادمین دا! پەیوەندیا تە دهێتە گرێدان ب کارمەندێ پشتەڤانیێ ل هەولێرێ. نۆکە دێ وەڵام تە هێتە دان.`,
      },
    },
  ];

  const handleQuickQuestion = (q: typeof quickQuestions[0]) => {
    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      senderName: buyer.name,
      text: q.label,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    if (q.id === 'q-agent') {
      // Escalate to admin ticket queue
      syncWithAdminPanel('NEW_TICKET', {
        ticketNumber,
        buyerId: buyer.id,
        buyerName: buyer.name,
        buyerPhone: buyer.phone,
        buyerCity: buyer.city,
        kycStatus: buyer.kycStatus,
        rooftopLandmark: buyer.rooftopPin?.landmark || 'Behind Family Mall, Street 10',
        subject: 'Human agent assistance requested via mobile chat',
        category: 'general',
        initialMessage: q.label,
      });
    }

    setTimeout(() => {
      setIsTyping(false);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: q.id === 'q-agent' ? 'agent' : 'bot',
        senderName: q.id === 'q-agent' ? 'ZEEDO Concierge Specialist' : 'ZEEDO Concierge',
        text: q.answer[language] || q.answer.en,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, botMsg]);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 600);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    setInputText('');

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      senderName: buyer.name,
      text: userText,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Sync message to Admin Panel Support Ticket
    syncWithAdminPanel('BUYER_MESSAGE', {
      ticketNumber,
      buyerId: buyer.id,
      buyerName: buyer.name,
      buyerPhone: buyer.phone,
      text: userText,
    });

    setTimeout(() => {
      setIsTyping(false);
      let reply = '';
      if (userText.toLowerCase().includes('phone') || userText.toLowerCase().includes('call')) {
        reply = rtl
          ? 'تیمی گەیاندن پێش گەیشتن بە شوێنەکەت ڕاستەوخۆ پەیوەندیت پێوە دەکەن.'
          : 'The dispatch team and courier driver will call you directly before arrival at your rooftop landmark.';
      } else if (userText.toLowerCase().includes('cancel') || userText.toLowerCase().includes('return')) {
        reply = rtl
          ? 'پشکنینی کاڵا لە بەردەم دەرگا و لە ئامادەبوونی شۆفێری گەیاندن ئەنجام دەدرێت پێش پێدانی پارە.'
          : 'Inspection takes place in front of the courier before cash payment. If rejected on inspection, courier returns it.';
      } else {
        reply = rtl
          ? `پەیامەکەت بە سەرکەوتوویی لە تیکێتی #${ticketNumber} تۆمارکرا. تیمی بەڕێوەبەرایەتی لە چەند ساتێکی کەمدا وەڵامت دەدەنەوە.`
          : `Your inquiry has been logged under Ticket #${ticketNumber}. An admin specialist at the Erbil hub is reviewing your account and will reply directly in this chat.`;
      }

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'agent',
        senderName: 'ZEEDO Concierge Specialist',
        text: reply,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, botMsg]);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 750);
  };

  const getStatusBadge = () => {
    switch (ticketStatus) {
      case 'in_progress':
        return (
          <View style={[styles.statusPill, styles.statusInProgress]}>
            <Clock size={10} color="#D97706" />
            <Text style={styles.statusInProgressText}>In Progress</Text>
          </View>
        );
      case 'resolved':
        return (
          <View style={[styles.statusPill, styles.statusResolved]}>
            <CheckCircle2 size={10} color="#059669" />
            <Text style={styles.statusResolvedText}>Resolved</Text>
          </View>
        );
      default:
        return (
          <View style={[styles.statusPill, styles.statusOpen]}>
            <AlertCircle size={10} color="#DC2626" />
            <Text style={styles.statusOpenText}>Open Queue</Text>
          </View>
        );
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={[styles.headerRow, rtl && styles.rtlRow]}>
            <View style={[styles.titleGroup, rtl && styles.rtlRow]}>
              <View style={styles.avatarCircle}>
                <Headphones size={18} color="#FFFFFF" />
                <View style={styles.onlineDot} />
              </View>
              <View>
                <View style={[styles.nameRow, rtl && styles.rtlRow]}>
                  <Text style={styles.headerTitle}>ZEEDO Concierge</Text>
                  <View style={styles.verifiedBadge}>
                    <CheckCircle2 size={11} color={TOKENS.colors.secondary} />
                    <Text style={styles.verifiedBadgeText}>Official</Text>
                  </View>
                </View>
                <View style={[styles.ticketRow, rtl && styles.rtlRow]}>
                  <Text style={styles.ticketNumberText}>{ticketNumber}</Text>
                  {getStatusBadge()}
                </View>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={18} color={TOKENS.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Ticket Resolution Banner if resolved */}
          {ticketStatus === 'resolved' && (
            <View style={[styles.resolvedBanner, rtl && styles.rtlRow]}>
              <CheckCircle2 size={14} color="#059669" />
              <Text style={styles.resolvedBannerText}>
                {rtl
                  ? 'ئەم تیکێتە لەلایەن تیمی پشتگیرییەوە چارەسەرکرا. دەتوانیت پەیام بنێریتەوە ئەگەر پرسیارت هەبوو.'
                  : 'This ticket was marked resolved by support. Send a message anytime if you need more help.'}
              </Text>
            </View>
          )}

          {/* Quick FAQ Suggestion Pills */}
          <View style={styles.quickChipsWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[styles.quickChipsRow, rtl && styles.rtlRow]}
            >
              {quickQuestions.map((q) => {
                const IconComponent = q.icon;
                return (
                  <TouchableOpacity
                    key={q.id}
                    style={[styles.quickChip, rtl && styles.rtlRow]}
                    onPress={() => handleQuickQuestion(q)}
                    activeOpacity={0.8}
                  >
                    <IconComponent size={13} color={TOKENS.colors.primary} />
                    <Text style={styles.quickChipText}>{q.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Messages Stream */}
          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.messagesContainer}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <View
                  key={m.id}
                  style={[
                    styles.messageBubbleWrapper,
                    isUser ? styles.userWrapper : styles.botWrapper,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      isUser ? styles.userBubble : styles.botBubble,
                      m.sender === 'agent' && styles.agentBubble,
                    ]}
                  >
                    {m.sender === 'agent' && (
                      <View style={[styles.agentTagRow, rtl && styles.rtlRow]}>
                        <Sparkles size={11} color={TOKENS.colors.secondary} />
                        <Text style={styles.agentTagText}>
                          {m.senderName || 'Admin Specialist (Erbil Operations Hub)'}
                        </Text>
                      </View>
                    )}
                    <Text
                      style={[
                        styles.messageText,
                        isUser ? styles.userMessageText : styles.botMessageText,
                        rtl && styles.alignRight,
                      ]}
                    >
                      {m.text}
                    </Text>
                    <Text
                      style={[
                        styles.messageTime,
                        isUser ? styles.userTime : styles.botTime,
                        rtl && styles.alignRight,
                      ]}
                    >
                      {m.timestamp}
                    </Text>
                  </View>
                </View>
              );
            })}

            {isTyping && (
              <View style={[styles.messageBubbleWrapper, styles.botWrapper]}>
                <View style={[styles.messageBubble, styles.botBubble, styles.typingBubble]}>
                  <Text style={styles.typingText}>ZEEDO Concierge is typing...</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input Bar */}
          <View style={[styles.inputContainer, rtl && styles.rtlRow]}>
            <TextInput
              style={[styles.input, rtl && styles.alignRight]}
              placeholder={rtl ? 'پرسیارێک بنووسە بۆ بەڕێوەبەرایەتی...' : 'Type message to Erbil helpdesk...'}
              placeholderTextColor={TOKENS.colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSendMessage}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                !inputText.trim() && styles.sendBtnDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={!inputText.trim()}
              activeOpacity={0.85}
            >
              <Send size={15} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    height: '82%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
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
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: TOKENS.colors.cardBorder,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: TOKENS.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    position: 'absolute',
    bottom: -1,
    right: -1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: TOKENS.colors.textPrimary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: TOKENS.colors.secondaryLight,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
  },
  verifiedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: TOKENS.colors.secondary,
  },
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  ticketNumberText: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: TOKENS.colors.textSecondary,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  statusOpen: {
    backgroundColor: '#FEE2E2',
  },
  statusOpenText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#DC2626',
  },
  statusInProgress: {
    backgroundColor: '#FEF3C7',
  },
  statusInProgressText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706',
  },
  statusResolved: {
    backgroundColor: '#D1FAE5',
  },
  statusResolvedText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
  },
  resolvedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#A7F3D0',
  },
  resolvedBannerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
    flex: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: TOKENS.colors.cardMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickChipsWrapper: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.6)',
  },
  quickChipsRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: TOKENS.colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: TOKENS.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
  },
  quickChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: TOKENS.colors.primary,
  },
  messagesContainer: {
    padding: 16,
    gap: 12,
  },
  messageBubbleWrapper: {
    width: '100%',
  },
  userWrapper: {
    alignItems: 'flex-end',
  },
  botWrapper: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '82%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    gap: 4,
  },
  userBubble: {
    backgroundColor: TOKENS.colors.primary,
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#F1F5F9',
    borderBottomLeftRadius: 4,
  },
  agentBubble: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  agentTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  agentTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: TOKENS.colors.secondary,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 19,
  },
  userMessageText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  botMessageText: {
    color: TOKENS.colors.textPrimary,
  },
  messageTime: {
    fontSize: 9,
    fontWeight: '500',
  },
  userTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  botTime: {
    color: TOKENS.colors.textMuted,
  },
  typingBubble: {
    paddingVertical: 8,
  },
  typingText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: TOKENS.colors.textMuted,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: TOKENS.colors.cardBorder,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: TOKENS.colors.cardBorder,
    borderRadius: TOKENS.borderRadius.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13,
    color: TOKENS.colors.textPrimary,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: TOKENS.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: TOKENS.colors.textMuted,
    opacity: 0.5,
  },
});
