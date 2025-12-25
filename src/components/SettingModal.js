import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const checkFirstLaunchForDeepLinks = async (setShowModal) => {
  if (Platform.OS !== 'android' || Platform.Version < 31) return;

  const hasLaunched = await AsyncStorage.getItem('hasLaunchedDeepLinkPrompt');
  if (!hasLaunched) {
    await AsyncStorage.setItem('hasLaunchedDeepLinkPrompt', 'true');
    setShowModal(true); // show custom modal
  }
};

// Usage in a component
export default function SettingModel() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    checkFirstLaunchForDeepLinks(setShowModal);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Modal visible={showModal} transparent animationType="fade">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ width: 300, padding: 20, backgroundColor: 'white', borderRadius: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Enable App Links</Text>
            <Text style={{ fontSize: 16, marginBottom: 20 }}>
              To open links directly in this app, please enable "Open supported links" in App Info → Open by default.
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity onPress={() => setShowModal(false)} style={{ marginRight: 10 }}>
                <Text style={{ color: 'gray', fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  Linking.openSettings();
                  setShowModal(false);
                }}
              >
                <Text style={{ color: 'blue', fontWeight: 'bold' }}>Go to Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
