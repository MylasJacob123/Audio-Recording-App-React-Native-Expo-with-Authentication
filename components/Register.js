import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useDispatch } from "react-redux"; 
import { setUser } from "../redux/authSlice"; 
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Register({ navigation }) {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);  
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  
  const dispatch = useDispatch();

  const validateRegister = () => {
    let valid = true;
    const newErrors = {};

    if (!userName) {
      newErrors.userName = "Username is required";
      valid = false;
    }
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
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm your password";
      valid = false;
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleRegister = () => {
    if (validateRegister()) {
      const newUser = { userName, email, password };
      
      AsyncStorage.getItem('users')
        .then((storedUsers) => {
          const users = storedUsers ? JSON.parse(storedUsers) : [];
          users.push(newUser);
  
          AsyncStorage.setItem('users', JSON.stringify(users));
  
          dispatch(setUser(newUser));
  
          alert("Registration Successful", "You can now log in.");
          navigation.navigate("Login");
        })
        .catch((error) => {
          console.error("Failed to save users", error);
          alert("Registration failed");
        });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Register</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#f0f8f7"
          value={userName}
          onChangeText={setUserName}
        />
        <FontAwesome name="user" size={20} color="#f0f8f7" style={styles.icon} />
      </View>
      {errors.userName && <Text style={styles.error}>{errors.userName}</Text>}

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

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#f0f8f7"
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <FontAwesome
            name={showConfirmPassword ? "eye" : "eye-slash"}
            size={20}
            color="#f0f8f7"
            style={styles.eyeIcon}
          />
        </TouchableOpacity>
      </View>
      {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <View style={styles.redirect}>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.redirectText}>Already have an account? Login</Text>
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
