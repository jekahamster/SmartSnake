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

	game.updateGameField(this.body, objectValue["body"]);

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
					this.vmatrix[i][j] = objectValue["border"];
		}
		// right bound
		if (this.body[0][0] - this.visionR < 0)
		{
			let empty_left = this.visionR - this.body[0][0];
			vx_top += empty_left;
			mx_top += empty_left;
			for (let i = 0; i < this.visionR*2+1; i++)
				for (let j = 0; j < empty_left; j++)
					this.vmatrix[i][j] = objectValue["border"];
		}
		// bottom bound
		if (this.body[0][1] + this.visionR > this.game.matrix.length-1)
		{
			let empty_bottom = this.visionR + this.body[0][1]+1 - this.game.matrix.length;
			vy_bottom -= empty_bottom;
			my_bottom -= empty_bottom;
			for (let i = 0; i < empty_bottom; i++)
				for (let j = 0; j < this.visionR*2+1; j++)
					this.vmatrix[this.visionR*2+1-i-1][j] = objectValue["border"];
		}
		// left bound 
		if (this.body[0][0] + this.visionR > this.game.matrix[0].length-1)
		{
			let empty_right = this.visionR + this.body[0][0]+1 - this.game.matrix[0].length;
			vx_bottom -= empty_right;
			mx_bottom -= empty_right;
			for (let i = 0; i < this.visionR*2+1; i++)
				for (let j = 0; j < empty_right; j++)
					this.vmatrix[i][this.visionR*2+1-j-1] = objectValue["border"];
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
		this.game.updateGameField([this.body[this.size-1]], objectValue["none"]);
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
		this.game.updateGameField(this.body, objectValue["body"]);
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
			url: "../modules/saveJSON.php",
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