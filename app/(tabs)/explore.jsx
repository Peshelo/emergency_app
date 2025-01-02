import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import * as Clipboard from "expo-clipboard"; // Import Clipboard for copying
import pb from "../../lib/connection";
import { Stack } from "expo-router";

// Constant list of cities
const cities = [
  "Harare",
  "Bulawayo",
  "Chitungwiza",
  "Mutare",
  "Epworth",
  "Gweru",
  "Kwekwe",
  "Kadoma",
  "Masvingo",
  "Chinhoyi",
  "Marondera",
  "Norton",
  "Chegutu",
  "Zvishavane",
  "Victoria Falls",
  "Hwange",
  "Redcliff",
  "Rusape",
  "Chiredzi",
  "Bindura",
  "Beitbridge",
  "Shurugwi",
  "Chipinge",
  "Kariba",
  "Karoi",
  "Gokwe",
  "Mvurwi",
  "Shamva",
  "Ruwa",
  "Nyanga",
  "Mazowe",
  "Chirundu",
  "Plumtree",
  "Mutoko",
  "Murewa",
  "Gwanda",
  "Binga",
  "Zaka",
  "Chimanimani",
  "Mvuradona",
];

// Constant list of priorities
const priorities = [
  { label: "Low", value: "green" },
  { label: "Medium", value: "yellow" },
  { label: "High", value: "red" },
];

const emergencyTypes = [
  { id: 1, title: "Fire", icon: "fire", color: "#ff6347" },
  { id: 2, title: "Medical Emergency", icon: "medkit", color: "#4CAF50" },
  { id: 3, title: "Crime", icon: "gavel", color: "#ff4500" },
  { id: 4, title: "Accident", icon: "car-crash", color: "#FFA500" },
  { id: 5, title: "Natural Disaster", icon: "wind", color: "#6A5ACD" },
  { id: 6, title: "Domestic Violence", icon: "user-shield", color: "#FF69B4" },
  { id: 7, title: "Suspicious Activity", icon: "eye", color: "#1E90FF" },
  { id: 8, title: "Theft", icon: "hand-holding-usd", color: "#FFD700" },
  { id: 9, title: "Lost Item", icon: "question-circle", color: "#8B4513" },
  { id: 10, title: "Traffic Violation", icon: "traffic-light", color: "#DC143C" },
];

const EmergencyCard = ({ type, onReport }) => (
  <TouchableOpacity
    style={[styles.emergencyButton, { backgroundColor: type.color }]}
    onPress={() => onReport(type)}
  >
    <FontAwesome5 name={type.icon} size={32} color="white" />
    <Text style={styles.emergencyText}>{type.title}</Text>
  </TouchableOpacity>
);

const Explore = () => {
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [description, setDescription] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedMerchant, setSelectedMerchant] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [location, setLocation] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [merchants, setMerchants] = useState([]);
  const [caseId, setCaseId] = useState(null); // State to hold CaseId
  const [successModalVisible, setSuccessModalVisible] = useState(false); // State for success modal

  useEffect(() => {
    const requestLocationPermission = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required.");
        return;
      }

      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation.coords);
    };

    const fetchMerchants = async () => {
      try {
        const records = await pb.collection("merchant").getFullList();
        setMerchants(records);
      } catch (error) {
        Alert.alert("Error", "Failed to fetch merchants.");
      }
    };

    requestLocationPermission();
    fetchMerchants();
  }, []);

  const handleReportEmergency = (type) => {
    setSelectedEmergency(type);
    setModalVisible(true);
  };

  const validate = () => {
    const newErrors = {};
    if (!description) newErrors.description = "Description is required";
    if (!selectedCity) newErrors.city = "City is required";
    if (!selectedPriority) newErrors.priority = "Priority is required";
    if (!selectedMerchant) newErrors.merchant = "Merchant is required";
    return newErrors;
  };

  const handleImagePick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmitReport = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", selectedEmergency.title);
      formData.append("description", description);
      formData.append("city", selectedCity);
      formData.append("address", "test"); // Replace with actual address if needed
      formData.append("latitude", location.latitude.toString());
      formData.append("longitude", location.longitude.toString());
      formData.append("merchant", selectedMerchant);
      formData.append("status", "Open");
      formData.append("priority", selectedPriority);
      formData.append("phoneNumber", "test"); // Replace with actual phone number if needed

      if (imageUri) {
        const fileName = imageUri.split("/").pop();
        formData.append("images", {
          uri: imageUri,
          name: fileName,
          type: "image/jpeg",
        });
      }

      const record = await pb.collection("cases").create(formData);
      setCaseId(record.id); // Set CaseId
      setSuccessModalVisible(true); // Show success modal
      setModalVisible(false);
      resetForm();
    } catch (error) {
      Alert.alert("Error", "Failed to submit the case. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDescription("");
    setSelectedEmergency(null);
    setSelectedCity("");
    setSelectedPriority("");
    setSelectedMerchant("");
    setImageUri(null);
    setErrors({});
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(caseId);
    Alert.alert("Copied!", "Case ID has been copied to your clipboard.");
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Report Case',headerShown:true ,
        headerRight: () => (
          <Image source={require('../../assets/images/logo.jpg')} style={styles.logoHeader} />
        )
       }}/>
      <ScrollView contentContainerStyle={styles.emergencyList}>
        {emergencyTypes.map((type) => (
          <EmergencyCard key={type.id} type={type} onReport={handleReportEmergency} />
        ))}
      </ScrollView>
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Report {selectedEmergency?.title}</Text>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.input}
              placeholder="Describe the emergency"
              multiline
              value={description}
              onChangeText={setDescription}
            />
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
            
            <Text style={styles.label}>City</Text>
            <Picker
              selectedValue={selectedCity}
              onValueChange={(itemValue) => setSelectedCity(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select a city" value="" />
              {cities.map((city, index) => (
                <Picker.Item key={index} label={city} value={city} />
              ))}
            </Picker>
            {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}

            <Text style={styles.label}>Priority</Text>
            <Picker
              selectedValue={selectedPriority}
              onValueChange={(itemValue) => setSelectedPriority(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select a priority" value="" />
              {priorities.map((priority) => (
                <Picker.Item key={priority.label} label={priority.label} value={priority.value} />
              ))}
            </Picker>
            {errors.priority && <Text style={styles.errorText}>{errors.priority}</Text>}

            <Text style={styles.label}>Select Merchant</Text>
            <Picker
              selectedValue={selectedMerchant}
              onValueChange={(itemValue) => setSelectedMerchant(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select a merchant" value="" />
              {merchants.map((merchant) => (
                <Picker.Item key={merchant.id} label={merchant.name} value={merchant.id} />
              ))}
            </Picker>
            {errors.merchant && <Text style={styles.errorText}>{errors.merchant}</Text>}

            <TouchableOpacity style={styles.buttonUpload} onPress={handleImagePick}>
              <Text style={styles.buttonText}>Upload Image</Text>
            </TouchableOpacity>

            {imageUri && <Image source={{ uri: imageUri }} style={styles.imagePreview} />}

            <TouchableOpacity style={styles.button} onPress={handleSubmitReport} disabled={loading}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Submit Report</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={successModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Report Submitted Successfully!</Text>
            <Text style={styles.modalMessage}>Your case ID is: {caseId}</Text>
            <TouchableOpacity style={styles.button} onPress={copyToClipboard}>
              <Text style={styles.buttonText}>Copy Case ID</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSuccessModalVisible(false)}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  emergencyList: {
    flexDirection: "row",
    width: "100%",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 100,
    height: 100,
    objectFit: 'contain',
    alignSelf: 'center',
    marginVertical: 16,
  },
  logoHeader: {
    width: 40,
    height: 40,
    objectFit: 'cover',
marginRight: 10,
borderRadius: 50,
 },
  emergencyButton: {
    backgroundColor: "#28a745",
    borderRadius: 10,
    padding: 20,
    margin: 5,
    height: 150,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "45%",
  },
  emergencyText: {
    color: "white",
    fontSize: 18,
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "100%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: "100%",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#00AA4DFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonUpload: {
   backgroundColor: "#216CBBFF",
    color: "#007BFF",
    borderStyle: "dashed",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: "#dc3545",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 5,
    marginBottom: 10,
  },
});

export default Explore;
