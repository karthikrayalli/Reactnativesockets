import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/chatContext';
import AsyncStorage from "@react-native-async-storage/async-storage";

const Login = () => {
  const context = useAuth();
  const { hostName, socket, setUser, setIsAuthenticated, fetchData } = context;
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordShow, setForgotPasswordShow] = useState(false);
  const [sending, setSending] = useState(false);
  const [otp, setOtp] = useState('');

  const showToast = (title, message) => {
    Alert.alert(title, message);
  };

  const handleLogin = async (e) => {
    e?.preventDefault?.();

    const data = {
      email: email,
    };

    if (otp?.length > 0 && forgotPasswordShow) {
      data.otp = otp;
    } else {
      data.password = password;
    }

    try {
      const response = await fetch(`${hostName}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      console.log("response",response)
      const resdata = await response.json();
      console.log("resdata",resdata)
      if (response.status !== 200) {
        showToast('An error occurred.', resdata.error);
      } else {
        showToast('Login successful', 'You are now logged in');

        await AsyncStorage.setItem('token', resdata.authtoken);
        setUser(await resdata.user);
        socket.emit('setup', await resdata.user._id);
        setIsAuthenticated(true);
        fetchData();
        // navigation.navigate('Dashboard');
      }
    } catch (error) {
      console.log(error);
      showToast('Error', 'An error occurred during login');
    }
  };

  const handleSendOtp = async () => {
    setSending(true);

    const data = {
      email: email,
    };

    try {
      const response = await fetch(`${hostName}/auth/getotp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const resdata = await response.json();

      setSending(false);

      if (response.status !== 200) {
        showToast('An error occurred.', resdata.error);
      } else {
        showToast('OTP sent', 'OTP sent to your email');
      }
    } catch (error) {
      console.log(error);
      setSending(false);
    }
  };

  return (
    // <KeyboardAvoidingView
    //   behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    //   style={styles.container}
    // >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {/* <FontAwesome name="user" size={24} color="white" /> */}
            </View>
            <Text style={styles.welcomeText}>Welcome Back</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.form}>
              {forgotPasswordShow && (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setForgotPasswordShow(false)}
                >
                  {/* <MaterialIcons name="arrow-back" size={24} color="#6B46C1" /> */}
                </TouchableOpacity>
              )}

              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  placeholderTextColor="#A0AEC0"
                />
                {forgotPasswordShow && (
                  <TouchableOpacity
                    style={styles.sendOtpButton}
                    onPress={handleSendOtp}
                    disabled={sending}
                  >
                    {sending ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.sendOtpText}>Send OTP</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {!forgotPasswordShow && (
                <View style={styles.passwordContainer}>
                  <View style={styles.passwordInput}>
                    {/* <Feather
                      name="lock"
                      size={20}
                      color="#A0AEC0"
                      style={styles.inputIcon}
                    /> */}
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder="Password"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      placeholderTextColor="#A0AEC0"
                    />
                    <TouchableOpacity
                      style={styles.showButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Text style={styles.showButtonText}>
                        {showPassword ? 'Hide' : 'Show'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={styles.forgotPassword}
                    onPress={() => setForgotPasswordShow(true)}
                  >
                    <Text style={styles.forgotPasswordText}>
                      Forgot password?
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {forgotPasswordShow && (
                <View style={styles.inputGroup}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter OTP"
                    keyboardType="numeric"
                    value={otp}
                    onChangeText={setOtp}
                    placeholderTextColor="#A0AEC0"
                  />
                </View>
              )}

              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
              >
                <Text style={styles.loginButtonText}>
                  {forgotPasswordShow ? 'Login using OTP' : 'Login'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    // </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#9F7AEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A5568',
  },
  card: {
    width: '100%',
    maxWidth: 468,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  form: {
    width: '100%',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  inputGroup: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#2D3748',
  },
  sendOtpButton: {
    backgroundColor: '#6B46C1',
    borderRadius: 10,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendOtpText: {
    color: 'white',
    fontWeight: 'bold',
  },
  passwordContainer: {
    marginBottom: 15,
  },
  passwordInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  showButton: {
    padding: 10,
  },
  showButtonText: {
    color: '#6B46C1',
    fontSize: 12,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  forgotPasswordText: {
    color: '#6B46C1',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#6B46C1',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  signupContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  signupText: {
    color: '#4A5568',
  },
  signupLink: {
    color: '#6B46C1',
    fontWeight: 'bold',
  },
});

export default Login;