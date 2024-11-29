import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";

const API_URL = "https://dta-qrcode.onrender.com";

export default function QRCodeScannerScreen() {
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [email, setEmail] = useState<string | null>(null);
  const qrCodeLock = useRef(false);

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
    setEmail(data);
    setModalIsVisible(false);
  }

  async function sendEmail() {
    if (!email) return;

    try {
      const response = await axios.post(`${API_URL}/send-email`, { email });
      if (response.data.success) {
        Alert.alert("Sucesso", "E-mail enviado com sucesso!");
      } else {
        Alert.alert("Erro", "Falha ao enviar o e-mail");
      }
    } catch (error) {
      Alert.alert("Erro", "Erro ao comunicar com o servidor");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leitor de QR Code</Text>
      <Text style={styles.subtitle}>
        Clique no botão abaixo para iniciar a leitura.
      </Text>
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
            <Text style={styles.scanText}>Posicione o QR Code na moldura</Text>
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
          <Text style={styles.emailText}>E-mail escaneado: {email}</Text>
          <TouchableOpacity style={styles.sendButton} onPress={sendEmail}>
            <Text style={styles.sendButtonText}>Enviar E-mail</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 20,
  },
  button: {
    padding: 15,
    backgroundColor: "#007BFF",
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonText: {
    fontSize: 18,
    color: "#ffffff",
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
    color: "#ffffff",
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
    width: 60,
    height: 60,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emailContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  emailText: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 10,
  },
  sendButton: {
    padding: 15,
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    alignItems: "center",
  },
  sendButtonText: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "bold",
  },
});
