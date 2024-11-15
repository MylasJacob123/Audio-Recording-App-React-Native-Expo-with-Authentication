import React, { useState, useEffect } from "react";
import { StyleSheet, ActivityIndicator, View } from "react-native";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useDispatch } from "react-redux";
import { setUser } from "./redux/authSlice";
import { setRecordings } from "./redux/dbSlice";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUserState] = useState(null);
  const dispatch = useDispatch();
  const Stack = createNativeStackNavigator();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem("users");
        console.log("Loaded user data from AsyncStorage:", userData);
        if (userData) {
          const parsedUser = JSON.parse(userData);
          dispatch(setUser({ user: parsedUser }));
          setUserState(parsedUser);
  
          const recordingsData = await AsyncStorage.getItem("recordings");
          const parsedRecordings = JSON.parse(recordingsData) || [];
          dispatch(
            setRecordings(
              parsedRecordings.filter(
                (record) => record.userId === parsedUser.id
              )
            )
          );
        }
      } catch (error) {
        console.error("Failed to load user or recordings", error);
      } finally {
        setLoading(false);
      }
    };
  
    loadUserData();
  }, [dispatch]);

  const saveUserData = async (user) => {
    try {
      await AsyncStorage.setItem("user", JSON.stringify(user));
      dispatch(setUser({ user }));
      setUserState(user);
    } catch (error) {
      console.error("Failed to save user data", error);
    }
  };

  const saveRecordings = async (updatedRecordings) => {
    try {
      await AsyncStorage.setItem(
        "recordings",
        JSON.stringify(updatedRecordings)
      );
      dispatch(setRecordings(updatedRecordings));
    } catch (error) {
      console.error("Failed to save recordings", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={user ? "Login" : "Home"}>
        <Stack.Screen name="Home" options={{ headerShown: false }}>
          {(props) => <Home {...props} saveRecordings={saveRecordings} />}
        </Stack.Screen>
        <Stack.Screen name="Login" options={{ headerShown: false }}>
          {(props) => <Login {...props} saveUserData={saveUserData} />}
        </Stack.Screen>
        <Stack.Screen
          name="Register"
          options={{ headerShown: false }}
          component={Register}
        />
        <Stack.Screen
          name="Profile"
          options={{ headerShown: false }}
          component={Profile}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
