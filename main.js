import { Application, effectsMixin, Graphics} from "pixi.js";

export class Game {
    constructor(){
        this.app = null;
    }

    create_paddle() {
        this.paddle = new Graphics();
        this.paddle.rect(0,0,130,20);
        this.paddle.x = 335;
        this.paddle.y = 800;
        this.paddle.fill(0x273591);
        this.app.stage.addChild(this.paddle);
    }

    create_ball(){
        this.ball = new Graphics();
        this.ball.circle(0,0,10);
        this.ball.x = 400;
        this.ball.y = 790;
        this.ball.fill(0xd4d00f);
        this.app.stage.addChild(this.ball);
    };

    move_paddle(){
        this.move_left = false;
        this.move_right = false;
        window.addEventListener("keydown", (e)=>{
            if(e.code=="ArrowLeft")
                this.move_left = true;
            if(e.code=="ArrowRight")
                this.move_right = true;   
        });
        window.addEventListener("keyup", (e)=>{
            if(e.code=="ArrowLeft")
                this.move_left = false;
            if(e.code=="ArrowRight")
                this.move_right = false;   
        });
    };

    create_blocks(){
        this.blocks = [];
        let start_x = 12;
        let start_y = 100;
        const colors = ["0xff0000", "0x0022ff", "0x1aff00", "0xe6ff00", "0x3614b3"];
        for(let i = 0; i<5; i++){
            for(let j = 0; j<11; j++){
                let block = new Graphics();
                block.rect(0, 0, 66, 30);
                block.x = start_x;
                block.y = start_y;
                block.fill(colors[i]);
                this.app.stage.addChild(block);
                this.blocks.push(block);
                start_x+=71;
            };
            start_x = 12;
            start_y+=35;
        };
    };

    collie_blocks(){
        for(let i=0; i<this.blocks.length; i++){
            let block = this.blocks[i];
            if(
                (this.ball.x + 10 > block.x  && this.ball.x - 10 < block.x+66) &&
                (this.ball.y + 10 > block.y && this.ball.y-10<block.y+30)
                ){
                    this.vy*=-1;
                    this.app.stage.removeChild(block);
                    this.blocks.splice(i,1);
                }
        }
    };

    game_cycle(){
        this.vx = 5;
        this.vy = -5;
        this.app.ticker.add((time) => {
            this.ball.x+=this.vx*time.deltaTime;
            this.ball.y+=this.vy*time.deltaTime;
            if(this.ball.x-10<=0 || this.ball.x+10>=800)
                this.vx*=-1;
            if(this.ball.y-10<=0)
                this.vy*=-1;
            if((this.ball.y+10>=this.paddle.y && this.ball.y<this.paddle.y) && (this.ball.x+10>=this.paddle.x && this.ball.x-10<=this.paddle.x+130))
                this.vy*=-1;
            if(this.move_left && this.paddle.x>0)
                this.paddle.x -= 5*time.deltaTime;
            if(this.move_right && this.paddle.x+130<800)
                this.paddle.x += 5*time.deltaTime;

            this.collie_blocks();
        });
    };


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
        this.create_paddle();

        //шар
        this.create_ball();

        //движение платформы
        this.move_paddle();

        //создание блоков
        this.create_blocks();

        //игровой цикл
        this.game_cycle();

    };

}

const game = new Game();

game.init();