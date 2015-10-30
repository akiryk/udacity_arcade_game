var app = function(){

    var player,
        allEnemies = [];

    var tileWidth = 101,
        tileHeight = 171,
        tilesPerRow = 5,
        tilesPerCol = 6;

    // Enemies our player must avoid
    var Enemy = function() {
        // Variables applied to each of our instances go here,
        // we've provided one for you to get started

        // The image/sprite for our enemies, this uses
        // a helper we've provided to easily load images
        this.sprite = 'images/enemy-bug.png';
        this.setCoords();
        this.setSpeed();
        this.width = 90;
        this.height = 68;
    };

    // Update the enemy's position, required method for game
    // Parameter: dt, a time delta between ticks
    Enemy.prototype.update = function(dt) {
        // You should multiply any movement by the dt parameter
        // which will ensure the game runs at the same speed for
        // all computers.
        this.x = this.x + this.speed * dt;
        // Check if the enemy has fallen off edge of stage
        this.checkOnStage();

        this.checkCollision();
    };

    Enemy.prototype.checkOnStage = function(){
        if (this.x > tilesPerRow * tileWidth){
            // We're offstage!
            // Update coordinates...
            this.setCoords();
            this.setSpeed();
        }
    };

    Enemy.prototype.setCoords = function(){
        this.x = -100;
        this.y = 60 + getRandomInt(3) *(tileHeight/2);
    };

    Enemy.prototype.setSpeed = function(baseline){
        baseline = baseline ? baseline : 65;
        this.speed = getRandomInt(50, baseline); // get random num from 65 to 115
    };

    // Draw the enemy on the screen, required method for game
    Enemy.prototype.render = function() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    };

    // Check for collision with player (allow overlap with other enemies)
    Enemy.prototype.checkCollision = function(){

        if (this.x + this.width > player.x && this.x < player.x + player.width){
            // columns overlap
            if (this.y + this.height > player.y && this.y < player.y + player.height) {
                // rows overlap -- we have a collision!
                player.die();
            }
        }
    };

    /*
     * Player Class
     *
     */
    var Player = function(){
        this.sprites = [
            'images/char-boy.png',
            'images/char-cat-girl.png',
            'images/char-horn-girl.png',
            'images/char-pink-girl.png',
            'images/char-princess-girl.png'
        ];
        this.score = 0;
    };

    Player.prototype.selectSprite = function(i){
        this.sprite = this.sprites[i];
        this.setInitialCoords();
        this.width = 60;
        this.height = 84;
        this.isAlive = true;
    };

    Player.prototype.setInitialCoords = function(){
        this.x = 202;
        this.y = 400;
    };

    Player.prototype.update = function(){
        // If player is dead, have them jitter for a moment...
        if (!this.isAlive){
            this.x += getRandomInt(5, -2);
            this.y += getRandomInt(5, -2);
        }
    };

    Player.prototype.render = function(){
        if (this.sprite){
            // just one sprite, so draw it.
            ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
            if (this.score){
                ctx.font = "24px sans-serif";
                ctx.fillStyle = '#a12a04';
                ctx.fillText("Your Score: " + this.score, 0, 40);
            }
        } else {
            // multiple sprites, so present them for selection
            for (var i=0; i<this.sprites.length; i++){
                ctx.drawImage(Resources.get(this.sprites[i]), tileWidth * i, 400);
            }
            // Draw welcome message
            ctx.drawImage(Resources.get('images/start-message.png'), 0, 0);
        }
    };

    Player.prototype.handleInput = function(k){
        switch(k){
            case 'left':
                if (this.x >= tileWidth) this.x -= tileWidth;
                break;
            case 'right':
                if (this.x <= 3*tileWidth) this.x += tileWidth;
                break;
            case 'up':
                if (this.y >= 60) this.y -= 85;
                // We only need to check for win if player moves up:
                this.checkWin();
                break;
            case 'down':
                if (this.y <= 315) this.y += 85;
                break;
        }
    };

    Player.prototype.checkWin = function(){
        if (this.y < 0) {
            // We made it to water!
            this.score++;
            updateEnemySpeeds(this.score);
            document.removeEventListener('keyup', keyListener);
            this.timer = window.setTimeout( function(){
                    window.clearTimeout(this.timer);
                    document.addEventListener('keyup', keyListener);
                    this.playNewGame();
                }.bind(this), 1000 );
            if (allEnemies.length < 8) allEnemies.push(new Enemy());
        }
    };

    Player.prototype.playNewGame = function(){
        this.setInitialCoords();
    };

    Player.prototype.die = function(){
        if (!this.isAlive) return;
        this.isAlive = false;
        this.score = 0;
        resetEnemies();
        document.removeEventListener('keyup', keyListener);
        this.timer = window.setTimeout( function(){
            this.startOver();
        }.bind(this), 750 );
    };

    Player.prototype.startOver = function(){
        window.clearTimeout(this.timer);
        this.setInitialCoords();
        this.isAlive = true;
        document.addEventListener('keyup', keyListener);
    };

    // Create enemies with a brief interval between each one to space them out.
    function initEnemies(){
        var timer;
        createEnemy();
        function createEnemy(){
            allEnemies.push(new Enemy());
            if (allEnemies.length < 3){
                timer = window.setTimeout(createEnemy, 1500);
            } else {
                window.clearTimeout(timer);
            }
        }
    }

    function resetEnemies(){
        // reset enemies to the initial three
        allEnemies.splice(3);
        // reset each enemy's speed
        for (var i=0; i<3; i++){
            allEnemies[i].setSpeed();
        }
    }

    // Utility function for returning a random number
    function getRandomInt(range, offset){
        offset = offset || 0;
        return Math.floor(Math.random()*range) + offset;
    }

    function keyListener(e){
        var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };

        player.handleInput(allowedKeys[e.keyCode]);
    }

    function startGame(i){
        document.addEventListener('keyup', keyListener);
        ctx.canvas.removeEventListener('click', spriteClickHandler);
        player.selectSprite(i);
        initEnemies();
    }

    function updateEnemySpeeds(score){
        for (var i=0; i<allEnemies.length; i++){
            allEnemies[i].setSpeed( 65 + (score * 10));
        }
    }

    function spriteClickHandler(e){
        var rect = ctx.canvas.getBoundingClientRect();
        var x = e.clientX - rect.left,
            y = e.clientY - rect.top;
        if (y > 430 && y < 575) {
            switch(true){
                case x < 101:
                    startGame(0);
                    break;
                case x < 202:
                    startGame(1);
                    break;
                case x < 303:
                    startGame(2);
                    break;
                case x < 404:
                    startGame(3);
                    break;
                case x < 600:
                    startGame(4);
                    break;
            }
        }
    }

    return {
        init: function(){
            player = new Player();
            ctx.canvas.addEventListener('click', spriteClickHandler);
            return player;
        },
        allEnemies: allEnemies
    };

};
