var canvas  = document.getElementById('main-field');
var ctx     = canvas.getContext('2d');

var cell_x 		= 30;
var cell_y 		= 30;
var cell_size 	= 20;
canvas.width 	= cell_x*cell_size;
canvas.height 	= cell_y*cell_size;

var g = new Game();

$(() => {
    g.createGameField(cell_y, cell_x);
    drawGrid(ctx, cell_x, cell_y, cell_size);
});

$("#main-field").click(function (e) {
    let x = (e.offsetX == undefined) ? e.layerX : e.offsetX;
    let y = (e.offsetY == undefined) ? e.layerY : e.offsetY;
    x = Math.ceil(x / cell_size) - 1;
    y = Math.ceil(y / cell_size) - 1;

    if (g.matrix[y][x] != -1)
    {
        g.matrix[y][x] = -1;
    }
    else
    {
        g.matrix[y][x] = 0; 
    }
    draw();
});

$("#save").click(function () {
    g.saveGameField($("#save-inp").val().trim());
});

$("#load").click(function () {
    g.loadGameField($("#load-inp").val().trim());
    cell_y = g.matrix.length;
    cell_x = g.matrix[0].length;
    canvas.width 	= cell_x*cell_size;
    canvas.height 	= cell_y*cell_size;
    draw();
});

$("#back").click(function () {
    location = "../";
});

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

function draw() {
    ctx.clearRect(0, 0, cell_x*cell_size, cell_y*cell_size);
    for (let i = 0; i < g.matrix.length; i++)
        for (let j = 0; j < g.matrix[i].length; j++)
        {
            if (g.matrix[i][j] == -1)
            {
                ctx.fillStyle = "white";
                ctx.fillRect(j*cell_size, i*cell_size, cell_size, cell_size);
            }
            else 
            {
                ctx.fillStyle = "black";
                ctx.fillRect(j*cell_size, i*cell_size, cell_size, cell_size);
            }
        }
    drawGrid(ctx, cell_x, cell_y, cell_size);
}