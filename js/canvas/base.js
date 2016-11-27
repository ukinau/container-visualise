var BaseCanvasModel = function(){
  this.possitionX = 0;
  this.possitionY = 0;
  this.width = 0; 
  this.height = 0; 
  this.z_index = 0;
  this.z_index_fixed = false;
}
BaseCanvasModel.prototype.get_possitionX_end = function(){
  return this.possitionX + this.width
}
BaseCanvasModel.prototype.get_possitionY_end = function(){
  return this.possitionY + this.height
}
BaseCanvasModel.prototype.collision_detect = function(x,y){
  if (this.possitionX < x && x < this.possitionX + this.width){
    if (this.possitionY < y && y < this.possitionY + this.height){
      return true
    }
  }
  return false
}
