import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://dta-qrcode.onrender.com";

export default function QRCodeScannerScreen() {
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [email, setEmail] = useState<string | null>(null);
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const qrCodeLock = useRef(false);
  const [technicianName, setTechnicianName] = useState<string | null>(null);

  React.useEffect(() => {
    const loadTechnicianName = async () => {
      const technician = await AsyncStorage.getItem("loggedTechnician");
      if (technician) {
        const technicianData = JSON.parse(technician);
        setTechnicianName(technicianData.name);
      }
    };
    loadTechnicianName();
  }, []);

  async function handleOpenCamera() {
    const { granted } = await requestPermission();
    if (!granted) {
      return Alert.alert("Permissão Necessária", "Habilite a câmera para continuar.");
    }
    setModalIsVisible(true);
    qrCodeLock.current = false;
  }

  function handleQRCodeRead(data: string) {
    if (!data.includes("\n")) {
      Alert.alert("QR Code Inválido", "O QR Code deve seguir a estrutura correta.");
      return;
    }
    setEmail(data);
    setModalIsVisible(false);
  }

  async function sendEmail() {
    if (!email || !technicianName) return;

    setShowCustomAlert(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setShowCustomAlert(false));
      setEmail(null);
    }, 3000);

    try {
      await axios.post(`${API_URL}/send-email`, { email, technicianName });
    } catch (error) {
      console.error("Erro ao enviar e-mail:", error);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>QR Code Scanner</Text>
      <TouchableOpacity style={styles.button} onPress={handleOpenCamera}>
        <MaterialCommunityIcons name="qrcode-scan" size={24} color="white" />
        <Text style={styles.buttonText}>Iniciar Leitura</Text>
      </TouchableOpacity>

      <Modal visible={modalIsVisible} transparent={true}>
        <View style={styles.modalBackground}>
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={({ data }) => {
              if (data && !qrCodeLock.current) {
                qrCodeLock.current = true;
                setTimeout(() => handleQRCodeRead(data), 500);
              }
            }}
          >
            <View style={styles.overlay}>
              <View style={styles.scanFrame} />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalIsVisible(false)}
              >
                <MaterialCommunityIcons name="close" size={32} color="#fff" />
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      </Modal>

      {email && (
        <View style={styles.emailContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={sendEmail}>
            <Text style={styles.actionButtonText}>Enviar E-mail</Text>
          </TouchableOpacity>
        </View>
      )}

      {showCustomAlert && (
        <Animated.View style={[styles.customAlert, { opacity: fadeAnim }]}>
          <Text style={styles.alertText}>E-mail enviado com sucesso!</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#222",
    marginBottom: 30,
    textAlign: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007BFF",
    padding: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
    marginLeft: 8,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scanFrame: {
    width: 260,
    height: 260,
    borderWidth: 2,
    borderColor: "#4CAF50",
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    padding: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
  },
  emailContainer: {
    marginTop: 30,
    width: "90%",
  },
  actionButton: {
    backgroundColor: "#28A745",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  customAlert: {
    position: "absolute",
    bottom: 60,
    backgroundColor: "#333",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  alertText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
});
