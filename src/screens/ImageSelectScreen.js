import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';
import { DIFFICULTY_CONFIG } from '../utils/puzzleUtils';

const { width } = Dimensions.get('window');
const PREVIEW_SIZE = width - 48;

export default function ImageSelectScreen({ navigation, route }) {
  const { difficulty } = route.params;
  const config = DIFFICULTY_CONFIG[difficulty];

  console.log('[ImageSelectScreen] 렌더링 - 난이도:', difficulty);

  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // 갤러리에서 이미지 선택
  const pickImage = async () => {
    console.log('[ImageSelectScreen] 갤러리 열기');
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('[ImageSelectScreen] 갤러리 권한:', status);
      if (status !== 'granted') {
        Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('[ImageSelectScreen] 이미지 선택됨:', result.assets[0].width, 'x', result.assets[0].height);
        setSelectedImage(result.assets[0]);
      } else {
        console.log('[ImageSelectScreen] 이미지 선택 취소');
      }
    } catch (error) {
      console.error('[ImageSelectScreen] 이미지 선택 오류:', error);
      Alert.alert('오류', '이미지를 선택하는 중 오류가 발생했습니다.');
    }
  };

  // 카메라로 사진 촬영
  const takePhoto = async () => {
    console.log('[ImageSelectScreen] 카메라 열기');
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      console.log('[ImageSelectScreen] 카메라 권한:', status);
      if (status !== 'granted') {
        Alert.alert('권한 필요', '카메라 접근 권한이 필요합니다.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('[ImageSelectScreen] 사진 촬영됨:', result.assets[0].width, 'x', result.assets[0].height);
        setSelectedImage(result.assets[0]);
      } else {
        console.log('[ImageSelectScreen] 촬영 취소');
      }
    } catch (error) {
      console.error('[ImageSelectScreen] 카메라 오류:', error);
      Alert.alert('오류', '카메라를 사용하는 중 오류가 발생했습니다.');
    }
  };

  // 게임 시작
  const startGame = () => {
    console.log('[ImageSelectScreen] 게임 시작 버튼 클릭');
    if (!selectedImage) {
      console.log('[ImageSelectScreen] 이미지 없음 - 알림 표시');
      Alert.alert('이미지 필요', '먼저 이미지를 선택해주세요.');
      return;
    }

    console.log('[ImageSelectScreen] 퍼즐 화면으로 이동');
    navigation.navigate('Puzzle', {
      imageUri: selectedImage.uri,
      imageWidth: selectedImage.width,
      imageHeight: selectedImage.height,
      difficulty,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>이미지 선택</Text>
        <View style={styles.placeholder} />
      </View>

      {/* 난이도 표시 */}
      <View style={styles.difficultyBadge}>
        <Text style={styles.difficultyText}>{config.label}</Text>
      </View>

      {/* 이미지 미리보기 */}
      <View style={[
        styles.previewContainer,
        selectedImage && {
          width: selectedImage.width > selectedImage.height
            ? PREVIEW_SIZE
            : PREVIEW_SIZE * (selectedImage.width / selectedImage.height),
          height: selectedImage.width > selectedImage.height
            ? PREVIEW_SIZE * (selectedImage.height / selectedImage.width)
            : PREVIEW_SIZE,
        }
      ]}>
        {selectedImage ? (
          <Image
            source={{ uri: selectedImage.uri }}
            style={styles.previewImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderEmoji}>🖼️</Text>
            <Text style={styles.placeholderText}>
              이미지를 선택해주세요
            </Text>
          </View>
        )}
      </View>

      {/* 이미지 선택 버튼들 */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={pickImage}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonEmoji}>📁</Text>
          <Text style={styles.buttonLabel}>갤러리</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.selectButton}
          onPress={takePhoto}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonEmoji}>📷</Text>
          <Text style={styles.buttonLabel}>카메라</Text>
        </TouchableOpacity>
      </View>

      {/* 게임 시작 버튼 */}
      <TouchableOpacity
        style={[
          styles.startButton,
          !selectedImage && styles.startButtonDisabled,
        ]}
        onPress={startGame}
        disabled={!selectedImage || loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color={colors.textLight} />
        ) : (
          <Text style={styles.startButtonText}>퍼즐 시작!</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  placeholder: {
    width: 60,
  },
  difficultyBadge: {
    alignSelf: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  difficultyText: {
    color: colors.textLight,
    fontWeight: '600',
    fontSize: 14,
  },
  previewContainer: {
    alignSelf: 'center',
    width: PREVIEW_SIZE * 0.8,
    height: PREVIEW_SIZE * 0.8,
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    marginBottom: 24,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  placeholderBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
  },
  placeholderEmoji: {
    fontSize: 60,
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 30,
  },
  selectButton: {
    backgroundColor: colors.surface,
    width: 100,
    height: 100,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: colors.puzzleBorder,
  },
  buttonEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  buttonLabel: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: colors.success,
    marginHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  startButtonDisabled: {
    backgroundColor: colors.puzzleBorder,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textLight,
  },
});
