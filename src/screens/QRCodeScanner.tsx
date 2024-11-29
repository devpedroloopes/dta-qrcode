import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import axios from "axios";

const API_URL = "https://dta-qrcode.onrender.com";

export default function QRCodeScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [email, setEmail] = useState<string | null>(null);
  const qrCodeLock = useRef(false);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    (async () => {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert("Câmera", "Você precisa habilitar o uso da câmera");
      }
    })();
  }, []);

  function handleQRCodeRead(data: string) {
    setEmail(data);
    setIsScanning(false);
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
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={({ data }) => {
          if (isScanning && data && !qrCodeLock.current) {
            qrCodeLock.current = true;
            setTimeout(() => {
              handleQRCodeRead(data);
              qrCodeLock.current = false;
            }, 500);
          }
        }}
      />
      <View style={styles.overlay}>
        <Text style={styles.title}>
          {email ? "QR Code Lido!" : "Posicione o QR Code na área"}
        </Text>

        {!email ? (
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => setIsScanning(true)}
          >
            <Text style={styles.scanButtonText}>Escanear</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.sendButton} onPress={sendEmail}>
            <Text style={styles.sendButtonText}>Enviar E-mail</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  scanButton: {
    width: "80%",
    padding: 15,
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    alignItems: "center",
  },
  scanButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  sendButton: {
    width: "80%",
    padding: 15,
    backgroundColor: "#007BFF",
    borderRadius: 10,
    alignItems: "center",
  },
  sendButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
});
