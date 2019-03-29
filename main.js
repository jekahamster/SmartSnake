$(() => {
	$("#settings-button").click(openSettings);
	$("#overlay").click(closeSettings);

	var mcanvas 	= document.getElementById("main-field");
	var mctx 		= mcanvas.getContext('2d');
	var vcanvas 	= document.getElementById("vision-field");
	var vctx 		= vcanvas.getContext('2d');

	// main screen
	var cell_x 		= 60;
	var cell_y 		= 60;
	var cell_size 	= 10;
	mcanvas.width 	= cell_x*cell_size;
	mcanvas.height 	= cell_y*cell_size;

	// vision screen
	const visionR 	= 9;
	var vcell_x 	= visionR*2+1;
	var vcell_y 	= visionR*2+1;
	var vcell_size 	= 10;
	vcanvas.width 	= vcell_x*vcell_size;
	vcanvas.height 	= vcell_y*vcell_size;
	


	var g = new Game;
	g.createGameField(cell_x, cell_y);
	
	var snake = new Snake(g, cell_size);
	var apple = new Apple(cell_size, cell_x, cell_y, g);
	apple.generate();



	snake.draw(mctx);
	snake.step("right");
	snake.step("right");
	snake.step("right");
	snake.append();
	snake.step("right");

	mctx.clearRect(0, 0, cell_x*cell_size, cell_y*cell_size);
	drawGrid(mctx, cell_x, cell_y, cell_size);
	drawGrid(vctx, vcell_x, vcell_y, vcell_size);
	snake.draw(mctx);
	apple.draw(mctx);

	console.log(g.matrix);


	var gameLoop = setInterval(function () {
		console.log("Game Loop");
		clearTimeout(gameLoop);
	}, 2000);

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
		
		game.updateGameField([pair[r]], 3);
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






function Snake(game, cell_size) {
	this.name 		= null;
	this.body 		= [[3, 0], [2, 0], [1, 0], [0, 0]];
	this.size 		= this.body.length;
	this.body_color = [Math.round(Math.random() * 255), 
				  	   Math.round(Math.random() * 255),
				  	   Math.round(Math.random() * 255)];
	this.cell_size = cell_size;
	this.game = game;

	game.updateGameField(this.body, 1);

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