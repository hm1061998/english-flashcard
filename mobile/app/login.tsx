import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { setAuth } from "@/store/slices/authSlice";
import { Button } from "@/components/Button";
import apiClient from "@/api/client";
import * as SecureStore from "expo-secure-store";
import { FontAwesome, Feather } from "@expo/vector-icons";

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      
      // Don't send confirmPassword to backend
      const { confirmPassword, ...payload } = data;
      
      const response = await apiClient.post(endpoint, payload);
      const { user, access_token: accessToken } = response as any;

      // Save token
      await SecureStore.setItemAsync("auth_token", accessToken);

      // Update state
      dispatch(
        setAuth({
          user: {
            id: user.id,
            email: user.email || user.username,
            name: user.username,
          },
          token: accessToken,
        }),
      );

      router.replace("/(tabs)");
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        (isRegister ? "Đăng ký thất bại" : "Đăng nhập thất bại");
      Alert.alert(
        "Lỗi",
        typeof message === "string" ? message : JSON.stringify(message),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMockLogin = () => {
    dispatch(
      setAuth({
        user: {
          id: "1",
          email: "guest@example.com",
          name: "Khách",
        },
        token: "mock-token",
      }),
    );
    router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/2068/2068153.png",
            }}
            style={styles.logo}
          />
          <Text style={styles.title}>English Flashcard</Text>
          <Text style={styles.subtitle}>
            {isRegister
              ? "Tạo tài khoản mới"
              : "Học tiếng Anh thông minh mỗi ngày"}
          </Text>
        </View>

        <View style={styles.formContainer}>
          {/* Tên đăng nhập */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Tên đăng nhập</Text>
            <View style={styles.inputContainer}>
              <Feather
                name="user"
                size={20}
                color="#9ca3af"
                style={styles.inputIcon}
              />
              <Controller
                control={control}
                name="username"
                rules={{ required: "Vui lòng nhập tên đăng nhập" }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập tên đăng nhập..."
                    placeholderTextColor="#9ca3af"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="none"
                  />
                )}
              />
            </View>
            {errors.username && (
              <Text style={styles.errorText}>{errors.username.message}</Text>
            )}
          </View>

          {/* Mật khẩu */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.inputContainer}>
              <Feather
                name="lock"
                size={20}
                color="#9ca3af"
                style={styles.inputIcon}
              />
              <Controller
                control={control}
                name="password"
                rules={{
                  required: "Vui lòng nhập mật khẩu",
                  minLength: {
                    value: 6,
                    message: "Mật khẩu phải ít nhất 6 ký tự",
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập mật khẩu..."
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={!showPassword}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather
                  name={showPassword ? "eye" : "eye-off"}
                  size={20}
                  color="#9ca3af"
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password.message}</Text>
            )}
          </View>

          {/* Nhập lại mật khẩu (Chỉ hiển thị khi Đăng ký) */}
          {isRegister && (
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Nhập lại mật khẩu</Text>
              <View style={styles.inputContainer}>
                <Feather
                  name="shield"
                  size={20}
                  color="#9ca3af"
                  style={styles.inputIcon}
                />
                <Controller
                  control={control}
                  name="confirmPassword"
                  rules={{
                    required: "Vui lòng nhập lại mật khẩu",
                    validate: (value) =>
                      value === password || "Mật khẩu nhập lại không khớp",
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập lại mật khẩu..."
                      placeholderTextColor="#9ca3af"
                      secureTextEntry={!showConfirmPassword}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Feather
                    name={showConfirmPassword ? "eye" : "eye-off"}
                    size={20}
                    color="#9ca3af"
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
              )}
            </View>
          )}

          <Button
            title={isRegister ? "Đăng Ký" : "Đăng Nhập"}
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            variant="primary"
          />

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => {
              setIsRegister(!isRegister);
              reset();
            }}
          >
            <Text style={styles.switchText}>
              {isRegister
                ? "Đã có tài khoản? Đăng nhập"
                : "Chưa có tài khoản? Đăng ký ngay"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.or}>HOẶC</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.socialButtons}>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={handleMockLogin}
          >
            <FontAwesome name="google" size={20} color="#DB4437" />
            <Text style={styles.socialText}>Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialButton, { backgroundColor: "#000" }]}
            onPress={handleMockLogin}
          >
            <FontAwesome name="apple" size={20} color="#fff" />
            <Text style={[styles.socialText, { color: "#fff" }]}>Apple</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleMockLogin} style={styles.guestButton}>
          <Text style={styles.guestText}>Dùng thử ngay (Khách)</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          Bằng cách tiếp tục, bạn đồng ý với Điều khoản và Chính sách bảo mật
          của chúng tôi.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    padding: 30,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4f46e5",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 8,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
  },
  inputWrapper: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  switchButton: {
    alignItems: "center",
    marginTop: 15,
  },
  switchText: {
    color: "#4f46e5",
    fontSize: 14,
    fontWeight: "500",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 30,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#f3f4f6",
  },
  or: {
    marginHorizontal: 15,
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "bold",
  },
  socialButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 10,
  },
  socialText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
  },
  guestButton: {
    alignItems: "center",
    paddingVertical: 10,
  },
  guestText: {
    color: "#6b7280",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  footer: {
    marginTop: 40,
    textAlign: "center",
    fontSize: 11,
    color: "#9ca3af",
    lineHeight: 18,
  },
});
