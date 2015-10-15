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
  window.month_names = ["January", "February", "March", "April", "May", "June", "July","August", "September", "October", "November", "December"]
  window.years = ["2013", "2014", "2015", "2016"]


	var content_html = "";
	var counter = 0;
  // Scrape the trips info table
  function scrapeBikeshareData() {

			var numTrips = $('.ed-panel__info__value_member-stats')[0].innerText;
			var duration = $('.ed-panel__info__value_member-stats')[1].innerText;
			var distance = $('.ed-panel__info__value_member-stats')[2].innerText;

    var trip_data = { "numTrips" : numTrips, "duration" : duration, "distance" : distance };
     window.my_bikeshare_data.push(trip_data);


		window.total_milage = distance;
		window.total_time = duration;
		window.num_trips = numTrips;

  }
  scrapeBikeshareData();

  // Create bikesharebrags sidebar menu
  content_html += "<br/><div id='bikesharebrags'>";
  content_html += "<div id='toggle-bikesharebrags'>X</div><br/><br/>";
  content_html += "<div id='bikesharebrags-body'>";
  content_html += "<h2>CaBiBrags</h2><br/><br/>";
  // if (window.one_trip_month == false && window.zero_trips_month == false){
    var loader_img = chrome.extension.getURL("ajax-loader.gif");    // Loading gif animation
     content_html += "<p id='calculate-my-milage' class='bikesharebrags-option'>Get Mileage for Bragging</p>";
    content_html += "<p id='milage-note'></p>";
    content_html += "<p id='brag-toggle' class='bikesharebrags-option'>Brag</p>";
    content_html += "<p id='brag-area'></p>";
    content_html += "<p id='leaderboard-toggle' class='bikesharebrags-option'>The Leaderboard</p>";
    content_html += "<p id='leaderboard'></p>";
  content_html += "</div></div>";

  $('#contentContainer').after(content_html);

  $('table').before("<div id='chart-area'></div><div id='chart-area-margin'></div>");

  // window.total_milage = 0;
  window.trips_calculated = 0;


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

  // // This runs automatically once data is loaded
   function calculateMyMilage() {
			postResults();
   };


  function handleNoMilageRow(i) {
    window.my_bikeshare_data[i]["milage"] = 0;
    window.trips_calculated += 1;
    $('#milage-note').html(String(window.trips_calculated) + " out of " + String(window.my_bikeshare_data.length) + " trips calculated.");
    if (window.trips_calculated === window.my_bikeshare_data.length) {
      postResults(window.total_milage);
    }
  }


  // Display milage results in the sidebar
  function postResults() {
    notice_area_html = "<p class='notice-area-text'>Number of trips: " + window.num_trips;

    notice_area_html += "</p><p class='notice-area-text'>Time Biking: " + window.total_time + "</p>";
    notice_area_html += "<p class='notice-area-text'>Approximate distance traveled: <span id='total-milage'>" + window.total_milage + "</span></p>";
    $('#calculate-my-milage').html("My stats");
    $('#calculate-my-milage').attr("style","text-decoration: underline;");
    $('#calculate-my-milage').after(notice_area_html);
    if (window.small_trips > 0) {
      var milage_note_html = "* There are " + window.my_bikeshare_data.length + " rows in your data table, but ";
      milage_note_html += window.small_trips + " of these are micro-trips under 60 seconds.";
      $('#milage-note').html(milage_note_html);
    }
    $('#loading-gif').remove();
    window.milage_calculated = true;
  }

  // Read the big CSV file of distances and store in window.lines
  function processData(allText) {
    var allTextLines = allText.split(/\r\n|\n/);
    var headers = allTextLines[0].split(',');
    var lines = [];

    for (var i = 1; i < allTextLines.length; i++) {
        var data = allTextLines[i].split(',');
        if (data.length == headers.length) {
            var tarr = {};
            for (var j = 0; j < headers.length; j++) {
                tarr[headers[j]] = data[j];
            }
            lines.push(tarr);
        }
    }
    window.lines = lines;
    calculateMyMilage();
  }

  Date.prototype.addDays = function(days) {
    var dat = new Date(this.valueOf())
    dat.setDate(dat.getDate() + days);
    return dat;
  }


  $('#calculate-my-milage').click(function() {
    calculateMyMilage();
  });

  $('#brag-toggle').click(function() {
    // Let's check if we have a milage value calculated before we let the user go bragging about it
    if (window.milage_calculated !== true) {
      $('#brag-area').html("Please calculate your mileage first. <br/> Then we can brag about it!");
      return
    } else {
      var twitter_img = chrome.extension.getURL("twitter_logo_white.png");
      var star_img = chrome.extension.getURL("star_icon_white.png");
      var tweet_it_html = "<a class='bragging-type-option' target='_blank' href='";
      tweet_it_html += "https://twitter.com/share?text=My bikeshare stats:%20" + window.num_trips + "%20trips. " + window.total_time + ".%20" + window.total_milage + "%20miles.%20via&url=http://cabibrags.com/&hashtags=CaBiBrags,bikeDC,bikeshare";
      tweet_it_html += "'><img src='" + twitter_img + "' width='48px' height='48px'/><br/>";
      tweet_it_html += "Tweet It</a>";
      var brag_html = "<a id='post-to-leaderboard' class='bragging-type-option'>";
      brag_html += "<img src='" + star_img + "' width='48px' height='48px'/><br/>";
      brag_html += "<span id='post-to-leaderboard-title'>Post To Leaderboard</span></a><span id='username-area'></span><br/><br/><br/>";
      brag_html += tweet_it_html
      if (window.posted_to_leaderboard === false) {
        $('#brag-area').html(brag_html);
      } else {
        $('#brag-area').html(tweet_it_html);
      }
    }
  });

  $('#post-to-leaderboard').livequery(function() {
      $(this).click(function() {
        var total_milage = window.total_milage;
        enter_leaderboard_name_html = "Enter your name as you'd like it to appear on the Leaderboard: <br/><input id='username-input' type='text' style='width: 140px'/>";
        enter_leaderboard_name_html += "<br/><a id='post-it-name-status' class='bikesharebrags-option'><i>Post to Leaderboard</i></a>";
        $('#username-area').html(enter_leaderboard_name_html);
        $('#post-to-leaderboard').html("");
      });

  });

  $('#post-it').livequery(function() {
    $(this).click(function() {
      postIt();
    });
  });


  function checkName(user_name){
    var leaderboard_text = $('div#bikesharebrags p#leaderboard').text();
    var yes_read = false;
    var br_flag = false;

		if (leaderboard_text.indexOf(user_name)!= -1){
			if (confirm('This username has already been added to the leaderboard. \n If this is your username and you want to update your mileage, click "Cancel" \n If you want to change this username, click "OK"')) {
				var new_name = prompt("Please enter a new username", "");
				$('#username-input').val(new_name);
				return checkName(new_name);
			} else {
				return true;
			}
		}
     else {
			return false;
		}
  }

	function getUserName(){
		if (window.username === null || window.username == undefined) {
			var user_name = $('#username-input').val();
		} else {
			var user_name = window.username;
		}
		return user_name
	}


  $('#post-it-name-status').livequery(function() {
    $(this).click(function() {
      postIt();
    });
  });


  function postIt() {
    var total_milage = window.total_milage;
		var update_flag = checkName(getUserName());
		var user_name = getUserName();
		total_milage = total_milage.substring(0,total_milage.length-6);
    $.ajax({
      type: "POST",
      url: "https://shielded-coast-7617.herokuapp.com/new_entry",
      data: { leaderboard_post: {flag: update_flag, name: user_name, miles: total_milage, city: "DC" } },
      success: function(data) {
					populate_leaderboard();
        $('#username-area').html("");
        window.posted_to_leaderboard = true;
      }
    });
  }


  // // Show/hide the sidebar
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
