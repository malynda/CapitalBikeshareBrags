CapitalBikeshareBrags
===========

This is a Chrome extension that lets you scrape, download, chart, and extend your Capital bikeshare data.

To use it, you need two things:

1. A Capital Bikeshare membership. (Get one here: https://capitalbikeshare.com/signup)
2. The Chrome browser. (Get it here: https://www.google.com/intl/en/chrome/browser/)

Load CapitalBikeshareBrags into your browser as an extension. Then navigate to your Trips page (https://capitalbikeshare.com/member/rentals). The extension will create a Capital Bikeshare Brags sidebar with three options: Calculate my Mileage, Download as CSV, and Chart My Data.

Each of the options triggers a javascript function in the background.js file.

**Calculate my Mileage** queries the Google Distance Matrix API with each of your trips to estimate the mileage logged. It displays high-level stats for the user, adds milage estmates to the CSV downloads, and enables the Chart function. The Google Distance Matrix API has a limit of 2,500 free calls per day, unfortunately.

**Download as CSV** builds a little CSV representation of your data and sends it to your Downloads folder. If you've calculated mileage, you get that data too.

**Chart My Data** uses highcharts.js to graph your miles logged per day and cumulative mileage.
