import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
// import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../context/chatContext';
// import ProfileMenu from '../Navbar/ProfileMenu';
// import NewMessage from '../miscellaneous/NewMessage';
// import { Audio } from 'expo-av';
// import ProfileModal from '../miscellaneous/ProfileModal';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from '@react-navigation/native';

const MyChatList = () => {
  const navigation = useNavigation()
  // const { setActiveTab } = route.params;
  const [sound, setSound] = useState();
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const context = useAuth();

  const {
    hostName,
    user,
    socket,
    myChatList: chatlist,
    originalChatList: data,
    activeChatId,
    setActiveChatId,
    setMyChatList,
    setIsChatLoading,
    setMessageList,
    setIsOtherUserTyping,
    setReceiver,
    isLoading,
    isOtherUserTyping,
  } = context;

  // useEffect(() => {
  //   const loadSound = async () => {
  //     const { sound } = await Audio.Sound.createAsync(
  //       require('../../assets/newmessage.wav')
  //     );
  //     setSound(sound);
  //   };

  //   loadSound();

  //   return () => {
  //     if (sound) {
  //       sound.unloadAsync();
  //     }
  //   };
  // }, []);

  useEffect(() => {
    socket.on('new-message-notification', async (data) => {
      let newlist = [...chatlist];

      let chatIndex = newlist.findIndex(
        (chat) => chat._id === data.conversationId
      );
      if (chatIndex === -1) {
        newlist.unshift(data.conversation);
      }
      chatIndex = newlist.findIndex((chat) => chat._id === data.conversationId);
      newlist[chatIndex].latestmessage = data.text;

      if (activeChatId !== data.conversationId) {
        newlist[chatIndex].unreadCounts = newlist[chatIndex].unreadCounts.map(
          (unread) => {
            if (unread.userId === user._id) {
              unread.count = unread.count + 1;
            }
            return unread;
          }
        );
        newlist[chatIndex].updatedAt = new Date();
      }

      let updatedChat = newlist.splice(chatIndex, 1)[0];
      newlist.unshift(updatedChat);

      setMyChatList([...newlist]);

      if (activeChatId !== data.conversationId) {
        // try {
        //   await sound?.replayAsync();
        // } catch (error) {
        //   console.log(error);
        // }

        // Show notification
        Alert.alert(
          'New Message',
          data.text,
          [
            {
              text: 'View',
              onPress: () => {
                const receiver = newlist.find(
                  (chat) => chat._id === data.conversationId
                ).members[0];
                handleChatOpen(data.conversationId, receiver);
              },
            },
            { text: 'Dismiss' },
          ]
        );
      }
    });

    return () => {
      socket.off('new-message-notification');
    };
  }, [chatlist, activeChatId]);

  const handleUserSearch = (text) => {
    setSearchQuery(text);
    if (text !== '') {
      const newchatlist = data.filter((chat) =>
        chat.members[0].name.toLowerCase().includes(text.toLowerCase())
      );
      setMyChatList(newchatlist);
    } else {
      setMyChatList(context.originalChatList);
    }
  };

  const handleChatOpen = async (chatid, receiver) => {
    try {
      setIsChatLoading(true);
      setMessageList([]);
      setIsOtherUserTyping(false);

      await socket.emit('stop-typing', {
        typer: user._id,
        conversationId: activeChatId,
      });
      await socket.emit('leave-chat', activeChatId);

      socket.emit('join-chat', { roomId: chatid, userId: user._id });
      setActiveChatId(chatid);

      const response = await fetch(`${hostName}/message/${chatid}/${user._id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': await AsyncStorage.getItem('token'),
        },
      });
      console.log("response",response)
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const jsonData = await response.json();

      setMessageList(jsonData);
      setReceiver(receiver);
      setIsChatLoading(false);
      navigation.navigate("ChatArea")
      const newlist = chatlist.map((chat) => {
        if (chat._id === chatid) {
          chat.unreadCounts = chat.unreadCounts.map((unread) => {
            if (unread.userId === user._id) {
              unread.count = 0;
            }
            return unread;
          });
        }
        return chat;
      });

      setMyChatList(newlist);
    } catch (error) {
      console.log(error);
    }
  };

  return isLoading ? (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#6B46C1" />
    </View>
  ) : (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chats</Text>
        <View style={styles.searchContainer}>
          {/* <FontAwesome name="search" size={16} color="#A0AEC0" style={styles.searchIcon} /> */}
          <TextInput
            style={styles.searchInput}
            placeholder="Search user"
            value={searchQuery}
            onChangeText={handleUserSearch}
          />
          <TouchableOpacity onPress={() => setIsProfileModalOpen(true)}>
            <Image
              source={{ uri: user.profilePic }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.newChatButton}
        // onPress={() => setActiveTab(1)}
      >
        <Text style={styles.newChatButtonText}>Add new Chat</Text>
        {/* <MaterialIcons name="add" size={16} color="white" /> */}
      </TouchableOpacity>

      <ScrollView style={styles.chatList}>
        {chatlist.map((chat) => {
          const image = `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.members[0].name)}&background=random&color=fff&bold=true`;
          return(
          <TouchableOpacity
            key={chat.members[0]._id}
            style={[
              styles.chatItem,
              chat._id === activeChatId && styles.activeChatItem,
            ]}
            onPress={() => handleChatOpen(chat._id, chat.members[0])}
          >
              <Image
      source={{ 
    uri: image }}
    style={styles.chatImage}
  />
            <View style={styles.chatContent}>
              <Text style={styles.chatName}>
                {chat.members[0].name?.length > 11
                  ? chat.members[0].name?.substring(0, 13) + '...'
                  : chat.members[0].name}
              </Text>
              {isOtherUserTyping && chat._id === activeChatId ? (
                <Text style={styles.typingText}>typing...</Text>
              ) : (
                <Text style={styles.chatMessage}>
                  {chat.latestmessage?.substring(0, 15) +
                    (chat.latestmessage?.length > 15 ? '...' : '')}
                </Text>
              )}
            </View>
            <View style={styles.chatMeta}>
              <Text style={styles.chatTime}>
                {new Date(chat.updatedAt).toDateString() ===
                new Date().toDateString()
                  ? 'Today'
                  : new Date(chat.updatedAt).toDateString() ===
                    new Date(
                      new Date().setDate(new Date().getDate() - 1)
                    ).toDateString()
                  ? 'Yesterday'
                  : new Date(chat.updatedAt).toLocaleDateString()}
              </Text>
              <Text style={styles.chatTime}>
                {new Date(chat.updatedAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              {chat.unreadCounts.find(
                (unread) => unread.userId === user._id
              )?.count > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadCount}>
                    {
                      chat.unreadCounts.find(
                        (unread) => unread.userId === user._id
                      )?.count
                    }
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )
        })}
      </ScrollView>

      {/* <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
      /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  newChatButton: {
    backgroundColor: '#6B46C1',
    borderRadius: 20,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  newChatButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginRight: 5,
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    backgroundColor: '#F7FAFC',
  },
  activeChatItem: {
    backgroundColor: '#E9D8FD',
  },
  chatImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    resizeMode: 'contain'
  },
  chatContent: {
    flex: 1,
  },
  chatName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  typingText: {
    color: '#6B46C1',
    fontSize: 14,
  },
  chatMessage: {
    color: '#718096',
    fontSize: 14,
  },
  chatMeta: {
    alignItems: 'flex-end',
  },
  chatTime: {
    fontSize: 12,
    color: '#A0AEC0',
  },
  unreadBadge: {
    backgroundColor: '#6B46C1',
    borderRadius: 10,
    padding: 2,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  unreadCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
    chatImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  textAvatar: {
    backgroundColor: '#6B46C1', // Purple background color
    justifyContent: 'center',
    alignItems: 'center',
  },
  textAvatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default MyChatList;