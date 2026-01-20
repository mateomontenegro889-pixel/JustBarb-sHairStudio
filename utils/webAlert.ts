import { Alert, Platform } from 'react-native';

interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void | Promise<void>;
}

export function showAlert(
  title: string,
  message: string,
  buttons: AlertButton[]
): void {
  if (Platform.OS === 'web') {
    const confirmButton = buttons.find(b => b.style !== 'cancel');
    const cancelButton = buttons.find(b => b.style === 'cancel');
    
    const confirmed = window.confirm(`${title}\n\n${message}`);
    
    if (confirmed && confirmButton?.onPress) {
      confirmButton.onPress();
    } else if (!confirmed && cancelButton?.onPress) {
      cancelButton.onPress();
    }
  } else {
    Alert.alert(title, message, buttons);
  }
}

export function showError(title: string, message: string): void {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}
