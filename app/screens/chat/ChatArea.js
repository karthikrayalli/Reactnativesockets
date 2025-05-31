import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
// import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/chatContext';
import LottieView from 'lottie-react-native';
import ChatAreaTop from './ChatAreaTop';
// import FileUploadModal from '../miscellaneous/FileUploadModal';
// import ChatLoadingSpinner from '../miscellaneous/ChatLoadingSpinner';
import SingleMessage from './SingleMessage';
import AsyncStorage from "@react-native-async-storage/async-storage";

const ChatArea = () => {
//   const context = useContext(chatContext);
const context = useAuth();
  const {
    hostName,
    user,
    receiver,
    socket,
    activeChatId,
    messageList,
    setMessageList,
    isOtherUserTyping,
    setIsOtherUserTyping,
    setActiveChatId,
    setReceiver,
    setMyChatList,
    myChatList,
    isChatLoading,
  } = context;
  console.log("isOtherUserTyping",isOtherUserTyping)
  const [typing, setTyping] = useState(false);
  const [chatTyext, setChat] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigation = useNavigation();

  const showToast = (title, message) => {
    Alert.alert(title, message);
  };

  useEffect(() => {
    return () => {
      navigation.addListener('beforeRemove', () => {
        socket.emit('leave-chat', activeChatId);
        setActiveChatId('');
        setMessageList([]);
        setReceiver({});
      });
    };
  }, [socket, activeChatId, setActiveChatId, setMessageList, setReceiver]);

  useEffect(() => {
    socket.on('user-joined-room', (userId) => {
      const updatedList = messageList.map((message) => {
        if (message.senderId === user._id && userId !== user._id) {
          const index = message.seenBy.findIndex(
            (seen) => seen.user === userId
          );
          if (index === -1) {
            message.seenBy.push({ user: userId, seenAt: new Date() });
          }
        }
        return message;
      });
      setMessageList(updatedList);
    });

    socket.on('typing', (data) => {
      if (data.typer !== user._id) {
        setIsOtherUserTyping(true);
      }
    });

    socket.on('stop-typing', (data) => {
      if (data.typer !== user._id) {
        setIsOtherUserTyping(false);
      }
    });

    socket.on('receive-message', (data) => {
      setMessageList((prev) => [...prev, data]);
    });

    socket.on('message-deleted', (data) => {
      const { messageId } = data;
      setMessageList((prev) => prev.filter((msg) => msg._id !== messageId));
    });

    return () => {
      socket.off('typing');
      socket.off('stop-typing');
      socket.off('receive-message');
      socket.off('message-deleted');
    };
  }, [socket, messageList, setMessageList, user._id, setIsOtherUserTyping]);

  const handleTyping = (text) => {
    setChat(text)
    if (text === '' && typing) {
      setTyping(false);
      socket.emit('stop-typing', {
        typer: user._id,
        conversationId: activeChatId,
      });
    } else if (text !== '' && !typing) {
      setTyping(true);
      socket.emit('typing', {
        typer: user._id,
        conversationId: activeChatId,
      });
    }
  };

  const handleSendMessage = async (file) => {
    socket.emit('stop-typing', {
      typer: user._id,
      conversationId: activeChatId,
    });

    if (chatTyext === '' && !file) {
      showToast('Error', 'Message cannot be empty');
      return;
    }

    let key;
    if (file) {
      try {
        const response = await fetch(
          `${hostName}/user/presigned-url?filename=${file.name}&filetype=${file.type}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'auth-token': await AsyncStorage.getItem('token'),
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to get pre-signed URL');
        }
        const data = await response.json();
        const formData = new FormData();
        Object.entries({ ...data.fields, file }).forEach(([k, v]) => {
          formData.append(k, v);
        });

        const uploadResponse = await fetch(data.url, {
          method: 'POST',
          body: formData,
        });

        if (uploadResponse.status !== 201) {
          throw new Error('Failed to upload file');
        }

        key = data.fields.key;
      } catch (error) {
        showToast('Error', error.message);
        return;
      }
    }

    const data = {
      text: chatTyext,
      conversationId: activeChatId,
      senderId: user._id,
      imageUrl: file ? `https://conversa-chat.s3.ap-south-1.amazonaws.com/${key}` : null,
    };
    console.log("data",data)
    socket.emit('send-message', data);
    setChat('')
    setMyChatList(
      myChatList.map((chat) => {
        if (chat._id === activeChatId) {
          chat.latestmessage = chatTyext;
          chat.updatedAt = new Date().toUTCString();
        }
        return chat;
      }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    );
  };

  const removeMessageFromList = (messageId) => {
    setMessageList((prev) => prev.filter((msg) => msg._id !== messageId));
  };

  const markdownToHtml = (markdownText) => {
    // Simple markdown to plain text conversion for React Native
    return markdownText
      .replace(/\*\*(.*?)\*\*/g, '$1') // bold
      .replace(/\*(.*?)\*/g, '$1'); // italic
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {activeChatId !== '' ? (
        <>
          <View style={styles.chatContainer}>
            <ChatAreaTop />

            {isChatLoading && <ChatLoadingSpinner />}

            <ScrollView
              style={styles.messageContainer}
              contentContainerStyle={styles.messageContent}
              // ref={(ref) => { this.scrollView = ref; }}
              // onContentSizeChange={() => this.scrollView.scrollToEnd({ animated: true })}
            >
              {messageList?.map((message) =>
                !message.deletedby?.includes(user._id) ? (
                  <SingleMessage
                    key={message._id}
                    message={message}
                    user={user}
                    receiver={receiver}
                    markdownToHtml={markdownToHtml}
                    socket={socket}
                    activeChatId={activeChatId}
                    removeMessageFromList={removeMessageFromList}
                    showToast={showToast}
                  />
                ) : null
              )}
            </ScrollView>
{isOtherUserTyping && (
                  <LottieView
                    source={require('../../assets/animation.json')}
                    autoPlay
                    loop
                    style={styles.typingAnimation}
                  />
              )}
            <View style={styles.inputContainer}>
              

              <View style={styles.inputGroup}>
                {!receiver?.email?.includes('bot') && (
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={() => setIsModalOpen(true)}
                  >
                    {/* <FontAwesome name="upload" size={20} color="#6B46C1" /> */}
                    <Text>upload</Text>
                  </TouchableOpacity>
                )}

                <TextInput
                  style={styles.input}
                  placeholder="Type a message"
                  value={chatTyext}
                  onChangeText={(e) => handleTyping(e)}
                  onSubmitEditing={() => handleSendMessage()}
                  multiline
                />

                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={() => handleSendMessage()}
                >
                  {/* <MaterialIcons name="send" size={24} color="white" /> */}
                  <Text>Send</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* <FileUploadModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            handleSendMessage={handleSendMessage}
          /> */}
        </>
      ) : (
        !isChatLoading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Conversa</Text>
            <Text style={styles.emptySubtitle}>Online chatting app</Text>
            <Text style={styles.emptyText}>Select a chat to start messaging</Text>
          </View>
        )
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "red"
  },
  chatContainer: {
    flex: 1,
  },
  messageContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  messageContent: {
    paddingBottom: 70,
  },
  inputContainer: {
    padding: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  typingIndicator: {
    padding: 5,
    alignSelf: 'flex-start',
  },
  typingAnimation: {
    width: 150,
    height: 130,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 25,
    paddingHorizontal: 10,
  },
  uploadButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    padding: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#6B46C1',
    borderRadius: 20,
    padding: 8,
    marginLeft: 5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
  },
});

export default ChatArea;