;(function(){

	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	var CANVAS_WIDTH = 330, CANVAS_HEIGHT = 500;
	var play = true;

	canvas.width = CANVAS_WIDTH;
	canvas.height = CANVAS_HEIGHT;

	//unnecessary styling stuff
	canvas.style.display = 'block';
	canvas.style.margin = 'auto';

	//function for clearing the screen every loop
	var drawScreen = function(){
		ctx.fillStyle = '#0099ff';
		ctx.beginPath();
		ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		ctx.closePath();
	}

	//class for creating background
	var Bg = function(quantity){
		var circleQuantity = quantity;
		var circles = [];
		//create the circles
		var create = function(){
			for(var i = 0; i < circleQuantity; i++){
				circles.push([Math.random() * CANVAS_WIDTH, Math.random() * CANVAS_HEIGHT,  (Math.random() * 25) + 25, Math.random()/2, Math.ceil(Math.random() * 10)]);
			}
		}
		//render the circles
		var render = function(){
			for(var i = 0; i < circleQuantity; i++){
				ctx.fillStyle = 'rgba(255, 255, 255, ' + circles[i][3] + ')';
				ctx.beginPath();
				ctx.arc(circles[i][0], circles[i][1], circles[i][2], 0, Math.PI * 2);
				ctx.fill();
				ctx.closePath();
			}
		}
		//move the circles in circles array based on their random speed & check
		//if it has reached the bottom, calculate for new x position and place y position on top again
		var move = function(speed){
			for(var i = 0; i < circleQuantity; i++){
				if(circles[i][1] - circles[i][2] > CANVAS_HEIGHT){
					circles[i][0] = Math.random() * CANVAS_WIDTH;
					circles[i][2] = (Math.random() * 25) + 25;
					circles[i][1] = Math.random() * 0 - circles[i][2];
					circles[i][3] = Math.random()/2;
					circles[i][4] = speed;//Math.ceil(Math.random() * 10);
				}else{
					circles[i][1] += speed;//circles[i][4];
				}
			}
		}
		//return the public methods
		return {
			create: create,
			render: render,
			move: move
		};
	}
	
	//player constructor
	var Player = function(){
		var image = new Image();
		var loaded = false;
		var x, y;
		var currFrame = 0;
		var jumpSpeed = 0,
				fallSpeed = 0;
		var jumping = false;
		var falling = false;
		var width = 30;
		var height = 30;
		var changeFrame = 1,
				xClip;
		var points = 0;


		//sets the x and y position of the player
		var setPosition = function(newX, newY){
			x = newX;
			y = newY;
		}
		//check if image is loaded
		//if yes, set loaded to true otherwise, false
		var loadImage = function(imageSrc){
			image.src = imageSrc;
			image.onload = function(){
				loaded = true;
			}
		}
		//initializes a player's jump by setting necessary vars
		var jump = function(){
			if(!jumping && !falling){
				fallSpeed = 0;
				jumping = true;
				jumpSpeed = 15;
			}
		}
		//once jump is initialized, move the player as if jumping and decrement jumpSpeed every jump
		//once jumpSpeed is finally 0, set jumping to false and make the player start falling
		var checkJump = function(platforms){
			if(y > (CANVAS_HEIGHT-height) * 0.5){
				setPosition(x, y - jumpSpeed);
			}else{
				if(jumpSpeed > 10){
					points++;
				}
				background.move(jumpSpeed * 0.5);
				platforms.forEach(function(platform, index){
					platform.setPosition(platform.getX(), platform.getY() + jumpSpeed);
					if(platform.getY() > CANVAS_HEIGHT){
						var type = Math.round(Math.random() * 6);
						type = (type === 0)?1:0;
						platforms[index] = new Platform(Math.random() * (CANVAS_WIDTH - platform.width), platform.getY() - CANVAS_HEIGHT, type);
					}
				});
			}
			jumpSpeed--;
			if(jumpSpeed === 0){
				jumping = false;
				falling = true;
				fallSpeed = 1;
			}
		}
		//check if player which is falling has finally reached the bottom of the canvas
		//if not, continue falling faster
		var checkFall = function(){
			if(y < CANVAS_HEIGHT - height){
				setPosition(x, y + fallSpeed);
				fallSpeed++;
			}else{
				if(points === 0){
					fallStop();
				}else{
					GameOver();
				}
			}
		}
		//if player has reached the bottom, stop falling and initialize jump again
		var fallStop = function(){
			falling = false;
			fallSpeed = 0;
			jump();
		}
		//keeping track of player's points
		var getPoints = function(){
			return points;
		}
		var addPoints = function(){
			points++;
		}
		//move player left or right
		var moveLeft = function(){
			if(x > 0){
				setPosition(x - 20, y);
			}
		}
		var moveRight = function(){
			if(x + width < CANVAS_WIDTH){
				setPosition(x + 20, y);
			}
		}
		//draw the player based on the x, y position and animate the sprite
		var draw = function(){
			loadImage('pacman.png');
			if(loaded === true){
				if(currFrame === 0){
					xClip = 0;
					changeFrame = 1;
					currFrame += changeFrame;
				}else if(currFrame < 10){
					currFrame += changeFrame;
				}else if(currFrame < 20){
					xClip = 1;
					currFrame += changeFrame;
				}else if(currFrame < 30){
					xClip = 2;
					currFrame += changeFrame;
				}else if(currFrame === 30){
					changeFrame = -1;
					currFrame += changeFrame;
				}
				ctx.drawImage(image, width * xClip, 0, width, height, x, y, width, height);
			}
		}
		//getter functions
		var getWidth = function(){
			return width;
		}
		var getHeight = function(){
			return height;
		}
		var getFall = function(){
			return falling;
		}
		var getJump = function(){
			return jumping;
		}
		var getX = function(){
			return x;
		}
		var getY = function(){
			return y;
		}

		return {
			getX: getX,
			getY: getY,
			getWidth: getWidth,
			getHeight: getHeight,
			getPoints: getPoints,
			addPoints: addPoints,
			getFall: getFall,
			getJump: getJump,
			setPosition: setPosition,
			jump: jump,
			checkJump: checkJump,
			checkFall: checkFall,
			fallStop: fallStop,
			moveLeft: moveLeft,
			moveRight: moveRight,
			draw:draw
		};

	}
	//constructor for individual platforms that takes in an x, y location, type [0, 1] and width and height (for platform)
	var Platform = function(setX, setY, type, setWidth, setHeight){
		var firstColor = type === 1?'#AADD00':'#FF8C00';
		var secondColor = type === 1?'#698B22':'#EEEE00';
		var x = setX, y = setY;
		var width = setWidth || 70, height = setHeight || 20;
		var moving = Math.floor(Math.random() * 2);
		var direction = moving?-1:1;
		//function for when the player collides with the platform
		var onCollide = function(player){
			player.fallStop();
			if(type === 1){
				player.jumpSpeed = 50;
			}
		}
		var setPosition = function(newX, newY){
			x = newX;
			y = newY;
		}
		var getX = function(){
			return x;
		}
		var getY = function(){
			return y;
		}
		var getMoving = function(){
			return moving?{moving: moving, direction: direction}:false;
		}
		var setMoving = function(newDirection){
			direction = newDirection;
		}
		//drawing function for a platform
		var draw = function(){
			ctx.fillStyle = 'rgba(255, 255, 255, 1)';
			var gradient = ctx.createRadialGradient(x + (width/2), y + (height/2), 5, x + (width/2), y + (height/2), 45);
			gradient.addColorStop(0, firstColor);
			gradient.addColorStop(1, secondColor);
			ctx.fillStyle = gradient;
			ctx.beginPath();
			ctx.fillRect(x, y, width, height);
			ctx.closePath();
		}

		return {
			width: width,
			height: height,
			setPosition: setPosition,
			onCollide: onCollide,
			getX: getX,
			getY: getY,
			getMoving: getMoving,
			setMoving: setMoving,
			draw: draw
		}
	}
	//constructor that initializes the group of platforms inside the game
	var PlatformGenerator = function(){	
		var platformQuantity = 7,
			platforms = [],
			platformWidth = 70,
			platformHeight = 20;

		var create = function(){
			var position = 0,
					type;

			for(var i = 0; i < platformQuantity; i++){
				type = (Math.round(Math.random() * 6));
				type = (type === 0)?1:0;
				platforms[i] = new Platform(Math.random() * (CANVAS_WIDTH - platformWidth), position, type, platformWidth, platformHeight);
				if(position < CANVAS_HEIGHT - platformHeight){
					position += CANVAS_HEIGHT/platformQuantity
				}
			}

			return platforms;
		}

		return {
			create:create
		}

	}

	var Controls = function(){
		this.left = false;
		this.right = false;
		
		var keyDown = function(e){
			if(e.keyCode === 39){//right arrow
				this.right = true;
			}else if(e.keyCode === 37){//left arrow
				this.left = true;
			}
		}

		var keyUp = function(e){
			if(e.keyCode === 39){
				this.right = false;
			}else if(e.keyCode === 37){
				this.left = false;
			}
		}	

		return {
			left: this.left,
			right: this.right,
			keyDown: keyDown,
			keyUp: keyUp
		};
	}

	var background = new Bg(15);
	background.create();
	var player = new Player();
	player.setPosition((CANVAS_WIDTH - player.getWidth())/2, CANVAS_HEIGHT - 	player.getHeight());
	player.jump();
	var worldPlatforms = new PlatformGenerator().create();

	var controls = new Controls;
	window.addEventListener('keydown', function(e){
		controls.keyDown(e);//function to check which key is being pressed
		if(controls.left){
			player.moveLeft();
		}else if(controls.right){
			player.moveRight();
		}
	});
	window.addEventListener('keyup', function(e){
		controls.keyUp(e);//function to check which key is up
	});

	function ShowScore(player){
		ctx.fillStyle = 'rgba(0, 0, 0, 1)';
		ctx.fillText("POINTS: " + player.getPoints(), 5, 5);
	}

	function GameOver(){
		play = false;
	}

	function GameLoop(){
		drawScreen();
		background.render();
		worldPlatforms.forEach(function(platform, index){
			//check if platform can move and in which direction
			var isMoving = platform.getMoving();
			if(isMoving){
				if(platform.getX() <= 0){
					platform.setMoving(1);
				}else if(platform.getX() >= CANVAS_WIDTH -	platform.width){
					platform.setMoving(-1);
				}
				platform.setPosition(platform.getX() + (isMoving.direction * (index + 1)) * (player.getPoints()/100), platform.getY());
			}

			//draw each platform
			platform.draw();

			//check for collision
			if(player.getFall() &&
				player.getX() < platform.getX() + platform.width &&
				player.getX() + player.getWidth() > platform.getX() &&
				player.getY() + player.getHeight() > platform.getY() &&
				player.getY() + player.getHeight() < platform.getY() + platform.height
			){
				platform.onCollide(player);
			}

		});
		if(player.getJump()){
			player.checkJump(worldPlatforms);
		}else if(player.getFall()){
			player.checkFall();
		}
		player.draw();
		ctx.fillStyle = '#000';
		ctx.font = '12px Verdana';
		ctx.fillText(player.getPoints() + ' Pts.', CANVAS_WIDTH - 50, CANVAS_HEIGHT - 20, 50);
		if(play){
			var gameLoop = setTimeout(GameLoop, 1000/50);
		}else{
			ctx.fillStyle = '#000';
			ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
			ctx.fillStyle = '#fff';
			ctx.font = '30px Verdana';
			ctx.fillText('Game Over', (CANVAS_WIDTH - 100)/2, CANVAS_HEIGHT/2, 100);
			ctx.font = '20px Verdana';
			ctx.fillText(player.getPoints() + ' Pts.', (CANVAS_WIDTH - 60)/2, (CANVAS_HEIGHT + 50)/2, 60);
		}
	}

	GameLoop();
}());
