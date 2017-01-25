globals = {
  "infrontObjects": [], "modal": null, "modalFlag": false,
  "LeftTop": null
}
function DrawObjectWithEvent(name, options){
  if(options['type'] == 'team'){
    options['color'] = '#C9C9AB'
    options['text-font'] = '20px sans-serif'
  }else if(options['type'] == 'component'){
    options['color'] = '#88856A'
    options['text-font'] = '20px sans-serif'
  }else{
    options['color'] = '#DBBE32'
    options['text-font'] = '16px sans-serif'
    options['text-is_bold'] = false
  }
  var dCanvas = new SquareWithTitle(name, options)
  var dObj = new DrawObject(name, dCanvas, options)
  if(dObj.options['type'] == 'container'){
    dObj.event_function_register("mousedown", clickHandler)
    dObj.event_function_register("mousedown:clear", clickClearHandler)
    dObj.event_function_register("dragging", draggingHandler)
    dObj.event_function_register("dragging:clear", draggingClearHandler)
    dObj.event_function_register("mousemove", mouseMoveHandler)
    dObj.event_function_register("mousemove:clear", mouseMoveClearHandler)
  }
  pallet.add_object(dObj)
  return dObj
}

function mouseMoveHandler(_this, eventName, eventInfo){
  var s = Date.now()
  if(globals['modalFlag']){
    return false
  }
  _this.canvas.lineFlag = true
  _this.canvas.lineColor = '#ffffff'
  _this.canvas.lineWidth = 5
  connectionHighLight(_this, eventName, eventInfo)
  showDependenciesDetail(_this)
  console.log('move', (Date.now()-s)/1000)
}
function mouseMoveClearHandler(_this, eventName, eventInfo){
  var s = Date.now()
  if(globals['modalFlag']){
    return false
  }
  unHighlightDrawObject(_this)
  connectionUnHighLight(_this, eventName, eventInfo)
  console.log('move:clear', (Date.now()-s)/1000)
}

function clickHandler(_this, eventName, eventInfo){
  var s = Date.now()
  if(globals['modalFlag']){
    return false
  }
  moveStart(_this, eventName, eventInfo)
  //showTextBox(_this)
  var connections = _this.connections
  globals['infrontObjects'].push(_this)
  for(var i=0; i<connections.length; i++){
    if(_this == connections[i].from){
      connections[i].highlight({"color": "blue", "lineWidth": 3})
      globals['infrontObjects'].push(connections[i].to)
      highLightDrawObject(connections[i].to, "blue")
    }else{
      connections[i].highlight({"color": "red", "lineWidth": 3})
      globals['infrontObjects'].push(connections[i].from)
      highLightDrawObject(connections[i].from, "red")
    }
    var sametopic_connections =  find_connection_by_topic(
        connections[i].to.connections, connections[i].options.topics,
        function(connection){if(connection.to != _this && connection.from != _this){return true}})
    for(var j=0; j<sametopic_connections.length; j++){
      sametopic_connections[j][1].highlight({"color": "green", "lineWidth": 3})
      globals['infrontObjects'].push(sametopic_connections[j][1].from)
      highLightDrawObject(sametopic_connections[j][1].from, "green")
    }
  }

  var modalBackground = new SquareWithTitle(
      "", {'color': 'rgb(250, 250, 250)', 'globalAlpha': 0.8, 'x': 0, 'y': 0,
           'width': 3350, 'height': 2500})
  modalBackground.z_index = 50
  modalBackground.z_index_fixed = true
  var drawObject = new DrawObject()
  drawObject.canvas = modalBackground
  globals['modal'] = drawObject
  globals['modalFlag'] = true
  pallet.add_object(drawObject)

  for(var i=0; i<globals['infrontObjects'].length;i++){
    globals['infrontObjects'][i].canvas.z_index = 99
    globals['infrontObjects'][i].canvas.z_index_fixed = true
  }
  showDependenciesDetail(_this)
  console.log('click', (Date.now()-s)/1000)
}
function clickClearHandler(_this, eventName, eventInfo){
  var s = Date.now()
  //hideTextBox(_this)
  unHighlightDrawObject(_this)
  var connections = _this.connections
  for(var i=0; i<connections.length; i++){
    connections[i].unHighlight()
    unHighlightDrawObject(connections[i].to)
    unHighlightDrawObject(connections[i].from)
    var sametopic_connections =  find_connection_by_topic(
        connections[i].to.connections, connections[i].options.topics)
    for(var j=0; j<sametopic_connections.length; j++){
      sametopic_connections[j][1].unHighlight()
      unHighlightDrawObject(sametopic_connections[j][1].from)
    }
  }

  pallet.remove_object(globals['modal'])
  globals['modal'] = null
  globals['modalFlag'] = false
  for(var i=0; i<globals['infrontObjects'].length;i++){
    globals['infrontObjects'][i].canvas.z_index_fixed = false
  }
  globals['infrontObjects'] = []

  console.log('click:clear', (Date.now()-s)/1000)
}
function draggingHandler(_this, eventName, eventInfo){
  var s = Date.now()
  move(_this, eventName, eventInfo)
  console.log('dragging', (Date.now()-s)/1000)
}
function draggingClearHandler(_this, eventName, eventInfo){
  var s = Date.now()
  clearMove(_this, eventName, eventInfo)
  //hideTextBox(_this)
  //showTextBox(_this)
  console.log('dragging:clear', (Date.now()-s)/1000)
}



function redraw(){
  pallet.render()
}
setInterval(redraw, 300)
