import { Application, effectsMixin, Graphics, Text} from "pixi.js";

export class Game {
    constructor(){
        this.app = null;
        this.paddle_width = 130;
        this.paddle_coordinate_x = 335;
        this.paddle_coordinate_y = 800;
        this.buffs = [];
    }

    create_paddle() {
        this.paddle = new Graphics();
        this.paddle.rect(0,0,this.paddle_width,20);
        this.paddle.x = this.paddle_coordinate_x;
        this.paddle.y = this.paddle_coordinate_y;
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
                    this.score += 100;
                    this.score_text.text = "Score:" + this.score;
                    if(Math.random()<0.5){
                        this.create_buff(block.x, block.y);
                    }
                }
        }
    };

    score_out(){
        this.score = 0;
        
        this.score_text = new Text({
            text: "Score:0",
            style:{
                fill: 0xffffff,
                fontSize: 32
            }
        });
        this.score_text.x = 20;
        this.score_text.y = 20;

        this.app.stage.addChild(this.score_text);
    };

    create_buff(x,y){
        let buff = new Graphics();
        buff.rect(0,0,20,20);
        buff.fill(0xf257ea);

        buff.x = x;
        buff.y = y;

        buff.speed = 5;

        this.app.stage.addChild(buff);
        this.buffs.push(buff);
    };

    game_cycle(){
        this.vx = 5;
        this.vy = -5;
        this.app.ticker.add((time) => {
            //движение
            this.ball.x+=this.vx*time.deltaTime;
            this.ball.y+=this.vy*time.deltaTime;
            for(let i = 0; i<this.buffs.length; i++){
                let buff = this.buffs[i];
                buff.y+=buff.speed*time.deltaTime;
                if(
                    (buff.x+20 > this.paddle.x && buff.x<this.paddle.x+this.paddle_width) &&
                    (buff.y+20 > this.paddle.y && buff.y<this.paddle.y+20)
                ){
                    this.paddle_width+=30;
                    this.paddle_coordinate_x=this.paddle.x-15;
                    this.app.stage.removeChild(buff);
                    this.app.stage.removeChild(this.paddle);
                    this.buffs.splice(i,1);
                    this.create_paddle();
                };
            }
            //столкновение
            if(this.ball.x-10<=0 || this.ball.x+10>=800)
                this.vx*=-1;
            if(this.ball.y-10<=0)
                this.vy*=-1;
            if((this.ball.y+10>=this.paddle.y && this.ball.y<this.paddle.y) && (this.ball.x+10>=this.paddle.x && this.ball.x-10<=this.paddle.x+this.paddle_width))
                this.vy*=-1;
            if(this.move_left && this.paddle.x>0)
                this.paddle.x -= 5*time.deltaTime;
            if(this.move_right && this.paddle.x+this.paddle_width<800)
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

        //вывод счёта
        this.score_out();

        //игровой цикл
        this.game_cycle();

    };

}

const game = new Game();

game.init();