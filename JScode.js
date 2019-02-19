var request = new XMLHttpRequest(); // coindesk api call for BTC data
request.open("GET", "https://api.coindesk.com/v1/bpi/historical/close.?start=2011-06-01&end=2019-02-15");
request.onload = function () {
  dataBTC = JSON.parse(request.response); // putting returned value from api in a variable
  data_BTC = coindeskDataSetUp(dataBTC); // setting up data for easily manipulate it later
  markets.push("BTC"); // puting a string and corresponding data in a markets array for the purpose of comparing the string with user selection
  markets.push(data_BTC);
};
request.send();


var request2 = new XMLHttpRequest(); // tradier developer api call for SP500 data
request2.open("GET", "https://sandbox.tradier.com/v1/markets/history?symbol=SPX&start=2011-06-01&end=2019-02-15");
request2.setRequestHeader("Authorization", "Bearer xOzFt4WZAIAsA8tvNQmDTHNRBNfR");
request2.onload = function () {
  xmlData_SP500 = (request2.responseXML);
  data_SP500 = tradierDataSetUp(xmlToJson(xmlData_SP500));
  markets.push("SP500");
  markets.push(data_SP500);
};
request2.send();


var request3 = new XMLHttpRequest(); // tradier developer api call for NASDAQ100 data
request3.open("GET", "https://sandbox.tradier.com/v1/markets/history?symbol=NDX&start=2011-06-01&end=2019-02-15");
request3.setRequestHeader("Authorization", "Bearer xOzFt4WZAIAsA8tvNQmDTHNRBNfR");
request3.onload = function () {
  xmlData_NASDAQ100 = (request3.responseXML);
  data_NASDAQ100 = tradierDataSetUp(xmlToJson(xmlData_NASDAQ100));
  markets.push("NASDAQ100");
  markets.push(data_NASDAQ100);
};
request3.send();


var request4 = new XMLHttpRequest(); // quandl api call for GOLD data
request4.open("GET", "https://www.quandl.com/api/v3/datasets/LBMA/GOLD.json?start_date=2011-06-01&end=2019-02-15&order=asc&api_key=gB67ip1xdyGDpwFY7sf6");
request4.onload = function(){
  dataGOLD = JSON.parse(request4.response);
  data_GOLD = quandlDataSetUp(dataGOLD);
  markets.push("GOLD");
  markets.push(data_GOLD);
};
request4.send();


var request5 = new XMLHttpRequest(); // quandl api call for SILVER data
request5.open("GET", "https://www.quandl.com/api/v3/datasets/LBMA/SILVER.json?start_date=2011-06-01&end=2019-02-15&order=asc&api_key=gB67ip1xdyGDpwFY7sf6");
request5.onload = function(){
  dataSILVER = JSON.parse(request5.response);
  data_SILVER = quandlDataSetUp(dataSILVER);
  markets.push("SILVER");
  markets.push(data_SILVER);
};
request5.send();


xmlToJson = function(xml) { // https://davidwalsh.name/convert-xml-json
var obj = {};
if (xml.nodeType == 1) {
    if (xml.attributes.length > 0) {
        obj["@attributes"] = {};
        for (var j = 0; j < xml.attributes.length; j++) {
            var attribute = xml.attributes.item(j);
            obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
        }
    }
} else if (xml.nodeType == 3) {
    obj = xml.nodeValue;
}
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
 }


 function coindeskDataSetUp(data){ // setting up data from coindesk in a object of two array
   var newData = {}; // declaration of an object btc that will contain a date array and a price array
     newData.date = Object.keys(data.bpi); // return an array containing all propertys from object bpi, this property are dates
     newData.price = Object.values(data.bpi); // return an array containing all values from object bpi, this values are prices
     return newData;
 }


 function tradierDataSetUp(data){ // extracting dates ans corresponding prices from data of tradier developer api
   var newData = {date: [], price: []}; // declaration of an objecct data thah will contain a date array and a price array
   for(var i in data.history.day){ // loop through all values in object day
     newData.date = newData.date.concat(Object.values(data.history.day[i].date)); // return an array containing the date at day i, concat this array with data date array
     newData.price = newData.price.concat(parseFloat(Object.values(data.history.day[i].close))); // same, in addition conversion of closing prices from string type to float type
   }
   return newData;
 }


function quandlDataSetUp(data){ // extracting dates ans corresponding prices from data of quandl api
  var newData = {date: [], price: []}; // declaration of an objecct data thah will contain a date array and a price array
  for(var i in data.dataset.data){ // // loop through all values in object data
    newData.date.push(data.dataset.data[i][0]); // put dates in date object of newData
    newData.price.push(data.dataset.data[i][2]); // put prices in price object of newData
  }
  return newData;
}


function dateFrom(dateArray, priceArray, date){ // modify an array of dates and an array of corresponding prices to keep only dates and prices from the specified date
  var index = 0;
  var lastIndex = dateArray.length - 1;
  if (date > dateArray[index] && date < dateArray[lastIndex]){ // check if the specified date is in the range of dates of the array, if not no change will be made to the array
    while (date > dateArray[index]){ // counting the index from where the function will keep remaining dates
        index++;
    }
  }
  dateArray.splice(0, index); // deleting(index) dates from begining to specified date value
  priceArray.splice(0,index); // deleting corresping prices
}


/* BTC market unlike traditionals markets is live 7/7 day, so we have to cut days and values from BTC data to match with SP500 days.
function to set same numbers of dates and prices on four arrays by deleting dates that are not in both arrays and prices associated with those dates */
function setSameDates(dates1, prices1, dates2, prices2){
  var i = 0;
  while(i < dates1.length || i < dates2.length){ // while loop that check if there is still date on one or both array
    if(dates1[i] == dates2[i]){ // no change if both dates are equal in both arrays
      i++;
    }
    else if(dates1 < dates2 && i != dates1.length){ // if one date is smaller and if we are not at the end of the array, we delete it and the prices associated with
      dates1.splice(i,1);
      prices1.splice(i,1);
    }
    else if(dates1 > dates2 && i != dates2.length){ // same as above
      dates2.splice(i,1);
      prices2.splice(i,1);
    }
    else{ // we reach here if one array are no more values and the other still have some, deleting remaining values
      dates1.splice(i,1);
      prices1.splice(i,1);
      dates2.splice(i,1);
      prices2.splice(i,1);
    }
  }
}


function sum(x){
  var somme = 0;
  for(let i = 0; i < x.length; i++){ // loop to calculate sum of x
    somme = somme + x[i];
  }
  return somme;
}


function average(x){
  return sum(x) / x.length;
}


function covariance (x, y){ // formula of covariance is ∑((x(i)-x(avg))((y(i)-y(avg))) / n where n is the number of couples x(i) y(i)
  var somme_produit = 0; // declaration of a variable who will be equal to the sum of multiplications
  for(let i = 0; i < x.length; i++){ // loop to calculate the sum of multiplications
    somme_produit = somme_produit + ((x[i] - average(x)) * (y[i] - average(y)));
  }
  return somme_produit / (x.length); // we divide by the number of couples and return the result
}


function standard_deviation (x){ // formula of standard deviation is square root of ( (∑(|x(i)-x(avg)|²) / n ) where n is the number of values inside x
 var somme_operation = 0; // declaration of a variable who will be equal to ∑(|x(i)-x(avg)|²
 for(let i = 0; i < x.length; i++){
   somme_operation = somme_operation + Math.pow(Math.abs(x[i] - average(x)), 2);
 }
 return Math.sqrt(somme_operation / x.length); // we divide by the number of values of x and we return the quare root of the result
}


function correlation_Pearson (x, y){ // formula of Pearson's correlation
  return covariance(x, y) / (standard_deviation(x) * standard_deviation(y));
}


/* function that return an array of Pearson's correlation from an input of two prices array of same length and an interval value,
the aim is to have a dynamic correlation of prices through time */
function variablePearson(prices1, prices2, interval){
  var correlationPearson = []; // array of Pearson's correlation that we will return in the end
  var prices1Interval = []; // array on values in the interval from prices1
  var prices2Intreval = []; // same for prices2

/* to calculate correlation, we take values from price-interval/2 and price+interval/2 from current price,
the first loop is to avoid to go "outside" array by the front,
the second loop is the main loop,
the third is to avoid to go "outside" array by the end
note : in loop 1 and 3, we take from interval/2 to interval-1 values to calculate Pearson's correlation*/
  for(i = 0; i < interval; i++){
    prices1Interval = prices1.slice(0, i + interval / 2);
    prices2Interval = prices2.slice(0, i + interval / 2);
    correlationPearson.push(correlation_Pearson(prices1Interval,prices2Interval)); // calculation of correlation of values in the interval and put the result on the array of correlation
  }
  for(i = interval; i < prices1.length - interval / 2; i++){
    prices1Interval = prices1.slice(i - interval / 2, i + interval / 2);
    prices2Interval = prices2.slice(i - interval / 2, i + interval / 2);
    correlationPearson.push(correlation_Pearson(prices1Interval,prices2Interval));
  }
  for(i = prices1.length - interval / 2; i < prices1.length; i++){
    prices1Interval = prices1.slice(i - interval / 2, prices1.length);
    prices2Interval = prices2.slice(i - interval / 2, prices1.length);
    correlationPearson.push(correlation_Pearson(prices1Interval,prices2Interval));
  }
  return correlationPearson;
}
