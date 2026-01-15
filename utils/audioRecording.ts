import { Audio } from 'expo-av';
import { Platform } from 'react-native';

let recording: Audio.Recording | null = null;
let webMediaRecorder: MediaRecorder | null = null;
let webAudioChunks: Blob[] = [];

export async function requestAudioPermissions(): Promise<boolean> {
  try {
    if (Platform.OS === 'web') {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    }
    const { status } = await Audio.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting audio permissions:', error);
    return false;
  }
}

export async function startRecording(): Promise<void> {
  try {
    const hasPermission = await requestAudioPermissions();
    if (!hasPermission) {
      throw new Error('Audio recording permission not granted');
    }

    if (Platform.OS === 'web') {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      webMediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      webAudioChunks = [];
      
      webMediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          webAudioChunks.push(event.data);
        }
      };
      
      webMediaRecorder.start();
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording: newRecording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    
    recording = newRecording;
  } catch (error) {
    console.error('Failed to start recording:', error);
    throw error;
  }
}

export async function stopRecording(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      if (!webMediaRecorder) {
        throw new Error('No active recording');
      }
      
      return new Promise((resolve, reject) => {
        if (!webMediaRecorder) {
          reject(new Error('No active recording'));
          return;
        }
        
        webMediaRecorder.onstop = () => {
          const audioBlob = new Blob(webAudioChunks, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          webMediaRecorder?.stream.getTracks().forEach(track => track.stop());
          webMediaRecorder = null;
          webAudioChunks = [];
          resolve(audioUrl);
        };
        
        webMediaRecorder.onerror = (event) => {
          reject(new Error('Recording failed'));
        };
        
        webMediaRecorder.stop();
      });
    }

    if (!recording) {
      throw new Error('No active recording');
    }

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    recording = null;
    
    return uri;
  } catch (error) {
    console.error('Failed to stop recording:', error);
    recording = null;
    webMediaRecorder = null;
    throw error;
  }
}

export function isRecording(): boolean {
  if (Platform.OS === 'web') {
    return webMediaRecorder !== null && webMediaRecorder.state === 'recording';
  }
  return recording !== null;
}

export function getWebAudioBlob(): Blob | null {
  if (webAudioChunks.length > 0) {
    return new Blob(webAudioChunks, { type: 'audio/webm' });
  }
  return null;
}
