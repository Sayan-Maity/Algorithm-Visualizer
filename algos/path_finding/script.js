const rows = 19;
const cols = 44;

let startingPointX = 9;
let startingPointY = 15;
let endingPointX = 9;
let endingPointY = 27;

let speed = 10;

// it will show whether visualization is currently in process or not.
let currentlyRunning = false;
let foundPath = false;
let mouseIsDown = false;

// for the grid "isBlocked" will show whether there is wall or not on given cell.
let isBlocked = new Array(rows);
let gridElements = new Array(rows);
for (let i = 0; i < rows; i++) {
  isBlocked[i] = new Array(cols).fill(0);
  gridElements[i] = new Array(cols);
}

class PriorityQueue {
  constructor(defaultNode, comparator) {
    this.values = [];
    this.comparator = comparator;
    this.defaultNode = defaultNode;
  }
  // implemention of heap. based on "comparator" function heap will behave like min-heap or max-heap;
  add(element) {
    this.values.push(element);
    let index = this.values.length - 1;
    while (index >= 1 && this.comparator(this.values[index], this.values[Math.floor(index / 2)])) {
      [this.values[index], this.values[Math.floor(index / 2)]] = [
        this.values[Math.floor(index / 2)],
        this.values[index],
      ];
      index = Math.floor(index / 2);
    }
  }
  getTop() {
    if (this.isEmpty()) return 'No elements in priority queue';
    return this.values[0];
  }
  pop() {
    if (this.isEmpty()) return 'Underflow';
    [this.values[0], this.values[this.values.length - 1]] = [this.values[this.values.length - 1], this.values[0]];
    this.values.pop();

    let element = this.values[0];
    let index = 0;
    while (index * 2 + 1 < this.values.length) {
      let leftNode = this.defaultNode;
      let rightNode = this.defaultNode;
      if (index * 2 + 1 < this.values.length) leftNode = this.values[index * 2 + 1];
      if (index * 2 + 2 < this.values.length) rightNode = this.values[index * 2 + 2];

      if (this.comparator(element, rightNode) && this.comparator(element, leftNode)) break;
      if (index * 2 + 2 === this.values.length || this.comparator(leftNode, rightNode)) {
        [this.values[index], this.values[index * 2 + 1]] = [this.values[index * 2 + 1], this.values[index]];
        index = index * 2 + 1;
      } else {
        [this.values[index], this.values[index * 2 + 2]] = [this.values[index * 2 + 2], this.values[index]];
        index = index * 2 + 2;
      }
    }
  }
  isEmpty() {
    return this.values.length === 0;
  }
}

class Deque {
  constructor() {
    this.values = [];
  }
  push_back(element) {
    this.values.push(element);
  }
  pop_back() {
    if (this.isEmpty()) return;
    return this.values.pop();
  }
  push_front(element) {
    this.values.unshift(element);
  }
  pop_front() {
    if (this.isEmpty()) return;
    return this.values.shift();
  }
  isEmpty() {
    return this.values.length == 0;
  }
}

// create grid like struccture using table.
const init = () => {
  const allowDrop = (e) => {
    e.preventDefault();
  };

  const drag = (e) => {
    mouseIsDown = false;
    e.dataTransfer.setData('sourceId', e.target.id);
  };

  const drop = (e) => {
    e.preventDefault();
    let sourceId = e.dataTransfer.getData('sourceId');
    let targetId = e.target.id;

    var src = document.getElementById(sourceId);
    var tar = document.getElementById(targetId);
    let tarX = Number.parseInt(tar.id.substr(1, 2));
    let tarY = Number.parseInt(tar.id.substr(4, 2));
    if (!src || !tar) return;
    if (
      (src.className === 'startPoint' && tar.className === 'endPoint') ||
      (src.className === 'endPoint' && tar.className === 'startPoint')
    ) {
      [startingPointX, endingPointX] = [endingPointX, startingPointX];
      [startingPointY, endingPointY] = [endingPointY, startingPointY];
    } else {
      if (src.className === 'startPoint') {
        startingPointX = tarX;
        startingPointY = tarY;
      } else {
        endingPointX = tarX;
        endingPointY = tarY;
      }
      src.draggable = false;
      src.ondragstart = null;
      tar.draggable = true;
      tar.ondragstart = (e) => drag(e);
    }

    [src.className, tar.className] = [tar.className, src.className];
    [src.id, tar.id] = [tar.id, src.id];
  };
  const createGrid = (rows, cols, callback) => {
    let grid = document.createElement('table');
    grid.className = 'grid';

    for (let i = 0; i < rows; i++) {
      let tr = grid.appendChild(document.createElement('tr'));
      tr.ondrop = (e) => drop(e);
      tr.ondragover = (e) => allowDrop(e);

      for (let j = 0; j < cols; j++) {
        let cell = tr.appendChild(document.createElement('td'));
        // Unique ID for each cell. if row or cell number is single digit then put 0 infront of it.
        cell.id = 'r' + ('0' + i).slice(-2) + 'c' + ('0' + j).slice(-2);

        if (i == startingPointX && j == startingPointY) {
          cell.className = 'startPoint';
          cell.draggable = true;
          cell.ondragstart = (e) => drag(e);
        } else if (i == endingPointX && j == endingPointY) {
          cell.className = 'endPoint';
          cell.draggable = true;
          cell.ondragstart = (e) => drag(e);
        }

        gridElements[i][j] = cell;

        cell.addEventListener(
          'mouseover',
          () => {
            if (mouseIsDown) callback(cell, i, j);
          },
          false
        );

        cell.addEventListener(
          'mousedown',
          () => {
            callback(cell, i, j);
          },
          false
        );
      }
    }

    return grid;
  };
  const grid = createGrid(rows, cols, function (el, row, col) {
    if (row == startingPointX && col == startingPointY) {
    } else if (row == endingPointX && col == endingPointY) {
    } else if (el.className == 'clicked') {
      el.className = '';
      isBlocked[row][col] = 0;
    } else {
      el.className = 'clicked';
      isBlocked[row][col] = 1;
    }
  });
  document.getElementById('container').appendChild(grid);
  document.querySelector('body').addEventListener('mousedown', () => {
    mouseIsDown = 1;
  });
  document.querySelector('body').addEventListener('mouseup', () => {
    mouseIsDown = 0;
  });
};
init();

const isValid = (x, y) => {
  return x >= 0 && y >= 0 && x < rows && y < cols;
};
// to put delay between visualization.
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
const animate = async (nodesToAnimate, speed) => {
  for (let i = 0; i < nodesToAnimate.length; i++) {
    gridElements[nodesToAnimate[i].x][nodesToAnimate[i].y].className = 'visited';
    await sleep(speed);
    if (currentlyRunning == false) {
      clearGrid();
      return;
    }
  }
};
const generatePath = (path) => {
  let pathFromSrcToDest = [];
  let curi = endingPointX;
  let curj = endingPointY;

  while (!(curi == startingPointX && curj == startingPointY)) {
    if (path[curi][curj] == 'D') {
      curi++;
    } else if (path[curi][curj] == 'U') {
      curi--;
    } else if (path[curi][curj] == 'L') {
      curj--;
    } else if (path[curi][curj] == 'R') {
      curj++;
    }
    if (!(curi == startingPointX && curj == startingPointY)) {
      pathFromSrcToDest.push({ x: curi, y: curj });
    }
  }
  pathFromSrcToDest.reverse();
  return pathFromSrcToDest;
};
const animatePath = async (path) => {
  if (currentlyRunning == false) return;
  let pathFromSrcToDest = generatePath(path);

  for (let i = 0; i < pathFromSrcToDest.length; i++) {
    let { x, y } = pathFromSrcToDest[i];
    gridElements[x][y].className = 'path';
    await sleep(speed * 2.5);

    if (currentlyRunning === false) {
      clearGrid();
      return;
    }
  }
  currentlyRunning = false;
};

const Dijkstra = async () => {
  // initiazing variables.
  const INF = 1000000000;
  let vis = new Array(rows);
  let path = new Array(rows);
  let dis = new Array(rows);
  for (let i = 0; i < rows; i++) {
    vis[i] = new Array(cols).fill(0);
    path[i] = new Array(cols).fill('0');
    dis[i] = new Array(cols).fill(INF);
  }
  let nodesToAnimate = [];
  // this will default node for min-heap.
  const defaultNode = {
    dis: INF,
    x: -1,
    y: -1,
  };
  // heap will be created based on given comparator function.
  const DijkstraComparator = (a, b) => {
    if (a.dis != b.dis) return a.dis < b.dis;
    return Math.abs(a.y - endingPointY) < Math.abs(b.y - endingPointY);
  };
  const pq = new PriorityQueue(defaultNode, DijkstraComparator);

  pq.add({ dis: 0, x: startingPointX, y: startingPointY });
  dis[startingPointX][startingPointY] = 0;
  vis[startingPointX][startingPointY] = 1;
  path[startingPointX][startingPointY] = '1';

  const dx = [1, 0, -1, 0];
  const dy = [0, 1, 0, -1];
  const direction = ['U', 'L', 'D', 'R'];

  while (!pq.isEmpty()) {
    let p = pq.getTop();
    pq.pop();
    let x = p.x;
    let y = p.y;

    if (x == endingPointX && y == endingPointY) {
      break;
    }
    if (!(x == startingPointX && y == startingPointY)) {
      nodesToAnimate.push({ x: x, y: y });
    }
    for (let i = 0; i < 4; i++) {
      let newX = x + dx[i];
      let newY = y + dy[i];
      if (isValid(newX, newY) && isBlocked[newX][newY] === 0 && dis[x][y] + 1 < dis[newX][newY]) {
        pq.add({
          dis: dis[x][y] + 1,
          x: newX,
          y: newY,
        });
        vis[newX][newY] = 1;
        dis[newX][newY] = dis[x][y] + 1;
        path[newX][newY] = direction[i];
      }
    }

    if (currentlyRunning === false) {
      clearGrid();
      return;
    }
  }

  await animate(nodesToAnimate, speed);
  if (vis[endingPointX][endingPointY]) {
    foundPath = true;
    await animatePath(path);
  } else {
    alert('There is no path between starting and ending point');
  }
  currentlyRunning = false;
};

const DFS_BFS = async (type) => {
  let vis = new Array(rows);
  let path = new Array(rows);
  for (let i = 0; i < rows; i++) {
    vis[i] = new Array(cols).fill(false);
    path[i] = new Array(cols).fill('0');
  }
  let nodesToAnimate = [];

  const dq = new Deque();
  dq.push_back([startingPointX, startingPointY]);
  vis[startingPointX][startingPointY] = true;
  path[startingPointX][startingPointY] = '1';

  const dx = [1, 0, -1, 0];
  const dy = [0, 1, 0, -1];
  const direction = ['U', 'L', 'D', 'R'];

  while (!dq.isEmpty()) {
    let x, y;
    if (type == 'dfs') {
      [x, y] = dq.pop_back();
    } else {
      [x, y] = dq.pop_front();
    }

    if (x == endingPointX && y == endingPointY) {
      break;
    }
    if (!(x == startingPointX && y == startingPointY)) {
      nodesToAnimate.push({ x: x, y: y });
    }
    for (let i = 0; i < 4; i++) {
      let newX = x + dx[i];
      let newY = y + dy[i];
      if (isValid(newX, newY) && isBlocked[newX][newY] == 0 && vis[newX][newY] == false) {
        dq.push_back([newX, newY]);
        vis[newX][newY] = true;
        path[newX][newY] = direction[i];
      }
    }
    if (currentlyRunning == false) {
      clearGrid();
      return;
    }
  }

  await animate(nodesToAnimate, speed + 4);
  if (vis[endingPointX][endingPointY]) {
    foundPath = true;
    await animatePath(path);
  } else {
    alert('There is no path between starting and ending point');
  }
  currentlyRunning = false;
};

const AStar = async () => {
  const findManhattanDistance = (sx, sy, fx, fy) => {
    return Math.abs(fx - sx) + Math.abs(fy - sy);
  };
  const AStarComparator = (x, y) => {
    return x.f < y.f;
  };

  const INF = 1000000000;
  let vis = new Array(rows);
  let path = new Array(rows);
  for (let i = 0; i < rows; i++) {
    vis[i] = new Array(cols).fill(0);
    path[i] = new Array(cols).fill('0');
  }
  let nodesToAnimate = [];

  const defaultNode = {
    f: INF,
    x: -1,
    y: -1,
  };
  const pq = new PriorityQueue(defaultNode, AStarComparator);
  pq.add({
    f: findManhattanDistance(startingPointX, startingPointY, endingPointX, endingPointY),
    x: startingPointX,
    y: startingPointY,
  });
  vis[startingPointX][startingPointY] = 1;
  path[startingPointX][startingPointY] = '1';

  const dx = [1, 0, -1, 0];
  const dy = [0, 1, 0, -1];
  const direction = ['U', 'L', 'D', 'R'];

  while (!pq.isEmpty()) {
    let p = pq.getTop();
    pq.pop();
    let x = p.x;
    let y = p.y;

    if (x == endingPointX && y == endingPointY) {
      break;
    }
    if (!(x == startingPointX && y == startingPointY)) {
      nodesToAnimate.push({ x: x, y: y });
    }
    for (let i = 0; i < 4; i++) {
      let newX = x + dx[i];
      let newY = y + dy[i];
      if (isValid(newX, newY) && isBlocked[newX][newY] === 0 && vis[newX][newY] === 0) {
        let newNode = {};
        pq.add({
          f: findManhattanDistance(newX, newY, endingPointX, endingPointY),
          x: newX,
          y: newY,
        });
        vis[newX][newY] = 1;
        path[newX][newY] = direction[i];
      }
    }

    if (currentlyRunning === false) {
      clearGrid();
      return;
    }
  }
  await animate(nodesToAnimate, speed + 10);
  if (vis[endingPointX][endingPointY]) {
    foundPath = true;
    await animatePath(path);
  } else {
    alert('There is no path between starting and ending point');
  }
  currentlyRunning = false;
};

const removeVisitedCell = () => {
  // remove "visited" and "path"
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (gridElements[i][j].className == 'visited' || gridElements[i][j].className == 'path') {
        gridElements[i][j].className = '';
      }
    }
  }
};

const clearGrid = () => {
  //  remove "visited", "path" and "block(wall)" cells
  currentlyRunning = false;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if ((i == startingPointX && j == startingPointY) || (i == endingPointX && j == endingPointY));
      else {
        gridElements[i][j].className = '';
      }
      isBlocked[i][j] = 0;
    }
  }
};

const algorithmCaller = () => {
  if (currentlyRunning == true) {
    return;
  }
  type = document.getElementById('algorithm_type').value;
  currentlyRunning = true;
  foundPath = false;
  removeVisitedCell();
  if (type == 'dijkstra') {
    Dijkstra();
  } else if (type == 'Astar') {
    AStar();
  } else if (type == 'bfs' || type == 'dfs') {
    DFS_BFS(type);
  }
};

document.getElementById('visualizeButton').addEventListener('click', algorithmCaller);
document.getElementById('clearButton').addEventListener('click', clearGrid);
