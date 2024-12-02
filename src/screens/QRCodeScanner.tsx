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

  // Carregar nome do técnico logado do AsyncStorage
  React.useEffect(() => {
    const loadTechnicianName = async () => {
      const technician = await AsyncStorage.getItem("loggedTechnician");
      if (technician) {
        const technicianData = JSON.parse(technician);
        setTechnicianName(technicianData.name); // Define o nome do técnico
      }
    };
    loadTechnicianName();
  }, []);

  async function handleOpenCamera() {
    try {
      const { granted } = await requestPermission();

      if (!granted) {
        return Alert.alert("Câmera", "Você precisa habilitar o uso da câmera");
      }

      setModalIsVisible(true);
      qrCodeLock.current = false;
    } catch (error) {
      console.error(error);
    }
  }

  function handleQRCodeRead(data: string) {
    if (!data.includes("\n")) {
      Alert.alert("QR Code inválido", "Certifique-se de que o QR Code possui a estrutura correta.");
      return;
    }

    setEmail(data);
    setModalIsVisible(false);
  }

  async function sendEmail() {
    if (!email || !technicianName) return;

    // Exibir alerta customizado
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
      const response = await axios.post(`${API_URL}/send-email`, {
        email,
        technicianName, // Enviar o nome do técnico no corpo da requisição
      });
      if (!response.data.success) {
        console.error("Erro no servidor ao enviar o e-mail");
      }
    } catch (error) {
      console.error("Erro ao comunicar com o servidor:", error);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leitor de QR Code</Text>
      <TouchableOpacity style={styles.button} onPress={handleOpenCamera}>
        <Text style={styles.buttonText}>Iniciar Leitura</Text>
      </TouchableOpacity>

      <Modal visible={modalIsVisible} transparent={true}>
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
            <View style={styles.frame} />
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setModalIsVisible(false)}
            >
              <MaterialCommunityIcons name="close" size={28} color="white" />
            </TouchableOpacity>
          </View>
        </CameraView>
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
          <Text style={styles.alertText}>
            E-mail enviado! Ele pode chegar em até 3 minutos.
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    width: "80%",
    padding: 15,
    backgroundColor: "#007BFF",
    borderRadius: 8,
    alignItems: "center",
    elevation: 2,
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "transparent",
    paddingVertical: 20,
  },
  scanText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 5,
    borderRadius: 5,
  },
  frame: {
    borderWidth: 3,
    borderColor: "#00FF00",
    width: 250,
    height: 250,
    borderRadius: 10,
  },
  iconButton: {
    width: 50,
    height: 50,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emailContainer: {
    marginTop: 20,
    width: "80%",
  },
  actionButton: {
    padding: 15,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  actionButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  customAlert: {
    position: "absolute",
    bottom: 50,
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    width: "80%",
  },
  alertText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },
});
