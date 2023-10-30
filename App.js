import React, { useState, useEffect, useRef } from 'react';
import {Platform,StatusBar,Text,View,TextInput,TouchableOpacity,StyleSheet,
FlatList,AsyncStorage,SafeAreaView,KeyboardAvoidingView,Image,ScrollView,Modal,TouchableWithoutFeedback,} from 'react-native';
import { Audio, Recording } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import Message from './components/Message.jsx';
import botResponses from './DATA/messages.json';
import Splash from './components/splash'; // Importez le composant Splash
import Icon from 'react-native-vector-icons/FontAwesome';

export default function App() {
  const [inputText, setInputText] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [thèmeSombreActif, setThèmeSombreActif] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
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
    const userTextMessage = {
      id: chatMessages.length + 1,
      sender: 'Moi',
      content: inputText,
    };

    const botResponse = {
      id: chatMessages.length + 2,
      sender: 'Talk-bot',
      content: getRandomResponse(),
    };

    const updatedMessages = [...chatMessages, userTextMessage, botResponse];
    setChatMessages(updatedMessages);
    saveMessages(updatedMessages);
    setInputText('');
  }
};


  const handleOpenGallery = async () => {
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

      const botResponse = {
        id: chatMessages.length + 2,
        sender: 'Capitaine-smile',
        content: getRandomResponse(),
      };

      const updatedMessages = [...chatMessages, userImageMessage, botResponse];
      setChatMessages(updatedMessages);
      saveMessages(updatedMessages);
    }
  };

  const basculerThème = () => {
    setThèmeSombreActif(!thèmeSombreActif);
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
        placeholder="Posez votre question..."
        value={inputText}
        onChangeText={(text) => setInputText(text)}
      />
      <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
        <Icon name="paper-plane" size={18} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.sendButton2} onPress={handleOpenGallery}>
        <Icon name="image" size={18} color="white" />
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
    //backgroundColor: '#808fe3',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    //marginLeft: 0,
  },
  sendButton2: {
    width: 40,
    height: 40,
   
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    //marginLeft: 0,
  },
});
