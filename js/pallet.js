var Pallet = function(ctx, canvas_dom){
  this.canvas_dom = canvas_dom
  this.ctx = ctx
  this.draw_objects = []
  this.draw_objects_z_map = {}
	this.event_object = {
		"mousedown": null, //selected object with highest z_index
		"mousemove": null //selected object with highest z_index
	}
}
Pallet.prototype.add_object = function(obj){
  this.draw_objects.push(obj)
}

/**
	Private: re-calculate the possition and z-index for drawObject,
	and generate layer map as followings. after this method is executed,
	all draw object have enough information to draw something (like possition,
  width, z-index...)
  
	* layer map
	{
    <z-index>: [drawObejct, drawObejct]
	}
	
**/
Pallet.prototype._sort_object_by_z = function(){
  this.draw_objects_z_map = {}
  for(var i = 0;i<this.draw_objects.length; i++){
    this.draw_objects[i].calculate()
    var z = this.draw_objects[i].canvas.z_index 
    if(Object.prototype.toString.call(this.draw_objects_z_map[z]) == "[object Array]"){
      this.draw_objects_z_map[z].push(this.draw_objects[i])
    }else{
      this.draw_objects_z_map[z] = []
      this.draw_objects_z_map[z].push(this.draw_objects[i])
    }
  }
}


Pallet.prototype._get_sorted_zindex_list = function(){
  var z_list = Object.keys(this.draw_objects_z_map)
  z_list.sort(function(a,b){
    if(Number(a) < Number(b)) return -1;
    if(Number(a) > Number(b)) return 1;
    return 0;
  })
	return z_list
}

Pallet.prototype.render = function(){
  this.ctx.clearRect(0, 0, this.canvas_dom.width, this.canvas_dom.height)
  this._sort_object_by_z()
	var z_list = this._get_sorted_zindex_list()
  for(var i=0; i<z_list.length; i++){
    var z = z_list[i]
    for(var j=0; j<this.draw_objects_z_map[z].length; j++){
			this.draw_objects_z_map[z][j].canvas.draw(this.ctx)
    }
  }
}

Pallet.prototype.setMouseEventToDocument = function(_document){
	var events = ['mousedown', 'mousemove']
	for(var i=0; i<events.length; i++){
  	var callback = this.genMouseEventHandler(events[i])
		_document.addEventListener(events[i], callback)
	}
}

Pallet.prototype.genMouseEventHandler = function(eventName){
	var _this = this
	var callback = function(e){
		var rect = e.target.getBoundingClientRect(); 
		var x = e.clientX - rect.left;
		var y = e.clientY - rect.top;
		var deteced = {}
		for(var i=0; i< _this.draw_objects.length; i++){
			var obj = _this.draw_objects[i]
			if(obj.canvas.collision_detect(x, y)){
				if(deteced[obj.canvas.z_index]){
					deteced[obj.canvas.z_index].push(obj)
				}else{
					deteced[obj.canvas.z_index] = [obj]
				}	
			}
		}	
		var z_list = Object.keys(deteced)
		if(z_list.length > 0){
			z_list.sort(function(a,b){
				if(Number(a) < Number(b)) return 1;
				if(Number(a) > Number(b)) return -1;
				return 0;
			})
			var front_z_index = z_list.shift()
			var detected_objects = deteced[front_z_index]
			//TODO unsupport wrapped object	
			//TODO consider event delivery
			var detected_object = detected_objects[0]
			if(_this.event_object[eventName] != detected_object){
				if(_this.event_object[eventName])
					_this.event_object[eventName].event_handler(eventName+':clear')
				_this.event_object[eventName] = detected_object
				detected_object.event_handler(eventName)
			}
		}
	}
	return callback
}
