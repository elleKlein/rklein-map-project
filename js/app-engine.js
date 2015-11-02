// Set map variable for google map's map
// Set list of all markers to use later	
var map;
  	allMarkers = [];

// Main function to create google map	
function initialize() {
	
	// Set the variable for the starting point
  var saltValley = new google.maps.LatLng(40.686376, -111.972836);
	
	// Set the variable for the google map option
  var mapOptions = {
    zoom:11,
    center: saltValley,
    disableDefaultUI: true
  };
	
	// Create a new map object
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions); 
}

// Main function to create and place markers on google map		
function addGoogleMapsMarkers(m){        
	
	// Display multiple markers on a map
  var infoWindow = new google.maps.InfoWindow();

	// Function to create Info window for the google map marker   
  function makeInfoWindow(mk){
		
		// Create the DOM element for the marker window 
		var infoWindowContent = '<div class="info_content">';
		infoWindowContent += '<h4>' + mk.title + '</h4>';
		infoWindowContent += '<p>' + mk.ph + '</p>';
		infoWindowContent += '<p class="review">' + mk.blurb + '</p>';
		infoWindowContent += '</div>';
		
		// Google Map V3 method to set the content of the marker window    		
  	infoWindow.setContent(String(infoWindowContent));

		// Google Map V3 method to set the content of the marker window   		
  	infoWindow.open(map, mk);
  }

	// Function delete all markers on the map
	function deleteAllMarkers(){
		// Loops over all the markers on the map and use the google map method .setMap(null) to remove it
  	for(var i = 0, max=allMarkers.length; i < max; i++ ) {
	  	allMarkers[i].setMap(null);
	  }
	  allMarkers = [];
  }
  
	// if all Markers variable contains any markers object, call the deleteAllMarkers function to remove it.
  if(allMarkers.length > 0){
	  deleteAllMarkers();
  }
  
	// Loop through our array of markers & place each one on the map
  for(var i = 0, max=m.length; i < max; i++ ) {
	  // create the position object
    var position = new google.maps.LatLng(m[i][2], m[i][3]);
    // create the mkr object from the marker param
    var mkr = new google.maps.Marker({
	        position: position,
	        map: map,
					animation: google.maps.Animation.DROP,
	        title: m[i][0],
	        ph: m[i][1],
	        pic: m[i][4],
	        blurb: m[i][5]
		    });
    // update allMarkers array variable with mkr object
    allMarkers.push(mkr);
 
		// Apply google maps event method to bind a mouseover event to the marker
		// on event, create and show info window using the makeInfoWindow Method
	  google.maps.event
	  .addListener(mkr, 'mouseover', (function(mk, i) {
      return function() {
        makeInfoWindow(mk);
      }
	  })(mkr, i));

		// Apply google maps event method to bind a mouse click event to the marker
		// on event, create and show info window using the makeInfoWindow Method
		// and animate the marker        	        
	  google.maps.event
	  .addListener(mkr, 'click', (function(mk, i){
			return function(){
	      makeInfoWindow(mk);
				toggleBounce(mk, i);
			}
		})(mkr, i));
  }

	// Animate the marker
	function toggleBounce(mk, i) {        		
	  var yelpMarkerDetailUl =  $('.yelp-list').find('ul'),
	  		yelpMarkerDetail = yelpMarkerDetailUl.find('li'),
	  		yelpMarkerDetailPos = 212 * i,
	  		activeYelpMarkerDetail = yelpMarkerDetail.eq(i);        
	  if (mk.getAnimation() != null) {
		  mk.setAnimation(null);
	    yelpMarkerDetailUl.removeClass('show');
	    activeYelpMarkerDetail.removeClass('active');
		// If marker does not have animation attribue         
	  } else {
			for(am in allMarkers){
				var isMoving = allMarkers[am].getAnimation();
				if(isMoving && am !== i){
					allMarkers[am].setAnimation(null);
				}
			}
			
			// Add the Bounce animation to the clicked marker         			
	    mk.setAnimation(google.maps.Animation.BOUNCE);
	    yelpMarkerDetailUl.addClass('show').animate({
		    scrollTop: yelpMarkerDetailPos
		  }, 300);
		  yelpMarkerDetailUl.find('.active').removeClass('active');
	    activeYelpMarkerDetail.addClass('active');
	  }
	}

	// Add click event to the yelp-list ul li dom       			
	$('.results').find('li').click(function(){
		var pos = $(this).index();
		for(am in allMarkers){
			var isMoving = allMarkers[am].getAnimation();
			if(isMoving && am !== pos){
				allMarkers[am].setAnimation(null);
			}
		}

		// Add the Bounce animation to the marker that corresponding to the clicked element index        					
		allMarkers[pos].setAnimation(google.maps.Animation.BOUNCE);
		makeInfoWindow(allMarkers[pos]);
		$('.results').find('.active').removeClass('active');
		$(this).addClass('active');
	});	
}

// This is the function that calls to yelp,
// updates the knockout data binds and creates the markers
function yelpAjax(searchNear, searchFor) {
	// API keys
	var auth = {
			    consumerKey : "_zjan_SWajarAwkgChyE7A",
			    consumerSecret : "wVzHhzcpJJ2DZBL5IMCdUlVLVzg",
			    accessToken : "wYt3Gh7-f3mjH2YfqX_-YCIrAsBWENjY",
			    accessTokenSecret : "GFf9Cz5AH5zlPtXDwLVOhunBa9k",
			};
	
	// Create a variable "accessor" to pass on to OAuth.SignatureMethod
	var accessor = {
	    consumerSecret : auth.consumerSecret,
	    tokenSecret : auth.accessTokenSecret
	};
	
	// Create a array object "parameter" to pass on "message" JSON object
	var parameters = [];
	parameters.push(['term', searchFor]);
	parameters.push(['location', searchNear]);
	parameters.push(['callback', 'cb']);
	parameters.push(['oauth_consumer_key', auth.consumerKey]);
	parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
	parameters.push(['oauth_token', auth.accessToken]);
	parameters.push(['oauth_signature_method', 'HMAC-SHA1']);
	
	// Create a JSON object "message" to pass on to OAuth.setTimestampAndNonce
	var message = {
	    'action' : 'http://api.yelp.com/v2/search',
	    'method' : 'GET',
	    'parameters' : parameters
	};
	
	// OAuth proof-of-concept using JS
	OAuth.setTimestampAndNonce(message);
	OAuth.SignatureMethod.sign(message, accessor);

	// OAuth proof-of-concept using JS
	var parameterMap = OAuth.getParameterMap(message.parameters);
	yJax(message.action, parameterMap);
}

// Ajax OAuth method to get yelp's data
function yJax(url, ydata){
	$.ajax({
		'url' : url,
		'data' : ydata,
		'dataType' : 'jsonp',
		'global' : true,
		'jsonpCallback' : 'cb',
		'success' : function(data){
			makeYelpList(data);
		}
	});
}

// Function to create the list from Yelp's API
function makeYelpList(d){
	// Create the variable 
	var $yelpList = $('.results');
			results = d.businesses,
			el = '';
			
	// Clear the yelpList to add new entries
	$yelpList.empty();

	// Create the markers Array object
	var markers = [];

	// If no data is returned				
	if(results.length > 0){	
	// Create the variable for to use in populating the ylep-list li Dom
		for (result in results){
			var business = results[result],
					name = business.name,
					img = business.image_url,
					ph = /^\+1/.test(business.display_phone) ? business.display_phone : '',
					url = business.url,
					stars = business.rating_img_url_small,
					rate = business.rating,
					loc = {
						lat: business.location.coordinate.latitude,
						lon: business.location.coordinate.longitude,
						address: business.location.display_address[0] + '<br>' + business.location.display_address[business.location.display_address.length - 1]
					},
					review = {
						img: business.snippet_image_url,
						txt: business.snippet_text
					};
					
			// Create the Dom object
			var makeEl = '<li><div class="heading row">';
			makeEl += '</p><div class="col-sm-12">';
			makeEl += '<h3>' + name + '</h3><p>';
			makeEl += '<span>' + loc.address + '</span></p>';
			makeEl += '<p><strong>' + ph + '</strong></p>';
			makeEl += '<p><a class="btn btn-warning btn-small" href="' + url + '" target="_blank">Yelp! Info</a></p>';
			makeEl += '</div></div></li>';
												
			el += makeEl;

			// Create the marker array object then add marker to the markers array object
	    var marker = [name, ph, loc.lat, loc.lon, review.img, review.txt];
	    markers.push(marker);
		}
		// Add the el to the yelp-list ul dom
		$yelpList.append(el);
		
		// Create the markers to place on the map											
		google.maps.event.addDomListener(window, 'load', addGoogleMapsMarkers(markers));
		
	// If no data is returned create an error message												
	} else {
		var searchedFor = $('input').val();
		$yelpList.addClass('open').append('<li><h3>Oh no! We can\'t seem to find anything on <span>' + searchedFor + '</span>.</h3><p>Trying searching something else.</p></li>');
		//	Clear the markers on the map
		google.maps.event.addDomListener(window, 'load', addGoogleMapsMarkers(markers));
	}
}

// Initialize the google maps function
initialize();

// Call the main yelp function
yelpAjax('84107', 'Dog Daycare');