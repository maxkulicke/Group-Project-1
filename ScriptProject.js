$(document).ready(function () {

  $("#main-form-2").hide();
  $(".zillowLink").hide();
  // the NOAA API is where all of weather data comes from
  var NOAAtokenMax = "OBzsTvSdeIEAZDdTInysIDJSVQZdhKtx";
  var NOAAtokenAdrian = "fuZeuwvpqkvLmzuxfUtEkCXZjBGBtsUF";

  // smartyStreets API is what we'll use to convert a zip code query from user into the
  // county FIPS code needed for the NOAA queries
  // we only get 250/month for free, so use sparingly when testing!!!
  var smartyStreetsToken = "Tr2dL8zZULmwYqfpMw3W";
  var smartyStreetsID = "a0c54500-b299-d806-f742-6e5b1e339615";

  // zillow api key
  var ZWSID = "X1-ZWz1hjdyrt1k3v_8fetn";

  // proxy because zillow doesn't accept CORS?
  var proxy = "https://cors-anywhere.herokuapp.com/";

  var googleKey = "AIzaSyBLvMtnaXQWVXtpdpFXhzlpt2F38GO8lkc";


  $("#submit").on("click", function (event) {
    event.preventDefault();
    var address = $("#address").val();
    var city = $("#city").val();
    var stateInitials = $("#state").val();
    var zip = $("#zip").val();
    zillowGetter(address, city, stateInitials, zip);
    streetView(address, city, stateInitials, zip);
    weatherRunner(zip);
    // document.getElementById("main-form").style.display = "none"; 
    $("#main-form").hide();
    $("#main-form-2").show();
    $("body").css("background-image","none");
  });

  // returns 4 character string for the current year.
  // used by backTracker() to have start year
  function getYear() {
    var now = parseInt(moment().format('YYYY'));
    return now;
  }

  // initiates the weather data process with user input info
  function weatherRunner(zip) {
    // we only get 250/month for free, so use sparingly when testing!!!
    // zipCaller(zip); // avoiding zipCaller for now to not max out API calls!!
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

  // backTracker takes the FIPS argument and triggers the NOAA ajax calls
  function backTracker(FIPS) {
    var startYear = getYear() - 12;
    noaaTAVG(FIPS, startYear);
    noaaEMXT(FIPS, startYear);
    noaaPRCP(FIPS, startYear);
  }

  // NOAA ajax calls
  function noaaTAVG(FIPS, startYear) {
    var endYear = startYear + 10;
    var tavgURL =
      "https://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GSOY&datatypeid=TAVG&locationid=FIPS:"
      + FIPS + "&startdate=" + startYear + "-01-01&enddate=" + endYear + "-01-01";
    $.ajax({
      url: tavgURL,
      headers: { token: NOAAtokenAdrian },
      method: "GET",
      success: function (response) {
        var averages = objectMaker(response);
        graphTempMAX(averages);
      },
      error: function () {
      }
    })
  }

  function noaaEMXT(FIPS, startYear) {
    var endYear = startYear + 10;
    var emxtURL =
      "https://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GSOY&datatypeid=EMXT&locationid=FIPS:"
      + FIPS + "&startdate=" + startYear + "-01-01&enddate=" + endYear + "-01-01";
    $.ajax({
      url: emxtURL,
      headers: { token: NOAAtokenAdrian },
      method: "GET",
      success: function (response) {
        var averages = objectMaker(response);
        graphTempAVG(averages);
      },
      error: function () {
      }
    })
  }

  function noaaPRCP(FIPS, startYear) {
    var endYear = startYear + 10;
    var prcpURL =
      "https://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GSOY&datatypeid=PRCP&locationid=FIPS:"
      + FIPS + "&startdate=" + startYear + "-01-01&enddate=" + endYear + "-01-01";
    $.ajax({
      url: prcpURL,
      headers: { token: NOAAtokenAdrian },
      method: "GET",
      success: function (response) {
        var averages = objectMaker(response);
        graphPRCP(averages);
      },
      error: function () {
      }
    })
  }

  // Used by the NOAA callers to extract and shape data for graphs
  function objectMaker(response) {
    var organizedDataSet = {};
    var array = response.results
    for (var i = 0; i < array.length; i++) {
      var year = array[i].date.slice(0, 4);
      if (organizedDataSet.hasOwnProperty(year)) {
        organizedDataSet[year].push(array[i].value);
      }
      else {
        organizedDataSet[year] = [array[i].value];
      }
    }
    var averages = objectAverager(organizedDataSet);
    return averages;
  }

  function objectAverager(object) {
    var avgArray = [];
    for (var property in object) {
      var avg = yearAvg(object[property]);
      avgArray.push(avg);
    }
    return avgArray;
  }

  // averages all the values in the array using reduce();
  function yearAvg(array) {
    let sum = array.reduce((previous, current) => current += previous);
    let arrayAvg = sum / array.length;
    return arrayAvg;
  }

  function graphTempAVG(array) {

    $("#main-form-2").show();

    var year = moment().format('YYYY');

    var formattedArray = array.map(function (temp, index) { return { x: year - (index*2), y: temp * 9 / 5 + 32 } });

    new Chartist.Line('.TAVG', {
      series: [formattedArray]
    }, {
      axisX: {
        type: Chartist.AutoScaleAxis,
        onlyInteger: true,
      },
    }, {
    })
  };

  function graphTempMAX(array) {

    $("#main-form-2").show();

    var year = moment().format('YYYY');
    var formattedArray = array.map(function (temp, index) { return { x: (year - index*2), y: temp * 9 / 5 + 32 } });
    new Chartist.Line('.TMAX', {
      series: [formattedArray]
    }, {
      axisX: {
        type: Chartist.AutoScaleAxis,
        onlyInteger: true
      },
    }, {
    })
  };

  function graphPRCP(array) {

    $("#main-form-2").show();

    var year = moment().format('YYYY');

    var formattedArray = array.map(function (total, index) { return { x: (year - index*2), y: total / 10 * 0.0393701 } });

    new Chartist.Line('.PRCP', {
      series: [formattedArray]
    }, {
      axisX: {
        type: Chartist.AutoScaleAxis,
        onlyInteger: true,
      },

      // axisY: {
      //   type: Chartist.FixedScaleAxis,

      // }
    })
  };

  // zillow stuff

  // this function creates the url and does the ajax call to the Zillow API
  function zillowGetter(address, city, stateInitials, zip) {

    $(".zillowLink").show();

    var address = spaceToPlusParser(address);
    var city = spaceToPlusParser(city);
    var stateInitials = spaceToPlusParser(stateInitials);
    var zip = spaceToPlusParser(zip);

    var zillowURL = "https://www.zillow.com/webservice/GetSearchResults.htm?zws-id="
      + ZWSID + "&address=" + address + "&citystatezip=" + city + "%2C+" + stateInitials + "+" + zip;

    $.ajax({
      // proxy because zillow doesn't accept CORS
      url: proxy + zillowURL,
      method: "GET"
    }).then(function (response) {
      var JSONresponse = xmlToJson(response);
      zillowDisplayer(JSONresponse);
    });
  };

  // appends values taken from zillow JSONresponse and appends to bar at the top
  function zillowDisplayer(response) {
    console.log(response);
    console.log(response["SearchResults:searchresults"].response.results.result.localRealEstate.region.links.overview["#text"]);
    var zestimate = undefinedChecker(
      response["SearchResults:searchresults"].response.results.result.zestimate.amount["#text"]);
    var lowRange = undefinedChecker(
      response["SearchResults:searchresults"].response.results.result.zestimate.valuationRange.low["#text"]);
    var highRange = undefinedChecker(
      response["SearchResults:searchresults"].response.results.result.zestimate.valuationRange.high["#text"]);
    var neighborhoodAVG = undefinedChecker(
      response["SearchResults:searchresults"].response.results.result.localRealEstate.region.zindexValue["#text"]);
      var zillowLink = undefinedChecker(
        response["SearchResults:searchresults"].response.results.result.localRealEstate.region.links.overview["#text"]);
        console.log(zillowLink);

        //response["SearchResults:searchresults"].response.results.result.localRealEstate.region.links.overview["#text"]


    $("#zestimate").append(zestimate);
    $("#range").append(lowRange + " - " + highRange);
    $("#neighborhood").append(neighborhoodAVG);
    $(".zillowLink").click(function() {

      window.location = zillowLink + this.id;
  }


  function undefinedChecker(string) {
    if (string == undefined) {
      string = "no data found";
    }
    return string;
  }

  // parses string inputs from user address form
  // Replaces every ' ' character with '+', which is URL friendly
  function spaceToPlusParser(str) {
    var parsedString = str.replace(/ /g, '+');
    return parsedString;
  }

  function streetView(address, city, stateInitials, zip) {
    var address = spaceToPlusParser(address);
    var city = spaceToPlusParser(city);
    var stateInitials = spaceToPlusParser(stateInitials);
    var zip = spaceToPlusParser(zip);
    var streetViewURL =
      "https://maps.googleapis.com/maps/api/streetview?size=600x600&location="
      + address + city + stateInitials + zip + "&key=" + googleKey;


    $("#street-view").append($("<img src=" + streetViewURL + " />"))


  }


  // NOTE! the following function is copied verbatim from this website:
  // https://davidwalsh.name/convert-xml-json
  // the zillow API returns xml as default. until i can figure out the proper
  // way to call for a JSON output, I will use this function to convert the
  // XML to JSON for ease of access/traversing

  // Changes XML to JSON
  function xmlToJson(xml) {
    var obj = {};

    if (xml.nodeType == 1) { // element
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