$(document).ready(function () {

  var token = "OBzsTvSdeIEAZDdTInysIDJSVQZdhKtx";

  function getYear() {
    var now = parseInt(moment().format('YYYY'));
    return now;
  }

  // 400 ERROR test call
  // var testURL = "https://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GSOY&datatypeid=TAVG&locationid=FIPS:06115&startdate=2010-01-01&enddate=2018-01-01";
  // $.ajax({
  //   url: testURL,
  //   headers: { token: token },
  //   method: "GET"
  // }).then(function (response) {
  //   console.log(response);
  // });


  function noaaLocationList() {
    var locationURL = "https://www.ncdc.noaa.gov/cdo-web/api/v2/locationcategories";
    $.ajax({
      url: locationURL,
      headers: { token: token },
      method: "GET"
    }).then(function (response) {
      console.log(response);
    });
  }

  function noaaZIPlist() {
    var zipURL = "https://www.ncdc.noaa.gov/cdo-web/api/v2/locations?locationcategoryid=CNTY&sortfield=name&sortorder=desc&limit=1000";
    $.ajax({
      url: zipURL,
      headers: { token: token },
      method: "GET"
    }).then(function (response) {
      console.log(response);
    });
  }

  // this function gets the yearly temp avg data points for a county code
  // it then crunches the numbers down into a single yearly avg which is
  // pushed into the beginning of the TAVG array
  function noaaTAVG(startYear, endYear, array) {
    var tavgURL = "https://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GSOY&datatypeid=TAVG&locationid=FIPS:06115&startdate=" + startYear + "-01-01&enddate=" + endYear + "-01-01";
    $.ajax({
      url: tavgURL,
      headers: { token: token },
      method: "GET",
      success: function (response) {
        ajaxDataMaker(response, array);
      }
      // }).then(function (response) {
      //   ajaxDataMaker(response, array);
      // });
    });
  }

  // this function gets the yearly temp maximum data points for a county code
  // it then crunches the numbers down into a single yearly avg which is
  // pushed into the beginning of the TMAX array
  function noaaTMAX(startYear, endYear, array) {
    var tmaxURL = "https://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GSOY&datatypeid=TMAX&locationid=FIPS:42101&startdate=" + startYear + "-01-01&enddate=" + endYear + "-01-01";
    $.ajax({
      url: tmaxURL,
      headers: { token: token },
      method: "GET"
    }).then(function (response) {
      ajaxDataMaker(response, array);
    });
  }

  // this function gets the yearly precipitation total data points for a county code
  // it then crunches the numbers down into a single yearly avg which is
  // pushed into the beginning of the PRCP array
  function noaaPRCP(startYear, endYear, array) {
    var prcpURL = "https://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GSOY&datatypeid=PRCP&locationid=FIPS:42101&startdate=" + startYear + "-01-01&enddate=" + endYear + "-01-01";
    $.ajax({
      url: prcpURL,
      headers: { token: token },
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
    for (var i = 0; i < response.results.length; i++) {
      yearResults.push((response.results[i].value));
    }
    var yearResultsAvg = yearAvg(yearResults);
    arrayMaker(yearResultsAvg, array);
  };

  function backTracker() {
    var TAVG = [];
    var TMAX = [];
    var PRCP = [];
    var startYear = getYear() - 2;
    // should take start year from getNow year - 2;
    for (var i = 0; i < 10; i++) {
      var endYear = startYear + 1;
      noaaTAVG(startYear, endYear, TAVG);
      noaaTMAX(startYear, endYear, TMAX);
      noaaPRCP(startYear, endYear, PRCP);
      startYear--;
    }
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

  backTracker();

})

