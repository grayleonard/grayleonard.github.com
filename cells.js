function Cells(ele) {
	this.ele = ele
	this.ctx = this.ele.getContext('2d')
	this.cells = {}
	this.cellSize = 80
	this.drawpat = this.ctx.createPattern(patimg, 'repeat')
	this.patterns = [
		[".0.",
		"..0",
		"000"],
		["000",
		"0..",
		".0."]
	];
	document.addEventListener('click', this.onClick.bind(this));
	this.init()
	return this
}

Cells.prototype = {
	init: function() {
		this.setSize()
		this.seed()
	},
	key2coords: function(key) {
		var split = key.split("-");
		return [parseInt(split[0], 10), parseInt(split[1], 10)];
	},
	coords2key: function(x, y) {
		return x + '-' + y
	},
	onClick: function(e) {
		console.log(this)
		console.log(e)
		this.placePattern(
			Math.floor(e.clientX/this.cellSize),
			Math.floor(e.clientY/this.cellSize
				  )
		);
	},
	setSize: function() {
		this.width = document.body.clientWidth
		this.height = document.body.clientHeight
		this.ctx.canvas.width = this.width
		this.ctx.canvas.height = this.height
		for(var i = 0; i < this.width / this.cellSize; i++) {
			for(var j = 0; j < this.height / this.cellSize; j++) {
				this.cells[i+'-'+j] = { x: i, y: j, type: 0, color: '#f5f5f5' }
			}
		}
	},
	seed: function() {
		var self = this
		this.placeRandom(1)
	},
	draw: function() {
		var self = this
		var keys = Object.keys(self.cells)
		keys.forEach(function(k) {
			if(self.cells[k].type == 1)
				self.ctx.fillStyle = '#2a2a2a'//self.cells[k].color
			if(self.cells[k].type == 0)
				self.ctx.fillStyle = 'black'//self.cells[k].color
			self.ctx.fillRect(self.cells[k].x * self.cellSize, self.cells[k].y * self.cellSize, self.cellSize, self.cellSize)
		})
	},
	getRandom: function(min, max) {
		return min + Math.floor(Math.random() * (max - min + 1));
	},
	placeRandom: function(num) {
		var self = this
		var num = num || 5
		for(var i = 0; i < num; i++) {
			var rx = this.getRandom(0, (this.width / this.cellSize) - 1)
			var ry = this.getRandom(0, (this.height / this.cellSize) - 1)
			self.placePattern(rx, ry)
		}
	},
	placePattern: function(rx, ry) {
		console.log(rx, ry)
		var self = this
		var pattern = self.patterns[self.getRandom(0, self.patterns.length - 1)]
		pattern.map(function (line, i) {
			for (var j = 0; j < line.length; j++) {
				var alive = line[j] !== ".";
				var x = rx + j, y = ry + i;
				if (alive) {
					self.createCell(x+'-'+y);
				}
			}
		});

	},
	step: function () {
		//this.setSize();

		var neighbourCounts = {}, k, self = this;

		var countNeighbours = function (key) {
			var neighbourKey;
			var coords = self.key2coords(key);
			for (var x = -1; x <= 1; x++) {
				for (var y = -1; y <= 1; y++) {
					neighbourKey = self.coords2key(x + coords[0], y + coords[1]);
					if(neighbourKey in self.cells && self.cells[neighbourKey].type == 1) {
						neighbourCounts[key] = neighbourCounts[key] || 0;
						if (x === 0 && y === 0) continue;
						neighbourCounts[key]++
					}
				}
			}
		};

		// Count neighbours
		for (k in this.cells) {
			countNeighbours(k);
		}

		var birthsAndDeaths = function (key) {
			var count = neighbourCounts[key];
			var coords = self.key2coords(key);
			if (count < 2 || count > 3) {
				self.killCell(key)
			} else if (count === 3) {
				self.createCell(key)
			}
		};

		// Births and deaths
		for (k in neighbourCounts) {
			birthsAndDeaths(k);
		}
		self.draw()

	},
	killCell: function(c) {
		if(c in this.cells) {
			this.cells[c].type = 0
			this.cells[c].color = 'black'
		}
	},
	createCell: function(c) {
		if(c in this.cells) {
			this.cells[c].type = 1
			this.cells[c].color = '#e5e5e5'
		}
	}
}

var patimg = new Image()
patimg.onload = function() {
	window.Cells = Cells
	window.cells = new window.Cells(document.querySelector('#automata'))
	setInterval(function() {
		window.cells.step()
	}, 185)
	setInterval(function() {
		window.cells.placeRandom(1)
	}, 700)
}

patimg.src = 'pattern.png'
