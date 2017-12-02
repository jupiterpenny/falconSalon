


var successCallback = function(data) {
document.getElementById('lat').value = data.coords.latitude;
document.getElementById('lon').value = data.coords.longitutde;
console.log(lat, lon);
    console.log('latitude: ' + data.coords.latitude + ' longitude: ' + data.coords.longitude);
    var lan = data.coords.latitude;
    var lon = data.coords.longitude;
    // var name = document.getElementById('name').value;
    
    // $.ajax({
    //     url: "http://kmosipov-hackathon.appspot.com/route/init?lat=" + lan +"&lon=" + lon,
    //     //force to handle it as text
    //     dataType: "text",
    //     success: function(data) {
    
    //         //data downloaded so we call parseJSON function 
    //         //and pass downloaded data
    //         var json = $.parseJSON(data);
    //         //now json variable contains data in json format
    //         //let's display a few items
    //         for (var i=0;i<json.length;++i)
    //         {
    //             $('#text').append('<div class="name">'+json.photo[i]+'</>');
    //             $('#blurMe').append('<div class="name">'+json.labels[i]+'</>');
    //         }
    //     }
    // });

    var arrayTime = [];
};

var failureCallback = function() {
    console.log('location failure :(');
};

 function getLocation() {

    //determine if the handset has client side geo location capabilities
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(pos);
    }
    else{
        alert("Functionality not available");
    }
};

// var lan = localStorage.getItem(x);
// var lon = localStorage.getItem(y);


// $.ajax({
//     url: "http://kmosipov-hackathon.appspot.com/route/init?lat=" + lan +"&" + lon +"=name",
//     //force to handle it as text
//     dataType: "text",
//     success: function(data) {

//         //data downloaded so we call parseJSON function 
//         //and pass downloaded data
//         var json = $.parseJSON(data);
//         //now json variable contains data in json format
//         //let's display a few items
//         for (var i=0;i<json.length;++i)
//         {
//             $('#text').append('<div class="name">'+json.photo[i]+'</>');
//             $('#blurMe').append('<div class="name">'+json.labels[i]+'</>');
//         }
//     }
// });
// console.log(navArray);
// var arrayTime = [];




// function sendAjax(siteProtocol, siteName, sitePort, sitePath, siteQueryString,) {
//     var name = document.getElementById('name').value;
//     var time = new Date();
//     var table = document.getElementById("myTable");
//     var row = table.insertRow(0);
//     var cell1 = row.insertCell(0);
//     var cell2 = row.insertCell(1);
//     cell1.innerHTML = "NEW CELL1";
//     cell2.innerHTML = "NEW CELL2";


//            $.ajax({
//                url: siteProtocol + siteName + ':' + sitePort + sitePath + siteQueryString,
//                complete: function(response) {
//                    if (typeof callBack !== 'undefined') callBack(response);
//                },
//                withCredentials: true,
//                crossDomain: true,
//                error: function() {
//                    console.log("Error with ajax call...");
//                }
//            });


//            window.location.href = 'next.html'; 
//        }


