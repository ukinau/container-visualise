function showTextBox(_this){
  if(_this.options['textboxDrawObject']){
    return
  }
  if(!_this.options['description']){
    _this.options['description'] = "empty description"
  }
  var content = _this.id + '\n' + _this.options['description']
  var textbox =  new TextboxSquare(pallet.ctx, content)
  textbox.possitionX = _this.canvas.get_possitionX_end()
  textbox.possitionY = _this.canvas.get_possitionY_end()

  textbox.width = 300
  textbox.height = 200
  textbox.color = "rgb(250, 250, 250)"
  textbox.globalAlpha = 0.8
  textbox.text.font = "20px sans-serif"
  textbox.text.is_bold = false
  textbox.z_index = 99
  textbox.z_index_fixed = true

  var drawObject = new DrawObject()
  drawObject.canvas = textbox
  _this.options['textboxDrawObject'] = drawObject
  pallet.add_object(drawObject)
}
function hideTextBox(_this){
  if(_this.options['textboxDrawObject']){
    pallet.remove_object(_this.options['textboxDrawObject'])
    _this.options['textboxDrawObject'] = null
  }
}

function add_title(_this, body){
  body.push("\n<font>(40px chalkboard)" + _this.id + '</font>\n\n')
}
function add_description(_this, body){
  body.push("<font>(30px chalkboard)Description: </font>\n")
  body.push(_this.options['description'] + '\n')
}
function add_depends(_this, body, reffered_list){
  body.push("<font>(30px chalkboard)Depend:</font>\n")
  var indent = "  "
  for(var i = 0; i<_this.connections.length; i++){
    if(_this.connections[i].to == _this){ reffered_list.push(_this.connections[i]); continue }
    if(_this.connections[i].options.topics){
      var con = _this.connections[i]
      body.push("\n<color>(#003aff)" + indent + "*" +con.to.id + '</color>\n')
      for(var j=0; j<con.options.topics.length; j++){
        var topic_tree_simbol = "┣"
        if(j == con.options.topics.length - 1){topic_tree_simbol= "┗"}
        var topic = con.options.topics[j]
        body.push("<color>(#003aff) "+indent + topic_tree_simbol + topic[0] + '<' + topic[1] + '>' + '</color>\n')
        var same_cons = find_connection_by_topic(con.to.connections, [topic],
           function(c){if(c.to != _this && c.from != _this && c.to == con.to){return true}})
        for(var k=0; k<same_cons.length; k++){
          var tree_simbol = "┣"
          var left_tree = "┃"
          if(k == same_cons.length - 1){tree_simbol= "┗"}
          if(topic_tree_simbol == "┗"){left_tree = "  "}
          var same_cons_topic = same_cons[k][2]
          body.push("<color>(#12a004) "+ indent + "<color>(#003aff)" +left_tree + "</color>" + tree_simbol + same_cons[k][1].from.id)
          body.push(':'+ same_cons_topic[0] + '<' + same_cons_topic[1] + '>' + '</color>\n')
        }
      }
    }else{
      body.push("\n<color>(#003aff)"+indent +"*"+ _this.connections[i].to.id + '</color>\n')
    }
  }
}


// {operation: {topic: [ComponentName]}}
// {none: [ComponentName]}
function sort_reffered_connection(reffered_list){
  var result = {}
  for(var i=0; i<reffered_list.length; i++){
    var con = reffered_list[i]
    if(con.options.topics){
      for(var j=0; j<con.options.topics.length; j++){
        var topic = con.options.topics[j]
        var topic_op = topic[0]
        var topic_dest = topic[1]
        if(!result.hasOwnProperty(topic_op)){
          console.log(topic_op)
          result[topic_op] = {}
        }
        if(!result[topic_op].hasOwnProperty(topic_dest)){
          console.log(topic_op, topic_dest)
          result[topic_op][topic_dest] = []
        }
        result[topic_op][topic_dest].push(con.from.id)
      }
    }else{
      if(!("unassignment" in result)){
        result["NONE"]={"topic":[]}
      }
      result["NONE"]["topic"].push(con.from.id)
    }
  }
  return result
}

/**
 * <container-name>
 * * -> <container-name>: <operation> (target)
 * * * * -> <container-name>: <operation> (target)
 * * -> <operation> (target):<container-name>
 */
function showDependenciesDetail(_this){
  var body_array = []
  var body = ""
  var reffered_list = []
  var indent = "  "
  add_title(_this, body_array)
  add_description(_this, body_array)
  add_depends(_this, body_array, reffered_list)
  body = body_array.join("")

  sorted_reffered = sort_reffered_connection(reffered_list)
  body += "\n<font>(30px chalkboard)Referred:</font>\n"
  for(var operation in sorted_reffered){
    body += "\n<color>(#ff2d00)" + indent + "[" + operation + "]" + '</color>\n'
    var index = 0
    for(var topic in sorted_reffered[operation]){
      var topic_tree_simbol = "┣"
      if(index==(Object.keys(sorted_reffered[operation]).length-1)){
        topic_tree_simbol= "┗"
      }
      body += "<color>(#ff2d00)" + indent + topic_tree_simbol + "<" +topic + ">"+'</color>\n'
      for(var i=0; i<sorted_reffered[operation][topic].length; i++){
        var component_name = sorted_reffered[operation][topic][i]
        var tree_simbol = "┣"
        var left_tree = "┃"
        if(i == sorted_reffered[operation][topic].length - 1){tree_simbol= "┗"}
        if(topic_tree_simbol == "┗"){left_tree = "  "}
          body += "<color>(#ff2d00)" + indent + left_tree + tree_simbol + component_name + '</color>\n'
      }
      index++
    }
  }
  updateLeftTextbox(body)
}


function connectionHighLight(_this, eventName, _){
  var connections = _this.connections
  for(var i=0; i<connections.length; i++){
    if(_this == connections[i].from){
      connections[i].highlight({"color": "blue", "lineWidth": 3})
      highLightDrawObject(connections[i].to, "blue")
    }else{
      connections[i].highlight({"color": "red", "lineWidth": 3})
      highLightDrawObject(connections[i].from, "red")
    }
    var sametopic_connections =  find_connection_by_topic(
        connections[i].to.connections, connections[i].options.topics,
        function(connection){if(connection.to != _this && connection.from != _this){return true}})
    for(var j=0; j<sametopic_connections.length; j++){
      sametopic_connections[j][1].highlight({"color": "green", "lineWidth": 3})
      highLightDrawObject(sametopic_connections[j][1].from, "green")
    }
  }
}
function connectionUnHighLight(_this, eventName, _){
  var connections = _this.connections
  for(var i=0; i<connections.length; i++){
    connections[i].unHighlight()
    unHighlightDrawObject(connections[i].to)
    unHighlightDrawObject(connections[i].from)
    var sametopic_connections =  find_connection_by_topic(
        connections[i].to.connections, connections[i].options.topics,
        function(connection){if(connection.to != _this && connection.from != _this){return true}})
    for(var j=0; j<sametopic_connections.length; j++){
      sametopic_connections[j][1].unHighlight()
      unHighlightDrawObject(sametopic_connections[j][1].from)
    }
  }
}
function highLightDrawObject(drawObject, color){
  drawObject.canvas.lineFlag = true
  drawObject.canvas.lineColor = color
  drawObject.canvas.lineWidth = 5
}
function unHighlightDrawObject(drawObject){
  drawObject.canvas.lineFlag = false
}

function showTopicOnConnections(connections, highlight, except_obj){
  for(var i=0; i<connections.length; i++){
    if(highlight){
      if(connections[i].to != except_obj &&
          connections[i].from != except_obj){
        connections[i].highlight(highlight)
      }
    }
    if(connections[i].options._title && !(connections[i].canvas instanceof ArrowConnectionWithTitle)){
      if(connections[i].from != except_obj && connections[i].to != except_obj){
        var strokeStyle = connections[i].canvas.strokeStyle
        connections[i].canvas = new ArrowConnectionWithTitle(connections[i].options._title)
        connections[i].canvas.title.color = strokeStyle
        connections[i].canvas.title.is_bold = false
      }
    }
    if(highlight){
      if(connections[i].to != except_obj &&
          connections[i].from != except_obj){
        connections[i].highlight(highlight)
      }
    }
  }
}
function hideTopicOnConnections(connections, unHighlight){
  for(var i=0; i<connections.length; i++){
    if(connections[i].options._title && (connections[i].canvas instanceof ArrowConnectionWithTitle)){
      connections[i].canvas = new ArrowConnection()
    }
    if(unHighlight){
      connections[i].unHighlight()
    }
  }
}

function moveStart(_this, eventName, eventInfo){
  _this['clicked'] = true
  _this['moveStartPoint'] = eventInfo
  _this['originalCordinate'] = [_this.canvas.possitionX, _this.canvas.possitionY]
}
function move(_this, eventName, eventInfo){
  _this.canvas.possitionX = _this['originalCordinate'][0] + Number(eventInfo['x']) - Number(_this['moveStartPoint']['x'])
  _this.canvas.possitionY = _this['originalCordinate'][1] + Number(eventInfo['y']) - Number(_this['moveStartPoint']['y'])
}
function clearMove(_this, eventName, eventInfo){
  _this['clicked'] = false
  _this['moveStartPoint'] = null
  _this['originalCordinate'] = [_this.canvas.possitionX, _this.canvas.possitionY]
}

//topics: [['op', 'topic'], ['op1', 'topic1']]
//return [[topic, connection, match_topic]]
function find_connection_by_topic(connections, topics, filter){
  result = []
  if(!topics){
    return result
  }
  for(var i=0; i<connections.length; i++){
    if(!connections[i].options.topics){
      continue
    }
    for(var j=0; j<connections[i].options.topics.length; j++){
      for(var k=0; k<topics.length; k++){
        target_topic = connections[i].options.topics[j]
        if(compare_topic(topics[k], target_topic)){
          if(typeof filter != "function" || filter(connections[i])){
            result.push([topics[k], connections[i],
                         target_topic]);
          }
        }
      }
    }
  }
  return result
}

//topic: ['op', 'topic']
function compare_topic(src_topic, target_topic){
  return (src_topic[1] == target_topic[1]) && (src_topic[0] != target_topic[0])
}

function initLeftTextbox(body){
  var textbox =  new TextboxSquare(pallet.ctx, body)
  textbox.possitionX = 25
  textbox.possitionY = 25

  textbox.width = 600
  textbox.height = 2450
  textbox.color = "rgb(250, 250, 250)"
  textbox.globalAlpha = 0.8
  textbox.text.font = "20px sans-serif"
  textbox.text.is_bold = false
  textbox.z_index = 99
  textbox.z_index_fixed = true

  var drawObject = new DrawObject()
  drawObject.canvas = textbox
  globals['LeftTop'] = drawObject
  pallet.add_object(drawObject)
}

function updateLeftTextbox(body){
  globals['LeftTop'].canvas.text.content = body
}
