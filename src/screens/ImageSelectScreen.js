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

  // 난이도 아이콘
  const getDifficultyIcon = () => {
    switch (difficulty) {
      case 'easy': return '🌱';
      case 'medium': return '🌿';
      case 'hard': return '🌳';
      default: return '🧩';
    }
  };

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
      {/* 장식 원형 */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>이미지 선택</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* 난이도 뱃지 */}
      <View style={styles.difficultyContainer}>
        <View style={styles.difficultyBadge}>
          <Text style={styles.difficultyIcon}>{getDifficultyIcon()}</Text>
          <Text style={styles.difficultyText}>{config.label}</Text>
        </View>
        <Text style={styles.difficultyHint}>힌트 {config.hintPieces}개 제공</Text>
      </View>

      {/* 이미지 미리보기 */}
      <View style={styles.previewWrapper}>
        <View style={[
          styles.previewContainer,
          selectedImage && {
            width: selectedImage.width > selectedImage.height
              ? PREVIEW_SIZE * 0.85
              : PREVIEW_SIZE * 0.85 * (selectedImage.width / selectedImage.height),
            height: selectedImage.width > selectedImage.height
              ? PREVIEW_SIZE * 0.85 * (selectedImage.height / selectedImage.width)
              : PREVIEW_SIZE * 0.85,
          }
        ]}>
          {selectedImage ? (
            <>
              <Image
                source={{ uri: selectedImage.uri }}
                style={styles.previewImage}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.changeImageButton}
                onPress={pickImage}
                activeOpacity={0.8}
              >
                <Text style={styles.changeImageText}>변경</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.placeholderBox}>
              <View style={styles.placeholderIconContainer}>
                <Text style={styles.placeholderEmoji}>🖼️</Text>
              </View>
              <Text style={styles.placeholderTitle}>이미지 선택</Text>
              <Text style={styles.placeholderText}>
                아래 버튼으로 사진을 선택하세요
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* 이미지 선택 버튼들 */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={pickImage}
          activeOpacity={0.8}
        >
          <View style={styles.selectButtonIcon}>
            <Text style={styles.buttonEmoji}>🖼️</Text>
          </View>
          <Text style={styles.buttonLabel}>갤러리</Text>
          <Text style={styles.buttonSubLabel}>사진 선택</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.selectButton}
          onPress={takePhoto}
          activeOpacity={0.8}
        >
          <View style={styles.selectButtonIcon}>
            <Text style={styles.buttonEmoji}>📷</Text>
          </View>
          <Text style={styles.buttonLabel}>카메라</Text>
          <Text style={styles.buttonSubLabel}>직접 촬영</Text>
        </TouchableOpacity>
      </View>

      {/* 게임 시작 버튼 */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.startButton,
            !selectedImage && styles.startButtonDisabled,
          ]}
          onPress={startGame}
          disabled={!selectedImage || loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={colors.textLight} />
          ) : (
            <View style={styles.startButtonInner}>
              <Text style={styles.startButtonText}>
                {selectedImage ? '퍼즐 시작하기' : '이미지를 선택하세요'}
              </Text>
              {selectedImage && <Text style={styles.startButtonArrow}>→</Text>}
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  decorCircle1: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primaryLight + '20',
  },
  decorCircle2: {
    position: 'absolute',
    bottom: 100,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.accent + '15',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  backIcon: {
    fontSize: 22,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerPlaceholder: {
    width: 44,
  },
  difficultyContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  difficultyIcon: {
    fontSize: 18,
  },
  difficultyText: {
    color: colors.textLight,
    fontWeight: '700',
    fontSize: 15,
  },
  difficultyHint: {
    marginTop: 8,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  previewWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  previewContainer: {
    width: PREVIEW_SIZE * 0.85,
    height: PREVIEW_SIZE * 0.75,
    backgroundColor: colors.surface,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  changeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.overlay,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  changeImageText: {
    color: colors.textLight,
    fontSize: 13,
    fontWeight: '600',
  },
  placeholderBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    padding: 24,
  },
  placeholderIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  placeholderEmoji: {
    fontSize: 36,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 24,
  },
  selectButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: colors.puzzleBorder,
  },
  selectButtonIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonEmoji: {
    fontSize: 28,
  },
  buttonLabel: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 2,
  },
  buttonSubLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    elevation: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  startButtonDisabled: {
    backgroundColor: colors.puzzleBorder,
    shadowOpacity: 0,
    elevation: 0,
  },
  startButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textLight,
  },
  startButtonArrow: {
    fontSize: 22,
    color: colors.textLight,
    fontWeight: '300',
  },
});
