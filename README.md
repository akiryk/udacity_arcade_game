frontend-nanodegree-arcade-game
===============================

###How to play the game:
Either run the app from a local web server or simply open index.html in your browser without running a server. Click on a character to select it as your avatar, then use arrow keys to hop towards the water without being hit by an enemy bug. Each time you make it to the water, you gain points — but the number of bugs and their speed increases. If you touch a bug, you die and have to start over again (you'll know you died if your character starts jittering!). After you make a first score, wait for the gems to appear — each gem you collect gains you five points.

*Gems*
If you see a gem, try to get it and win 5 extra points — but you won't see any gems until you've made it past the first level. Gems appear after a random few seconds and then remain for a random few seconds, so you have to move quickly once you see one.

###The App
The app is comprised of a superclass, called Sprite, and three subclasses: Player, Enemy, and Gem. These classes are designed to know very little about the game world — they only know how to do circumscribed things such as move. Game control is handled by engine.js, which contains a function that runs the game — checking for collisions, for the collecting of gems, and for which avatar a player would like to use. In some cases, it listens to custom events dispatched by the game elements. For example, when a player hits water, the player instance fires a 'win' event which the game engine listens for.

*Sprite Class* is the parent class for players and enemies. It has height, width, and sprite URL properties, and a render method for drawing an instance to the canvas.

*Player Class* inherits from Sprite, including Sprite's size and sprite properties and the render method. In addition, Player has location (x,y) properties and a property called 'isAlive' for flagging whether it's in a 'live' state or 'dead' state. This flag is important so that the player can jitter place when killed without inducing an infinite number of new "death" events — the engine simply ignores collisions for an already-dead player. It knows the bounds of the game world, so it behaves appropropriately when told to move (for example, it won't move to the right if it's on the right edge of canvas). It doesn't know about enemies, since the game engine takes care of that.

*Enemy Class* inherits from Sprite, including Sprite's size and sprite properties and the render method. In addition, Enemy has location (x,y) and speed properties. It knows the world bounds, so instances can reset themselves when they go off canvas. They don't know about players, but simply move according to speed and direction.

*Gem Class* inherits from Sprite. It starts a lifespan of a few seconds when instantiated and it fires a 'die' event when its lifespan is over. The game engine listens for that event, and stops rendering the gem to the canvas.