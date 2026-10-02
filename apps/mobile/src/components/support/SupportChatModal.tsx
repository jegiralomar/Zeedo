import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { X, Send, Headphones, Sparkles, ShieldCheck } from 'lucide-react-native';
import { AppTheme } from '../../theme/colors';
import { useAppStore } from '../../store/useAppStore';
import { ZEEDO_CONFIG } from '../../config/api';

interface SupportChatModalProps {
  visible: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  ticketId: string;
  senderType: 'user' | 'admin';
  senderId: string;
  senderName: string;
  message: string;
  createdAt: string;
}

export const SupportChatModal: React.FC<SupportChatModalProps> = ({ visible, onClose }) => {
  const { currentUser, language } = useAppStore();
  const isRtl = language !== 'en';

  const [ticketId, setTicketId] = useState<string | null>(null);
  const [ticketNumber, setTicketNumber] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize or fetch active ticket
  useEffect(() => {
    if (!visible) {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      return;
    }

    let isMounted = true;

    const initTicket = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${ZEEDO_CONFIG.API_BASE_URL}/api/support/tickets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser?.id || 'guest-' + Date.now(),
            userName: currentUser?.name || 'Zeedo Guest',
            userPhone: currentUser?.phone || '',
            subject: 'Mobile Live Support',
          }),
        });

        const data = await res.json();
        if (data.success && data.ticket && isMounted) {
          setTicketId(data.ticket.id);
          setTicketNumber(data.ticket.ticketNumber || `TKT-${data.ticket.id}`);
          fetchMessages(data.ticket.id);
        }
      } catch (err) {
        console.warn('Could not initialize support ticket:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initTicket();

    // Poll messages every 3 seconds while modal is visible
    pollTimerRef.current = setInterval(() => {
      if (ticketId) {
        fetchMessages(ticketId, true);
      }
    }, 3000);

    return () => {
      isMounted = false;
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [visible, ticketId, currentUser]);

  const fetchMessages = async (tId: string, silent = false) => {
    try {
      const res = await fetch(`${ZEEDO_CONFIG.API_BASE_URL}/api/support/messages?ticketId=${tId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
    } catch (err) {
      if (!silent) console.warn('Failed to fetch messages:', err);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !ticketId || isSending) return;

    setIsSending(true);
    if (!textToSend) setInputText('');

    // Optimistic message
    const tempMsg: ChatMessage = {
      id: 'temp-' + Date.now(),
      ticketId,
      senderType: 'user',
      senderId: currentUser?.id || 'guest',
      senderName: currentUser?.name || 'Me',
      message: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await fetch(`${ZEEDO_CONFIG.API_BASE_URL}/api/support/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId,
          senderType: 'user',
          senderId: currentUser?.id || 'guest',
          senderName: currentUser?.name || 'Zeedo Buyer',
          message: text,
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => prev.map((m) => (m.id === tempMsg.id ? data.message : m)));
      }
    } catch (err) {
      console.warn('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const quickPrompts = isRtl
    ? [
        '📦 كيف يعمل فحص الطرد عند الاستلام؟',
        '🏆 استفسار حول مزاد فزت به',
        '💳 ما هي طرق الدفع المتاحة؟',
      ]
    : [
        '📦 How does doorstep inspection work?',
        '🏆 Question about an auction I won',
        '💳 What are the payment methods?',
      ];

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.avatarBubble}>
                <Headphones size={20} color="#FFFFFF" />
              </View>
              <View>
                <View style={styles.titleRow}>
                  <Text style={styles.headerTitle}>
                    {isRtl ? 'خدمة عملاء زيدو' : 'ZEEDO Live Support'}
                  </Text>
                  <View style={styles.onlineBadge}>
                    <View style={styles.onlineDot} />
                    <Text style={styles.onlineText}>{isRtl ? 'متصل' : 'Online'}</Text>
                  </View>
                </View>
                {ticketNumber ? (
                  <Text style={styles.headerSub}>{ticketNumber} • {isRtl ? 'دعم فني مباشر' : 'Live Agent Support'}</Text>
                ) : null}
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={20} color="#1E293B" />
            </TouchableOpacity>
          </View>

          {/* Doorstep Trust Notice */}
          <View style={styles.noticeBar}>
            <ShieldCheck size={16} color="#059669" />
            <Text style={styles.noticeText}>
              {isRtl
                ? 'فريق الدعم متاح للإجابة على استفسارات المزادات وفحص الطرود والتوصيل.'
                : 'Support is online to answer questions regarding auctions, doorstep check, and COD.'}
            </Text>
          </View>

          {/* Messages list */}
          {isLoading && messages.length === 0 ? (
            <View style={styles.centerLoading}>
              <ActivityIndicator size="large" color={AppTheme.colors.primary} />
              <Text style={styles.loadingText}>
                {isRtl ? 'جارٍ الاتصال بفريق الدعم...' : 'Connecting to support team...'}
              </Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messagesList}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconCircle}>
                    <Sparkles size={28} color={AppTheme.colors.primary} />
                  </View>
                  <Text style={styles.emptyTitle}>
                    {isRtl ? 'مرحباً بك في خدمة العملاء' : 'Welcome to Zeedo Support'}
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    {isRtl
                      ? 'اطرح سؤالك أو اختر أحد الأسئلة الشائعة أدناه وسيقوم فريقنا بالرد عليك مباشرة.'
                      : 'Ask a question or tap a quick prompt below to begin chatting with our live team.'}
                  </Text>

                  {/* Quick Prompts */}
                  <View style={styles.promptsContainer}>
                    {quickPrompts.map((prompt, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.promptChip}
                        onPress={() => handleSendMessage(prompt)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.promptText}>{prompt}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              }
              renderItem={({ item }) => {
                const isUser = item.senderType === 'user';
                return (
                  <View
                    style={[
                      styles.messageRow,
                      isUser ? styles.messageRowUser : styles.messageRowAdmin,
                    ]}
                  >
                    {!isUser && (
                      <View style={styles.adminAvatar}>
                        <Text style={styles.adminAvatarText}>Z</Text>
                      </View>
                    )}
                    <View
                      style={[
                        styles.bubble,
                        isUser ? styles.bubbleUser : styles.bubbleAdmin,
                      ]}
                    >
                      {!isUser && (
                        <Text style={styles.senderLabel}>
                          {item.senderName || (isRtl ? 'إدارة زيدو' : 'ZEEDO Staff')}
                        </Text>
                      )}
                      <Text
                        style={[
                          styles.messageText,
                          isUser ? styles.messageTextUser : styles.messageTextAdmin,
                        ]}
                      >
                        {item.message}
                      </Text>
                      <Text
                        style={[
                          styles.timeText,
                          isUser ? styles.timeTextUser : styles.timeTextAdmin,
                        ]}
                      >
                        {new Date(item.createdAt || Date.now()).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  </View>
                );
              }}
            />
          )}

          {/* Quick chip bar if chat already has messages */}
          {messages.length > 0 && (
            <View style={styles.miniPromptsRow}>
              {quickPrompts.slice(0, 2).map((prompt, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.miniChip}
                  onPress={() => handleSendMessage(prompt)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.miniChipText} numberOfLines={1}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Input Bar */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.textInput, isRtl && styles.textInputRtl]}
              placeholder={isRtl ? 'اكتب رسالتك هنا...' : 'Type your message...'}
              placeholderTextColor="#94A3B8"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                !inputText.trim() && styles.sendBtnDisabled,
              ]}
              onPress={() => handleSendMessage()}
              disabled={!inputText.trim() || isSending}
              activeOpacity={0.8}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Send size={18} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  onlineText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  headerSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#A7F3D0',
  },
  noticeText: {
    flex: 1,
    fontSize: 11,
    color: '#065F46',
    fontWeight: '600',
  },
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFE4E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  promptsContainer: {
    width: '100%',
    gap: 8,
  },
  promptChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  promptText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  miniPromptsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  miniChip: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  miniChipText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '600',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
    gap: 8,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAdmin: {
    justifyContent: 'flex-start',
  },
  adminAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: {
    backgroundColor: AppTheme.colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleAdmin: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  senderLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: AppTheme.colors.primary,
    marginBottom: 2,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 19,
  },
  messageTextUser: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  messageTextAdmin: {
    color: '#0F172A',
    fontWeight: '500',
  },
  timeText: {
    fontSize: 9,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timeTextUser: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  timeTextAdmin: {
    color: '#94A3B8',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  textInputRtl: {
    textAlign: 'right',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
});
