/**
* @description Encapsulates object oriented parts of Frogger game
* @param {object} worldBounds - The width and height of the canvas
* @returns {object} Key methods so that game engine can manage player and enemies.
*/
var froggerApp = function(worldBounds){

    var bounds = worldBounds;

    var playerSprites = [
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png'
    ];

    /**
    * @description Superclass, represents a sprite or character
    * @constructor
    * @param {object} settings - Width, height, and url of the sprite image.
    */
    var Sprite = function(settings){
        this.height = settings.height;
        this.width = settings.width;
        this.sprite = settings.sprite;
    };

    /** Draw the Sprite on the screen, required method for game */
    Sprite.prototype.render = function(){
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    };

    /**
    * @description Represents a gem
    * @constructor
    * @param {string} spriteUrl - url of the sprite image.
    * @param {number} x - x location on canvas
    * @param {number} y - y location on canvas
    * @param {number} lifespan - duration in milliseconds that gem will remain on canvas.
    */
    var Gem = function(spriteUrl, x, y, lifespan) {
        Sprite.call(this, {
            height: 82,
            width: 74,
            sprite: spriteUrl
        });
        this.x = x;
        this.y = y;
        this.lifespan = window.setTimeout(this.die.bind(this), lifespan);
    };

    Gem.prototype = Object.create(Sprite.prototype);

    Gem.prototype.constructor = Gem;

    /** Stop timer and alert engine that gem should vanish */
    Gem.prototype.die = function(){
        window.clearTimeout(this.lifespan);
        document.dispatchEvent(new CustomEvent("gemDiesEvent"));
    };

    /**
    * @description Represents an enemy bug, inherits from Sprite
    * @constructor
    */
    var Enemy = function() {
        Sprite.call(this, {
            height:68,
            width:90,
            sprite:'images/enemy-bug.png'
        });

        this.setCoords();

        this.baselineSpeed = 60;
        this.setSpeed();
    };

    /** Prototype chaining: make Sprite class the supertype of Enemy */
    Enemy.prototype = Object.create(Sprite.prototype);

    Enemy.prototype.constructor = Enemy;

    /** Update the enemy's position, required method for game
    * Parameter: dt, a time delta between ticks */
    Enemy.prototype.update = function(dt) {
        // Multiply any movement by the dt parameter
        // which will ensure the game runs at the same speed for
        // all computers.
        this.x = this.x + this.speed * dt;
        this.checkOnStage();
    };

    /** Check if enemy has fallen off stage and reset if necessary */
    Enemy.prototype.checkOnStage = function(){
        if (this.x > bounds.width){
            // We're offstage!
            // Update coordinates...
            this.setCoords();
            this.setSpeed();
        }
    };

    /** Place enemy on left of stage. */
    Enemy.prototype.setCoords = function(){
        this.x = -100;
        this.y = 60 + Resources.getRandomInt(3) *(bounds.tileHeight/2);
    };

    /**
    * @description Set enemy speed
    * @param {number} baseline - The minimum possible speed, which
    * increases as player's score increases.
    */
    Enemy.prototype.setSpeed = function(baseline){
        this.baselineSpeed = baseline ? baseline : this.baselineSpeed;
        this.speed = Resources.getRandomInt(50, this.baselineSpeed);
    };

    /**
    * @description Check for collision with player
    * @param {object} player - an instance of Player
    * @returns {boolean} True if there is a collision; false if not
    */
    Enemy.prototype.collidesWith = function(player){
        if (this.x + this.width > player.x && this.x < player.x + player.width){
            // columns overlap
            if (this.y + this.height > player.y && this.y < player.y + player.height) {
                // rows overlap -- we have a collision!
                return true;
            }
        }
    };

    /**
    * @description Represents a player, inherits from Sprite
    * @constructor
    * @param {string} spriteUrl URL for player image
    * @param {number} x - x coordinate
    * @param {number} y - y coordinate
    */
    var Player = function(spriteUrl, x, y){
        Sprite.call(this, {
            width: 60,
            height: 84,
            sprite: spriteUrl
        });
        this.x = x;
        this.y = y;
        this.isAlive = true;
        this.score = 0;
    };

    /** Chain prototype: Make Sprite the supertype of Player */
    Player.prototype = Object.create(Sprite.prototype);

    Player.prototype.constructor = Player;

    /** Set player location at start of game */
    Player.prototype.setInitialCoords = function(){
        this.x = 202;
        this.y = 400;
    };

    /** If player is dead, have them jitter for a moment */
    Player.prototype.update = function(){
        if (!this.isAlive){
            this.x += Resources.getRandomInt(5, -2);
            this.y += Resources.getRandomInt(5, -2);
        }
    };

    /** Engine.js calls this method on 'keyup' events to tell player to move.
    * Player will only move if doing so will keep it within canvas bounds.*/
    Player.prototype.handleInput = function(k){
        switch(k){
            case 'left':
                if (this.x >= bounds.tileWidth) this.x -= bounds.tileWidth;
                break;
            case 'right':
                if (this.x <= 3*bounds.tileWidth) this.x += bounds.tileWidth;
                break;
            case 'up':
                if (this.y >= 50) this.y -= bounds.tileHeight/2;
                if (this.y < 0) {
                    // Player reached water -- a win!
                    document.dispatchEvent(new CustomEvent("winEvent"));
                }
                break;
            case 'down':
                if (this.y <= 2*bounds.tileHeight) this.y += bounds.tileHeight/2;
                break;
        }
    };

    /** Player dies so reset score and change isAlive variable */
    Player.prototype.die = function(){
        if (!this.isAlive) return;
        this.isAlive = false; // so we can have avatar jitter in death
        this.score = 0;
    };

    /** If player dies, the instance should reset location and start over.*/
    Player.prototype.startOver = function(){
        this.setInitialCoords();
        this.isAlive = true;
    };

    /** Provide game engine access to key methods */
    return {
        getPlayer: function(s, x, y){
            return new Player(s, x, y);
        },
        getEnemy: function(){
            return new Enemy();
        },
        getGem: function(s, x, y, lifespan){
            return new Gem(s, x, y, lifespan);
        }
    };

};
