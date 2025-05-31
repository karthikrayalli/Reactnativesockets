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
import AsyncStorage from "@react-native-async-storage/async-storage";

const NewChats = () => {
  // const { setActiveTab } = route.params;
  const [data, setData] = useState([]);
  const [users, setUsers] = useState(data);
  const [isLoading, setIsLoading] = useState(true);
    const context = useAuth();
  
  const {
    hostName,
    socket,
    user,
    myChatList,
    setMyChatList,
    setReceiver,
    setActiveChatId,
  } = context;

  const fetchNonFriendsList = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${hostName}/user/non-friends`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': await AsyncStorage.getItem('token'),
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const jsonData = await response.json();
      setData(jsonData);
      setUsers(jsonData);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNonFriendsList();
  }, [myChatList]);

  const handleUserSearch = (text) => {
    if (text !== '') {
      const newusers = data.filter((user) =>
        user.name.toLowerCase().includes(text.toLowerCase())
      );
      setUsers(newusers);
    } else {
      setUsers(data);
    }
  };

  const handleNewChat = async (receiverid) => {
    const payload = { members: [user._id, receiverid] };
    try {
      const response = await fetch(`${hostName}/conversation/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': await AsyncStorage.getItem('token'),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();

      setMyChatList([data, ...myChatList]);
      setReceiver(data.members[0]);
      setActiveChatId(data._id);
      // setActiveTab(0);

      socket.emit('join-chat', {
        roomId: data._id,
        userId: user._id,
      });

      setUsers((users) => users.filter((user) => user._id !== receiverid));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* <TouchableOpacity
          style={styles.backButton}
          onPress={() => setActiveTab(0)}
        >
          <MaterialIcons name="arrow-back" size={24} color="#6B46C1" />
        </TouchableOpacity> */}
        <View style={styles.searchContainer}>
          {/* <FontAwesome name="search" size={16} color="#A0AEC0" style={styles.searchIcon} /> */}
          <TextInput
            style={styles.searchInput}
            placeholder="Enter Name"
            onChangeText={handleUserSearch}
          />
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B46C1" />
        </View>
      ) : (
        <ScrollView style={styles.userList}>
          <TouchableOpacity style={styles.newGroupButton}>
            <Text style={styles.newGroupButtonText}>Create New Group</Text>
            {/* <MaterialIcons name="add" size={16} color="white" /> */}
          </TouchableOpacity>
          {users.map(
            (userItem) =>
              userItem._id !== context.user._id && (
                <TouchableOpacity
                  key={userItem._id}
                  style={styles.userItem}
                  onPress={() => handleNewChat(userItem._id)}
                >
                  <Image
                    source={{ uri: userItem.profilePic }}
                    style={styles.userImage}
                  />
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{userItem.name}</Text>
                    <Text style={styles.userPhone}>{userItem.phoneNum}</Text>
                  </View>
                  {/* <MaterialIcons
                    name="chevron-right"
                    size={24}
                    color="#A0AEC0"
                  /> */}
                </TouchableOpacity>
              )
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    marginRight: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 20
    },
});

export default NewChats;