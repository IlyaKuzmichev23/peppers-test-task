import { Application, Graphics} from "pixi.js";

export class Game {
    constructor(){
        this.app = null;
    }

    async init(){
        this.app = new Application();

        await this.app.init({
            width: 800,
            height: 900,
            background: 0x808080,
            antialias:  true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });

        document.body.appendChild(this.app.canvas);

        //платформа
        const paddle = new Graphics();
        paddle.rect(0,0,130,20);
        paddle.x = 335;
        paddle.y = 800;
        paddle.fill(0x273591);
        this.app.stage.addChild(paddle);

        //шар
        const ball = new Graphics();
        ball.circle(0,0,10);
        ball.x = 400;
        ball.y = 790;
        ball.fill(0xd4d00f);
        this.app.stage.addChild(ball);

        //игровой цикл
        let vx = 5;
        let vy = -5;
        this.app.ticker.add((time) => {
            ball.x+=vx*time.deltaTime;
            ball.y+=vy*time.deltaTime;
            console.log(ball.y);
            if(ball.x-10<=0 || ball.x+10>=800)
                vx*=-1;
            if(ball.y-10<=0)
                vy*=-1;
            if(ball.y+10>=paddle.y)
                vy*=-1;
        });

    };

}

const game = new Game();

game.init();