var vector 			= "right";
var pressed_key;

$(() => {
	$("#settings-button").click(openSettings);
	$("#overlay").click(closeSettings);
	start();
});

function start() {
	var mcanvas 	= document.getElementById("main-field");
	var mctx 		= mcanvas.getContext('2d');
	var vcanvas 	= document.getElementById("vision-field");
	var vctx 		= vcanvas.getContext('2d');
	
	var mode 		= "game";
	// main screen
	var cell_x 		= 30;
	var cell_y 		= 30;
	var cell_size 	= 20;
	mcanvas.width 	= cell_x*cell_size;
	mcanvas.height 	= cell_y*cell_size;

	// vision screen
	const visionR 	= 9;
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

	$(".direction").click(function () {
		if ($(this).attr("data-direction") != "none")
			vector = $(this).attr("data-direction");
		mctx.clearRect(0, 0, cell_x*cell_size, cell_y*cell_size);
		g.drawBarriers(mctx, cell_size);
		snake.step( vector );
		snake.draw(mctx);
		apple.draw(mctx);
		snake.updateVMatrix();
		snake.drawVMatrix(vctx, vcell_size);
		drawGrid(mctx, cell_x, cell_y, cell_size);
		drawGrid(vctx, vcell_x, vcell_y, vcell_size);
	});

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
			//Out of range
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
		}, 100);
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

	let win_h = $(window).height();
	let win_w = $(window).width();
	$(this).animate({
		"top": win_h/2-$(this).height()/2+"px",
		"left": win_w/2-$(this).width()/2+"px",
	}, 300);
	$("#settings-window").animate({
		"height": "600px",
		"width": "600px",
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
