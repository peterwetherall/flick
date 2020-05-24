let flick = {};
flick.colours = ["red", "green", "yellow", "blue", "purple", "pink", "orange", "brown"];
flick.colour = flick.colours[Math.floor(Math.random() * flick.colours.length)];
flick.canvas = document.getElementsByTagName("canvas")[0];
flick.canvas.width = window.innerWidth;
flick.canvas.height = window.innerHeight;
flick.refresh = 25;
flick.collision = 0.8;
flick.centre = {
	x: Math.round(flick.canvas.width / 2),
	y: Math.round(flick.canvas.height / 2)
};
flick.ballRadius = 25;
flick.ctx = flick.canvas.getContext("2d");
window.addEventListener("resize", () => {
	location.reload();
});
//Ball class
class Ball {
	constructor (x, y, vx, vy, col) {
		this.pos = {
			x: x,
			y: y
		};
		this.vel = {
			x: vx,
			y: vy
		};
		this.colour = col;
	}
	draw () {
		//Draw ball
		flick.ctx.beginPath();
		flick.ctx.arc(this.pos.x, this.pos.y, flick.ballRadius, 0, Math.PI * 2);
		flick.ctx.fillStyle = this.colour;
		flick.ctx.fill();
		//Move ball
		this.pos.x += this.vel.x;
		this.pos.y += this.vel.y;
		//Wall collision
		if (this.pos.x - flick.ballRadius < 0) {
			this.pos.x = flick.ballRadius;
			this.vel.x = -this.vel.x * flick.collision;
		}
		if (this.pos.y - flick.ballRadius < 0) {
			this.pos.y = flick.ballRadius;
			this.vel.y = -this.vel.y * flick.collision;
		}
		if (this.pos.x + flick.ballRadius > flick.canvas.width) {
			this.pos.x = flick.canvas.width - flick.ballRadius;
			this.vel.x = -this.vel.x * flick.collision;
		}
		if (this.pos.y + flick.ballRadius > flick.canvas.height) {
			this.pos.y = flick.canvas.height - flick.ballRadius;
			this.vel.y = -this.vel.y * flick.collision;
		}
		//Other ball collision
		for (let otherBall of flick.balls) {
			if (otherBall !== this) {
				let dist = Math.sqrt(Math.pow(this.pos.x - otherBall.pos.x, 2) + Math.pow(this.pos.y - otherBall.pos.y, 2));
				if (dist < 50) {
					let change = (50 - dist) / 2;
					let angle = Math.asin((this.pos.x - otherBall.pos.x) / dist);
					this.pos.x += change * Math.sin(angle);
					this.pos.y += change * Math.cos(angle);
					otherBall.pos.x -= change * Math.sin(angle);
					otherBall.pos.y -= change * Math.cos(angle);
				}
			}
		}
	}
}
flick.balls = [];
//On mouse down
flick.movements = [];
flick.moving = false;
window.addEventListener("mousedown", (e) => {
	if (Math.sqrt(Math.pow(flick.centre.x - e.clientX, 2) + Math.pow(flick.centre.y - e.clientY, 2)) < flick.ballRadius && flick.refresh === 0) {
		flick.moving = true;
		flick.movements.push([e.clientX, e.clientY]);
	}
});
//On mouse move
window.addEventListener("mousemove", (e) => {
	if (flick.moving) {
		if (Math.sqrt(Math.pow(flick.centre.x - e.clientX, 2) + Math.pow(flick.centre.y - e.clientY, 2)) < flick.ballRadius) {
			flick.movements.push([e.clientX, e.clientY]);
		} else {
			shoot(e);
		}
	}
});
//On mouse leaving circle
let shoot = (e) => {
	if (flick.moving) {
		flick.moving = false;
		let i = 1;
		let vx, vy;
		do {
			vx = e.clientX - flick.movements[flick.movements.length - i][0];
			vy = e.clientY - flick.movements[flick.movements.length - i][1];
			i++;
		} while (vx === 0 && vy === 0 && i <= flick.movements.length);
		flick.balls.push(new Ball(e.clientX, e.clientY, vx, vy, flick.colour));
		let previousColour = flick.colour;
		do {
			flick.colour = flick.colours[Math.floor(Math.random() * flick.colours.length)];
		} while (flick.colour === previousColour);
		flick.movements = [];
		flick.refresh = 25;
	}
};
//On mouse up before leaving the circle
window.addEventListener("mouseup", (e) => {
	if (flick.moving) {
		flick.moving = false;
		flick.movements = [];
	}
});
//Animation loop
let iv = () => {
	//Clear screen
	flick.ctx.clearRect(0, 0, flick.canvas.width, flick.canvas.height);
	//Draw on temporary ball if required
	if (flick.movements.length > 0) {
		flick.ctx.beginPath();
		flick.ctx.arc(flick.movements[flick.movements.length - 1][0], flick.movements[flick.movements.length - 1][1], flick.ballRadius, 0, Math.PI * 2);
		flick.ctx.fillStyle = flick.colour;
		flick.ctx.fill();
	} else {
		flick.ctx.beginPath();
		flick.ctx.arc(flick.centre.x, flick.centre.y, flick.ballRadius - flick.refresh, 0, Math.PI * 2);
		flick.ctx.fillStyle = flick.colour;
		flick.ctx.fill();
		if (flick.refresh > 0) {
			flick.refresh--;
		}
	}
	//Draw on balls
	for (let ball of flick.balls) {
		ball.draw();
	}
	requestAnimationFrame(iv);
};
iv();