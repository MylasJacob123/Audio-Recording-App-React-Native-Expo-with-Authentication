import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Linking
} from "react-native";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from "react-redux";
import { addRecording, deleteRecording, setRecordings } from "../redux/dbSlice";
import * as Sharing from "expo-sharing";

export default function Home({ navigation }) {
  const dispatch = useDispatch();
  const recordings = useSelector((state) => state.db.recordings);
  const [recording, setRecording] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [playingSound, setPlayingSound] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [recordingName, setRecordingName] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);
    } else if (!isRecording && seconds !== 0) {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  useEffect(() => {
    const getUserFromStorage = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Failed to load user data from AsyncStorage", error);
      }
    };

    getUserFromStorage();
  }, []);

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (granted) {
        const newRecording = new Audio.Recording();
        await newRecording.prepareToRecordAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );
        await newRecording.startAsync();
        setRecording(newRecording);
        setIsRecording(true);
        setSeconds(0);
      } else {
        alert("Permission to access microphone is required!");
      }
    } catch (error) {
      console.error("Failed to start recording", error);
    }
  };

  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);
      clearInterval(seconds);
      const newRecording = {
        uri,
        date: new Date().toISOString(),
        duration: formatTime(seconds),
        name: "",
      };
      dispatch(addRecording(newRecording)); 
      setSeconds(0);
      setIsModalVisible(true);
    } catch (error) {
      console.error("Failed to stop recording", error);
    }
  };

  const handleSaveRecording = () => {
    const updatedRecordings = recordings.map((rec, index) =>
      index === recordings.length - 1 ? { ...rec, name: recordingName } : rec
    );
    dispatch(setRecordings(updatedRecordings)); 
    setIsModalVisible(false);
  };

  const handleCancelModal = () => {
    setRecordingName("");
    setIsModalVisible(false);
  };

  const playRecording = async (uri) => {
    if (playingSound) {
      await playingSound.stopAsync();
      setPlayingSound(null);
    }
    const { sound } = await Audio.Sound.createAsync({ uri });
    setPlayingSound(sound);
    await sound.playAsync();
  };

  const deleteRecordingHandler = (uri) => {
    dispatch(deleteRecording(uri));
  };

  const filteredRecordings = recordings.filter(
    (note) =>
      note.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.date.includes(searchQuery)
  );

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      setUser(null);
      navigation.navigate("Login");
    } catch (error) {
      console.error("Failed to logout", error);
    }
  };

  const shareRecording = async (uri) => {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        alert("Sharing is not available on this device.");
      }
    } catch (error) {
      console.error("Failed to share recording", error);
    }
  };

  const googleDriveUpload = () => {
    const googleDriveUrl = "https://drive.google.com";
    Linking.openURL(googleDriveUrl);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Expo Audio Recorder</Text>

      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setIsDropdownVisible(!isDropdownVisible)}
      >
        <Text style={styles.menuButtonText}>☰</Text>
      </TouchableOpacity>

      {isDropdownVisible && (
        <View style={styles.dropdownMenu}>
          <TouchableOpacity style={styles.buttonNav} onPress={() => navigation.navigate("Profile")}>
            <Text style={styles.buttonText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonNav} onPress={handleLogout}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}

      <TextInput
        style={styles.searchBar}
        placeholder="Search by name or date..."
        placeholderTextColor="#f0f8f7"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <Text style={styles.timer}>{formatTime(seconds)}</Text>

      <FlatList
        data={filteredRecordings}
        keyExtractor={(item) => item.uri}
        renderItem={({ item }) => (
          <View style={styles.recordingItem}>
            <Text style={styles.recordingDate}>
              {item.name || "..."} - {item.date} - {item.duration}
            </Text>
            <View style={styles.buttons}>
              <TouchableOpacity
                style={[styles.button, styles.playButton]}
                onPress={() => playRecording(item.uri)}
              >
                <Text style={styles.buttonText}>Play</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={() => deleteRecordingHandler(item.uri)}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.playButton]}
                onPress={() => shareRecording(item.uri)}
              >
                <Text style={styles.buttonText}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.playButton]}
                onPress={googleDriveUpload}
              >
                <Text style={styles.buttonText}>Upload</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <View style={styles.recordingControls}>
        <TouchableOpacity
          style={styles.recordButton}
          onPress={recording ? stopRecording : startRecording}
        >
          <Text style={styles.recordButtonText}>
            {recording ? "Stop Recording" : "Start Recording"}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Name of Recording</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter name"
              value={recordingName}
              onChangeText={setRecordingName}
            />
            <Button title="Save" onPress={handleSaveRecording} />
            <Button title="Cancel" onPress={handleCancelModal} />
          </View>
        </View>
      </Modal>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0b0b",
    paddingTop: 40,
    padding: "10",
  },
  header: {
    fontSize: 30,
    fontWeight: "300",
    textAlign: "left",
    marginLeft: 15,
    marginBottom: 20,
    color: "#1abc9c",
  },
  menuButton: {
    position: "absolute",
    top: 40,
    right: 20,
    padding: 10,
    borderColor: "#1abc9c",
    borderWidth: 1,
    borderRadius: 10,
  },
  menuButtonText: {
    fontSize: 24,
    color: "#1abc9c",
  },
  dropdownMenu: {
    position: "absolute",
    top: 95,
    right: 20,
    backgroundColor: "#202021",
    borderRadius: 10,
    padding: 10,
    width: 150,
    zIndex: 1000,
    gap: 5,
    borderColor: "#1abc9c",
    borderWidth: 1,
  },
  dropdownItem: {
    flex: 1,
    padding: 10,
    borderColor: "#1abc9c",
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
  searchBar: {
    marginHorizontal: 20,
    padding: 10,
    backgroundColor: "#201f20",
    borderColor: "#cbd1d1",
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 15,
    marginBottom: 10,
    color: "white",
  },
  timer: {
    textAlign: "center",
    fontSize: 75,
    fontWeight: "bold",
    color: "#1abc9c",
    margin: 10,
  },
  recordingItem: {
    backgroundColor: "#202021",
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    borderColor: "#cbd1d1",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4
  },
  recordingDate: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#f0f8f7",
    marginBottom: 10,
    textAlign: "center",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonNav: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#1abc9c",
    borderWidth: 1,
  },
  button: {
    backgroundColor: "#555",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  playButton: {
    backgroundColor: "#28a745",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
  },
  shareButton: {
    backgroundColor: "#ffc107",
  },
  uploadButton: {
    backgroundColor: "#17a2b8",
  },
  recordingControls: {
    padding: 20,
    alignItems: "center",
  },
  recordButton: {
    backgroundColor: "#1abc9c",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 30,
  },
  recordButtonText: {
    color: "white",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#f0f8f7",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#0a0b0b",
  },
  modalInput: {
    borderColor: "#0a0b0b",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    width: "100%",
    marginBottom: 20,
    color: "#0a0b0b",
  },
  navigationButtons: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: "10",
  },
  navigationButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    backgroundColor: "#1abc9c",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});
