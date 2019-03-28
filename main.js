$(() => {
	$("#settings-button").click(openSettings);
	$("#overlay").click(closeSettings);

	var mcanvas 	= document.getElementById("main-field");
	var mctx 		= mcanvas.getContext('2d');
	var vcanvas 	= document.getElementById("vision-field");
	var vctx 		= vcanvas.getContext('2d');

	var cell_x 		= 60;
	var cell_y 		= 60;
	var cell_size 	= 10;
	mcanvas.width 	= cell_x*cell_size;
	mcanvas.height 	= cell_y*cell_size;

	const visionR 	= 9;
	var vcell_x 	= visionR*2+1;
	var vcell_y 	= visionR*2+1;
	var vcell_size 	= 10;
	vcanvas.width 	= vcell_x*vcell_size;
	vcanvas.height 	= vcell_y*vcell_size;

	drawGrid(mctx, cell_x, cell_y, cell_size);
	drawGrid(vctx, vcell_x, vcell_y, vcell_size);

	var gameLoop = setInterval(function () {
		console.log("Game Loop");
		clearTimeout(gameLoop);
	}, 2000);

});


function Snake() {
	this.body = [[3, 0], [2, 0], [1, 0], [0, 0]];
	this.size = this.body.length;
	this.color = [Math.round(Math.random() * 255), 
				  Math.round(Math.random() * 255),
				  Math.round(Math.random() * 255)];
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
			url: filePath,
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
				"filename": fileName,
			}),
			success: function (data)
			{
				console.log("Save map: " + data);
			} 
		});
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