// create knockout model to bind to the search element											
function yelpBusinessViewModel() {
  var self = this;

	// set the bind-data to the search field
	self.searchTerm = ko.observable('Dog Daycare');

	// function to update the view model
	self.updateYelpResults = function(){
		// return the updated data from the search field
		// then run the ajax function to create the yelp list
		ko.computed(function(){
			yelpAjax('84107', self.searchTerm());
		}, self);
	}	
}

// Start knockout dependency tracking
ko.applyBindings(new yelpBusinessViewModel());