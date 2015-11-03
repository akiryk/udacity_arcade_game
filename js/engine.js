/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */

var Engine = function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    /* Initialize variables to hold game, player and enemy instances. */
    var game, // reference to app
        player, // a player
        gem, // a gem
        allEnemies = [], // array of enemies
        playerAvatars = [], // array of player sprites for selecting game avatar
        keyTimer,
        inAction = false, // a flag for knowing whether to check for collisions.
        gemTimer,
        score = 0;

    var message = 'Use arrow keys to hop to water!';

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developer's can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;

    canvas.width = 505;
    canvas.height = 606;
    doc.body.appendChild(canvas);

    // Style for the text message.
    ctx.font = "24px sans-serif";
    ctx.fillStyle = '#a12a04';
    ctx.textAlign = 'center';

    var spriteURLs = [
            'images/char-boy.png',
            'images/char-cat-girl.png',
            'images/char-horn-girl.png',
            'images/char-pink-girl.png',
            'images/char-princess-girl.png'
        ];

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        renderStage();
        renderEntities();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);
    }

    /* Starting a game involves the following steps:
     * Get a reference to the frogger app, then:
     * 1. Display a few sprites so that gameplayer can choose one.
     * 2. Register a listener to see which sprite is selected.
     * 3. Create a few enemies for the enemies array; don't start movement
     * 4. Render the first, static view of the stage.
     */
    function init() {
        reset();
        lastTime = Date.now();

        // Get a reference to the game app!
        game = froggerApp( {
            width: 505,
            height: 606,
            tileWidth: 101,
            tileHeight: 171
        });

        // Start checking for collisions, wins, etc.
        inAction = true;

        // Draw enemies and players to stage
        renderStage();

        //  Get an array of player avatars
        playerAvatars = getPlayerAvatars();

        // Listen for clicks on the player avatars
        ctx.canvas.addEventListener('click', avatarClickHandler);

        // Draw the avatars. This is only for the intro part, when
        // player can select a character for game play.
        renderAvatars();

        // Draw welcome message
        ctx.drawImage(Resources.get('images/start-message.png'), 0, 0);
    }

    /*
     * GAME INTRO
     * During the game intro, display a selection of avatars and listen
     * for the player/user to click on one. Once that happens, start the game.
     */

    /** Create an array of player instances */
    function getPlayerAvatars() {
        var arr = [];

        for (var i=0; i<spriteURLs.length; i++){
            arr.push(game.getPlayer(spriteURLs[i], 101 * i, 400));
        }
        return arr;
     }

    /** 
    * @description Listen for mouseclicks on player avatars 
    * @param {object} e - click event 
    */
    function avatarClickHandler(e){
        var rect = ctx.canvas.getBoundingClientRect();
        var x = e.clientX - rect.left,
            y = e.clientY - rect.top;
        if (y > 430 && y < 575 && x > 0 && x < 600) {
            var sprite;
            switch(true){
                case x < 101:
                    sprite = 0;
                    break;
                case x < 202:
                    sprite = 1;
                    break;
                case x < 303:
                    sprite = 2;
                    break;
                case x < 404:
                    sprite = 3;
                    break;
                case x < 600:
                    sprite = 4;
                    break;
            }

            // Character has been selected, so end intro and begin game!
            endIntro(sprite);
            startGame(sprite);
        }
    }

    /** 
    * @description Clear the canvas of sprites and stop listening for mouse clicks. 
    */
    function endIntro() {
        ctx.canvas.removeEventListener('click', avatarClickHandler);

        while (playerAvatars.length){
            playerAvatars[0] = null;
            playerAvatars.shift();
        }

        playerAvatars = null;
    }

    /*
     * @description Start the game once player selects an avatar
     * @param {number} spriteID - index of selected sprite in spriteURLs array.
     */
    function startGame(spriteID) {
        player = game.getPlayer(spriteURLs[spriteID], 202, 400);
        player.render();
        // Start listening to arrow keys and start main loop
        document.addEventListener('keyup', keyListener);
        // Listen for 'win' events to be dispatch by player instance
        // Note: custom listener may not be supported by legacy internet explorer!
        document.addEventListener('winEvent', handleWin);
        initEnemies();
        main();
    }

    /** Listen for key events in order to move the player sprite */
    function keyListener(e){
        var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };
        player.handleInput(allowedKeys[e.keyCode]);
    }

    /** Handle a win when player instance fires a 'winEvent' event. */
    function handleWin() {
        score+=10;
        document.removeEventListener('keyup', keyListener);
        message = 'Your score: ' + score;
        keyTimer = window.setTimeout( function(){
            window.clearTimeout(keyTimer);
            document.addEventListener('keyup', keyListener);
            startNewLevel();
        }, 1000 );
    }

    /** Start new level if player wins a round */
    function startNewLevel() {
        player.setInitialCoords();
        updateEnemySpeeds(); // increase speed
        if (allEnemies.length < 8) allEnemies.push( game.getEnemy());
        // only add gems after a player has scored
        if (score>0 && !gem){
            startGemTimer();
        }
    }

    /** Create enemies with a brief interval between each one to space them out. */
    function initEnemies(){
        var enemyTimer,
            x,
            y,
            speed;

        createEnemy();

        function createEnemy(){
            allEnemies.push( game.getEnemy() );
            if (allEnemies.length < 3){
                enemyTimer = window.setTimeout(createEnemy, 1500);
            } else {
                window.clearTimeout(enemyTimer);
            }
        }
    }

    /** Change speeds based on player's score */
    function updateEnemySpeeds(){
        allEnemies.forEach( function(enemy){
            enemy.setSpeed( 65 + (score));
        });
    }

    /** Reset enemies to the initial three at initial speed */
    function resetEnemies(){
        allEnemies.splice(3);
        updateEnemySpeeds();
    }

    /** Start a timer that will add a gem after some random amount of time. */
    function startGemTimer(delay) {
        window.clearTimeout(gemTimer);
        var pause = Resources.getRandomInt(5,delay||1)*1000;
        gemTimer = window.setTimeout(displayGem, pause);
    }

    /** Display a gem for a short period of time */
    function displayGem() {
        window.clearTimeout(gemTimer);
        // Create details for the gem
        var lifespan = Resources.getRandomInt(4,4) * 1000;
        var x = Resources.getRandomInt(5)*101;
        var y = Resources.getRandomInt(3) * 85.5 + 58;

        // Make a gem with a random location and lifespan
        gem = game.getGem('images/Gem-Blue.png', x, y, lifespan);

        // The gem instance determines when to die based on its lifespan.
        // Listen for the gemDies event and nullify the object when that happens.
        // Then start a new gem timer after a few seconds.
        document.addEventListener('gemDiesEvent', function(){
            gem = null;
            startGemTimer(3);
        });
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        updateEntities(dt);
        if (gem) checkGemCollection();
        if (inAction) checkCollisions();
    }

    function checkCollisions() {
        allEnemies.forEach(function(enemy) {
            if (enemy.collidesWith(player)){
                handleCollision();
            }
        });
    }

    /** If there is a gem on the stage, check if player is in same place */
    function checkGemCollection() {
        if (player.x == gem.x && player.y == gem.y) {
            score += 5;
            message = 'Your score: ' + score;
            gem.die();
            gem = null;
        }
    }

    /* If player collides with an enemy, reset the score to zero,
     * kill the player, reset the enemies, and pause a moment before
     * restarting play.
     */
    function handleCollision() {
        inAction = false;
        score = 0;
        message = 'Ah, too bad! Start over...';

        // kill timer so we don't display gems before it's time
        window.clearTimeout(gemTimer);

        player.die();
        resetEnemies();

        // Pause player's ability to move to indicate player is dead.
        document.removeEventListener('keyup', keyListener);

        // Restart play after brief timeout.
        keyTimer = window.setTimeout( function(){
                    document.addEventListener('keyup', keyListener);
                    inAction = true;
                    player.startOver();
                    window.clearTimeout(keyTimer);
                }, 750 );

    }

    /* This is called by the update function  and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to  the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        player.update();
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function renderStage() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/water-block.png',   // Top row is water
                'images/stone-block.png',   // Row 1 of 3 of stone
                'images/stone-block.png',   // Row 2 of 3 of stone
                'images/stone-block.png',   // Row 3 of 3 of stone
                'images/grass-block.png',   // Row 1 of 2 of grass
                'images/grass-block.png'    // Row 2 of 2 of grass
            ],
            numRows = 6,
            numCols = 5,
            row, col;

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }

    }

    /* This function is called by the render function and is called on each game
     * tick. It's purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        if (gem){
            gem.render();
        }

        // render score
        ctx.fillText(message, canvas.width/2, 40);

        player.render();

    }

    /* Render just the avatars so that player can select the one to use.
     * Enemies are not rendered at this point.
     */
    function renderAvatars() {
        playerAvatars.forEach(function(player) {
            player.render();
        });
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        // noop
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     *
     * But don't load them until all js files are ready.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png',
        'images/Gem-Blue.png',
        'images/start-message.png'
    ]);
    Resources.onReady(init);

};

/** Make sure all the game js files have loaded before starting the game */
document.onreadystatechange = function(){
    if (document.readyState == 'complete'){
        Engine(window);
    }
};