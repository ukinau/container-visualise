ConnectionBaseCanvas = function(){
  this.begin_possition = [] // [x, y]
  this.end_possition = [] // [x, y]
  this.globalAlpha = null
  this.strokeStyle = null
  this.lineWidth = null
  this.z_index = 99 //TODO temporally max higher value
}

ConnectionBaseCanvas.prototype.draw = function(ctx){
  var tmp_globalAlpha = ctx.globalAlpha
  var tmp_lineWidth = ctx.lineWidth 
  var tmp_strokeStyle = ctx.strokeStyle
  ctx.globalAlpha = this.globalAlpha
  ctx.lineWidth = this.lineWidth
  ctx.strokeStyle = this.strokeStyle

  ctx.beginPath()
  ctx.moveTo(this.begin_possition[0],
             this.begin_possition[1])
  ctx.lineTo(this.end_possition[0],
             this.end_possition[1])
  ctx.stroke()

  ctx.globalAlpha = tmp_globalAlpha
  ctx.lineWidth = tmp_lineWidth
  ctx.strokeStyle = tmp_strokeStyle
}
ConnectionBaseCanvas.prototype.collision_detect = function(x, y){
  return false
}

ArrowConnection = function(){
  ConnectionBaseCanvas.call(this)
  this.arrow_width = 5
  this.arrow_height = 10
}

ArrowConnection.prototype.draw = function(ctx){
  this.end_possition[0] = Number(this.end_possition[0])
  this.end_possition[1] = Number(this.end_possition[1])
  var left_possitions = []
  var right_possitions = []
  var original_end_possition = this.end_possition
  this.end_possition = []

  arrowPos(this.begin_possition, original_end_possition,
           0, this.arrow_height, left_possitions, [])
  this.end_possition[0] = Number(left_possitions[0])
  this.end_possition[1] = Number(left_possitions[1])
  Object.getPrototypeOf(ArrowConnection.prototype).draw.call(this, ctx)
  this.end_possition = original_end_possition

  var tmp_globalAlpha = ctx.globalAlpha
  var tmp_lineWidth = ctx.lineWidth
  var tmp_strokeStyle = ctx.strokeStyle
  var tmp_fillStyle = ctx.fillStyle

  ctx.globalAlpha = this.globalAlpha
  ctx.lineWidth = this.lineWidth
  ctx.strokeStyle = this.strokeStyle
  ctx.fillStyle = this.strokeStyle

  arrowPos(this.begin_possition, this.end_possition,
           this.arrow_width, this.arrow_height,
           left_possitions, right_possitions)

  ctx.moveTo(this.end_possition[0], this.end_possition[1])
  ctx.lineTo(left_possitions[0], left_possitions[1])
  ctx.lineTo(right_possitions[0], right_possitions[1])
  ctx.fill()

  ctx.globalAlpha = tmp_globalAlpha
  ctx.lineWidth = tmp_lineWidth
  ctx.strokeStyle = tmp_strokeStyle
  ctx.fillStyle = tmp_fillStyle
}



inherits(ArrowConnection, ConnectionBaseCanvas)


function arrowPos(A,B,w,h,L,R){ //A,B,L,Rは[0]:x [1]:y
  var Vx= B[0]-A[0];
  var Vy= B[1]-A[1];
  var v = Math.sqrt(Vx*Vx+Vy*Vy);
  var Ux= Vx/v;
  var Uy= Vy/v;
  L[0]= B[0] - Uy*w - Ux*h;
  L[1]= B[1] + Ux*w - Uy*h;
  R[0]= B[0] + Uy*w - Ux*h;
  R[1]= B[1] - Ux*w - Uy*h;
}
