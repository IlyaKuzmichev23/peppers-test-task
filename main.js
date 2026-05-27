import { Application, effectsMixin, Graphics, Text, Sprite, Assets} from "pixi.js";

export class Game {
    constructor(){
        this.app = null;
        this.paddle_width = 130;
        this.paddle_coordinate_x = 335;
        this.paddle_coordinate_y = 800;
        this.buffs = [];
        this.is_pause = false;
        this.game_over = false;
    }

    create_border(){
        this.border = new Graphics();
        this.border.rect(0, 0,400, 900);
        this.border.x = 800;
        this.border.y = 0;
        this.border.fill(0x1f2120);
        this.app.stage.addChild(this.border);
    };

    async create_paddle() {
        const texture = await Assets.load("/images/paddle.png");
        this.paddle = new Sprite(texture);
        this.paddle.x = this.paddle_coordinate_x;
        this.paddle.y = this.paddle_coordinate_y;
        this.paddle.width = this.paddle_width;
        this.paddle.height = 20;
        this.app.stage.addChild(this.paddle);
    };

    async create_ball(){
        const texture = await Assets.load("/images/ball.png");
        this.ball = new Sprite(texture);
        this.ball.anchor.set(0.5);
        this.ball.width = 20;
        this.ball.height = 20;
        this.ball.x = 400;
        this.ball.y = 790;
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

    async create_blocks(){
        this.blocks = [];
        let start_x = 12;
        let start_y = 100;
        const blocks = ["block1.png", "block2.png", "block3.png", "block4.png", "block5.png"];
        for(let i = 0; i<5; i++){
            const texture = await Assets.load(`/images/${blocks[i]}`);
            for(let j = 0; j<11; j++){
                const block = new Sprite(texture);
                block.width = 66;
                block.height = 30;
                block.x = start_x;
                block.y = start_y;
                this.app.stage.addChild(block);
                this.blocks.push(block);
                start_x+=71;
            };
            start_x = 12;
            start_y+=35;
        };
    };

    collide_blocks(){
        for(let i=0; i<this.blocks.length; i++){
            let block = this.blocks[i];
            if(
                (this.ball.x + 10 > block.x  && this.ball.x - 10 < block.x+66) &&
                (this.ball.y + 10 > block.y && this.ball.y-10<block.y+30)
                ){
                    this.vy*=-1;
                    this.hit_sound.currentTime = 0;
                    this.hit_sound.play();
                    this.app.stage.removeChild(block);
                    this.blocks.splice(i,1);
                    this.score += 100;
                    this.score_text.text = "Score:" + this.score;
                    if(Math.random()<0.999){
                        this.create_buff(block.x, block.y);
                    }
                }
        }
    };

    show_game_over(){
        this.game_over_text = new Text({
            text: "GAME OVER",
            style:{
                fill: 0xffffff,
                fontSize: 64,
                fontFamily:"fantasy",
                fontWeight: "bold"
            }
        })
        this.game_over_text.anchor.set(0.5);
        this.game_over_text.x = 400;
        this.game_over_text.y = 450;

        this.app.stage.addChild(this.game_over_text);
    };

    score_out(){
        this.score = 0;
        
        this.score_text = new Text({
            text: "Score:0",
            style:{
                fill: 0xffffff,
                fontSize: 32,
                fontFamily: "monospace",
                fontWeight: "bold"
            }
        });
        this.score_text.x = 900;
        this.score_text.y = 100;

        this.app.stage.addChild(this.score_text);
    };

    create_buff(x,y){
        const buff = new Sprite(this.texture_buff);
        buff.anchor.set(0.5);

        buff.width = 20;
        buff.height = 20;

        buff.x = x;
        buff.y = y;

        buff.speed = 5;

        this.app.stage.addChild(buff);
        this.buffs.push(buff);
    };


    pause(){
        window.addEventListener("keydown", (e)=>{
            if(e.code=="Space")
                if(this.game_over)
                    location.reload();
                else
                    this.is_pause = !this.is_pause;
        });
    };

    game_cycle(){
        this.vx = 5;
        this.vy = -5;
        this.app.ticker.add((time) => {
            //проверка паузы или окончания игры
            if(this.is_pause || this.game_over)
                return;
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
                    this.buff_sound.currentTime = 0;
                    this.buff_sound.play();
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
                if(this.paddle.x-5<0)
                    this.paddle.x=0
                else
                    this.paddle.x -= 5*time.deltaTime;
            if(this.move_right && this.paddle.x+this.paddle_width<800)
                if(this.paddle.x+this.paddle_width+5>800)
                    this.paddle.x = 800-this.paddle_width;
                else
                    this.paddle.x += 5*time.deltaTime;
            this.collide_blocks();

            //условие окончания игры
            if(this.ball.y > 900){
                this.game_over = true;
                this.app.stage.removeChild(this.ball);
                this.show_game_over();
            }
        });
    };


    async init(){
        this.app = new Application();

        await this.app.init({
            width: 1200,
            height: 900,
            background: 0x808080,
            antialias:  true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });

        document.body.appendChild(this.app.canvas);

        this.texture_buff = await Assets.load("/images/star.png");

        this.hit_sound = new Audio("/sounds/hit.wav");

        this.buff_sound = new Audio("/sounds/buff.wav");

        //граница
        this.create_border();

        //платформа
        await this.create_paddle();

        //шар
        this.create_ball();

        //движение платформы
        this.move_paddle();

        //создание блоков
        await this.create_blocks();

        //вывод счёта
        this.score_out();

        //игровой цикл
        this.game_cycle();

        //пауза
        this.pause();

    };

}

const game = new Game();

game.init();