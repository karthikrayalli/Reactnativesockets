import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
// import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/chatContext';
// import ProfileModal from '../miscellaneous/ProfileModal';
import AsyncStorage from "@react-native-async-storage/async-storage";

const ChatAreaTop = () => {
//   const context = useContext(chatContext);
const context = useAuth();
  const {
    receiver,
    setReceiver,
    activeChatId,
    setActiveChatId,
    setMessageList,
    isChatLoading,
    hostName,
    socket,
  } = context;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getReceiverOnlineStatus = async () => {
    if (!receiver._id) {
      return;
    }

    try {
      const response = await fetch(
        `${hostName}/user/online-status/${receiver._id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': await AsyncStorage.getItem('token'),
          },
        }
      );
      const data = await response.json();
      setReceiver((receiver) => ({
        ...receiver,
        isOnline: data.isOnline,
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const handleBack = () => {
    socket.emit('leave-chat', activeChatId);
    setActiveChatId('');
    setMessageList([]);
    setReceiver({});
  };

  const getLastSeenString = (lastSeen) => {
    let lastSeenString = 'last seen ';
    if (new Date(lastSeen).toDateString() === new Date().toDateString()) {
      lastSeenString += 'today ';
    } else if (
      new Date(lastSeen).toDateString() ===
      new Date(new Date().setDate(new Date().getDate() - 1)).toDateString()
    ) {
      lastSeenString += 'yesterday ';
    } else {
      lastSeenString += `on ${new Date(lastSeen).toLocaleDateString()} `;
    }

    lastSeenString += `at ${new Date(lastSeen).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;

    return lastSeenString;
  };

  useEffect(() => {
    getReceiverOnlineStatus();
  }, [receiver?._id]);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text>Back</Text>
        {/* <MaterialIcons name="arrow-back" size={24} color="#6B46C1" /> */}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => setIsModalOpen(true)}
      >
        {isChatLoading ? (
          <ActivityIndicator size="small" color="#6B46C1" />
        ) : (
          <View style={styles.profileInfo}>
            <Image
              style={styles.profileImage}
              source={{ uri: receiver.profilePic }}
            />
            <View style={styles.profileText}>
              <Text style={styles.name}>{receiver.name}</Text>
              {receiver.isOnline ? (
                <Text style={styles.onlineStatus}>
                  <View style={styles.onlineDot} />
                  active now
                </Text>
              ) : (
                <Text style={styles.lastSeen}>
                  {getLastSeenString(receiver.lastSeen)}
                </Text>
              )}
            </View>
          </View>
        )}
      </TouchableOpacity>
{/* 
      <ProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={receiver}
      /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    marginRight: 10,
  },
  profileButton: {
    flex: 1,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  profileText: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  onlineStatus: {
    fontSize: 12,
    color: '#4A5568',
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#48BB78',
    marginRight: 4,
  },
  lastSeen: {
    fontSize: 10,
    color: '#A0AEC0',
  },
});

export default ChatAreaTop;