import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSelector, useDispatch } from "react-redux"; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setUser } from "../redux/authSlice"; 

export default function Profile() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        console.log("Loaded user data from AsyncStorage:", userData);
        if (userData) {
          const parsedUser = JSON.parse(userData);
          dispatch(setUser({ user: parsedUser }));
        }
      } catch (error) {
        console.error("Failed to load user data", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [dispatch]);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile</Text>

      {user ? (
        <>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Username:</Text>
            <Text style={styles.info}>{user.userName || "N/A"}</Text> 
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.info}>{user.email || "N/A"}</Text>
          </View>
        </>
      ) : (
        <Text>No user data found</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  infoContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
  },
  info: {
    fontSize: 16,
    color: "#555",
  },
});
