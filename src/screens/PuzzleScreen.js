import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import {
  DIFFICULTY_CONFIG,
  generatePuzzlePieces,
  generateChoices,
  isPuzzleComplete,
  formatTime,
  shuffleArray,
} from '../utils/puzzleUtils';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const MAX_PUZZLE_WIDTH = screenWidth - 32;
const MAX_PUZZLE_HEIGHT = screenHeight * 0.50;
const PREVIEW_TIME = 10;

export default function PuzzleScreen({ navigation, route }) {
  const { imageUri, imageWidth, imageHeight, difficulty } = route.params;
  const config = DIFFICULTY_CONFIG[difficulty];
  const gridSize = config.gridSize;

  // 이미지 비율에 맞게 퍼즐 크기 계산
  const imageRatio = imageWidth && imageHeight ? imageWidth / imageHeight : 3 / 4;
  let puzzleWidth, puzzleHeight;

  if (imageRatio > MAX_PUZZLE_WIDTH / MAX_PUZZLE_HEIGHT) {
    puzzleWidth = MAX_PUZZLE_WIDTH;
    puzzleHeight = MAX_PUZZLE_WIDTH / imageRatio;
  } else {
    puzzleHeight = MAX_PUZZLE_HEIGHT;
    puzzleWidth = MAX_PUZZLE_HEIGHT * imageRatio;
  }

  console.log('[PuzzleScreen] 렌더링 - 난이도:', difficulty, '그리드:', gridSize);
  console.log('[PuzzleScreen] 이미지 크기:', imageWidth, 'x', imageHeight, '비율:', imageRatio.toFixed(2));
  console.log('[PuzzleScreen] 퍼즐 크기:', puzzleWidth.toFixed(0), 'x', puzzleHeight.toFixed(0));

  // 상태
  const [pieces, setPieces] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [choices, setChoices] = useState([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [isPreview, setIsPreview] = useState(true);
  const [previewCountdown, setPreviewCountdown] = useState(PREVIEW_TIME);
  const [remainingHints, setRemainingHints] = useState(config.hintPieces || 0);
  const [wrongSlots, setWrongSlots] = useState([]); // 틀린 슬롯 ID 목록

  // 각 조각 크기 계산
  const pieceWidth = puzzleWidth / gridSize;
  const pieceHeight = puzzleHeight / gridSize;

  // 퍼즐 초기화
  useEffect(() => {
    console.log('[PuzzleScreen] 퍼즐 초기화 - 그리드:', gridSize, '힌트:', config.hintPieces);
    const initialPieces = generatePuzzlePieces(gridSize, puzzleWidth, puzzleHeight);
    setPieces(initialPieces);
    console.log('[PuzzleScreen] 퍼즐 조각 생성 완료:', initialPieces.length, '개');
  }, [gridSize, puzzleWidth, puzzleHeight]);

  // 미리보기 카운트다운
  useEffect(() => {
    if (!isPreview) return;

    if (previewCountdown <= 0) {
      console.log('[PuzzleScreen] 미리보기 종료 - 게임 시작!');
      setIsPreview(false);
      return;
    }

    const timer = setTimeout(() => {
      setPreviewCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isPreview, previewCountdown]);

  // 게임 타이머
  useEffect(() => {
    if (isComplete || isPreview) return;

    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isComplete, isPreview]);

  // 완성 체크
  useEffect(() => {
    if (pieces.length > 0 && !isComplete && !isPreview) {
      const placedCount = pieces.filter((p) => p.isPlaced).length;
      const allPlaced = pieces.every((p) => p.isPlaced);
      console.log('[PuzzleScreen] 완성 체크 - 배치됨:', placedCount, '/', pieces.length);
      if (allPlaced) {
        console.log('[PuzzleScreen] 🎉 퍼즐 완성!');
        setTimeout(() => {
          setIsComplete(true);
        }, 500);
      }
    }
  }, [pieces, isComplete, isPreview]);

  // 빈 칸 선택 핸들러
  const handleSlotPress = useCallback(
    (piece) => {
      if (piece.isPlaced || isComplete || isPreview) return;

      console.log('[PuzzleScreen] 슬롯 선택 - ID:', piece.id, '위치:', piece.row, piece.col);
      setSelectedSlot(piece);

      const unplacedPieces = pieces.filter((p) => !p.isPlaced);
      const newChoices = generateChoices(piece, unplacedPieces, config.wrongChoices);
      console.log('[PuzzleScreen] 선택지 생성:', newChoices.length, '개');
      setChoices(newChoices);
    },
    [pieces, config.wrongChoices, isComplete, isPreview]
  );

  // 선택지에서 조각 선택
  const handleChoiceSelect = useCallback(
    (chosenPiece) => {
      if (!selectedSlot) return;

      setMoveCount((prev) => prev + 1);

      const isCorrect = chosenPiece.id === selectedSlot.id;
      console.log('[PuzzleScreen] 조각 선택 - 선택:', chosenPiece.id, '정답:', selectedSlot.id, isCorrect ? '✅ 정답!' : '❌ 오답');

      if (isCorrect) {
        // 정답: 조각 배치 (placedBy: 'correct')
        setPieces((prev) =>
          prev.map((p) =>
            p.id === selectedSlot.id ? { ...p, isPlaced: true, placedBy: 'correct' } : p
          )
        );
        // 틀린 목록에서 제거 (혹시 있으면)
        setWrongSlots((prev) => prev.filter((id) => id !== selectedSlot.id));
      } else {
        // 오답: 틀린 슬롯으로 표시 (잠시 후 사라짐)
        setWrongSlots((prev) => [...prev, selectedSlot.id]);
        setTimeout(() => {
          setWrongSlots((prev) => prev.filter((id) => id !== selectedSlot.id));
        }, 1500);
      }

      setSelectedSlot(null);
      setChoices([]);
    },
    [selectedSlot]
  );

  // 힌트 사용 (선택된 슬롯에 정답 배치)
  const handleUseHint = useCallback(() => {
    if (!selectedSlot || remainingHints <= 0 || isComplete || isPreview) return;

    console.log('[PuzzleScreen] 힌트 사용 - 슬롯:', selectedSlot.id, '남은 힌트:', remainingHints - 1);

    setPieces((prev) =>
      prev.map((p) =>
        p.id === selectedSlot.id ? { ...p, isPlaced: true, placedBy: 'hint' } : p
      )
    );
    setRemainingHints((prev) => prev - 1);
    setSelectedSlot(null);
    setChoices([]);
  }, [selectedSlot, remainingHints, isComplete, isPreview]);

  // 게임 재시작
  const handleRestart = () => {
    console.log('[PuzzleScreen] 게임 재시작');
    const initialPieces = generatePuzzlePieces(gridSize, puzzleWidth, puzzleHeight);
    setPieces(initialPieces);
    setSelectedSlot(null);
    setChoices([]);
    setElapsedTime(0);
    setIsComplete(false);
    setMoveCount(0);
    setIsPreview(true);
    setPreviewCountdown(PREVIEW_TIME);
    setRemainingHints(config.hintPieces || 0);
    setWrongSlots([]);
  };

  // 미리보기 스킵
  const handleSkipPreview = () => {
    setIsPreview(false);
    setPreviewCountdown(0);
  };

  // 홈으로
  const handleGoHome = () => {
    navigation.navigate('Home');
  };

  // 남은 조각 수
  const remainingPieces = pieces.filter((p) => !p.isPlaced).length;
  const totalPieces = pieces.length;
  const progressPercent = totalPieces > 0 ? ((totalPieces - remainingPieces) / totalPieces) * 100 : 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* 장식 원형 */}
      <View style={styles.decorCircle1} />

      {/* 상단 바 */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconButton} onPress={handleGoHome} activeOpacity={0.7}>
          <Text style={styles.iconButtonText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⏱️</Text>
            <Text style={styles.statValue}>{formatTime(elapsedTime)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>👆</Text>
            <Text style={styles.statValue}>{moveCount}</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.hintButton,
              (!selectedSlot || remainingHints <= 0 || isPreview) && styles.hintButtonDisabled,
            ]}
            onPress={handleUseHint}
            disabled={!selectedSlot || remainingHints <= 0 || isPreview}
            activeOpacity={0.7}
          >
            <Text style={styles.hintIcon}>💡</Text>
            <Text style={[
              styles.hintCount,
              remainingHints <= 0 && styles.hintCountEmpty,
            ]}>{remainingHints}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.iconButton} onPress={handleRestart} activeOpacity={0.7}>
          <Text style={styles.iconButtonTextPrimary}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* 진행 상황 바 */}
      {!isPreview && !isComplete && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {totalPieces - remainingPieces} / {totalPieces}
          </Text>
        </View>
      )}

      {/* 안내 메시지 */}
      <View style={styles.instructionBar}>
        {isComplete ? (
          <View style={styles.completeBadge}>
            <Text style={styles.completeBadgeText}>🎉 퍼즐 완성!</Text>
          </View>
        ) : isPreview ? (
          <View style={styles.previewBadge}>
            <Text style={styles.previewBadgeText}>사진을 기억하세요!</Text>
            <View style={styles.countdownCircle}>
              <Text style={styles.countdownText}>{previewCountdown}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.instructionText}>
            {selectedSlot ? '아래에서 맞는 조각을 선택하세요' : '빈 칸을 터치하세요'}
          </Text>
        )}
      </View>

      {/* 퍼즐 보드 */}
      <View style={[styles.puzzleBoard, { width: puzzleWidth, height: puzzleHeight }]}>
        {isPreview || isComplete ? (
          <View style={{ width: puzzleWidth, height: puzzleHeight }}>
            <Image
              source={{ uri: imageUri }}
              style={{ width: puzzleWidth, height: puzzleHeight, borderRadius: 8 }}
              resizeMode="cover"
            />
            {/* 미리보기/완성 시 그리드 라인 표시 */}
            {isPreview && (
              <View style={styles.gridOverlay} pointerEvents="none">
                {Array.from({ length: gridSize - 1 }).map((_, i) => (
                  <View
                    key={`preview-h-${i}`}
                    style={[
                      styles.previewGridLine,
                      { top: (i + 1) * pieceHeight, width: puzzleWidth, height: 2 },
                    ]}
                  />
                ))}
                {Array.from({ length: gridSize - 1 }).map((_, i) => (
                  <View
                    key={`preview-v-${i}`}
                    style={[
                      styles.previewGridLine,
                      { left: (i + 1) * pieceWidth, height: puzzleHeight, width: 2 },
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          pieces.map((piece) => {
            const isWrong = wrongSlots.includes(piece.id);
            const isHint = piece.placedBy === 'hint';
            const isCorrect = piece.placedBy === 'correct';

            // 배치된 조각: 사각형
            if (piece.isPlaced) {
              return (
                <View
                  key={piece.id}
                  style={[
                    styles.puzzleSlot,
                    {
                      left: piece.col * pieceWidth,
                      top: piece.row * pieceHeight,
                      width: pieceWidth - 2,
                      height: pieceHeight - 2,
                    },
                  ]}
                >
                  <View style={{ width: pieceWidth - 2, height: pieceHeight - 2, overflow: 'hidden' }}>
                    <Image
                      source={{ uri: imageUri }}
                      style={{
                        position: 'absolute',
                        left: -piece.col * pieceWidth,
                        top: -piece.row * pieceHeight,
                        width: puzzleWidth,
                        height: puzzleHeight,
                      }}
                      resizeMode="cover"
                    />
                  </View>
                  {/* 힌트로 배치된 경우 표시 */}
                  {isHint && (
                    <View style={styles.hintOverlay}>
                      <Text style={styles.hintOverlayIcon}>💡</Text>
                    </View>
                  )}
                  {/* 정답으로 배치된 경우 표시 */}
                  {isCorrect && (
                    <View style={styles.correctOverlay}>
                      <Text style={styles.correctOverlayIcon}>✓</Text>
                    </View>
                  )}
                </View>
              );
            }

            // 미배치 조각: 빈 슬롯
            return (
              <TouchableOpacity
                key={piece.id}
                style={[
                  styles.puzzleSlot,
                  selectedSlot?.id === piece.id && styles.selectedSlot,
                  isWrong && styles.wrongSlot,
                  {
                    left: piece.col * pieceWidth,
                    top: piece.row * pieceHeight,
                    width: pieceWidth - 2,
                    height: pieceHeight - 2,
                  },
                ]}
                onPress={() => handleSlotPress(piece)}
                activeOpacity={0.8}
              >
                <Text style={[styles.slotNumber, isWrong && { color: colors.error }]}>
                  {isWrong ? '✕' : piece.id + 1}
                </Text>
              </TouchableOpacity>
            );
          })
        )}

        {/* 그리드 라인 */}
        {!isPreview && !isComplete && (
          <View style={styles.gridOverlay} pointerEvents="none">
            {Array.from({ length: gridSize - 1 }).map((_, i) => (
              <View
                key={`h-${i}`}
                style={[
                  styles.gridLine,
                  isPreview && styles.previewGridLine,
                  { top: (i + 1) * pieceHeight, width: puzzleWidth, height: 2 },
                ]}
              />
            ))}
            {Array.from({ length: gridSize - 1 }).map((_, i) => (
              <View
                key={`v-${i}`}
                style={[
                  styles.gridLine,
                  isPreview && styles.previewGridLine,
                  { left: (i + 1) * pieceWidth, height: puzzleHeight, width: 2 },
                ]}
              />
            ))}
          </View>
        )}
      </View>

      {/* 선택지 영역 */}
      <View style={styles.choiceArea}>
        {isComplete ? (
          <View style={styles.completionArea}>
            <View style={styles.resultCard}>
              <View style={styles.resultRow}>
                <View style={styles.resultItem}>
                  <Text style={styles.resultIcon}>⏱️</Text>
                  <Text style={styles.resultLabel}>시간</Text>
                  <Text style={styles.resultValue}>{formatTime(elapsedTime)}</Text>
                </View>
                <View style={styles.resultDivider} />
                <View style={styles.resultItem}>
                  <Text style={styles.resultIcon}>👆</Text>
                  <Text style={styles.resultLabel}>이동</Text>
                  <Text style={styles.resultValue}>{moveCount}회</Text>
                </View>
              </View>
            </View>
            <View style={styles.completionButtons}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleRestart}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>다시하기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleGoHome}
                activeOpacity={0.85}
              >
                <Text style={styles.secondaryButtonText}>홈으로</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : isPreview ? (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkipPreview}
            activeOpacity={0.85}
          >
            <Text style={styles.skipButtonText}>건너뛰기</Text>
            <Text style={styles.skipButtonArrow}>→</Text>
          </TouchableOpacity>
        ) : choices.length > 0 ? (
          <View style={styles.choiceContainer}>
            {choices.map((choice, index) => {
              // 선택지용 스케일 계산
              const choiceDisplayHeight = 70;
              const scale = choiceDisplayHeight / pieceHeight;
              const scaledPieceWidth = pieceWidth * scale;
              const scaledPieceHeight = pieceHeight * scale;
              const scaledPuzzleWidth = puzzleWidth * scale;
              const scaledPuzzleHeight = puzzleHeight * scale;

              return (
                <TouchableOpacity
                  key={`choice-${choice.id}-${index}`}
                  style={[styles.choiceItem, { width: scaledPieceWidth, height: scaledPieceHeight }]}
                  onPress={() => handleChoiceSelect(choice)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.choiceImageWrapper, { width: scaledPieceWidth, height: scaledPieceHeight }]}>
                    <Image
                      source={{ uri: imageUri }}
                      style={[
                        styles.choiceImage,
                        {
                          left: -choice.col * scaledPieceWidth,
                          top: -choice.row * scaledPieceHeight,
                          width: scaledPuzzleWidth,
                          height: scaledPuzzleHeight,
                        },
                      ]}
                      resizeMode="cover"
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderEmoji}>👆</Text>
            <Text style={styles.choicePlaceholder}>위에서 빈 칸을 선택하세요</Text>
          </View>
        )}
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
    top: -60,
    right: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.primaryLight + '15',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  iconButtonText: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  iconButtonTextPrimary: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  statIcon: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
    elevation: 3,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  hintButtonDisabled: {
    backgroundColor: colors.puzzleBorder,
    shadowOpacity: 0,
    elevation: 0,
  },
  hintIcon: {
    fontSize: 14,
  },
  hintCount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textLight,
  },
  hintCountEmpty: {
    color: colors.textSecondary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.puzzleBorder,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  instructionBar: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  completeBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  completeBadgeText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.success,
  },
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  previewBadgeText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  countdownCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textLight,
  },
  puzzleBoard: {
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    elevation: 8,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  puzzleSlot: {
    position: 'absolute',
    backgroundColor: colors.surfaceLight,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  selectedSlot: {
    borderWidth: 3,
    borderColor: colors.primary,
    backgroundColor: colors.primary + '15',
  },
  placedPieceContainer: {
    position: 'absolute',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  wrongSlot: {
    borderWidth: 3,
    borderColor: colors.error,
    backgroundColor: colors.error + '20',
  },
  slotContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wrongSlotContent: {
    backgroundColor: colors.error + '30',
  },
  wrongIcon: {
    fontSize: 24,
    color: colors.error,
    fontWeight: '800',
  },
  slotNumber: {
    fontSize: 14,
    color: colors.textTertiary,
    fontWeight: '600',
  },
  pieceImage: {
    position: 'absolute',
  },
  hintOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  hintOverlayIcon: {
    fontSize: 12,
  },
  correctOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  correctOverlayIcon: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '800',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: colors.puzzleBorder,
  },
  previewGridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  choiceArea: {
    flex: 1,
    backgroundColor: colors.surface,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  choiceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  choiceItem: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: colors.puzzleBorder,
  },
  choiceImageWrapper: {
    overflow: 'hidden',
  },
  choiceImage: {
    position: 'absolute',
  },
  placeholderContainer: {
    alignItems: 'center',
    gap: 8,
  },
  placeholderEmoji: {
    fontSize: 32,
  },
  choicePlaceholder: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 28,
    gap: 10,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  skipButtonText: {
    color: colors.textLight,
    fontSize: 17,
    fontWeight: '700',
  },
  skipButtonArrow: {
    color: colors.textLight,
    fontSize: 20,
    fontWeight: '400',
  },
  completionArea: {
    alignItems: 'center',
    width: '100%',
    gap: 20,
  },
  resultCard: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 16,
    padding: 20,
    width: '100%',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultItem: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  resultIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  resultLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  resultDivider: {
    width: 1,
    height: 50,
    backgroundColor: colors.puzzleBorder,
    marginHorizontal: 20,
  },
  completionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  primaryButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.puzzleBorder,
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
});
