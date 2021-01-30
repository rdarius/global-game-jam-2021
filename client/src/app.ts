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

const socket = io("https://blobbystrike.ioi.lt", {secure: true})
const game = new Game(socket)

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

const BULLET_SHOOTING_DELAY = 100

function onKeyDown(e: any) {
  game.getPlayer().setKeyPressed(e.keyCode, true)
}
function onKeyUp(e: any) {
  game.getPlayer().setKeyPressed(e.keyCode, false)
}

function onContextMenu() {
  game.getPlayer().clearKeysPressed()
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
  scale *= 50
  pos.x *= scale
  pos.y *= scale
  game.getPlayer().addBullet(new Bullet(game.getPlayer(), pos))
  socket.emit('shoot', {position: game.getPlayer().position, direction: pos})
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

function drawPlayer(p5: P5, player: OtherPlayer, x: any, y: any) {
  p5.stroke(0, 0, 0)
  p5.strokeWeight(5)
  p5.fill(player.color)
  p5.ellipse(x, y, 80, 80)
  p5.textSize(32)
  p5.fill(255, 255, 255)
  p5.textAlign(p5.CENTER, p5.CENTER)
  p5.text(player.name, x - 300,y - 150, 600, 50)
  p5.noStroke()
  p5.fill('#850000')
  p5.rect(x - 50, y - 90, 100, 5)
  p5.fill('#008500')
  p5.rect(x - 50, y - 90, player.health, 5)
}

function drawBullet(p5: P5, color: string, x: any, y: any) {
  p5.stroke(0, 0, 0)
  p5.strokeWeight(3)
  p5.fill(color)
  p5.ellipse(x, y, 30, 30)
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

function drawMap(p5: P5) {
  for (let tile of mapTiles) {
    if (isVisible(game.getPlayer().position, tile.position)) {
      p5.image(tile.image, tile.position.x - game.getPlayer().position.x - tile.image.width/2, tile.position.y - game.getPlayer().position.y - tile.image.height/2)
    }
  }
}

const sketch = (p5: P5) => {
  p5.setup = () => {
    buildMap()
    p5.createCanvas(1920, 1080, p5.WEBGL);
    canvas = document.querySelector('canvas')!
    onCanvasResize()
    window.addEventListener('resize', onCanvasResize)
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)
    document.addEventListener("contextmenu", onContextMenu)
    canvas.addEventListener("mousedown", onMouseUp)
    p5.textFont(fonts.get('Ubuntu')!)

    game.addItem(new Pickable({x: 150, y: 150}, new Item(images.get('healthPack')!, "HEAL")))
    game.addItem(new Pickable({x: 150, y: 100}, new Item(images.get('powerUp')!, "DAMAGE")))
    game.addItem(new Pickable({x: 150, y: 100}, new Item(images.get('shield')!, "DEFENCE")))
  }

  p5.preload = () => {
    let resources = prealoadResources(p5)
    
    images = resources.images
    fonts = resources.fonts

    setupSocketEvents(socket, game)
  }

  p5.draw = () => {
    p5.background('#000000')
    // p5.translate(p5.width/2, p5.height/2)


    // drawing map background
    drawMap(p5)


    // drawing items
    for (let item of game.getItems()) {

      p5.image(item.item.image, item.position.x - game.getPlayer().position.x, item.position.y - game.getPlayer().position.y)

    }


  
    for (let otherPlayer of game.getOtherPlayers()) {
      // going through other player list

      // draw player if in range
      if (isVisible(game.getPlayer().position, otherPlayer.position)) {
        otherPlayer.draw(p5, {
          x: otherPlayer.position.x - game.getPlayer().position.x,
          y: otherPlayer.position.y - game.getPlayer().position.y
        })
      }

      // going through bullets of that player
      for (let bullet of otherPlayer.getBullets()) {

        // draw bullet if in range
        if (isVisible(game.getPlayer().position, bullet.position)) {
          drawBullet(p5, bullet.shooter.color, bullet.position.x - game.getPlayer().position.x, bullet.position.y - game.getPlayer().position.y)
        }

        // move bullet
        bullet.move()

        // check if bullet colloides with current player
        if (distance(game.getPlayer().position, bullet.position) < BULLET_SIZE + PLAYER_SIZE) {
          bullet.timeToLive = -1
        }

        // check if bullet collides with other player
        for (let otherPlayerCheck of game.getOtherPlayers()) {
          if (distance(otherPlayerCheck.position, bullet.position) < BULLET_SIZE + PLAYER_SIZE) {
            // check if player bullet collides with is not the player who shot the bullet
            if (otherPlayerCheck.id !== bullet.shooter.id) {
              bullet.timeToLive = -1
            }
          }
        }
      }

      // removig bullets that has traveled far enough
      otherPlayer.removeExpiredBullets()
    }
    
    // drawing current player
    game.getPlayer().draw(p5, {x: 0, y: 0})

    
    // going through current player bullets
    for (let bullet of game.getPlayer().getBullets()) {
      // drawing bullet if in range
      if (isVisible(game.getPlayer().position, bullet.position)) {
        drawBullet(p5, bullet.shooter.color, bullet.position.x - game.getPlayer().position.x, bullet.position.y - game.getPlayer().position.y)
      }

      // move bullet
      bullet.move()

      // check if bullet collides with other player
      for (let otherPlayer of game.getOtherPlayers()) {
        if (distance(otherPlayer.position, bullet.position) < BULLET_SIZE + PLAYER_SIZE) {
          // register hit to other player
          otherPlayer.hit(bullet, game.getPlayer().socket)
        }
      }
    }
    
    // removig bullets that has traveled far enough
    game.getPlayer().removeExpiredBullets()

    // drawing coordinates of the current player
    p5.fill('#ffffff')
    p5.stroke('#000000')
    p5.textAlign(p5.LEFT, p5.TOP)
    p5.text(Math.floor(game.getPlayer().position.x) + ':' + Math.floor(game.getPlayer().position.y), -p5.width/2 + 10, -p5.height/2 + 10)
    
    // moving player depending on keys pressed
    game.getPlayer().move()
  }

}

new P5(sketch)