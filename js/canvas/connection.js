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
