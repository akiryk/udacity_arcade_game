var froggerApp = function(){

    var player,
        allEnemies = [];

    var tileWidth = 101,
        tileHeight = 171,
        tilesPerRow = 5,
        tilesPerCol = 6;

    // Superclass Constructor is parent of Enemy and Player classes
    var Character = function(settings){
        this.height = settings.height;
        this.width = settings.width;
        this.setSprite(settings.sprite);
    };

    // Draw the character on the screen, required method for game
    Character.prototype.render = function(){
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    };

    // Set the sprite to a URL pointing to an image file
    Character.prototype.setSprite = function(spriteUrl){
        this.sprite = spriteUrl;
    };

    // Enemies our player must avoid
    var Enemy = function() {
        Character.call(this, {
            height:68,
            width:90,
            sprite:'images/enemy-bug.png'
        });

        this.setCoords();
        this.setSpeed();
    };

    Enemy.prototype = Object.create(Character.prototype);

    Enemy.prototype.constructor = Enemy;

    // Update the enemy's position, required method for game
    // Parameter: dt, a time delta between ticks
    Enemy.prototype.update = function(dt) {
        // You should multiply any movement by the dt parameter
        // which will ensure the game runs at the same speed for
        // all computers.
        this.x = this.x + this.speed * dt;
        // Check if the enemy has fallen off edge of stage
        this.checkOnStage();

        // this.checkCollision();
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
        this.x = -300 + getRandomInt(75);
        this.y = 60 + getRandomInt(3) *(tileHeight/2);
    };

    Enemy.prototype.setSpeed = function(baseline){
        baseline = baseline ? baseline : 65;
        this.speed = getRandomInt(50, baseline); // get random num from 65 to 115
    };



    // Check for collision with player (allow overlap with other enemies)
    Enemy.prototype.collidesWith = function(player){
        if (this.x + this.width > player.x && this.x < player.x + player.width){
            // columns overlap
            if (this.y + this.height > player.y && this.y < player.y + player.height) {
                // rows overlap -- we have a collision!
                return true;
            }
        }
    };

    /*
     * Player Class
     *
     */
    var Player = function(spriteUrl, x, y){
        this.sprite = spriteUrl;
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 84;
        this.isAlive = true;
        this.score = 0;
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
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
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
            //this.score++;
            //updateEnemySpeeds(this.score);
            // document.removeEventListener('keyup', keyListener);
            // this.timer = window.setTimeout( function(){
            //         window.clearTimeout(this.timer);
            //         document.addEventListener('keyup', keyListener);
            //         this.playNewGame();
            //     }.bind(this), 1000 );
            // if (allEnemies.length < 8) allEnemies.push(new Enemy());
            return true;
        }
    };

    Player.prototype.playNewGame = function(){
        this.setInitialCoords();
    };

    Player.prototype.die = function(){
        if (!this.isAlive) return;
        this.isAlive = false;
        this.score = 0;
    };

    Player.prototype.startOver = function(){
        this.setInitialCoords();
        this.isAlive = true;
    };

     // Utility function for returning a random number
    function getRandomInt(range, offset){
        offset = offset || 0;
        return Math.floor(Math.random()*range) + offset;
    }


    return {
        getPlayer: function(sprite, x, y){
            return new Player(sprite, x, y);
        },
        getEnemy: function(){
            return new Enemy();
        }
    };

};
