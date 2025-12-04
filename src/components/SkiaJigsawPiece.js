import React from 'react';
import { View } from 'react-native';
import {
  Canvas,
  Path,
  Image,
  useImage,
  Group,
  Skia,
} from '@shopify/react-native-skia';

/**
 * 직소 퍼즐 조각의 돌출/오목 패턴 생성
 * @param {number} row - 행 인덱스
 * @param {number} col - 열 인덱스
 * @param {number} gridSize - 그리드 크기
 * @returns {object} 각 변의 패턴 (1: 돌출, -1: 오목, 0: 평평)
 */
const getPiecePattern = (row, col, gridSize) => {
  // 시드 기반으로 일관된 패턴 생성
  const seed = row * gridSize + col;

  return {
    top: row === 0 ? 0 : ((seed + row) % 2 === 0 ? 1 : -1),
    right: col === gridSize - 1 ? 0 : ((seed + col) % 2 === 0 ? 1 : -1),
    bottom: row === gridSize - 1 ? 0 : ((seed + row + 1) % 2 === 0 ? -1 : 1),
    left: col === 0 ? 0 : ((seed + col + gridSize) % 2 === 0 ? -1 : 1),
  };
};

/**
 * Skia Path 객체로 직소 퍼즐 조각 생성
 * @param {number} width - 조각 너비
 * @param {number} height - 조각 높이
 * @param {object} pattern - 각 변의 패턴
 * @param {number} offsetX - X 오프셋
 * @param {number} offsetY - Y 오프셋
 * @returns {SkPath} Skia Path 객체
 */
const createJigsawPath = (width, height, pattern, offsetX = 0, offsetY = 0) => {
  const path = Skia.Path.Make();
  const tabSize = Math.min(width, height) * 0.2;
  const tabNeck = tabSize * 0.4;

  // 시작점 (좌상단)
  path.moveTo(offsetX, offsetY);

  // 상단 변
  if (pattern.top === 0) {
    path.lineTo(offsetX + width, offsetY);
  } else {
    const midX = width / 2;
    const dir = pattern.top;
    path.lineTo(offsetX + midX - tabNeck, offsetY);
    path.cubicTo(
      offsetX + midX - tabNeck, offsetY - dir * tabSize * 0.3,
      offsetX + midX - tabSize, offsetY - dir * tabSize * 0.3,
      offsetX + midX - tabSize, offsetY - dir * tabSize * 0.6
    );
    path.cubicTo(
      offsetX + midX - tabSize, offsetY - dir * tabSize,
      offsetX + midX + tabSize, offsetY - dir * tabSize,
      offsetX + midX + tabSize, offsetY - dir * tabSize * 0.6
    );
    path.cubicTo(
      offsetX + midX + tabSize, offsetY - dir * tabSize * 0.3,
      offsetX + midX + tabNeck, offsetY - dir * tabSize * 0.3,
      offsetX + midX + tabNeck, offsetY
    );
    path.lineTo(offsetX + width, offsetY);
  }

  // 오른쪽 변
  if (pattern.right === 0) {
    path.lineTo(offsetX + width, offsetY + height);
  } else {
    const midY = height / 2;
    const dir = pattern.right;
    path.lineTo(offsetX + width, offsetY + midY - tabNeck);
    path.cubicTo(
      offsetX + width + dir * tabSize * 0.3, offsetY + midY - tabNeck,
      offsetX + width + dir * tabSize * 0.3, offsetY + midY - tabSize,
      offsetX + width + dir * tabSize * 0.6, offsetY + midY - tabSize
    );
    path.cubicTo(
      offsetX + width + dir * tabSize, offsetY + midY - tabSize,
      offsetX + width + dir * tabSize, offsetY + midY + tabSize,
      offsetX + width + dir * tabSize * 0.6, offsetY + midY + tabSize
    );
    path.cubicTo(
      offsetX + width + dir * tabSize * 0.3, offsetY + midY + tabSize,
      offsetX + width + dir * tabSize * 0.3, offsetY + midY + tabNeck,
      offsetX + width, offsetY + midY + tabNeck
    );
    path.lineTo(offsetX + width, offsetY + height);
  }

  // 하단 변
  if (pattern.bottom === 0) {
    path.lineTo(offsetX, offsetY + height);
  } else {
    const midX = width / 2;
    const dir = pattern.bottom;
    path.lineTo(offsetX + midX + tabNeck, offsetY + height);
    path.cubicTo(
      offsetX + midX + tabNeck, offsetY + height + dir * tabSize * 0.3,
      offsetX + midX + tabSize, offsetY + height + dir * tabSize * 0.3,
      offsetX + midX + tabSize, offsetY + height + dir * tabSize * 0.6
    );
    path.cubicTo(
      offsetX + midX + tabSize, offsetY + height + dir * tabSize,
      offsetX + midX - tabSize, offsetY + height + dir * tabSize,
      offsetX + midX - tabSize, offsetY + height + dir * tabSize * 0.6
    );
    path.cubicTo(
      offsetX + midX - tabSize, offsetY + height + dir * tabSize * 0.3,
      offsetX + midX - tabNeck, offsetY + height + dir * tabSize * 0.3,
      offsetX + midX - tabNeck, offsetY + height
    );
    path.lineTo(offsetX, offsetY + height);
  }

  // 왼쪽 변
  if (pattern.left === 0) {
    path.lineTo(offsetX, offsetY);
  } else {
    const midY = height / 2;
    const dir = pattern.left;
    path.lineTo(offsetX, offsetY + midY + tabNeck);
    path.cubicTo(
      offsetX - dir * tabSize * 0.3, offsetY + midY + tabNeck,
      offsetX - dir * tabSize * 0.3, offsetY + midY + tabSize,
      offsetX - dir * tabSize * 0.6, offsetY + midY + tabSize
    );
    path.cubicTo(
      offsetX - dir * tabSize, offsetY + midY + tabSize,
      offsetX - dir * tabSize, offsetY + midY - tabSize,
      offsetX - dir * tabSize * 0.6, offsetY + midY - tabSize
    );
    path.cubicTo(
      offsetX - dir * tabSize * 0.3, offsetY + midY - tabSize,
      offsetX - dir * tabSize * 0.3, offsetY + midY - tabNeck,
      offsetX, offsetY + midY - tabNeck
    );
    path.lineTo(offsetX, offsetY);
  }

  path.close();
  return path;
};

/**
 * Skia 기반 직소 퍼즐 조각 컴포넌트
 */
const SkiaJigsawPiece = ({
  imageUri,
  piece,
  pieceWidth,
  pieceHeight,
  puzzleWidth,
  puzzleHeight,
  gridSize,
}) => {
  const image = useImage(imageUri);
  const pattern = getPiecePattern(piece.row, piece.col, gridSize);
  const tabSize = Math.min(pieceWidth, pieceHeight) * 0.2;

  // 패딩 (탭이 잘리지 않도록)
  const padding = tabSize;
  const canvasWidth = pieceWidth + padding * 2;
  const canvasHeight = pieceHeight + padding * 2;

  // 클리핑 패스 생성
  const clipPath = createJigsawPath(pieceWidth, pieceHeight, pattern, padding, padding);

  // 이미지 소스 위치 계산
  const srcX = piece.col * pieceWidth;
  const srcY = piece.row * pieceHeight;

  if (!image) {
    return (
      <View style={{ width: canvasWidth, height: canvasHeight, backgroundColor: '#f0f0f0' }} />
    );
  }

  // 이미지 스케일 계산 (실제 이미지 크기와 퍼즐 크기의 비율)
  const imageWidth = image.width();
  const imageHeight = image.height();
  const scaleX = imageWidth / puzzleWidth;
  const scaleY = imageHeight / puzzleHeight;

  return (
    <Canvas style={{ width: canvasWidth, height: canvasHeight }}>
      <Group clip={clipPath}>
        <Image
          image={image}
          x={padding - srcX}
          y={padding - srcY}
          width={puzzleWidth}
          height={puzzleHeight}
          fit="cover"
        />
      </Group>
      {/* 테두리 */}
      <Path
        path={clipPath}
        color="rgba(255,255,255,0.6)"
        style="stroke"
        strokeWidth={2}
      />
    </Canvas>
  );
};

/**
 * Skia 기반 빈 퍼즐 슬롯
 */
const SkiaJigsawSlot = ({
  piece,
  pieceWidth,
  pieceHeight,
  gridSize,
  isSelected,
  isWrong,
}) => {
  const pattern = getPiecePattern(piece.row, piece.col, gridSize);
  const tabSize = Math.min(pieceWidth, pieceHeight) * 0.2;

  const padding = tabSize;
  const canvasWidth = pieceWidth + padding * 2;
  const canvasHeight = pieceHeight + padding * 2;

  const slotPath = createJigsawPath(pieceWidth, pieceHeight, pattern, padding, padding);

  let fillColor = 'rgba(245, 247, 250, 0.9)';
  let strokeColor = 'rgba(200, 200, 200, 0.8)';
  let strokeWidth = 1.5;

  if (isSelected) {
    fillColor = 'rgba(74, 144, 217, 0.2)';
    strokeColor = 'rgba(74, 144, 217, 1)';
    strokeWidth = 3;
  } else if (isWrong) {
    fillColor = 'rgba(239, 83, 80, 0.3)';
    strokeColor = 'rgba(239, 83, 80, 1)';
    strokeWidth = 2;
  }

  return (
    <Canvas style={{ width: canvasWidth, height: canvasHeight }}>
      <Path
        path={slotPath}
        color={fillColor}
        style="fill"
      />
      <Path
        path={slotPath}
        color={strokeColor}
        style="stroke"
        strokeWidth={strokeWidth}
      />
    </Canvas>
  );
};

/**
 * 이미 맞춰진 퍼즐 조각 표시 (슬롯 + 이미지)
 */
const SkiaPlacedPiece = ({
  imageUri,
  piece,
  pieceWidth,
  pieceHeight,
  puzzleWidth,
  puzzleHeight,
  gridSize,
}) => {
  const image = useImage(imageUri);
  const pattern = getPiecePattern(piece.row, piece.col, gridSize);
  const tabSize = Math.min(pieceWidth, pieceHeight) * 0.2;

  const padding = tabSize;
  const canvasWidth = pieceWidth + padding * 2;
  const canvasHeight = pieceHeight + padding * 2;

  const clipPath = createJigsawPath(pieceWidth, pieceHeight, pattern, padding, padding);

  const srcX = piece.col * pieceWidth;
  const srcY = piece.row * pieceHeight;

  if (!image) {
    return (
      <Canvas style={{ width: canvasWidth, height: canvasHeight }}>
        <Path path={clipPath} color="rgba(200, 230, 200, 0.5)" style="fill" />
      </Canvas>
    );
  }

  return (
    <Canvas style={{ width: canvasWidth, height: canvasHeight }}>
      <Group clip={clipPath}>
        <Image
          image={image}
          x={padding - srcX}
          y={padding - srcY}
          width={puzzleWidth}
          height={puzzleHeight}
          fit="cover"
        />
      </Group>
      <Path
        path={clipPath}
        color="rgba(100, 200, 100, 0.6)"
        style="stroke"
        strokeWidth={2}
      />
    </Canvas>
  );
};

export {
  SkiaJigsawPiece,
  SkiaJigsawSlot,
  SkiaPlacedPiece,
  getPiecePattern,
  createJigsawPath,
};
