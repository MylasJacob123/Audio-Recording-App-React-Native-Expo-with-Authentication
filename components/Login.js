import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { login } from "../redux/authSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();

  const validateLogin = () => {
    let valid = true;
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Enter a valid email";
      valid = false;
    }
    if (!password) {
      newErrors.password = "Password is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (validateLogin()) {
      try {
        const storedUsers = await AsyncStorage.getItem("users");
        const users = storedUsers ? JSON.parse(storedUsers) : [];
  
        const user = users.find(
          (user) => user.email === email && user.password === password
        );
  
        if (user) {
          dispatch(login({ userName: user.userName, email: user.email }));
  
          alert("Login Successful", "Welcome back!");
          navigation.navigate("Home");
        } else {
          alert("Login Failed", "Invalid email or password.");
        }
      } catch (error) {
        console.error("Failed to login", error);
        alert("An error occurred while trying to login.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Login</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#f0f8f7"
          value={email}
          onChangeText={setEmail}
        />
        <MaterialIcons name="email" size={20} color="#f0f8f7" style={styles.icon} />
      </View>
      {errors.email && <Text style={styles.error}>{errors.email}</Text>}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#f0f8f7"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <FontAwesome
            name={showPassword ? "eye" : "eye-slash"}
            size={20}
            color="#f0f8f7"
            style={styles.eyeIcon}
          />
        </TouchableOpacity>
      </View>
      {errors.password && <Text style={styles.error}>{errors.password}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <View style={styles.redirect}>
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.redirectText}>Don't have an account? Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#0a0b0b",
  },
  header: {
    fontSize: 35,
    fontWeight: "300",
    marginBottom: 20,
    color: "#1abc9c",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "85%",
    backgroundColor: "#201f20",
    borderWidth: 1,
    borderColor: "#cbd1d1",
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    padding: 15,
    color: "white",
  },
  eyeIcon: {
    marginLeft: 10,
  },
  button: {
    width: "50%",
    backgroundColor: "#1abc9c",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
  redirect: {
    marginTop: 40,
  },
  redirectText: {
    color: "white",
    fontSize: 18,
  },
  error: {
    color: "red",
    fontSize: 14,
    alignSelf: "flex-start",
    marginLeft: 30,
    marginBottom: 10,
    marginTop: -5,
  },
});
