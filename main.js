var vector = "right";									// left | top | right | down
var pressed_key;
var tmp_x, tmp_y;
var objectValue = {
	"apple": 3,
	"body": 1,
	"none": 0,
	"border": -1,
}

$(() => {
	$("#settings-button").click(openSettings);
	$("#overlay").click(closeSettings);

	if ($(window).width() <= 450)
	{
		$("#vision-field").on("click", function (e) {
			let x = e.pageX;
			let y = e.pageY;
			$("#settings-button").css({
				"left": x - $("#settings-button").width()/2 + "px",
				"top": y - $("#settings-button").width()/2 + "px",
				"display": "flex",
			});
			$("#settings-button").trigger("click");
			tmp_x = x;
			tmp_y = y;
		});
	}

	start();
});

function start() {
	var mcanvas 	= document.getElementById("main-field");	
	var mctx 		= mcanvas.getContext('2d');
	var vcanvas 	= document.getElementById("vision-field");	
	var vctx 		= vcanvas.getContext('2d');
	
	var mode 		= "train"; 									// game | train
	var step_delay 	= 150;

	// main screen
	var cell_x 		= 30;
	var cell_y 		= 30;
	var cell_size 	= 20;
	mcanvas.width 	= cell_x*cell_size;
	mcanvas.height 	= cell_y*cell_size;

	// vision screen
	const visionR 	= 20;
	var vcell_x 	= visionR*2+1;
	var vcell_y 	= visionR*2+1;
	var vcell_size 	= 10;
	vcanvas.width 	= vcell_x*vcell_size;
	vcanvas.height 	= vcell_y*vcell_size;

	var g = new Game();
	g.createGameField(cell_y, cell_x);
	var snake = new Snake(visionR, g, cell_size);
	var apple = new Apple(cell_size, cell_x, cell_y, g);
	g.drawBarriers(mctx, cell_size);
	apple.generate();
	apple.draw(mctx);
	snake.draw(mctx);
	snake.drawVMatrix(vctx)

	drawGrid(mctx, cell_x, cell_y, cell_size);
	drawGrid(vctx, vcell_x, vcell_y, vcell_size);
	if (mode == "game")
		startGameMode();
	else if (mode == "train")
		startTrainMode();

	function startGameMode() {
		var game = true;
		$(document).on("keydown", function (e) {
			if (game)
				pressed_key = e.keyCode;
		});
	
		var gameLoop = setInterval(function () {
			if (pressed_key == 27) 
			{
				game = false;
				pressed_key = null;
				clearTimeout(gameLoop);
				console.log("Game over. Key ESC pressed.");
			}
			
			if (pressed_key == 37 && vector != "right")
				vector = "left";
			if (pressed_key == 38 && vector != "down")
				vector = "top";
			if (pressed_key == 39 && vector != "left")
				vector = "right";
			if (pressed_key == 40 && vector != "top")
				vector = "down";
			
			// check coords and step
			// Out of range
			try {
				snake.step( vector );
				if (snake.body[0][0] > cell_x-1 || snake.body[0][0] < 0)
				{
					game = false;
					pressed_key = null;
					clearTimeout(gameLoop);
					console.log("Game over. Out of range!");
				}
			} catch (error) {
				game - false;
				pressed_key = null;
				clearTimeout(gameLoop);
				console.log("Game over. Out of range!");
			}

			// Barriers
			for (let i = 0; i < g.barriers.length; i++)
			{
				if (snake.body[0][0] == g.barriers[i][0] && snake.body[0][1] == g.barriers[i][1])
				{
					game = false;
					pressed_key = null;
					clearTimeout(gameLoop);
					console.log("Game over. Barrier!");
				}
			}

			// Apple
			if (snake.body[0][0] == apple.x && snake.body[0][1] == apple.y)
			{
				apple.generate();
				snake.append();
			}

			// Bump into snake body
			for (let i = 1; i < snake.body.length; i++)
				if (snake.body[0][0] == snake.body[i][0] && snake.body[0][1] == snake.body[i][1])
				{
					game = false;
					pressed_key = null;
					clearTimeout(gameLoop);
					console.log("Game over. Your block!");
				}	

			drawScreen();
		}, step_delay);
	}

	function startTrainMode() {
		var game = true;
		$(document).on("keydown", e=>{
			let key_vector 	= ["left", "top", "right", "down"];
			if (key_vector[e.keyCode-37]) 
				vector = key_vector[e.keyCode-37];
			else return;
			
			if (game)
				game = move();
		});

		$(".direction").click(function () {
			if ($(this).attr("data-direction") != "none")
				vector = $(this).attr("data-direction");
			
			if (game) 
				game = move();
		});

		function move() {
			// check coords and step
			// Out of range
			
			try {
				snake.step( vector );
				if (snake.body[0][0] > cell_x-1 || snake.body[0][0] < 0)
				{
					console.log("Game over. Out of range!");
					return false;
				}
			} catch (error) {
				console.log("Game over. Out of range!");
				return false;
			}

			// Barriers
			for (let i = 0; i < g.barriers.length; i++)
			{
				if (snake.body[0][0] == g.barriers[i][0] && snake.body[0][1] == g.barriers[i][1])
				{
					console.log("Game over. Barrier!");
					return false;
				}
			}

			// Apple
			if (snake.body[0][0] == apple.x && snake.body[0][1] == apple.y)
			{
				apple.generate();
				snake.append();
			}

			// Bump into snake body
			for (let i = 1; i < snake.body.length; i++)
				if (snake.body[0][0] == snake.body[i][0] && snake.body[0][1] == snake.body[i][1])
				{
					console.log("Game over. Your block!");
					return false;
				}	

			drawScreen();
			new InputCalculator().calc(snake.vmatrix, [visionR, visionR]);
			return true;
		}
		
	}

	function drawScreen() {
		mctx.clearRect(0, 0, cell_x*cell_size, cell_y*cell_size);
		g.drawBarriers(mctx, cell_size);
		snake.draw(mctx);
		apple.draw(mctx);
		snake.updateVMatrix();
		g.drawBarriers(mctx, cell_size);
		snake.drawVMatrix(vctx, vcell_size);
		drawGrid(mctx, cell_x, cell_y, cell_size);
		drawGrid(vctx, vcell_x, vcell_y, vcell_size);
	}

};

function drawGrid(ctx, cell_x, cell_y, cell_size) {
	ctx.strokeStyle = "white";
	ctx.lineWidth = "1";
	for (var i = cell_size; i < cell_x*cell_size; i += cell_size)
	{
		ctx.beginPath();
		ctx.moveTo(i, 0);
		ctx.lineTo(i, cell_y*cell_size);
		ctx.stroke();
		ctx.closePath();
	}

	for (var i = cell_size; i < cell_y*cell_size; i += cell_size)
	{
		ctx.beginPath();
		ctx.moveTo(0, i);
		ctx.lineTo(cell_x*cell_size, i);
		ctx.stroke();
		ctx.closePath();
	}
}

function openSettings() {
	if ($("#settings-window").width() > 0)
		return;

	let wins_w = 600;
	let wins_h = 600;

	if ($(window).width() <= 450)
	{
		wins_w = $(window).width();
		wins_h = $(window).height();
	}

	let win_h = $(window).height();
	let win_w = $(window).width();
	
	$(this).animate({
		"top": win_h/2-$(this).height()/2+"px",
		"left": win_w/2-$(this).width()/2+"px",
	}, 300);
	$("#settings-window").animate({
		"height": wins_h + "px",
		"width": wins_w + "px",
	}, 500);
	$("#overlay").fadeIn(500);
	
	setTimeout(function () {
		$("#settings-content").fadeIn(100);
	}, 500);
}

function closeSettings() {
	let win_h = $(window).height();
	let win_w = $(window).width();
	$("#settings-content").fadeOut(100);
	setTimeout(function () {
		if ($(window).width() <= 450)
			$("#settings-button").animate({
				"top": tmp_y - $("#settings-button").height()/2 + "px",
				"left": tmp_x - $("#settings-button").width()/2 + "px",

			}, 500, function () {
				$("#settings-button").hide();
			});
		else
			$("#settings-button").animate({
				"top": "10px",
				"left": "10px",

			}, 500);
		$("#settings-window").animate({
			"height": "0px",
			"width": "0px",
		}, 300);
	}, 100);

	$("#overlay").fadeOut(500);
}

Array.prototype.unique = function() {
	return this.filter(function (value, index, self) {
		return self.indexOf(value) === index;
	});
};
