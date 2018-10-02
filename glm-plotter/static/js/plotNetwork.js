// JAC - jdechalendar@stanford.edu

var width = 960,
    height = 760;

var myTitle = d3.select("#main")
  .append("h1");

var svg = d3.select("#main")
  .append("div")
    .attr("class", "col")
  .append("svg")
    .attr("width", width)
    .attr("height", height);

var container = svg.append("g");

// zooming
var min_zoom = .1;
var max_zoom = 5;

var zoom = d3.behavior.zoom()
  .scaleExtent([min_zoom,max_zoom])
  .on("zoom",zoomed);

function zoomed() {
  container.attr("transform", "translate(" + d3.event.translate + ")scale("
  + d3.event.scale + ")");
}

svg.call(zoom).on("dblclick.zoom", null)

// initialize force
var force = d3.layout.force()
    .charge(-120)
    .linkDistance(30)
  .gravity(0.05)
    .size([width, height]);

var drag = force.drag()
  .on("dragstart", dragstart);

var node = container.selectAll(".node"),
    link = container.selectAll(".link");

// load data
d3.json("/data", function(error, mydata) {
  if (error) throw error;

  // extract data from the json input
  var fileNm = mydata.file;
  var graph = mydata.graph;
  var fixedNodes = mydata.fixedNodes;

  myTitle.html(fileNm);

  link = link.data(graph.links)
      .enter().append("g")
      .attr("class", "link")
   // there is no value property. But varying line-width could be useful in the
   // future - keep
   //   .style("stroke-width", function(d) { return Math.sqrt(d.value); });
  // Note: I created the following line object in a 'g' container even though
  // it wasn't necessary in case I want to add something to the container later,
  // like an image - or text
  var line = link.append("line")

  // color the lines according to their type as defined by linkType property in
  // the JSON
  link.each(function(d){
	if (d.linkType) {
		d3.select(this).classed(d.linkType, true)
    }
  });

  // node 'g' container will contain the node circle and label
  node = node.data(graph.nodes)
      .enter().append("g")
      .attr("class", "node")
	  .call(drag) // this command enables the dragging feature
	  .on("dblclick", dblclick);
    //.on("click",clickAction); // this was removed but can be used to display
    // a hidden chart

  node.each(function(d){
    if (d.classNm) {
	  d3.select(this).classed(d.classNm, true)
	}
  });
  node.each(function(d){
    if (d.child) {
	  d3.select(this).classed(d.child, true)
	}
  });

  var circle = node.append("circle")
	.attr("r", 10)
	.attr("class", function(d) { return d.classNm; });
	//.style("fill", function(d) { return color(d.group); });
  var label = node.append("text")
    .text(function(d) { return d.name })
	.attr("class", "nodeNm");

  // add labels at end so they are on top
  var lineLabel = link.append("g").append("text")
    .text(function(d) { return d.linkType });
  var nodeg = node.append("g")
    .append("text")
    .style("font-size",16)
    .text(function(d) {
      if (d.child){
        return d.classNm+":"+d.child;
      }
      else {
        return d.classNm;
      }
    })

  node.each(function(d){
    idNode = fixedNodes.names.indexOf(d.name)
    if (idNode>-1) {
    d3.select(this).classed("fixed", d.fixed = true);
    d.x=fixedNodes.x[idNode];
    d.y=fixedNodes.y[idNode];
  }
  });

  force
      .nodes(graph.nodes)
      .links(graph.links)
      .start();

  // update positions at every iteration ('tick') of the force algorithm
  force.on("tick",function(){
    line.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });
    lineLabel.attr("x", function(d) { return (d.source.x+d.target.x)/2+8; })
      .attr("y", function(d) { return (d.source.y+d.target.y)/2+20; });
    circle.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
    label.attr("x", function(d) { return d.x + 8; })
      .attr("y", function(d) { return d.y; });
    nodeg.attr("x", function(d) { return d.x + 8; })
      .attr("y", function(d) { return d.y+20; });
  })
});

// after a node has been moved manually it is now fixed
function dragstart(d) {
  d3.event.sourceEvent.stopPropagation();
  d3.select(this).classed("fixed", d.fixed = true);
}

// when you double click a fixed node, it is released
function dblclick(d) {
  d3.select(this).classed("fixed", d.fixed = false);
}
//function clickAction(d){
 // if (document.getElementById('chart').style.display=='none'){
 //   document.getElementById('chart').style.display='block';
 // }
 // else {
 //  document.getElementById('chart').style.display='none';
 // }
//}
function saveXY(){
  var pre = document.getElementById('rmPreText').value;
	var myStr = "data:text/csv;charset=utf-8,";
	txtArr = [];
	cxArr = [];
	cyArr = [];

	d3.selectAll("text.nodeNm").each(function(d){
		txtArr.push(pre + d3.select(this).text());
	})
	d3.selectAll("circle").each(function (d){
		cxArr.push(d3.select(this).attr("cx"));
		cyArr.push(d3.select(this).attr("cy"));
	});
	if (txtArr.length!= cxArr.length || txtArr.length!= cyArr.length) {
		throw "number of circles is not consistent with number of text labels!"
	}
	for (var ii=0; ii<txtArr.length; ii++){
		myStr = myStr + txtArr[ii] + "," + cxArr[ii] + "," + cyArr[ii] + "\n"
	}
//	var cc = node.selectAll("circle")
//	var myStr = "data:text/csv;charset=utf-8,";
//	cc.each(function(d){
//		myStr = myStr+[d3.select(this).attr("cx") ,d3.select(this).attr("cy")].join(",") +"\n"
//	});
//	node.selectAll('text.nodeNm').each(function (d){
//		d3.select(this).text()
//	})
	//console.log(myStr)
	var encodedUri = encodeURI(myStr);
	var dummy = document.createElement("a");
	dummy.setAttribute("href", encodedUri);
	dummy.setAttribute("download", "xycoords.csv");
	document.body.appendChild(dummy);
	dummy.click(); // This will download the data file
}
function saveXYfixed(){
  var pre = document.getElementById('rmPreText').value;
  var myStr = "data:text/csv;charset=utf-8,";
  txtArr = [];
  cxArr = [];
  cyArr = [];

  d3.selectAll("text.nodeNm").each(function(d){
    if (d.fixed){
      txtArr.push(pre+d3.select(this).text());
    }
  })
  d3.selectAll("circle").each(function (d){
    if (d.fixed){
      cxArr.push(d3.select(this).attr("cx"));
      cyArr.push(d3.select(this).attr("cy"));
    }
  });
  if (txtArr.length!= cxArr.length || txtArr.length!= cyArr.length) {
    throw "number of circles is not consistent with number of text labels!"
  }
  for (var ii=0; ii<txtArr.length; ii++){
    myStr = myStr + txtArr[ii] + "," + cxArr[ii] + "," + cyArr[ii] + "\n"
  }
  var encodedUri = encodeURI(myStr);
  var dummy = document.createElement("a");
  dummy.setAttribute("href", encodedUri);
  dummy.setAttribute("download", "xycoords.csv");
  document.body.appendChild(dummy);
  dummy.click(); // This will download the data file
}
function removePrefix(){
		var pre = document.getElementById('rmPreText').value;
		d3.selectAll("text.nodeNm").text(
      function (d){return d.name.replace(pre,"");});
}

function nodeSearcher(){
		var targetNodeNm = document.getElementById('nodeSearchNm').value;
		d3.selectAll("g.node").each(
		function(d){
			a=1;
			if (d.name.indexOf(targetNodeNm)>-1){
				d3.select(this).classed("highlight", d.highlight = true);
			}
			else {
				d3.select(this).classed("highlight", d.highlight = false);
			}
		});
}
function changeLinkDistance(){
	force.linkDistance(Number(document.getElementById('linkLengthVal').value));
}
function changeGravity(){
	force.gravity(Number(document.getElementById('gravityVal').value));
}
function changeCharge(){
	force.charge(Number(document.getElementById('chargeVal').value));
}
