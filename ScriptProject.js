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
  var smartyStreetsToken = "Tr2dL8zZULmwYqfpMw3W";
  var smartyStreetsID = "a0c54500-b299-d806-f742-6e5b1e339615";

  // zillow api key
  var ZWSID = "X1-ZWz1hjdyrt1k3v_8fetn";

  // proxy because zillow doesn't accept CORS?
  var proxy = "https://cors-anywhere.herokuapp.com/";

  // test call
  var zip = "19143";
  governor(zip);

  // governor is the master function, will be triggered by user onclick event,
  // when they submit address. a function will need to be added to parse address forms
  // just works with zip code for now (currently hardcoded)
  function governor(zip) {
    zillowRunner(zip);
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
    zillowGetter();
  }

  // initiates the weather data process with user input info
  function weatherRunner(zip) {
    zipCaller(zip);
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

  // SAVE FOR LATER, needed to test error probing process
  // 400 ERROR test call
  // var testURL = "https://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GSOY&datatypeid=TAVG&locationid=FIPS:06115&startdate=2010-01-01&enddate=2018-01-01";
  // $.ajax({
  //   url: testURL,
  //   headers: { token: token },
  //   method: "GET"
  // }).then(function (response) {
  //   console.log(response);
  // });

  // this function gets the yearly temp avg data points for a county code
  // it then crunches the numbers down into a single yearly avg which is
  // pushed into the beginning of the TAVG array
  function noaaTAVG(FIPS, startYear, endYear, array) {
    var tavgURL =
      "https://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GSOY&datatypeid=TAVG&locationid=FIPS:"
      + FIPS + "&startdate=" + startYear + "-01-01&enddate=" + endYear + "-01-01";
    $.ajax({
      url: tavgURL,
      headers: { token: NOAAtoken },
      method: "GET",
      success: function (response) {
        ajaxDataMaker(response, array);
      }
    });
  }

  // this function gets the yearly temp maximum data points for a county code
  // it then crunches the numbers down into a single yearly avg which is
  // pushed into the beginning of the TMAX array
  function noaaTMAX(FIPS, startYear, endYear, array) {
    var tmaxURL =
      "https://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GSOY&datatypeid=TMAX&locationid=FIPS:"
      + FIPS + "&startdate=" + startYear + "-01-01&enddate=" + endYear + "-01-01";
    $.ajax({
      url: tmaxURL,
      headers: { token: NOAAtoken },
      method: "GET"
    }).then(function (response) {
      ajaxDataMaker(response, array);
    });
  }

  // this function gets the yearly precipitation total data points for a county code
  // it then crunches the numbers down into a single yearly avg which is
  // pushed into the beginning of the PRCP array
  function noaaPRCP(FIPS, startYear, endYear, array) {
    var prcpURL =
      "https://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GSOY&datatypeid=PRCP&locationid=FIPS:"
      + FIPS + "&startdate=" + startYear + "-01-01&enddate=" + endYear + "-01-01";
    $.ajax({
      url: prcpURL,
      headers: { token: NOAAtoken },
      method: "GET"
    }).then(function (response) {
      ajaxDataMaker(response, array);
    });
  }

  // this function is called by the noaa functions
  // it gets all the data points for a year, then averages them
  // then pushes them to the beginning of the respective array
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
  function backTracker(FIPS) {
    var TAVG = [];
    var TMAX = [];
    var PRCP = [];
    var startYear = getYear() - 2;
    // should take start year from getNow year - 2;
    // need to go backwards until error.....
    // should backwards loop be separate function?
    for (var i = 0; i < 10; i++) {
      var endYear = startYear + 1;
      noaaTAVG(FIPS, startYear, endYear, TAVG);
      noaaTMAX(FIPS, startYear, endYear, TMAX);
      noaaPRCP(FIPS, startYear, endYear, PRCP);
      startYear--;
    }
    // logs should be deleted at some point
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

  // zillow api key
  var ZWSID = "X1-ZWz1hjdyrt1k3v_8fetn";

  // need a function that can parse the user input into a string with '+' instead of a space

  function zillowGetter() {
    // // proxy because zillow doesn't accept CORS?
    // var proxy = "https://cors-anywhere.herokuapp.com/";
    var zillowURL = "https://www.zillow.com/webservice/GetSearchResults.htm?zws-id="
      + ZWSID + "&address=4922+Warrington+Ave&citystatezip=Philadelphia%2C+PA+19143";
    $.ajax({
      url: proxy + zillowURL,
      method: "GET"
    }).then(function (response) {
      var JSONresponse = xmlToJson(response);
      console.log(JSONresponse);
    });
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

