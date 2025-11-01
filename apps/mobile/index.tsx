// Polyfills - Buffer is required for some dependencies
import 'react-native-url-polyfill/auto';
import './src/__create/polyfills';

// Declare global Buffer type
declare global {
  var Buffer: typeof import('buffer').Buffer;
}
global.Buffer = require('buffer').Buffer;

// Use expo-router's entry point - it handles app registration automatically
import 'expo-router/entry';
