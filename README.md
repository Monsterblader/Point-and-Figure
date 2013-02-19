Point-and-Figure Charting
======

#What is point-and-figure Charting?

For an explanation and brief tutorial, go here:
http://en.wikipedia.org/wiki/Point_and_figure_chart

My first major program.  This will create point-and-figure charts based on the user's input.  It gets the price data from ichart.yahoo.com, and the financial data comes from finance.yahoo.com.

I wrote it in Javascript, using HTML and CSS.  I wrote it on the meteor framework, which, though the way it's set up caused me some problems, was a joy to use because the way it handles overhead made getting to the good stuff so much easier.

## Running the program

Try it on Monsterblader.meteor.com

--OR--

You must have meteor installed on your local host to run this program.  (www.meteor.com)
Clone the project.
Change to the Point-and-Figure directory.
Run "meteor."
Direct your browser to localhost:3000.

## Using the program

There is one input field where the user is expected to enter a ticker symbol of a company that ichart.yahoo.com tracks.  The input is not sanitized nor validated.  The server will then retrieve closing prices from the past 60 days and create and display a chart.  It will also retrieve some basic metrics related to the stock price and display them.

Once the user presses enter in the input field or presses the go button with a non-"" entry, a tab with the ticker symbol is created above the chart, the selection is counted, and the "Trending" pull-down menu is updated.  The menu contains a list of all of the user-selected stocks, sorted by stocks' popularity.  Selecting a stock from the tab or from the Trending menu will display that stock's chart and information.

## Dependencies

ichart.yahoo.com
finance.yahoo.com
The meteor development environment.  (www.meteor.com)

## Wish list

The point-and-figure algorithm is not actually the complete one.  I want to write that correctly.
Implement the Sector menu.
Incorporate trend lines.  Either automatic ones or ones that the user can create and save.

#Credits

Thanks to Catalyst Class, especially Shawn and Jonathan, for making key elements of this project work, enabling me to spend useful time building this project.
