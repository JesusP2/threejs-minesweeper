// NOTE: -1 = mine
// -2 = valid path
export function createMap(width: number, height: number) {
  const row = new Array(width).fill(0);
  const map: number[][] = [];
  for (let h = 0; h < height; h++) {
    map.push([...row]);
  }
  generateValidPath(map, [0, 0], [height - 1, width - 1]);
  generateMines(map, 10);
  countMines(map, [map.length, map[0].length]);
  printMap(map);
}

function printMap(map: number[][]) {
  let mapViz = '';
  for (const row of map) {
    const str = row
      .map((col) => (col === -2 ? 'P' : col === -1 ? 'M' : col))
      .join(' ');
    mapViz += `${str}\n`;
  }
  console.log(mapViz);
}

// you can only go left/right/top/bottom of the current box, the next box cannot be adjacent to a previous section of the path(besides the current box)
// example:
// start = [0, 3]
// end [5, 5]
// iter 1: [0, 4]
// iter 2: [1, 4]
// iter 3: cannot be [1, 3]
export function generateValidPath(
  map: number[][],
  start: [number, number],
  end: [number, number],
) {
  const currentBox: [number, number] = [...start];
  map[currentBox[0]][currentBox[1]] = -2;
  const maxIters = 100;
  let currIter = 0;
  while (
    !(currentBox[0] === end[0] && currentBox[1] === end[1]) &&
    currIter < maxIters
  ) {
    currIter++;
    const direction = getDirection(currentBox, end, map);
    if (direction === 'left') {
      currentBox[1] = currentBox[1] - 1;
    } else if (direction === 'right') {
      currentBox[1] = currentBox[1] + 1;
    } else if (direction === 'top') {
      currentBox[0] = currentBox[0] - 1;
    } else if (direction === 'bottom') {
      currentBox[0] = currentBox[0] + 1;
    }
    map[currentBox[0]][currentBox[1]] = -2;
  }
}

function doesBoxCollide({
  map,
  point,
  previousPoint,
  cols,
  rows,
}: {
  map: number[][];
  point: [number, number];
  previousPoint: [number, number];
  cols: number;
  rows: number;
}) {
  for (const col of [-1, 1]) {
    if (point[1] + col < 0 || point[1] + col >= cols) {
      continue;
    }
    const adjacentBoxPoint: [number, number] = [point[0], point[1] + col];
    const adjacentBox = map[adjacentBoxPoint[0]][adjacentBoxPoint[1]];
    if (
      adjacentBox === -2 &&
      !areArraysEqual(adjacentBoxPoint, previousPoint)
    ) {
      return true;
    }
  }

  for (const row of [-1, 1]) {
    if (point[0] + row < 0 || point[0] + row >= rows) {
      continue;
    }
    const adjacentBoxPoint: [number, number] = [point[0] + row, point[1]];
    const adjacentBox = map[adjacentBoxPoint[0]][adjacentBoxPoint[1]];
    if (
      adjacentBox === -2 &&
      !areArraysEqual(adjacentBoxPoint, previousPoint)
    ) {
      return true;
    }
  }
  return false;
}

function isBoxValid({
  map,
  nextPoint,
  currentPoint,
  end,
}: {
  map: number[][];
  nextPoint: [number, number];
  currentPoint: [number, number];
  end: [number, number];
}) {
  const rows = map.length;
  const cols = map[0].length;
  if (
    nextPoint[0] < 0 ||
    nextPoint[1] < 0 ||
    nextPoint[0] >= rows ||
    nextPoint[1] >= cols ||
    map[nextPoint[0]][nextPoint[1]] === -2
  ) {
    return false;
  }

  if (
    doesBoxCollide({
      point: nextPoint,
      previousPoint: currentPoint,
      map,
      rows,
      cols,
    })
  ) {
    return false;
  }

  const yDiff = end[0] - nextPoint[0];
  const xDiff = end[1] - nextPoint[1];
  let isPath1Valid = true;
  let tempY = nextPoint[0];
  let tempX = nextPoint[1];
  while (isPath1Valid && tempY !== end[0]) {
    const _tempY = tempY;
    tempY += yDiff < 0 ? -1 : +1;
    if (
      map[tempY][tempX] === -2 ||
      doesBoxCollide({
        point: [tempY, tempX],
        previousPoint: [_tempY, tempX],
        map,
        cols,
        rows,
      })
    ) {
      isPath1Valid = false;
    }
  }
  while (isPath1Valid && tempX !== end[1]) {
    const _tempX = tempX;
    tempX += xDiff < 0 ? -1 : +1;
    if (
      map[tempY][tempX] === -2 ||
      doesBoxCollide({
        point: [tempY, tempX],
        previousPoint: [tempY, _tempX],
        map,
        cols,
        rows,
      })
    ) {
      isPath1Valid = false;
    }
  }

  let isPath2Valid = true;
  tempY = nextPoint[0];
  tempX = nextPoint[1];
  while (isPath2Valid && tempX !== end[1]) {
    const _tempX = tempX;
    tempX += xDiff < 0 ? -1 : +1;
    if (
      map[tempY][tempX] === -2 ||
      doesBoxCollide({
        point: [tempY, tempX],
        previousPoint: [tempY, _tempX],
        map,
        cols,
        rows,
      })
    ) {
      isPath2Valid = false;
    }
  }
  while (isPath2Valid && tempY !== end[0]) {
    const _tempY = tempY;
    tempY += yDiff < 0 ? -1 : +1;
    if (
      map[tempY][tempX] === -2 ||
      doesBoxCollide({
        point: [tempY, tempX],
        previousPoint: [_tempY, tempX],
        map,
        cols,
        rows,
      })
    ) {
      isPath2Valid = false;
    }
  }
  return isPath1Valid || isPath2Valid;
}

function areArraysEqual(arr1: [number, number], arr2: [number, number]) {
  if (arr1.length !== arr2.length) {
    return false;
  }
  const len = arr1.length;
  for (let i = 0; i < len; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
}

type Direction = 'left' | 'right' | 'top' | 'bottom';
function getDirection(
  point: [number, number],
  end: [number, number],
  map: number[][],
) {
  const choices: Direction[] = [];
  const validChoices: Direction[] = [];
  const options = [
    {
      label: 'top',
      index: 0,
      value: -1,
    },
    {
      label: 'bottom',
      index: 0,
      value: 1,
    },
    {
      label: 'left',
      index: 1,
      value: -1,
    },
    {
      label: 'right',
      index: 1,
      value: 1,
    },
  ] as const;
  for (const option of options) {
    const nextPoint: [number, number] = [...point];
    nextPoint[option.index] += option.value;
    if (
      isBoxValid({
        map,
        nextPoint,
        currentPoint: point,
        end,
      })
    ) {
      validChoices.push(option.label);
    }
  }

  // we want to know the direction of the end so we can add bias to it
  const xDirection =
    end[1] - point[1] === 0 ? 'none' : end[1] - point[1] < 0 ? 'left' : 'right';
  if (xDirection === 'left' && validChoices.includes('left')) {
    choices.push(...new Array(3).fill('left'));
    if (validChoices.includes('right')) {
      choices.push(...new Array(2).fill('right'));
    }
  } else if (xDirection === 'right' && validChoices.includes('right')) {
    choices.push(...new Array(3).fill('right'));
    if (validChoices.includes('left')) {
      choices.push(...new Array(2).fill('left'));
    }
  }
  if (xDirection === 'none' && validChoices.includes('left')) {
    choices.push(...new Array(2).fill('left'));
  }
  if (xDirection === 'none' && validChoices.includes('right')) {
    choices.push(...new Array(2).fill('right'));
  }

  const yDirection =
    end[0] - point[0] === 0 ? 'none' : end[0] - point[0] < 0 ? 'top' : 'bottom';
  if (yDirection === 'top' && validChoices.includes('top')) {
    choices.push(...new Array(3).fill('top'));
    if (validChoices.includes('bottom')) {
      choices.push(...new Array(2).fill('bottom'));
    }
  } else if (yDirection === 'bottom' && validChoices.includes('bottom')) {
    choices.push(...new Array(3).fill('bottom'));
    if (validChoices.includes('top')) {
      choices.push(...new Array(2).fill('top'));
    }
  }
  if (yDirection === 'none' && validChoices.includes('top')) {
    choices.push(...new Array(2).fill('top'));
  }
  if (yDirection === 'none' && validChoices.includes('bottom')) {
    choices.push(...new Array(2).fill('bottom'));
  }
  const luckyGuy = Math.floor(Math.random() * choices.length);
  return choices[luckyGuy];
}

export function generateMines(map: number[][], minesNumber: number) {
  const width = map[0].length;
  const height = map.length;
  let minesAdded = 0;
  const chance = minesNumber / (width * height);
  const maxIters = 10;
  let currIter = 0;
  while (minesAdded < minesNumber && currIter < maxIters) {
    currIter++;
    for (let h = 0; h < height; h++) {
      for (let w = 0; w < width; w++) {
        const addMine =
          Math.random() < chance && minesAdded < minesNumber && map[h][w] === 0;
        if (addMine) {
          minesAdded++;
          map[h][w] = -1;
        }
      }
    }
  }
}

export function countMines(map: number[][], size: [number, number]) {
  for (let row = 0; row < size[0]; row++) {
    for (let col = 0; col < size[1]; col++) {
      let minesNum = 0;
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (
            row + i < 0 ||
            row + 1 >= size[0] ||
            col + j < 0 ||
            col + j >= size[1]
          ) {
            continue;
          }
          if (map[row + i][col + j] === -1) {
            minesNum++;
          }
        }
      }
      if (map[row][col] === 0) {
        map[row][col] = minesNum;
      }
    }
  }
}
