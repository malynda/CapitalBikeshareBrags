$(function() {

	window.my_bikeshare_data = [];
	var total_trips = 0;
	window.calculating = false;
	window.showing_sidebar = true;
	window.posted_to_leaderboard = false;
	window.time_in_seconds = 0;
	window.small_trips = 0;
	window.one_trip_month = false;
	window.zero_trips_month = false;


	var content_html = "";
	var counter = 0;
	// Scrape the trips info table
	function scrapeBikeshareData() {
		var numRecords = $('.ed-table__item').length;
		for (i = 0; i < numRecords / 2; i += 1)
		{
			var start_date = $('.ed-table__item__info_trip-start-date')[i].innerText;
			start_date = start_date.replace("Start ", "");
			// var start_inf = start_date.split(" ");
			// var date_s = start_inf[0];
			// var time_s = start_inf[1];
			var start_station = $('.ed-table__item__info_trip-start-station')[i].innerText;
			var end_station = $('.ed-table__item__info_trip-end-station')[i].innerText;
			var end_date = $('.ed-table__item__info_trip-end-date')[i].innerText;
			end_date = end_date.replace("End ", "");
			// var end_inf = end_date.split(" ");
			// var date_e = end_inf[0];
			// var time_e = end_inf[1];
			var duration = $('.ed-table__item__info_trip-duration')[i].innerText;
			duration = duration.replace("Duration ", "")
			var distance = $('.ed-table__item__info_trip-distance')[i].innerText;
			distance = distance.replace("Distance ", "").replace("miles", "");
			distance = parseInt(distance);
			var trip_data = {"start_date" : start_date, "end_date" : end_date, "duration" : duration, "distance" : distance};
			window.my_bikeshare_data.push(trip_data);
		}

		if (window.my_bikeshare_data.length > 1){

		}else if (window.my_bikeshare_data.length == 1){
			window.one_trip_month = true;
		} else {
			window.zero_trips_month = true;
		}

	}
	scrapeBikeshareData();
	window.mileage_calculated = true;
	window.total_mileage = 0;
	window.trips_calculated = 0;
	// addMileageForGraph();
      // Create the chart when we post results!

	function populate_leaderboard(){
		$.ajax({
			type: "GET",
			url: "https://shielded-coast-7617.herokuapp.com/entries.json?city=DC",
			success: function(data) {
				leaderboard_html = "";
				$('#leaderboard').empty();
				var leaderboard = data
				for (var i = 0; i <= leaderboard.length - 1; i++) {
					for (var i = 0; i <= data.length - 1; i++) {
						var leaderboard_entry = data[i];
						var leaderboard_position = Object.keys(leaderboard_entry)[0];
						var name = leaderboard_entry[leaderboard_position]["name"];
						var miles = leaderboard_entry[leaderboard_position]["miles"];

						// window.username = name;
						var entry_html = leaderboard_position + ". " + name + ": " + miles + "mi<br/>";
						$('#leaderboard').append(entry_html);
					}
				}
			}
		});
	}


	populate_leaderboard();



	function roundTenths(number) {
		return parseInt(number * 10) / 10
	}

	// Create bikesharebrags sidebar menu
	content_html += "<br/><div id='bikesharebrags'>";
	content_html += "<div id='toggle-bikesharebrags'>X</div><br/><br/>";
	content_html += "<div id='bikesharebrags-body'>";
	content_html += "<h1>CaBiBrags</h1><br/><br/>";
	if (window.one_trip_month == false && window.zero_trips_month == false){
		content_html += "<p id='mileage-note'></p>";

		content_html += "<p id='make-chart' class='bikesharebrags-option'>Chart My Data</p>";
		content_html += "<p id='chart-making-status'></p>";
		content_html += "<p id='download-csv' class='bikesharebrags-option'>Download as CSV</p>";

		content_html += "<p id='leaderboard-toggle' class='bikesharebrags-option'>The Leaderboard</p>";
		content_html += "<p id='leaderboard'></p>";
	} else if (window.one_trip_month == true) {
		content_html += "<br/><br/><h5>Only one trip on this page?.<br/><br/>Not much to graph here, honestly. </h5>";
	} else if (window.zero_trips_month == true){
		content_html += "<br/><br/><h5>You haven't taken any trips yet?.</h5>";
		content_html += "<br/><br/><br/><h2 style ='font-size: 50px'>&#9785;</h2>"; //sad face
	}
	content_html += "</div></div>";

	$('#contentContainer').after(content_html);

	$('.ed-profile-page').before("<div id='chart-area'></div><div id='chart-area-margin'></div>");




	function addMileageForGraph(){
		var mileage = 0;
		for (k = 0; k < window.my_bikeshare_data.length; k++) {
			mileage += parseInt(window.my_bikeshare_data[k]["distance"]);

			window.my_bikeshare_data[k]["mileage"] = mileage;
			window.total_mileage += mileage;
			window.trips_calculated += 1;
		}
		// When there are no more trips to calculate, post the results in the notice area of the bikesharebrags sidebar
		if (trips_calculated === window.my_bikeshare_data.length) {
			makeChart();
		}
	}


	function handleNomileageRow(i) {
		window.my_bikeshare_data[i]["mileage"] = 0;
		window.trips_calculated += 1;
		$('#mileage-note').html(String(window.trips_calculated) + " out of " + String(window.my_bikeshare_data.length) + " trips calculated.");
		if (window.trips_calculated === window.my_bikeshare_data.length) {
			postResults(window.total_mileage);
		}
	}


	// // Display mileage results in the sidebar
	// function postResults(total_mileage) {
	// 	window.total_mileage = roundTenths(total_mileage);
	// 	window.number_of_trips = window.my_bikeshare_data.length - window.small_trips;
	// 	window.total_hours = Math.floor(window.time_in_seconds/3600);
	// 	window.remainder_minutes = Math.floor((window.time_in_seconds % 3600)/60);
	// 	window.remainder_seconds = (window.time_in_seconds % 3600) % 60;
	// 	notice_area_html = "<p class='notice-area-text'>Number of trips: " + window.number_of_trips;
	// 	if (window.small_trips > 0) {
	// 		notice_area_html += "*"
	// 	}
	// 	notice_area_html += "</p><p class='notice-area-text'>Time Biking: " + window.total_hours + "h, " + window.remainder_minutes + "m, " + window.remainder_seconds + "s</p>";
	// 	notice_area_html += "<p class='notice-area-text'>Approximate distance traveled: <span id='total-mileage'>" + window.total_mileage + "</span>mi</p>";
	// 	$('#calculate-my-mileage').html("My "+ window.this_month +" stats");
	// 	$('#calculate-my-mileage').attr("style","text-decoration: underline;");
	// 	$('#calculate-my-mileage').after(notice_area_html);
	// 	if (window.small_trips > 0) {
	// 		var mileage_note_html = "* There are " + window.my_bikeshare_data.length + " rows in your data table, but ";
	// 		mileage_note_html += window.small_trips + " of these are micro-trips under 60 seconds.";
	// 		$('#mileage-note').html(mileage_note_html);
	// 	}
	// 	$('#loading-gif').remove();
	//
	//
	// }

	// // Read the big CSV file of distances and store in window.lines
	// function processData(allText) {
	// 	var allTextLines = allText.split(/\r\n|\n/);
	// 	var headers = allTextLines[0].split(',');
	// 	var lines = [];
	//
	// 	for (var i = 1; i < allTextLines.length; i++) {
	// 		var data = allTextLines[i].split(',');
	// 		if (data.length == headers.length) {
	// 			var tarr = {};
	// 			for (var j = 0; j < headers.length; j++) {
	// 				tarr[headers[j]] = data[j];
	// 			}
	// 			lines.push(tarr);
	// 		}
	// 	}
	// 	window.lines = lines;
	//
	// }

	Date.prototype.addDays = function(days) {
		var dat = new Date(this.valueOf())
		dat.setDate(dat.getDate() + days);
		return dat;
	}

	function getDates(startDate, stopDate) {
		var dateArray = new Array();
		var currentDate = new Date(startDate);
		while (currentDate <= stopDate) {
			dateArray.push( new Date (currentDate) )
			currentDate.setDate(currentDate.getDate() +1);
		}
		return dateArray;
	}

	function makeChart() {
		var additive_mileage_array = [];
		var daily_mileage_array = [];
		var cumulative_mileage_array = [0];
		var dates_with_trips = [];
		var last_cumulative_miles = 0;
		var mileage_calculated = false;

		for (var i = 0; i < window.my_bikeshare_data.length; i++) {
			if (window.my_bikeshare_data[i]["distance"] !== undefined) {
				mileage_calculated = true;
			}
		}

		if (mileage_calculated === false) {
			$('#chart-making-status').html("Please calculate your mileage first. We'll use that data to create a chart for you.");
			return
		}

		// Generating an array with all the dates between user's first bikeshare ride and user's most recent bikeshare ride
		first_date = parseDate(window.my_bikeshare_data[window.my_bikeshare_data.length - 1]["start_date"]);
		last_date = parseDate(window.my_bikeshare_data[0]["start_date"]);
		date_array = getDates(first_date, last_date);

		function parseDate(aDate){
			aDate = aDate.split(' ')[0]
			aDate = new Date(aDate)
			return aDate
		}

		// Stuff arrays with data representing daily trip miles and cumulative trip miles...
		for (var j = 0; j < date_array.length; j++) {
			mileage_present = false;

			// Check to see if the user took bike rides on any given day. If so, add up miles
			for (var i = 0; i < window.my_bikeshare_data.length; i++) {
				trip = window.my_bikeshare_data[i];

				this_trip_date = parseDate(trip["start_date"]);
				if (this_trip_date.getTime() === date_array[j].getTime()) {
					mileage_present = true;
					if (dates_with_trips.indexOf(this_trip_date.getTime()) === -1) {
						dates_with_trips.push(this_trip_date.getTime());
						daily_mileage_array.push(roundTenths(trip["distance"]));
						last_cumulative_miles = cumulative_mileage_array[cumulative_mileage_array.length -1]

						cumulative_mileage_array.push(last_cumulative_miles + roundTenths(trip["distance"]));

					} else {
						daily_mileage_array[daily_mileage_array.length - 1] = roundTenths(trip["distance"] + daily_mileage_array[daily_mileage_array.length - 1])
						cumulative_mileage_array[cumulative_mileage_array.length -1] = roundTenths(trip["distance"] + cumulative_mileage_array[cumulative_mileage_array.length -1])
					}
				}
			}

			if (mileage_present === false) {
				daily_mileage_array.push(0);
				last_cumulative_miles = cumulative_mileage_array[cumulative_mileage_array.length -1]
				cumulative_mileage_array.push(last_cumulative_miles);
			}
		}
		cumulative_mileage_array.shift();

		function formatDate(date) {
			return String(date.getMonth() + 1) + "/" + String(date.getDate()) + "/" + String(date.getFullYear());
		}

		var formatted_dates = date_array.map(formatDate);
		var number_of_steps = parseInt(formatted_dates.length / 10) + 1;
		$('#chart-area').highcharts({
			chart: { type: 'column' },
			title: { text: 'CaBi Graph' },
			xAxis: {
				categories: formatted_dates,
				labels: { maxStaggerLines: 1, rotation: 315, step: number_of_steps }
			},
			yAxis:
			[{
				title: { text: 'Miles This Day', style: { color: '#FF0000' } },
				labels: { style: { color: '#FF0000' } }
			},
			{
				title: { text: 'Total Miles Biked with CaBi', style: { color: '#000000' } },
				labels: { style: { color: '#000000' } },
				opposite: true,
				min: 0,
			}],
			plotOptions: {
				spline: {
					marker: {
						enabled: false
					}
				}
			},
			series: [
				{ type: 'column', name: 'Miles This Day', data: daily_mileage_array, color: '#FF0000'},
				{ type: 'spline', name: 'Total Miles For This Page', data: cumulative_mileage_array, color: '#000000', yAxis: 1 }
			],
			credits: false
		});

		$('#chart-area-margin').html("<br/><br/><br/>");

	}

	function downloadCSV() {
		var csvContent = "data:text/csv;charset=utf-8,";
		csvContent += "Start Date,End Date,Duration,Approximate Mileage\n"
		window.my_bikeshare_data.forEach(function(trip) {
			csvContent += (trip["start_date"] + "," + trip["end_date"] + "," + trip["duration"] + "," + trip["distance"] +"\n" );
		});
		var encodedUri = encodeURI(csvContent);
		window.open(encodedUri);
	};


	$('#download-csv').click(function() {
		downloadCSV();
	});

	$('#make-chart').click(function() {
		makeChart();
	});


	//
	// Show/hide the sidebar
	$('#toggle-bikesharebrags').click(function() {
		if (window.showing_sidebar === true) {
			$('#bikesharebrags').animate({ height: "35px", width: "35px" });
			$(this).html("&#8601;");
			window.showing_sidebar = false;
		} else {
			$('#bikesharebrags').animate({ height: "100%", width: "240px" });
			$(this).html("X");
			window.showing_sidebar = true;
		}
	});

});
