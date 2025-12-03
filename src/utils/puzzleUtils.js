// 퍼즐 유틸리티 함수들

/**
 * 난이도에 따른 그리드 크기 반환
 */
export const DIFFICULTY_CONFIG = {
  easy: { gridSize: 3, label: '쉬움 (3x3)', wrongChoices: 1 },
  medium: { gridSize: 4, label: '보통 (4x4)', wrongChoices: 2 },
  hard: { gridSize: 5, label: '어려움 (5x5)', wrongChoices: 3 },
};

/**
 * 퍼즐 조각 생성
 * @param {number} gridSize - 그리드 크기 (3, 4, 5)
 * @param {number} imageWidth - 이미지 너비
 * @param {number} imageHeight - 이미지 높이
 * @returns {Array} 퍼즐 조각 배열
 */
export const generatePuzzlePieces = (gridSize, imageWidth, imageHeight) => {
  const pieces = [];
  const pieceWidth = imageWidth / gridSize;
  const pieceHeight = imageHeight / gridSize;

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      pieces.push({
        id: row * gridSize + col,
        row,
        col,
        x: col * pieceWidth,
        y: row * pieceHeight,
        width: pieceWidth,
        height: pieceHeight,
        isPlaced: false,
      });
    }
  }

  return pieces;
};

/**
 * 배열 셔플 (Fisher-Yates 알고리즘)
 */
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * 선택지 생성 (정답 1개 + 오답 N개)
 * @param {object} correctPiece - 정답 조각
 * @param {Array} allPieces - 모든 조각
 * @param {number} wrongCount - 오답 개수
 * @returns {Array} 선택지 배열 (셔플된 상태)
 */
export const generateChoices = (correctPiece, allPieces, wrongCount) => {
  // 아직 배치되지 않은 조각들 중에서 오답 선택
  const availableWrongPieces = allPieces.filter(
    (p) => p.id !== correctPiece.id && !p.isPlaced
  );

  // 오답 조각 랜덤 선택
  const shuffledWrong = shuffleArray(availableWrongPieces);
  const wrongPieces = shuffledWrong.slice(0, Math.min(wrongCount, shuffledWrong.length));

  // 정답 + 오답 합쳐서 셔플
  const choices = shuffleArray([correctPiece, ...wrongPieces]);

  return choices;
};

/**
 * 퍼즐 완성 여부 확인
 */
export const isPuzzleComplete = (pieces) => {
  return pieces.every((piece) => piece.isPlaced);
};

/**
 * 시간 포맷 (초 -> MM:SS)
 */
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
