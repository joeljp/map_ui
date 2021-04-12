/*
joeljp@gmail.com 20210204
                 menu.js                                                                        sets.js

               initJSON------------------------------->Sets.initSuperSet -----> Sets.SuperSet = {sex: {…}, age: {…}, place: {…},…}
                   |                                                     |                        |
       ____________|____________                                         |                       sex: {F: Set(386) {"anundsjo_ow3",…}, M: Set(500) {"ankarsrum_om1"…}
      |                         |                                        |
   initMap                  initMenu                                     -----> Sets.tid2loc  = {ankarsrum_om1: "Ankarsrum", …}
   |      |                 |      |
   |      |                 |      |
   |      |                 |   interval-------------->Sets.interval_add_set
   |      |                 |      |                          |
   |      |                 |      |                          |
 plot   area----------discrete----}|{------------------>Sets.add_set/rem_set --> Sets.activeSets = {sex: {…}, age: {…}, agegroup: {…}, place: {…}}
          |_________________|______|                                                                           |
                   |                                                                                          age: {11: true, 14: true, …}
                   |
                 update----------------------------|-->Sets.select_tids  ------> Sets.activSets <--- Sets.SuperSet
                   |                               |
                   |                               |-->Sets.tid2loc[tid]
             updateMarkers
                   |
                showTIDS
*/

let polygons = {}
let polyj = 0 // keys for the sets hash
let mz = []; // The actual markers
let allMarkers = [];

function initJSON(){
    let locs = [];
    // READ META. LOOKS LIKE THIS: [["tid","birth","sex",…],["ankarsrum_om1",1934,"M",…], … ]
    $.getJSON("dat/lia/meta.json", function(json){ // was meta.json
	Sets.initSuperSet(json);
	locs = Object.keys(Sets.SuperSet["place"]);
	initMenu();
    });
    // READ COORDINATES AND INIT MAP
    $.getJSON("dat/lia/coords.json", function(json) { // was ndc.json
	initMap(json, locs);
    });
}
let shown = false;

function array_difference(a,b){
    let difference = a.filter(x => !b.includes(x));
}
function array_intersection(a,b){
    let difference = a.filter(x => b.includes(x));
}

let test = false; // this is just to facilitate metadata consistency checks
let last = []; // this is just to facilitate metadata consistency checks
function showTIDS(tids){
    if(test){
	let diff = Array.from(tids).filter(x => !last.includes(x));
	console.log(diff);
	last = Array.from(tids);
    }
    console.log(tids);
    return true;
    tids.forEach(function(tid){
	$("#inner-grid").append($("<div>"+tid+"</div>"));
    });
}

function selector(id, e){
    let size = Sets.SuperSet[id].null.size
    let set = $("<div>",{class: "cell", text: size, id: id+"_"+e}).click(function(){
	if($(this).data("selected")){
	    $(this).css('background-color', '#f50');
	    $(this).data("selected", false);
	    Sets.rem_set(id,e); // remove this set from the hash of selected sets
	}
	else{
	    let rangeslider = $("#slider-range"+id);
	    if(rangeslider.length){
		rangeslider.slider("option","reset")();
	    }
	    else{
		$("[id^="+id+"_]").each(function(){
		    if(!$(this).data("selected")){
			console.log("It's a button "+$(this).attr('id'));
			if(!$(this).attr('id') == id+"_null"){
			    $(this).click();
			}
		    }
		});
	    }
	    $(this).css('background-color', '#5f5');
	    $(this).data("selected", true);
	    Sets.add_set(id,e); // add this set to the hash of selected sets
	}
	update();
    }).data("selected", true).css('background-color', '#8f8');
    return set;
}
function discrete(id, v, nulls = false){
    // console.log("discrete", id, v);
    // CREATES THE «checkbox» STYLE divs with their Sets.add_set and Sets.rem_set calls
    // They also call update()
    $.each(v, function(i,e){Sets.add_set(id, e);});
    let tit = $("<div class='cats' id='"+id+"'>"+id+"</div>");
    let ind = $("<div id='indicator"+id+"'>"+v+"</div>");
    let sel = $("<div class='selector' id='selector"+id+"'/>");
    let nul = $("<div>Ø</div>");
    if(nulls){
	Sets.add_set(id, "null");
	nul = selector(id, "null");
    }
    $.each(v, function(i,e){
	//console.log("each", id, i, e);
	let set = $("<div>",{class: "cell", text: e, id: id+"_"+e}).click(function(){
	    if(nul.data("selected")){
		nul.trigger("click");
	    }
	    if($(this).data("selected")){
		$(this).css('background-color', '#f50');
		$(this).data("selected", false);
		v.splice( $.inArray(e, v), 1 );
		$("#indicator"+id).html(v.toString());
		Sets.rem_set(id,e); // remove this set from the hash of selected sets
	    }
	    else{
		v.push(e);
		$("#indicator"+id).html(v.toString());
		$(this).css('background-color', '#5f5');
		$(this).data("selected", true);
		Sets.add_set(id,e); // add this set to the hash of selected sets
	    }
	    update();
	}).data("selected", true).css('background-color', '#8f8');
	sel.append(set);
    });
    $("#inner-grid").append(tit,ind,sel,nul);
}
function interval(id,min,max, nulls = false){
    // console.log(id, min, max, nulls);
    // CREATES THE «range slider» STYLE divs with their Sets.updateInterval calls
    // They also call update()
    Sets.interval_add_set(id,min,max);
    let tit = $("<div class='cats' id='"+id+"'>"+id+"</div>");
    let ind = $("<div><span id='slider-indicatorL"+id+"'>"+min+"</span> - <span id='slider-indicatorR"+id+"'>"+max+"</span></div>");
    let sld = $("<div><div id='slider-range"+id+"' /></div>");
    let nul = $("<div></div>");
    if(nulls){
	Sets.add_set(id, "null");
	nul = selector(id, "null");
    }
    $("#inner-grid").append(tit,ind,sld,nul);
    $("#slider-range"+id).slider({
	range: true,
	min: (min - 1),
	max: (max + 1),
	step: 1,
	values: [min, max],
	reset: function(){
	    $("#slider-range"+id).slider("values", 0, min);
	    $("#slider-range"+id).slider("values", 1, max);
	    $('#slider-indicatorL'+id).html(min);
	    $('#slider-indicatorR'+id).html(max);
	    Sets.interval_add_set(id,min,max);
	},
	slide: function (e, ui) {
	    let from = ui.values[0];
	    let to   = ui.values[1];
	    $('#slider-indicatorL'+id).html(from);
	    $('#slider-indicatorR'+id).html(to);
	    Sets.interval_add_set(id,from,to);
	    update();
	},
	change: function(){
	    if(nul.data("selected")){ // IE, on changing range, the null selector should be diactivated
		nul.trigger("click");
	    }
	}
    });
    $("#slider-range"+id).data("min", min); // not in use right now..
    $("#slider-range"+id).data("max", max); // not in use right now..
}

function initMenu(){
    $("#inner-grid").append($("<div>Informants</div>"), $("<div id='n_tids' />"),$("<div><span>Locations </span><span id='n_locs' /></div>"),$("<div>Null</div>"));
    $.each(Sets.SuperSet, function(k,v){
	if(["place","area","region","country","agegroup"].includes(k)){return true} // IE, geographical stuff, for the map
	let nulls = false
	
	if(k == "age" || k == "birth" || k == "rec"){                               // IE, integer -> ranges/inervals
	    let min = 99999;
	    let max = 0;
	    $.each(v, function(i,e){
		if(i == "null"){
		    nulls = true;
		    return;
		}
		i = parseInt(i);
		if(typeof(i) != "number"){ // this will not happen, du to above line
		    console.log("OINK", k,i);
		}
		if(i > max){max = i;}
		if(i < min){min = i;}
		if(k == "age" & false){ // this is just here for finding rogue vals
		    console.log(typeof i);
		    console.log(stringo, "--->",min,max);
		}
	    });
	    interval(k,min,max, nulls);
	}
	else{                                                                       // IE, discrete -> check box
	    vals = [];
	    $.each(v, function(i,e){
		if(i == "null"){
		    nulls = true;
		    return;
		}
		vals.push(i);
	    });
	    discrete(k,vals, nulls);
	}
    });
    update();
}
function initMap(coords, places) {
    map = new google.maps.Map(document.getElementById("map"), {
	center: { lat: -34.397, lng: 150.644 },
	zoom: 5,
	mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    middle = coords.Vilhelmina;
    lat = middle[0];
    lng = middle[1];
    map.setCenter({lat: lat, lng: lng});
    const drawingManager = new google.maps.drawing.DrawingManager({
	drawingMode: google.maps.drawing.OverlayType.MARKER,
	drawingControl: true,
	drawingControlOptions: {
	    position: google.maps.ControlPosition.TOP_CENTER,
	    drawingModes: [
		google.maps.drawing.OverlayType.POLYGON,
	    ],
	},
	polygonOptions: {
	    geodesic: false,
	    fillColor: "#ffbc00",
	    fillOpacity: 0.3,
	    strokeWeight: 1,
	    clickable: true,
	    editable: true,
	    zIndex: 1
	},

    });
    drawingManager.setMap(map);
    google.maps.event.addListener(drawingManager, 'polygoncomplete', function (polygon) {
	polygons[polyj] = polygon;
	polygon.getPaths().forEach(function(path, index){
	    google.maps.event.addListener(path, 'insert_at',
					  // this is when you grab a midway point and drag it.
					  // It creates transforms the midway to an end point, and creates to subsequent midways
					  function(){
					      area(allMarkers, polygons, "insert");
					  });
	    
	    google.maps.event.addListener(path, 'remove_at',
					  // removes last change when clicking the redo arrow
					  function(){
					      area(allMarkers, polygons, "remove at");
					  });

	    google.maps.event.addListener(path, 'set_at',
					  function(){
					      area(allMarkers, polygons, "set at");
					  });

	    google.maps.event.addListener(polygon, 'click',
					  function(){
					      delete polygons[polygon.id];
					      polygon.setMap(null);
					      area(allMarkers, polygons, "click");
					  });


	    polygon.id = polyj;

	});
	area(allMarkers, polygons, "new poly");
	polygons[polyj++] = polygon;
    });
    plot(coords, places);
}

function area(markers,polygons, msg){
    console.log(msg);
    Sets.remove_active_set("place");
    $.each(polygons, function(i,polygon){
	$.each(markers, function(j,marker){
	    if(google.maps.geometry.poly.containsLocation(marker, polygon)){
		Sets.add_set("place", marker.title);
	    }
	});
    });
    update();
}

function update(){
    let locations = new Set;
    let tids = Sets.select_tids();
    tids.forEach(function(e){
	locations.add(Sets.tid2loc[e]);
    });
    $("#n_tids").html(tids.size);
    $("#n_locs").html(locations.size);
    updateMarkers(locations);
}

function updateMarkers(locs){
    $.each(mz, function(i,m){
	if(!locs.has(m.id)){
	    m.setMap(null);
	}
	else{
	    m.setMap(map);
	}
    });
    showTIDS(Sets.select_tids())
}

function plot(data,locs){
    var tiny = {
	url: "img/dot.svg",
	size: new google.maps.Size(3, 3),
	origin: new google.maps.Point(0, 0),
	anchor: new google.maps.Point(-1, -1),
	scaledSize: new google.maps.Size(3, 3)
    };
    var dot = {
	url: "img/green.svg",
	size: new google.maps.Size(7, 7),
	origin: new google.maps.Point(0, 0),
	anchor: new google.maps.Point(1, 1),
	scaledSize: new google.maps.Size(7, 7)
    };
    Object.values(locs).forEach(function(key){
	if(key != "focus"){
	    var tiny_marker = new google.maps.Marker({
		position: { lat: data[key][0], lng: data[key][1] },
		map: map,
		title: key,
		icon: tiny,
		id: key,
		zIndex: 0,
	    });
	    var marker = new google.maps.Marker({
		position: { lat: data[key][0], lng: data[key][1] },
		map: map,
		title: key,
		icon: dot,
		id: key,
	    });
	    google.maps.event.addListener(marker, "click", function() { console.log(key); });
	    mz.push(marker);
	    allMarkers.push({title: key,
			     active: true,
			     lat:
			     function lat(){
				 return data[key][0]
			     },
			     lng:
			     function lng(){
				 return data[key][1]
			     }
			    });
	}
    })
}
