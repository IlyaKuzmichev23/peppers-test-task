import { Application, effectsMixin, Graphics, Text, Sprite, Assets} from "pixi.js";

export class Game {
    constructor(){
        this.app = null;
        this.frame_thickness = 70;
        this.paddle_width = 130;
        this.paddle_coordinate_x = 335+this.frame_thickness;
        this.paddle_coordinate_y = 800+this.frame_thickness;
        this.buffs = [];
        this.is_pause = false;
        this.game_over = false;
        this.win = false;
        this.ball_speed = 8;
        this.paddle_speed = 10;
    }

    async create_frame(){
        const texture = await Assets.load("/images/frame.png");
        this.frame = new Sprite(texture);
        this.frame.x = 0;
        this.frame.y = 0;
        this.frame.width=800+this.frame_thickness*2;
        this.frame.height=900+this.frame_thickness;
        this.app.stage.addChild(this.frame);
    }

    async create_background(){
        const texture = await Assets.load("/images/background.png");
        this.background = new Sprite(texture);
        this.background.x=this.frame_thickness;
        this.background.y=this.frame_thickness;
        this.background.width=800;
        this.background.height=900;
        this.app.stage.addChild(this.background);
    }

    create_border(){
        this.border = new Graphics();
        this.border.rect(0, 0,400, 900+this.frame_thickness);
        this.border.x = 800+this.frame_thickness*2;
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
        this.ball.x = 400+this.frame_thickness;
        this.ball.y = 790+this.frame_thickness;
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
        let start_x = 12+this.frame_thickness;
        let start_y = 100+this.frame_thickness;
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
            start_x = 12+this.frame_thickness;
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
                    if(Math.random()<0.3){
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
        this.game_over_text.x = 400+this.frame_thickness;
        this.game_over_text.y = 450+this.frame_thickness;

        this.app.stage.addChild(this.game_over_text);
    };

    show_win(){
        this.win_text = new Text({
            text: "YOU WIN",
            style:{
                fill: 0xffffff,
                fontSize: 64,
                fontFamily:"fantasy",
                fontWeight: "bold"
            }
        })
        this.win_text.anchor.set(0.5);
        this.win_text.x = 400+this.frame_thickness;
        this.win_text.y = 450+this.frame_thickness;

        this.app.stage.addChild(this.win_text);
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
        this.score_text.x = 900+this.frame_thickness*2;
        this.score_text.y = 200;

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
        this.vx = 0;
        this.vy = -this.ball_speed;
        this.app.ticker.add((time) => {
            //проверка паузы или окончания игры
            if(this.is_pause || this.game_over || this.win)
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

                    if(this.paddle_coordinate_x+this.paddle_width > 800+this.frame_thickness){
                        this.paddle_coordinate_x = 800+this.frame_thickness - this.paddle_width;
                    }

                    if(this.paddle_coordinate_x<this.frame_thickness){
                        this.paddle_coordinate_x = this.frame_thickness;
                    }

                    this.buff_sound.currentTime = 0;
                    this.buff_sound.play();
                    this.app.stage.removeChild(buff);
                    this.app.stage.removeChild(this.paddle);
                    this.buffs.splice(i,1);
                    this.create_paddle();
                };
                if(buff.y>900+this.frame_thickness){
                    this.app.stage.removeChild(buff);
                    this.buffs.splice(i,1);
                }
            }
            //столкновение
            if(this.ball.x-10<=this.frame_thickness || this.ball.x+10>=800+this.frame_thickness)
                this.vx*=-1;
            if(this.ball.y-10<=this.frame_thickness)
                this.vy*=-1;
            if((this.ball.y+10>=this.paddle.y && this.ball.y<this.paddle.y) && (this.ball.x+10>=this.paddle.x && this.ball.x-10<=this.paddle.x+this.paddle_width)){
                const paddle_center = this.paddle.x+this.paddle_width/2;
                const ball_distance = this.ball.x - paddle_center;
                this.vx = ball_distance * 0.15;

                if(this.vx > this.ball_speed - 1)
                    this.vx = this.ball_speed - 1;

                if(this.vx < -this.ball_speed + 1)
                    this.vx = -this.ball_speed + 1;

                this.vy = -Math.sqrt(
                    this.ball_speed * this.ball_speed -
                    this.vx * this.vx
                );
            }
            this.collide_blocks();

            //движение платформы
            if(this.move_left && this.paddle.x>0+this.frame_thickness)
                if(this.paddle.x-10<0+this.frame_thickness)
                    this.paddle.x=0+this.frame_thickness
                else
                    this.paddle.x -= this.paddle_speed*time.deltaTime;
            if(this.move_right && this.paddle.x+this.paddle_width<800+this.frame_thickness)
                if(this.paddle.x+this.paddle_width+this.paddle_speed>800+this.frame_thickness)
                    this.paddle.x = 800+this.frame_thickness-this.paddle_width;
                else
                    this.paddle.x += 10*time.deltaTime;

            //условие окончания игры
            if(this.ball.y > 900+this.frame_thickness){
                this.game_over = true;
                this.app.stage.removeChild(this.ball);
                this.show_game_over();
            }
            if(this.score==5500){
                this.win = true;
                this.app.stage.removeChild(this.ball);
                this.show_win();
            }
        });
    };


    async init(){
        this.app = new Application();

        await this.app.init({
            width: 1200+this.frame_thickness*2,
            height: 900+this.frame_thickness,
            background: 0x808080,
            antialias:  true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });

        document.body.appendChild(this.app.canvas);

        this.texture_buff = await Assets.load("/images/star.png");

        this.hit_sound = new Audio("/sounds/hit.wav");

        this.buff_sound = new Audio("/sounds/buff.wav");

        //фон
        await this.create_background();

        //граница
        this.create_border();

        //рамка
        await this.create_frame();

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