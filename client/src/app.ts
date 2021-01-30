var canvas;

var tileTypes, mapTiles = [];

const PLAYER_SPEED = 10;

var Player = {
  id: '',
  name: '',
  position: {x:0, y:0},
  color: '#' + (Math.floor(Math.random() * 256)).toString(16) + (Math.floor(Math.random() * 256)).toString(16) + (Math.floor(Math.random() * 256)).toString(16),
  keysPressed: [],
}

var OtherPlayers = []

var KEY_W = 87;
var KEY_A = 65;
var KEY_S = 83;
var KEY_D = 68;

let grassImage;
function preload() {
  grassImage = loadImage('grass.png');
}

function onKeyDown(e) {
  Player.keysPressed[e.keyCode] = true;
}
function onKeyUp(e) {
  Player.keysPressed[e.keyCode] = false;
}

function onContextMenu() {
  Player.keysPressed = [];
}

function onCanvasResize() {
  var w = window.innerWidth;
  var h = window.innerHeight;

  var scale = 16/9;
  var windowScale = w/h;

  if (scale > windowScale) {
    // higher
    canvas.style.width = w + 'px';
    canvas.style.height = (w/16*9) + 'px';
  } else {
    // wider
    canvas.style.width = (h/9*16) + 'px';
    canvas.style.height = h + 'px';
  }
}

function drawPlayer(player, x, y) {
  stroke(0, 0, 0)
  strokeWeight(5)
  // translate(-width/2, -height/2)
  fill(player.color)
  ellipse(x, y, 80, 80);
  textSize(32);
  fill(255, 255, 255);
  textAlign(CENTER, CENTER);
  text(player.name, x - 300,y - 100, 600, 50);
}

function relativePosition(pos1, pos2) {
  return {
    x: pos2.x - pos1.x,
    y: pos2.y - pos1.y,
  }
}

function buildMap() {
  tileTypes = {
    grass: {
      image: grassImage
    }
  }

  for (let x = 0; x < 10; x++) {
    mapTiles[x] = []
    for (let y = 0; y < 6; y++) {
      mapTiles[x][y] = {
        tile: tileTypes.grass.image,
        x: x * 380,
        y: y * 380,
      }
    }
  }

  console.log(mapTiles)
}

function isVisible(middlePoint, visibleAreaSize, position, size) {
  if (
    position.x - size.width > middlePoint.x - visibleAreaSize.width/2 &&
    position.x + size.width < middlePoint.x + visibleAreaSize.width/2 &&
    position.y - size.height > middlePoint.y - visibleAreaSize.height/2 &&
    position.y + size.height < middlePoint.y + visibleAreaSize.height/2
  ) {
    // console.log('visible')
    return true;
  }
  // console.log('not visible')
  return false;
}

function distance(p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
}

function drawMap() {

  for (let xTiles of mapTiles) {
    for (let yTile of xTiles) {
      if (distance(Player.position, {x: yTile.x, y: yTile.y}) < 2000) {
        image(yTile.tile, yTile.x + width/2, yTile.y + height/2)
      }
    }
  }

}

function setup() {

  // TESTING //

  // END: TESTING //

  buildMap()
  createCanvas(1920, 1080);
  canvas = document.querySelector('canvas')
  onCanvasResize()
  window.addEventListener('resize', onCanvasResize)
  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('keyup', onKeyUp)
  document.addEventListener("contextmenu", onContextMenu);
}

function draw() {
  translate(-Player.position.x, Player.position.y)

  drawMap()

  for (let otherPlayer of OtherPlayers) {
    drawPlayer(otherPlayer, otherPlayer.position.x + width/2, -otherPlayer.position.y + height/2)
  }

  translate(Player.position.x, -Player.position.y)
  drawPlayer(Player, width/2, height/2)
  text(Math.floor(Player.position.x) + ':' + Math.floor(Player.position.y), width/2, 50)



  
  let previousPosition = {
    x: Player.position.x,
    y: Player.position.y,
  }
  if (Player.keysPressed[KEY_A]) {
    Player.position.x -= PLAYER_SPEED;
  }
  if (Player.keysPressed[KEY_D]) {
    Player.position.x += PLAYER_SPEED;
  }

  if (Player.keysPressed[KEY_W]) {
    Player.position.y += PLAYER_SPEED;
  }
  if (Player.keysPressed[KEY_S]) {
    Player.position.y -= PLAYER_SPEED;
  }
  if (Player.position.x !== previousPosition.x || Player.position.y !== previousPosition.y) {
    socket.emit('i-moved', {x: Player.position.x, y: Player.position.y})
  }
}

socket.on('your-info', function (playerData) {
  Player.name = playerData.name;
  Player.position = playerData.position;
  Player.color = playerData.color;
  Player.id = playerData.id;
})
socket.on('players-info', function (playersData) {
  for (let playerData of playersData) {
    if (Player.id !== playerData.id) {
      OtherPlayers.push({
        name: playerData.name,
        position: playerData.position,
        color: playerData.color,
        id: playerData.id,
      })
    }
  }
})
socket.on('new-player-joined', function (playerData) {
  if (Player.id !== playerData.id) {
    OtherPlayers.push({
      name: playerData.name,
      position: playerData.position,
      color: playerData.color,
      id: playerData.id,
    })
  }
})
socket.on('player-moved', function (movedPlayerData) {
  for (let playerData of OtherPlayers) {
    if (Player.id !== movedPlayerData.id && movedPlayerData.id === playerData.id) {
      playerData.position = movedPlayerData.position;
    }
  }
})