import { Application} from "pixi.js";

export class Game {
    constructor(){
        this.app = null;
    }

    async init(){
        this.app = new Application();

        await this.app.init({
            width: 800,
            height: 600,
            background: 0x000000,
            antialias:  true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,       // масштабирование под Retina
        });

        document.body.appendChild(this.app.canvas);
    };

}

const game = new Game();

game.init();