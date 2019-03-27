$(() => {
	$("#settings-button").click(openSettings);
	$("#overlay").click(closeSettings);

	var canvas = document.getElementById("main-field");
	var ctx = canvas.getContext('2d');
	
});


function Snake() {
	this.body = [[3, 0], [2, 0], [1, 0], [0, 0]];
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