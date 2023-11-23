import React, { useState, useEffect, useRef } from 'react';
import {
  Platform,
  StatusBar,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  AsyncStorage,
  SafeAreaView,
  KeyboardAvoidingView,
  Image,
  ScrollView,
} from 'react-native';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import Message from './components/Message.jsx';
import botResponses from './DATA/messages.json';
import Splash from './components/splash';
import Icon from 'react-native-vector-icons/FontAwesome';
import io from 'socket.io-client';

const socket = io('http://localhost:19006');

export default function App() {
  const [inputText, setInputText] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [thèmeSombreActif, setThèmeSombreActif] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(new Audio.Recording());
  const scrollViewRef = useRef();

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const storedMessages = await AsyncStorage.getItem('chatMessages');
        if (storedMessages) {
          setChatMessages(JSON.parse(storedMessages));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des messages depuis le stockage local :', error);
      }
    };

    loadMessages();

    setTimeout(() => {
      setShowSplash(false);
    }, 3000);
  }, []);

  useEffect(() => {
    if (thèmeSombreActif) {
      StatusBar.setBarStyle('light-content');
    } else {
      StatusBar.setBarStyle('dark-content');
    }
  }, [thèmeSombreActif]);

  useEffect(() => {
    const handleReceivedMessage = (message) => {
      const newMessage = {
        id: chatMessages.length + 1,
        sender: message.sender,
        content: message.content,
      };

      setChatMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    socket.on('message', handleReceivedMessage);

    return () => {
      socket.off('message', handleReceivedMessage);
    };
  }, [chatMessages]);

  if (showSplash) {
    return <Splash />;
  }

  const saveMessages = async (messages) => {
    try {
      await AsyncStorage.setItem('chatMessages', JSON.stringify(messages));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des messages dans le stockage local :', error);
    }
  };

  const getRandomResponse = () => {
    const responseKeys = Object.keys(botResponses.answers);
    const randomResponseId = responseKeys[Math.floor(Math.random() * responseKeys.length)];
    return botResponses.answers[randomResponseId];
  };

  const handleSendMessage = () => {
    if (inputText.trim() !== '') {
      socket.emit('message', { sender: 'Moi', content: inputText });
      setInputText('');
    }
  };

 
  const handleOpenGallery = async () => {
    if (isRecording) {
      try {
        await recording.stopAndUnloadAsync();
        setIsRecording(false);
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
    }
  
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
  
    if (!result.cancelled) {
      const userImageMessage = {
        id: chatMessages.length + 1,
        sender: 'Moi',
        image: result.uri,
      };
  
      const updatedMessages = [...chatMessages, userImageMessage];
      setChatMessages(updatedMessages);
      saveMessages(updatedMessages);
    }
  };
  

  const handleToggleRecording = async () => {
    if (isRecording) {
      try {
        await recording.stopAndUnloadAsync();
        setIsRecording(false);
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
    } else {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        });

        const recordingObject = new Audio.Recording();
        await recordingObject.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
        await recordingObject.startAsync();

        setRecording(recordingObject);
        setIsRecording(true);
      } catch (error) {
        console.error('Error starting recording:', error);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={require('./components/cerveau1.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.appName}>TalkWave</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -StatusBar.currentHeight}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
          ref={scrollViewRef}
          onContentSizeChange={() => {
            scrollViewRef.current.scrollToEnd({ animated: true });
          }}
        >
          <FlatList
            data={chatMessages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <Message data={item} />}
          />
        </ScrollView>

        <View style={[styles.inputContainer, { marginBottom: 15 }]}>
          <TextInput
            style={styles.input}
            placeholder="Conversation..."
            value={inputText}
            onChangeText={(text) => setInputText(text)}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Icon name="paper-plane" size={18} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.sendButton2} onPress={handleOpenGallery}>
            <Icon name="image" size={18} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.sendButton2} onPress={handleToggleRecording}>
            <Icon name={isRecording ? 'stop-circle' : 'microphone'} size={18} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'center',
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  appName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  keyboardAvoidingContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: 'grey',
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 12,
    fontSize: 16,
    backgroundColor: 'black',
    color: 'white',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton2: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
