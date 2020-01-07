
// TODO


// write onClick event for a submit button

// write form value jQuery targets, possibly write a function that creates an address object?

// figure out units of measurement for the 3 differnet statistics (TAVG, TMAX, PRCP) (max can do that)

// graphing api/library function should be written, will probably be called at 
// the end of backTracker(), which produces those three arrays of data averages.
// probably use the three arrays as arguments into a master graphing function

// figure out what properties of the zillow object we want to work with, access and 
// create html appropriately. 

// figure out timing issue w/ ajax calls... (mostly for max)
// two main issues: 
// 1) delay in the calls to avoid rate limit errors causes serious lag in the load of 
// the weather data. currently resolved by just using the error path to repeat the call.
// not sure if that is a viable long term solution....
// 2) whatever function those arrays will be sent to will most likely be called before the 

// ajax recursion is finished....

$(document).ready(function () {

// ajax recursion is finished.... comment some love
$(document).ready(function() {

  $("#submit").on("click", function(event){

    event.preventDefault();
    var zip = $("#zip").val().trim();
    //var address = $("#address").val().trim();
    console.log(zip);
    alert("hi");
  });


  // the NOAA API is where all of weather data comes from
  var NOAAtoken = "OBzsTvSdeIEAZDdTInysIDJSVQZdhKtx";

  // smartyStreets API is what we'll use to convert a zip code query from user into the
  // county FIPS code needed for the NOAA queries
  // we only get 250/month for free, so use sparingly when testing!!!
  var smartyStreetsToken = "Tr2dL8zZULmwYqfpMw3W";
  var smartyStreetsID = "a0c54500-b299-d806-f742-6e5b1e339615";

  // zillow api key
  var ZWSID = "X1-ZWz1hjdyrt1k3v_8fetn";

  // proxy because zillow doesn't accept CORS?
  var proxy = "https://cors-anywhere.herokuapp.com/";

  // test call, check console for results
  var zip = "19143";
  governor(zip);

  // governor is the master function, will be triggered by user onclick event,
  // when they submit address. a function will need to be added to parse address forms
  // just works with zip code for now (currently hardcoded)
  // eventually, the address will need to be passed into the governor(), i recommend
  // creating an object from the user form, and then calling governor like:
  // governor(object)
  function governor(zip) {
    // this will probably change to: zillowRunner(weatherObject)
    zillowRunner(zip);
    // this will probably change to: weatherRunner(addressObject.zip)
    weatherRunner(zip);
  }

  // returns the 4 character string for the current year.
  // this return is used by backTracker() to have a year
  // to work backwards from
  function getYear() {
    var now = parseInt(moment().format('YYYY'));
    return now;
  }

  // initiates the zillow process with user input info
  function zillowRunner(zip) {
    zillowGetter(zip);
  }

  // initiates the weather data process with user input info
  function weatherRunner(zip) {
    // we only get 250/month for free, so use sparingly when testing!!!
    // zipCaller(zip); // avoiding zipCaller for now to not max out API calls!!

    // use below call to skip the zipCaller() until it is absolutely needed, then
    // delete backTracker() call, and unComment out the zipCaller() call above
    backTracker("42101");
  }

  // queries smartyStreets API with zip code from user, passes
  // the FIPS code pulled from the ajax response into backTracker()
  function zipCaller(zip) {
    var zipQueryUrl
      = "https://us-zipcode.api.smartystreets.com/lookup?auth-id=" + smartyStreetsID +
      "&auth-token=" + smartyStreetsToken + "&zipcode=" + zip;
    $.ajax({
      url: zipQueryUrl,
      method: "GET",
      success: function (response) {
        backTracker(response[0].zipcodes[0].county_fips);
      }
    })
  }

  // this function gets the yearly temp avg data points for a county code
  // it then crunches the numbers down into a single yearly avg which is
  // pushed into the beginning of the TAVG array
  function noaaTAVG(FIPS, startYear, array, callCount, errorCount) {
    if (callCount >= 40) {
      return;
    }
    else if (errorCount >= 1000) {
      return;
    }
    var endYear = startYear + 1;
    var tavgURL =
      "https://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GSOY&datatypeid=TAVG&locationid=FIPS:"
      + FIPS + "&startdate=" + startYear + "-01-01&enddate=" + endYear + "-01-01";
    $.ajax({
      url: tavgURL,
      headers: { token: NOAAtoken },
      method: "GET",
      success: function (response) {
        ajaxDataMaker(response, array);
        startYear--;
        callCount++;
        noaaTAVG(FIPS, startYear, array, callCount, errorCount);
      },
      error: function () {
        errorCount++;
        noaaTAVG(FIPS, startYear, array, callCount, errorCount);
      }
    })
  }

  // this function gets the yearly temp maximum data points for a county code
  // it then crunches the numbers down into a single yearly avg which is
  // pushed into the beginning of the TMAX array
  // on successful call, calls itself recursively, avoids 429 errors this way
  function noaaTMAX(FIPS, startYear, array, callCount) {
    if (callCount >= 40) {
      return;
    }
    else if (errorCount >= 1000) {
      return;
    }
    var endYear = startYear + 1;
    var tmaxURL =
      "https://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GSOY&datatypeid=TMAX&locationid=FIPS:"
      + FIPS + "&startdate=" + startYear + "-01-01&enddate=" + endYear + "-01-01";
    $.ajax({
      url: tmaxURL,
      headers: { token: NOAAtoken },
      method: "GET",
      success: function (response) {
        ajaxDataMaker(response, array);
        startYear--;
        callCount++;
        noaaTMAX(FIPS, startYear, array, callCount, errorCount);
      },
      error: function () {
        errorCount++;
        noaaTMAX(FIPS, startYear, array, callCount, errorCount);
      }
    })
  }

  // this function gets the yearly precipitation total data points for a county code
  // it then crunches the numbers down into a single yearly avg which is
  // pushed into the beginning of the PRCP array
  // on successful call, calls itself recursively, avoids 429 errors this way
  function noaaPRCP(FIPS, startYear, array, callCount, errorCount) {
    if (callCount >= 40) {
      return;
    }
    else if (errorCount >= 1000) {
      return;
    }
    var endYear = startYear + 1;
    var prcpURL =
      "https://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GSOY&datatypeid=PRCP&locationid=FIPS:"
      + FIPS + "&startdate=" + startYear + "-01-01&enddate=" + endYear + "-01-01";
    $.ajax({
      url: prcpURL,
      headers: { token: NOAAtoken },
      method: "GET",
      success: function (response) {
        ajaxDataMaker(response, array);
        startYear--;
        callCount++;
        noaaPRCP(FIPS, startYear, array, callCount, errorCount);
      },
      error: function () {
        errorCount++;
        noaaPRCP(FIPS, startYear, array, callCount, errorCount);
      }
    })
  }

  // this function is called by the noaa functions
  // it gets all the data points for a year, then averages them
  // then pushes them to the beginning of the respective array
  // on successful call, calls itself recursively, avoids 429 errors this way
  function ajaxDataMaker(response, array) {
    var yearResults = [];
    // forEach?
    for (var i = 0; i < response.results.length; i++) {
      yearResults.push((response.results[i].value));
    }
    var yearResultsAvg = yearAvg(yearResults);
    arrayMaker(yearResultsAvg, array);
  };

  // backTracker takes the FIPS argument and works backwards through time,
  // calling the ajax caller functions to add data for each year.
  // really important function!
  function backTracker(FIPS) {
    var TAVG = [];
    var TMAX = [];
    var PRCP = [];
    var startYear = getYear() - 2;

    noaaTAVG(FIPS, startYear, TAVG, 0, 0);
    noaaTMAX(FIPS, startYear, TMAX, 0, 0);
    noaaPRCP(FIPS, startYear, PRCP, 0, 0);

    // these logs should be deleted eventually!
    console.log(TAVG);
    console.log(TMAX);
    console.log(PRCP);
  }

  // just adds a value to an array, at index[0], and shifts the rest back
  function arrayMaker(value, array) {
    array.unshift(value);
  }

  // averages all the values in the array using reduce();
  function yearAvg(array) {
    // need to understand following syntax better
    let sum = array.reduce((previous, current) => current += previous);
    let arrayAvg = sum / array.length;
    return arrayAvg;
  }

  // zillow stuff

  // this function creates the url and does the ajax call to the Zillow API
  function zillowGetter(zip) {
    // var address = spaceToPlusParser(jQuery call goes here);
    // var city = spaceToPlusParser(jQuery call goes here);
    // var stateInitials = spaceToPlusParser(jQuery call goes here);
    // var zillowUrl = "https://www.zillow.com/webservice/GetSearchResults.htm?zws-id="
    //  + ZWSID + "&address=" + address + "&citystatezip=" + city + "%2C+" + stateInitials +  "+" + zip;

    // once forms are created and jQuery values are gotten, replace below URL with the 
    // commented out syntax above (should be correct, double check though)
    var zillowURL = "https://www.zillow.com/webservice/GetSearchResults.htm?zws-id="
      + ZWSID + "&address=4922+Warrington+Ave&citystatezip=Philadelphia%2C+PA+19143";
    $.ajax({
      // proxy because zillow doesn't accept CORS?
      url: proxy + zillowURL,
      method: "GET"
    }).then(function (response) {
      var JSONresponse = xmlToJson(response);
      // comment this log out eventually!
      console.log(JSONresponse);
      return JSONresponse;
    });
  }

  // use this function to parse the string inputs from the form that the user fills out
  // with their address
  // URLs cannot take spaces, so this will replace every ' ' character within a string
  // with a '+', which is URL friendly. Ajax calls will fail if this is not done!
  function spaceToPlusParser(str) {
    var parsedString = str.replace(/ /g, '+');
    return parsedString;
  }

  // NOTE! the following function is copied verbatim from this website:
  // https://davidwalsh.name/convert-xml-json
  // the zillow API returns xml as default. until i can figure out the proper
  // way to call for a JSON output, I will use this function to convert the
  // XML to JSON for ease of access/traversing

  // Changes XML to JSON
  function xmlToJson(xml) {

    // Create the return object
    var obj = {};

    if (xml.nodeType == 1) { // element
      // do attributes
      if (xml.attributes.length > 0) {
        obj["@attributes"] = {};
        for (var j = 0; j < xml.attributes.length; j++) {
          var attribute = xml.attributes.item(j);
          obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
        }
      }
    } else if (xml.nodeType == 3) { // text
      obj = xml.nodeValue;
    }

    // do children
    if (xml.hasChildNodes()) {
      for (var i = 0; i < xml.childNodes.length; i++) {
        var item = xml.childNodes.item(i);
        var nodeName = item.nodeName;
        if (typeof (obj[nodeName]) == "undefined") {
          obj[nodeName] = xmlToJson(item);
        } else {
          if (typeof (obj[nodeName].push) == "undefined") {
            var old = obj[nodeName];
            obj[nodeName] = [];
            obj[nodeName].push(old);
          }
          obj[nodeName].push(xmlToJson(item));
        }
      }
    }
    return obj;
  };

});

