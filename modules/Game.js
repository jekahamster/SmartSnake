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
			url: "../maps/"+filePath,
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
			url: "../modules/saveJSON.php",
			type: "POST",
			data: ({
				"json": json,
				"filename": "../maps/"+fileName,
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
				if (this.matrix[i][j] == objectValue["border"])
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