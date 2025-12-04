import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

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
 * 직소 퍼즐 조각 SVG Path 생성
 * @param {number} width - 조각 너비
 * @param {number} height - 조각 높이
 * @param {object} pattern - 각 변의 패턴
 * @returns {string} SVG Path 문자열
 */
const generateJigsawPath = (width, height, pattern) => {
  const tabSize = Math.min(width, height) * 0.2; // 탭 크기
  const tabNeck = tabSize * 0.4; // 탭 목 너비

  let path = '';

  // 시작점 (좌상단)
  path += `M 0 0`;

  // 상단 변
  if (pattern.top === 0) {
    path += ` L ${width} 0`;
  } else {
    const midX = width / 2;
    const dir = pattern.top; // 1: 위로 돌출, -1: 아래로 오목
    path += ` L ${midX - tabNeck} 0`;
    path += ` C ${midX - tabNeck} ${-dir * tabSize * 0.3}, ${midX - tabSize} ${-dir * tabSize * 0.3}, ${midX - tabSize} ${-dir * tabSize * 0.6}`;
    path += ` C ${midX - tabSize} ${-dir * tabSize}, ${midX + tabSize} ${-dir * tabSize}, ${midX + tabSize} ${-dir * tabSize * 0.6}`;
    path += ` C ${midX + tabSize} ${-dir * tabSize * 0.3}, ${midX + tabNeck} ${-dir * tabSize * 0.3}, ${midX + tabNeck} 0`;
    path += ` L ${width} 0`;
  }

  // 오른쪽 변
  if (pattern.right === 0) {
    path += ` L ${width} ${height}`;
  } else {
    const midY = height / 2;
    const dir = pattern.right; // 1: 오른쪽 돌출, -1: 왼쪽 오목
    path += ` L ${width} ${midY - tabNeck}`;
    path += ` C ${width + dir * tabSize * 0.3} ${midY - tabNeck}, ${width + dir * tabSize * 0.3} ${midY - tabSize}, ${width + dir * tabSize * 0.6} ${midY - tabSize}`;
    path += ` C ${width + dir * tabSize} ${midY - tabSize}, ${width + dir * tabSize} ${midY + tabSize}, ${width + dir * tabSize * 0.6} ${midY + tabSize}`;
    path += ` C ${width + dir * tabSize * 0.3} ${midY + tabSize}, ${width + dir * tabSize * 0.3} ${midY + tabNeck}, ${width} ${midY + tabNeck}`;
    path += ` L ${width} ${height}`;
  }

  // 하단 변 (오른쪽에서 왼쪽으로)
  if (pattern.bottom === 0) {
    path += ` L 0 ${height}`;
  } else {
    const midX = width / 2;
    const dir = pattern.bottom; // 1: 아래로 돌출, -1: 위로 오목
    path += ` L ${midX + tabNeck} ${height}`;
    path += ` C ${midX + tabNeck} ${height + dir * tabSize * 0.3}, ${midX + tabSize} ${height + dir * tabSize * 0.3}, ${midX + tabSize} ${height + dir * tabSize * 0.6}`;
    path += ` C ${midX + tabSize} ${height + dir * tabSize}, ${midX - tabSize} ${height + dir * tabSize}, ${midX - tabSize} ${height + dir * tabSize * 0.6}`;
    path += ` C ${midX - tabSize} ${height + dir * tabSize * 0.3}, ${midX - tabNeck} ${height + dir * tabSize * 0.3}, ${midX - tabNeck} ${height}`;
    path += ` L 0 ${height}`;
  }

  // 왼쪽 변 (아래에서 위로)
  if (pattern.left === 0) {
    path += ` L 0 0`;
  } else {
    const midY = height / 2;
    const dir = pattern.left; // 1: 왼쪽 돌출, -1: 오른쪽 오목
    path += ` L 0 ${midY + tabNeck}`;
    path += ` C ${-dir * tabSize * 0.3} ${midY + tabNeck}, ${-dir * tabSize * 0.3} ${midY + tabSize}, ${-dir * tabSize * 0.6} ${midY + tabSize}`;
    path += ` C ${-dir * tabSize} ${midY + tabSize}, ${-dir * tabSize} ${midY - tabSize}, ${-dir * tabSize * 0.6} ${midY - tabSize}`;
    path += ` C ${-dir * tabSize * 0.3} ${midY - tabSize}, ${-dir * tabSize * 0.3} ${midY - tabNeck}, 0 ${midY - tabNeck}`;
    path += ` L 0 0`;
  }

  path += ' Z';

  return path;
};

/**
 * 직소 퍼즐 조각 컴포넌트 (일반 Image + SVG 테두리 방식)
 */
const JigsawPiece = ({
  imageUri,
  piece,
  pieceWidth,
  pieceHeight,
  puzzleWidth,
  puzzleHeight,
  gridSize,
}) => {
  const pattern = getPiecePattern(piece.row, piece.col, gridSize);
  const tabSize = Math.min(pieceWidth, pieceHeight) * 0.2;

  // SVG viewBox 패딩 (탭이 잘리지 않도록)
  const padding = tabSize;
  const svgWidth = pieceWidth + padding * 2;
  const svgHeight = pieceHeight + padding * 2;

  const clipPath = generateJigsawPath(pieceWidth, pieceHeight, pattern);

  // 이미지 위치 계산
  const imageX = -piece.col * pieceWidth;
  const imageY = -piece.row * pieceHeight;

  return (
    <View style={{ width: svgWidth, height: svgHeight }}>
      {/* 이미지 레이어 - 사각형으로 표시 */}
      <View
        style={{
          position: 'absolute',
          left: padding,
          top: padding,
          width: pieceWidth,
          height: pieceHeight,
          overflow: 'hidden',
          borderRadius: 4,
        }}
      >
        <Image
          source={{ uri: imageUri }}
          style={{
            position: 'absolute',
            left: imageX,
            top: imageY,
            width: puzzleWidth,
            height: puzzleHeight,
          }}
          resizeMode="cover"
        />
      </View>
      {/* SVG 테두리 레이어 */}
      <Svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ position: 'absolute' }}
      >
        <Path
          d={clipPath}
          transform={`translate(${padding}, ${padding})`}
          fill="none"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth={2}
        />
      </Svg>
    </View>
  );
};

/**
 * 빈 퍼즐 슬롯 (직소 모양)
 */
const JigsawSlot = ({
  piece,
  pieceWidth,
  pieceHeight,
  gridSize,
  isSelected,
  isWrong,
  children,
}) => {
  const pattern = getPiecePattern(piece.row, piece.col, gridSize);
  const tabSize = Math.min(pieceWidth, pieceHeight) * 0.2;

  const padding = tabSize;
  const svgWidth = pieceWidth + padding * 2;
  const svgHeight = pieceHeight + padding * 2;

  const clipPath = generateJigsawPath(pieceWidth, pieceHeight, pattern);

  let fillColor = 'rgba(245, 247, 250, 0.9)';
  let strokeColor = 'rgba(200, 200, 200, 0.8)';

  if (isSelected) {
    fillColor = 'rgba(74, 144, 217, 0.2)';
    strokeColor = 'rgba(74, 144, 217, 1)';
  } else if (isWrong) {
    fillColor = 'rgba(239, 83, 80, 0.3)';
    strokeColor = 'rgba(239, 83, 80, 1)';
  }

  return (
    <View style={{ width: svgWidth, height: svgHeight, justifyContent: 'center', alignItems: 'center' }}>
      <Svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ position: 'absolute' }}
      >
        <Path
          d={clipPath}
          transform={`translate(${padding}, ${padding})`}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={isSelected ? 3 : 1.5}
        />
      </Svg>
      {children}
    </View>
  );
};

export { JigsawPiece, JigsawSlot, getPiecePattern, generateJigsawPath };
