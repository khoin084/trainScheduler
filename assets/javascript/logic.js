/*=========================================================================
*Developer:Khoi Nguyen
*Date: 3/17/2017
*UCSD Code Bootcamp: Homework #7
In this assignment, attempting MVC design pattern
==========================================================================*/

/**
 *Obj train used to manipulate the DOM (controller + view)
 *No need for the MODEL here, bc the firebase DB is the MODEL.
 */
var train = {
    "numOfCols": 5,
    //main controller 
	init: function () {
		this.firebase();
        this.cacheDom();
        this.bindEvents();
    },
    firebase: function() {
        // Initialize Firebase
        var config = {
        apiKey: "AIzaSyDDCYwIvCe7Yr0Q8L6ybV0swNFdKWDzIqw",
        authDomain: "trainscheduler-9255c.firebaseapp.com",
        databaseURL: "https://trainscheduler-9255c.firebaseio.com",
        storageBucket: "trainscheduler-9255c.appspot.com",
        messagingSenderId: "645407810312"
        };
        firebase.initializeApp(config);
        //pointer/reference to DB
        var dataRef = firebase.database();
        //var for train input parameters
        var trainName = "";
        var dest = "";
        var firstTrainTime = "";
        var freq = "";

        $("#submitBtn").on("click", function(){
            console.log("submitted");
            //preventing refreshing of page from submit button.
            event.preventDefault();
            //maintain context to train obj. 
            trainName = train.$trainName.val().trim();
            dest = train.$destination.val().trim();
            firstTrainTime = train.$firstTime.val();
            freq = train.$frequency.val().trim();
            // Code for the push
            dataRef.ref("/trainAdded").push({
                trainName: trainName,
                dest: dest,
                firstTrainTime: firstTrainTime,
                freq: freq,
                dateAdded: firebase.database.ServerValue.TIMESTAMP
            });
        });
        dataRef.ref("/trainAdded")
               .on("child_added", function(snapshot){
        // Change the HTML to reflect
        train.render(snapshot.val().trainName,
            snapshot.val().dest,
            snapshot.val().firstTrainTime,
            snapshot.val().freq);
        //console.log(snapshot.val().trainName);
        });

    },
    //caching the DOM so we are not searching through the DOM over and over again.
    cacheDom: function () {
    	this.$submitBtn = $("#submitBtn");
        this.$trainName = $("#tname");
        this.$destination = $("#dest");
        this.$firstTime = $("#firstTime");
        this.$frequency = $("#freq");
        this.$addRow = $("#addRow");
    },
    //method to bind the search and clear button events.
    bindEvents: function () {
        this.$submitBtn.on("click", this.render.bind(this));   
    },
    //method to append results from API response to the DOM.
    render: function (tname, dest, firstTime, freq) {
        //clears the input fields after the search btn is clicked.
        $("form").trigger("reset");
        var nextArrival = train.calcNextArrival(freq, firstTime);
        var minAway = train.calcMinAway(freq, firstTime);
        var tempArray = [tname, dest, freq, nextArrival, minAway];
        var newRow = $("<tr>");
        train.$addRow.append(newRow);
        //loop to print each col data per row.
        for(var i = 0; i < train.numOfCols; i++){
            var newData = $("<td>" + tempArray[i] + "</td>");
            newRow.append(newData);
        }
    },
    calcNextArrival: function(freq, firstTime) {
        var currentTime = moment();
        // First Time (pushed back 1 year to make sure it comes before current time)
        var firstTimeConverted = moment(firstTime, "hh:mm").subtract(1, "years");
        // Difference between the times
        var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
        // Time apart (remainder)
        var tRemainder = diffTime % freq;
        // Minute Until Train
        var tMinutesTillTrain = freq - tRemainder;
        // Next Train
        var nextTrain = moment().add(tMinutesTillTrain, "minutes");
        return moment(nextTrain).format("hh:mm");
    },  
    calcMinAway: function (freq, firstTime) {
        var currentTime = moment();
        // First Time (pushed back 1 year to make sure it comes before current time)
        var firstTimeConverted = moment(firstTime, "hh:mm").subtract(1, "years");
        // Difference between the times
        var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
        // Time apart (remainder)
        var tRemainder = diffTime % freq;
        // Minute Until Train
        var tMinutesTillTrain = freq - tRemainder;
        return tMinutesTillTrain;
    }//end of calcMinAway
}//end of controller

//initialize the train controller and view once page has fully loaded.
$(document).ready(function() {
    train.init();
});




