import P5 from 'p5'

export default function prealoadResources(p5: P5): {
    images: Map<string, P5.Image>,
    fonts: Map<string, P5.Font>
} {

    let images = new Map<string, P5.Image>()
    let fonts = new Map<string, P5.Font>()

    images.set('grass', p5.loadImage('images/grass.png'))
    images.set('powerUp', p5.loadImage('images/PowerUp.png'))
    images.set('shield', p5.loadImage('images/Shield.png'))
    images.set('healthPack', p5.loadImage('images/HealthPack.png'))

    fonts.set('Ubuntu', p5.loadFont('fonts/Ubuntu/Ubuntu-Regular.ttf'))

    return {
        images,
        fonts
    };
}