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
		
		game.updateGameField([[this.x, this.y]], objectValue["apple"]);
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