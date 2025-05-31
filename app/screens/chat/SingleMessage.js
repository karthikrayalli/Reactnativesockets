import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Clipboard,
  Modal,
} from 'react-native';
// import { MaterialIcons, FontAwesome } from '@expo/vector-icons';

const SingleMessage = ({
  message,
  user,
  receiver,
  markdownToHtml,
  socket,
  activeChatId,
  removeMessageFromList,
  showToast,
}) => {
  const isSender = message.senderId === user._id;
  const messageTime = `${new Date(message.createdAt).getHours()}:${new Date(
    message.createdAt
  ).getMinutes()}`;

  const [isHovered, setIsHovered] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleCopy = () => {
    Clipboard.setString(message.text);
    showToast('Copied', 'Message copied to clipboard!');
  };

  const handleDeleteMessage = async (deleteFrom) => {
    removeMessageFromList(message._id);
    setIsDeleteModalOpen(false);

    const deleteFromUsers = [user._id];
    if (deleteFrom === 2) {
      deleteFromUsers.push(receiver._id);
    }

    const data = {
      messageId: message._id,
      conversationId: activeChatId,
      deleteFrom: deleteFromUsers,
    };

    socket.emit('delete-message', data);
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.messageContainer,
          isSender ? styles.senderContainer : styles.receiverContainer,
        ]}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setTimeout(() => setIsHovered(false), 1000)}
      >
        {/* {!isSender && receiver.profilePic && (
          <Image
            style={styles.senderImage}
            source={{ uri: receiver.profilePic }}
          />
        )} */}

        <View style={styles.messageContent}>
          {/* {message.replyto && (
            <View
              style={[
                styles.replyContainer,
                isSender ? styles.senderReply : styles.receiverReply,
              ]}
            >
              <Text style={styles.replyText}>reply to</Text>
            </View>
          )} */}

          <View
            style={[
              styles.messageBubble,
              isSender ? styles.senderBubble : styles.receiverBubble,
            ]}
          >
            {message.imageUrl && (
              <Image
                style={styles.messageImage}
                source={{ uri: message.imageUrl }}
              />
            )}
            <Text style={styles.messageText}>
              {markdownToHtml(message.text)}
            </Text>

            <View style={styles.messageFooter}>
              <Text style={styles.messageTime}>{messageTime}</Text>
              {isSender &&
                message.seenBy?.find(
                  (element) => element.user === receiver._id
                ) && (
                  // <FontAwesome
                  //   name="check-circle"
                  //   size={12}
                  //   color="#48BB78"
                  //   style={styles.seenIcon}
                  // />
                  <Text style={styles.reactionText}>check-circle</Text>
                )}
            </View>

            {message.reaction && (
              <View
                style={[
                  styles.reactionContainer,
                  isSender
                    ? styles.senderReaction
                    : styles.receiverReaction,
                ]}
              >
                <Text style={styles.reactionText}>{message.reaction}</Text>
              </View>
            )}
          </View>
        </View>

        {isHovered && (
          <View
            style={[
              styles.messageActions,
              isSender ? styles.senderActions : styles.receiverActions,
            ]}
          >
            {isSender && (
              <>
                <TouchableOpacity onPress={handleCopy} style={styles.actionButton}>
                  {/* <MaterialIcons name="content-copy" size={20} color="#6B46C1" /> */}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsDeleteModalOpen(true)}
                  style={styles.actionButton}
                >
                  {/* <MaterialIcons name="delete" size={20} color="#E53E3E" /> */}
                </TouchableOpacity>
              </>
            )}
            {!isSender && (
              <TouchableOpacity onPress={handleCopy} style={styles.actionButton}>
                {/* <MaterialIcons name="content-copy" size={20} color="#6B46C1" /> */}
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Delete Message Modal */}
      <Modal
        visible={isDeleteModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsDeleteModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Message</Text>
            <Text style={styles.modalText}>
              Do you want to delete this message for everyone or just for you?
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => handleDeleteMessage(1)}
              >
                <Text style={styles.modalButtonText}>Delete for me</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => handleDeleteMessage(2)}
              >
                <Text style={styles.modalButtonText}>Delete for everyone</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setIsDeleteModalOpen(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  messageContainer: {
    flexDirection: 'row',
    maxWidth: '80%',
    marginHorizontal: 8,
  },
  senderContainer: {
    alignSelf: 'flex-end',
  },
  receiverContainer: {
    alignSelf: 'flex-start',
  },
  senderImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
    alignSelf: 'center',
  },
  // messageContent: {
  //   flex: 1,
  // },
  replyContainer: {
    padding: 8,
    borderRadius: 10,
    marginBottom: 4,
  },
  senderReply: {
    backgroundColor: '#B794F4',
    alignSelf: 'flex-end',
  },
  receiverReply: {
    backgroundColor: '#90CDF4',
    alignSelf: 'flex-start',
  },
  replyText: {
    color: 'red',
    fontSize: 14,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
  },
  senderBubble: {
    backgroundColor: '#9F7AEA',
    borderTopRightRadius: 0,
  },
  receiverBubble: {
    backgroundColor: '#4299E1',
    borderTopLeftRadius: 0,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  messageText: {
    color: 'white',
    fontSize: 16,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  messageTime: {
    color: '#E2E8F0',
    fontSize: 10,
  },
  seenIcon: {
    marginLeft: 4,
  },
  reactionContainer: {
    position: 'absolute',
    bottom: -4,
    borderRadius: 12,
    padding: 2,
    paddingHorizontal: 6,
  },
  senderReaction: {
    left: -4,
    backgroundColor: '#9F7AEA',
  },
  receiverReaction: {
    right: -4,
    backgroundColor: '#4299E1',
  },
  reactionText: {
    fontSize: 12,
    color: 'white',
  },
  messageActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  senderActions: {
    justifyContent: 'flex-start',
  },
  receiverActions: {
    justifyContent: 'flex-end',
  },
  actionButton: {
    marginHorizontal: 4,
    padding: 4,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'column',
  },
  modalButton: {
    backgroundColor: '#6B46C1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalCancelButton: {
    borderWidth: 1,
    borderColor: '#6B46C1',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: '#6B46C1',
    fontWeight: 'bold',
  },
});

export default SingleMessage;
