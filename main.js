var vector 			= "right";
var pressed_key;

$(() => {
	$("#settings-button").click(openSettings);
	$("#overlay").click(closeSettings);

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
		$(document).on("keydown", function (e) {
			pressed_key = e.keyCode;
		});
	
		var gameLoop = setInterval(function () {
			if (pressed_key == 27) 
				clearTimeout(gameLoop);
			
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
					clearTimeout(gameLoop);
					console.log("Game over. Out of range!");
				}
			} catch (error) {
				clearTimeout(gameLoop);
				console.log("Game over. Out of range!");
			}

			// Barriers
			for (let i = 0; i < g.barriers.length; i++)
			{
				if (snake.body[0][0] == g.barriers[i][0] && snake.body[0][1] == g.barriers[i][1])
				{
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

});

function Apple(size, cell_x, cell_y, game) {
	this.size 	= size;
	this.cell_x = cell_x;
	this.cell_y = cell_y;
	this.color 	= [255, 0, 0];
	this.game = game;

	this.generate = function () {
		let pair = [];
		for (let i = 0; i < this.game.matrix.length; i++) {
			for (let j = 0; j < this.game.matrix[0].length; j++) {
				if (this.game.matrix[i][j] == 0)
					pair[pair.length] = [i, j];
			}
		}

		let r = Math.round(Math.random() * pair.length);
		this.x = pair[r][1];
		this.y = pair[r][0];
		
		game.updateGameField([[this.x, this.y]], 3);
	}

	this.draw = function (ctx) {
		ctx.fillStyle = "rgb("+
				this.color[0]+", "+
				this.color[1]+", "+
				this.color[2]+")";
		ctx.fillRect(this.x*this.size, 
					 this.y*this.size, 
					 this.size, 
					 this.size);
	}
}

function Snake(visionR, game, cell_size) {
	this.name 		= null;
	this.body 		= [[3, 0], [2, 0], [1, 0], [0, 0]];
	this.size 		= this.body.length;
	this.body_color = [Math.round(Math.random() * 255), 
				  	   Math.round(Math.random() * 255),
				  	   Math.round(Math.random() * 255)];
	this.cell_size 	= cell_size;
	this.game 		= game;
	this.visionR 	= visionR
	this.vmatrix 	= new Array(visionR*2+1);
	
	for (let i = 0; i < visionR*2+1; i++)
		this.vmatrix[i] = new Array(visionR*2+1);

	for (let i = 0; i < visionR*2+1; i++)
		for (let j = 0; j < visionR*2+1; j++)
			this.vmatrix[i][j] = 0;

	game.updateGameField(this.body, 1);

	this.updateVMatrix = function () {

		var vx_top 		= 0;
		var vy_top 		= 0;
		var vx_bottom 	= this.visionR*2;
		var vy_bottom 	= this.visionR*2;

		var mx_top 		= this.body[0][0] - visionR;
		var my_top 		= this.body[0][1] - visionR;
		var mx_bottom 	= this.body[0][0] + visionR;
		var my_bottom 	= this.body[0][1] + visionR;

		// top bound
		if (this.body[0][1] - this.visionR < 0)
		{
			let empty_top = this.visionR - this.body[0][1];
			vy_top += empty_top;
			my_top += empty_top;
			for (let i = 0; i < empty_top; i++)
				for (let j = 0; j < this.visionR*2+1; j++)
					this.vmatrix[i][j] = -1;
		}
		// right bound
		if (this.body[0][0] - this.visionR < 0)
		{
			let empty_left = this.visionR - this.body[0][0];
			vx_top += empty_left;
			mx_top += empty_left;
			for (let i = 0; i < this.visionR*2+1; i++)
				for (let j = 0; j < empty_left; j++)
					this.vmatrix[i][j] = -1;
		}
		// bottom bound
		if (this.body[0][1] + this.visionR > this.game.matrix.length-1)
		{
			let empty_bottom = this.visionR + this.body[0][1]+1 - this.game.matrix.length;
			vy_bottom -= empty_bottom;
			my_bottom -= empty_bottom;
			for (let i = 0; i < empty_bottom; i++)
				for (let j = 0; j < this.visionR*2+1; j++)
					this.vmatrix[this.visionR*2+1-i-1][j] = -1;
		}
		// left bound 
		if (this.body[0][0] + this.visionR > this.game.matrix[0].length-1)
		{
			let empty_right = this.visionR + this.body[0][0]+1 - this.game.matrix[0].length;
			vx_bottom -= empty_right;
			mx_bottom -= empty_right;
			for (let i = 0; i < this.visionR*2+1; i++)
				for (let j = 0; j < empty_right; j++)
					this.vmatrix[i][this.visionR*2+1-j-1] = -1;
		}

		for (let vi = vy_top, mi = my_top; vi <= vy_bottom; vi++, mi++)
			for (let vj = vx_top, mj = mx_top; vj <= vx_bottom; vj++, mj++)
					this.vmatrix[vi][vj] = this.game.matrix[mi][mj];
	}


	this.drawVMatrix = function (ctx, cell_size) {
		let colors = {
			"-1": 	"blue",
			"0": 	"white",
			"1": 	"green",
			"2": 	"yellow",
			"3": 	"red",
		}
		for (let i = 0; i < this.vmatrix.length; i++)
			for (let j = 0; j < this.vmatrix[i].length; j++)
			{
				ctx.fillStyle = colors[this.vmatrix[i][j]];
				ctx.fillRect(j*cell_size, i*cell_size, cell_size, cell_size);
			}
		
	}

	this.draw = function (ctx) {
		ctx.fillStyle = "rgb("+
				this.body_color[0]+", "+
				this.body_color[1]+", "+
				this.body_color[2]+")";
		for (var i = 0; i < this.size; i++)
		{
			ctx.fillRect(this.body[i][0]*this.cell_size, 
						this.body[i][1]*this.cell_size, 
						this.cell_size, 
						this.cell_size);
		}
	}

	this.step = function (vector) {
		this.game.updateGameField([this.body[this.size-1]], 0);
		this.body.splice(this.size-1, 1);
		if (vector == "right")
		{
			this.body.splice(0, 0, [this.body[0][0]+1, this.body[0][1]])
		}
		
		else if (vector == "left")
		{
			this.body.splice(0, 0, [this.body[0][0]-1, this.body[0][1]])
		}
		
		else if (vector == "top")
		{
			this.body.splice(0, 0, [this.body[0][0], this.body[0][1]-1])	
		}
		
		else if (vector == "down")
		{
			this.body.splice(0, 0, [this.body[0][0], this.body[0][1]+1])
		}
		this.game.updateGameField(this.body, 1);
	}

	this.append = function () {
		this.body[this.size] = this.body[this.body.length-1];
		this.size++;
	}

	this.load = function (filePath) {
		let json;
		$.ajax({
			type: "GET",
			url: "units/"+filePath,
			dataType: "json",
			async: false,
			success: function(data) {json = data}
		});

		this.name 		= json.name;
		this.body 		= json.body;
		this.size 		= json.size;
		this.body_color	= json.body_color;
	}

	this.save = function (fileName)	{
		let json = {
			"name": this.name,
			"body": this.body,
			"size": this.size,
			"body_color": this.body_color
		}

		json = JSON.stringify(json);
		$.ajax({
			url: "saveJSON.php",
			type: "POST",
			data: ({
				"json": json,
				"filename": "units/"+fileName,
			}),
			success: function (data)
			{
				console.log("Save unit: " + data);
			} 
		});
	}
}

function Game() {
	this.matrix;
	this.barriers = [];

	this.createGameField = function (n, m) {
		this.matrix = new Array(n);
		for (let i = 0; i < n; i++)
		{
			this.matrix[i] = new Array(m);
			for (let j = 0; j < m; j++)
				this.matrix[i][j] = 0; 
		}
	}

	this.loadGameField = function (filePath) {
		let json;
		$.ajax({
			type: "GET",
			url: "maps/"+filePath,
			dataType: "json",
			async: false,
			success: function(data) {json = data}
		});
		
		let inlineField = json.gameField;
		let n = json.rows;
		let m = json.columns;
		this.matrix = new Array(n);
		for (let i = 0; i < n; i++)
			this.matrix[i] = inlineField.splice(0, m);
		this.findBarriers();
	}

	this.saveGameField = function (fileName) {
		if (!this.matrix)
		{
			alert("Error. Field not found.");
			return;
		}

		let json = {
			"gameField": [],
			"rows": this.matrix.length,
			"columns": this.matrix[0].length,
		};

		for (let i = 0; i < json["rows"]; i++)
			json["gameField"] = json["gameField"].concat(this.matrix[i]);

		json = JSON.stringify(json);

		$.ajax({
			url: "saveJSON.php",
			type: "POST",
			data: ({
				"json": json,
				"filename": "maps/"+fileName,
			}),
			success: function (data)
			{
				console.log("Save map: " + data);
			} 
		});
	}

	this.updateGameField = function (coords, val) {
		// coords must be pairs array [[1, 2], [3, 4]]
		for (let i = 0; i < coords.length; i++)
		{
			this.matrix[coords[i][1]][coords[i][0]] = val; 
		}
	}

	this.findBarriers = function () {
		for (let i = 0; i < this.matrix.length; i++)
			for (let j = 0; j < this.matrix[0].length; j++)
			{
				if (this.matrix[i][j] == -1)
					this.barriers[this.barriers.length] = [j, i];
			}
	}

	this.drawBarriers = function (ctx, cell_size) {
		for (let i = 0; i < this.barriers.length; i++)
		{
			ctx.fillStyle = "blue";
			ctx.fillRect(this.barriers[i][0]*cell_size, this.barriers[i][1]*cell_size, cell_size, cell_size);
		}

	}
}

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

function count(arr, x) {
	var c = 0;
	for (let i = 0; i < arr.length; i++)
		if (arr[i] == x)
			c++;
	return c;
}

Array.prototype.unique = function() {
	return this.filter(function (value, index, self) {
		return self.indexOf(value) === index;
	});
};
