import P5 from 'p5'
import io from 'socket.io-client'
import Game from './Game'
import MapTile from './MapTile'
import OtherPlayer from './OtherPlayer'
import prealoadResources from './preloadResources'
import setupSocketEvents from './setupSocketEvents'
import Bullet from './Bullet'
import { Position } from './types'
import Pickable from './Pickable'
import Item from './Item'
import * as uuid from 'uuid'
import Wall from './Wall'
import { collideCircleCircle, collideRectCircle } from './collide'

let socket: SocketIOClient.Socket
let game: Game

let images: Map<string, P5.Image>
let fonts: Map<string, P5.Font>

let canvas: HTMLCanvasElement
var tileTypes, mapTiles: MapTile[] = []

let shootingDelay = Date.now()

const VISIBLE_RANGE = 2000
const VISIBLE_RANGE_X = 1200
const VISIBLE_RANGE_Y = 700

const PLAYER_SIZE = 80
const BULLET_SIZE = 30
const ITEM_SIZE = 64

const BULLET_SHOOTING_DELAY = 100

let time = Date.now()

const getDeltaTime = () => {
    let t = Date.now()
    let dt = t - time
    time = t
    return dt
}

function onKeyDown(e: any) {
  game.getPlayer().keyDown(e.keyCode)

}
function onKeyUp(e: any) {
  game.getPlayer().keyUp(e.keyCode)
}

function onContextMenu() {
  game.getPlayer().keysPressed.clear()
}

function getCursorPosition(canvas: HTMLCanvasElement, event: MouseEvent) {
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  return {
    x: x,
    y: y,
  }
}

function onMouseUp(e: MouseEvent) {
  if (shootingDelay > Date.now()) return
  shootingDelay = Date.now() + BULLET_SHOOTING_DELAY
  let pos = getCursorPosition(canvas, e)
  pos.x -= parseInt(canvas.style.width) / 2
  pos.y -= parseInt(canvas.style.height) / 2
  let length = Math.sqrt((pos.x * pos.x) + (pos.y * pos.y))
  let scale = 1 / length
  scale *= 2
  pos.x *= scale
  pos.y *= scale
  game.getPlayer().addBullet(new Bullet(game.getPlayer(), pos))
  socket.emit('shoot', {id: game.getPlayer().id, position: game.getPlayer().position, direction: pos})
}

function onCanvasResize() {
  var w = window.innerWidth
  var h = window.innerHeight

  var scale = 16/9;
  var windowScale = w/h

  if (scale > windowScale) {
    // higher
    canvas.style.width = w + 'px'
    canvas.style.height = (w/16*9) + 'px'
  } else {
    // wider
    canvas.style.width = (h/9*16) + 'px'
    canvas.style.height = h + 'px'
  }
}

function buildMap() {
  tileTypes = {
    grass: {
      image: images.get('grass')
    }
  }

  for (let x = -20; x < 20; x++) {
    for (let y = -20; y < 20; y++) {
      mapTiles.push(
        new MapTile(
          images.get('grass')!,
          {
            x: x * (images.get('grass')?.width || 256),
            y: y * (images.get('grass')?.height || 256)
          }
        )
      )
    }
  }

}

function isVisible(p1: Position, p2: Position) {
  return Math.abs(p1.x - p2.x) < VISIBLE_RANGE_X && Math.abs(p1.y - p2.y) < VISIBLE_RANGE_Y
}

function distance(p1: any, p2: any) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
}

function drawMapX(p5: P5) {
  for (let tile of mapTiles) {
    if (isVisible(game.getPlayer().position, {x: tile.position.x - tile.image.width / 2, y: tile.position.y - tile.image.height / 2})) {
      p5.image(tile.image, tile.position.x - game.getPlayer().position.x - tile.image.width/2, tile.position.y - game.getPlayer().position.y - tile.image.height/2)
    }
  }
}

function drawMap(p5: P5) {
  p5.stroke("#000000")
  p5.strokeWeight(4)
  for (let x = -p5.width; x < p5.width; x+=128) {
    p5.line(x - game.getPlayer().position.x % 128, -p5.height, x - game.getPlayer().position.x % 128, p5.height)
  }
  for (let y = -p5.width; y < p5.height; y+=128) {
    p5.line(-p5.width, y - game.getPlayer().position.y % 128, p5.width, y - game.getPlayer().position.y % 128)
  }
}


const sketch = (p5: P5) => {
  

  p5.preload = () => {
    let resources = prealoadResources(p5)
    
    images = resources.images
    fonts = resources.fonts
  }

  p5.setup = () => {
    buildMap()
    p5.createCanvas(1920, 1080)
    canvas = document.querySelector('canvas')!
    onCanvasResize()
    window.addEventListener('resize', onCanvasResize)
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)
    document.addEventListener("contextmenu", onContextMenu)
    canvas.addEventListener("mousedown", onMouseUp)
    p5.textFont(fonts.get('Ubuntu')!)

    socket = io("https://blobbystrike.ioi.lt", {secure: true})
    game = new Game(socket)
    game.setImages(images)

    // left
    game.addWall(new Wall({ x: -3060, y: -3060, }, { x: 20, y: 6120 }))

    // top
    game.addWall(new Wall({ x: -3060, y: -3060, }, { x: 6120, y: 20 }))

    // right
    game.addWall(new Wall({ x: 3040, y: -3060, }, { x: 20, y: 6120 }))

    // bottom
    game.addWall(new Wall({ x: -3060, y: 3040, }, { x: 6120, y: 20 }))

    setupSocketEvents(socket, game)
  }

  p5.draw = () => {

    let dt = getDeltaTime()

    p5.background('#690000')
    p5.translate(p5.width/2, p5.height/2)


    // drawing map background
    drawMap(p5)

    p5.strokeWeight(2)

    // drawing items
    for (let item of game.getItems()) {
      p5.image(item.item.image, item.position.x - game.getPlayer().position.x, item.position.y - game.getPlayer().position.y)
      if (collideRectCircle(p5, item.position.x, item.position.y, ITEM_SIZE, ITEM_SIZE, game.getPlayer().position.x, game.getPlayer().position.y, PLAYER_SIZE)) {
        switch(item.item.type) {
          case "HEAL":
            game.getPlayer().health = 100
            socket.emit('hit-player', {id: game.getPlayer().id, health: game.getPlayer().health})
            socket.emit('item-picked', {id: item.id})
            break;
          case "POINTS":
            socket.emit('item-picked', {id: item.id})
            break;
          // case "DAMAGE":
          //   game.getPlayer().damage += 2
          //   socket.emit('item-damage')
          //   break;
          // case "DEFENCE":
          //   game.getPlayer().defence += 2
          //   socket.emit('item-defence')
          //   break;
        }
        game.removeItem(item)
      }
    }


    game.otherPlayers.getPlayers().forEach((otherPlayer) => {
      // going through other player list

      // draw player if in range
      if (isVisible(game.getPlayer().position, otherPlayer.position)) {
        otherPlayer.draw(p5, {
          x: otherPlayer.position.x - game.getPlayer().position.x,
          y: otherPlayer.position.y - game.getPlayer().position.y
        })

        // move player if in range (guessing where player will be when request from servers comes back)
        otherPlayer.move(p5, dt, game.getWalls())
      }

      // going through bullets of that player
      for (let bullet of otherPlayer.getBullets()) {

        // draw bullet if in range
        if (isVisible(game.getPlayer().position, bullet.position)) {
          bullet.draw(p5, {
            x: bullet.position.x - game.getPlayer().position.x,
            y: bullet.position.y - game.getPlayer().position.y,
          })
        }

        // move bullet
        bullet.move(dt)

        // check if bullet colloides with current player
        if (collideCircleCircle(p5, game.getPlayer().position.x, game.getPlayer().position.y, PLAYER_SIZE, bullet.position.x, bullet.position.y, BULLET_SIZE)) {
          bullet.timeToLive = -1
        }

        // check if bullet collides with other player
        game.otherPlayers.getPlayers().forEach((otherPlayerCheck) => {
          if (collideCircleCircle(p5, otherPlayerCheck.position.x, otherPlayerCheck.position.y, PLAYER_SIZE, bullet.position.x, bullet.position.y, BULLET_SIZE)) {
            // check if player bullet collides with is not the player who shot the bullet
            if (otherPlayerCheck.id !== bullet.shooter.id) {
              bullet.timeToLive = -1
            }
          }
        })
      }

      // removig bullets that has traveled far enough
      otherPlayer.removeExpiredBullets()
    })
    
    // drawing current player
    game.getPlayer().draw(p5, {x: 0, y: 0})

    
    // going through current player bullets
    for (let bullet of game.getPlayer().getBullets()) {
      // drawing bullet if in range
      if (isVisible(game.getPlayer().position, bullet.position)) {
        bullet.draw(p5,
          {
            x: bullet.position.x - game.getPlayer().position.x,
            y: bullet.position.y - game.getPlayer().position.y
          })
      }

      // move bullet
      bullet.move(dt)

      // check if bullet collides with other player
      game.otherPlayers.getPlayers().forEach((otherPlayer) => {
        if (otherPlayer.id === game.getPlayer().id) return
        if (collideCircleCircle(p5, otherPlayer.position.x, otherPlayer.position.y, PLAYER_SIZE, bullet.position.x, bullet.position.y, BULLET_SIZE)) {
          // register hit to other player
          otherPlayer.hit(bullet, game.getPlayer().socket)
        }
      })
    }

    for (let wall of game.getWalls()) {
      wall.draw(p5, game.getPlayer().position)
    }
    
    // removig bullets that has traveled far enough
    game.getPlayer().removeExpiredBullets()

    // drawing coordinates of the current player
    p5.fill('#690000')
    p5.stroke('#000000')
    p5.textAlign(p5.LEFT, p5.TOP)
    p5.text(Math.floor(game.getPlayer().position.x) + ':' + Math.floor(game.getPlayer().position.y), -p5.width/2 + 30, -p5.height/2 + 30)

    p5.fill('#690000')
    p5.stroke('#000000')
    p5.textAlign(p5.RIGHT, p5.TOP)
    p5.text('Players: ' + (+game.otherPlayers.getPlayers().size + 1), p5.width/2 - 30, -p5.height/2 + 30)


    p5.fill('#690000')
    p5.stroke('#000000')
    p5.textAlign(p5.RIGHT, p5.BOTTOM)


    let scores = new Map<string, number>()
    game.otherPlayers.getPlayers().forEach((player) => {
      scores.set(player.id, player.score)
    })
    scores.set(game.getPlayer().id, game.getPlayer().score)

    scores[Symbol.iterator] = function* () {
        yield* [...this.entries()].sort((a, b) => b[1] - a[1]);
    }

    let text = 'All time best: ' + game.bestScore.name + ': ' + game.bestScore.score + '\n\n'

    for (let [id, score] of scores) {
      let player = game.otherPlayers.getPlayer(id)
      if (!player) {
        if (game.getPlayer().id === id) {
          player = game.getPlayer()
        }
      }
      if (player) {
        text += '\n' + player.name + ': ' + score
      }
    }

    text += `\n---------\nYour score: ${game.getPlayer().score}`;

    p5.text(text, p5.width/2 - 830, p5.height/2 - 830, 800, 800)
    
    // moving player depending on keys pressed
    let previousePosition = {...game.getPlayer().position}

    game.getPlayer().move(p5, dt, game.getWalls())
    
    let newPosition = {...game.getPlayer().position}
    if (previousePosition.x !== newPosition.x || previousePosition.y !== newPosition.y) {
      game.getPlayer().socket.emit('player-moved', {position: newPosition})
    }
  }

}

new P5(sketch)