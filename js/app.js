/*
* Memory card game with 4x4 cards. Three rounds can be played,
* if two cards match the user can try again in the same round.
* Matching pair is one point, 8 points in total possible.
*/

//constants
const CONST_LIST_OF_ITEMS = ["fa-diamond", "fa-paper-plane-o", "fa-anchor", "fa-bolt", "fa-cube", "fa-leaf", "fa-bicycle", "fa-bomb"];
const CONST_DELAY = 1000; //sets the delay after a not matching pair is turned
const CONST_THREE_STARS = 15; //threshold when first star is removed
const CONST_TWO_STARS = 25; //threshold when second star is removed


//global variables
let listOfCards; //global list holding all card objects
let matchedPairs; //global variable representing the matching pairs
let moves; //global variable counting the moves
let isCardOpen; //variable to decide if there is alread an open card
let timeNeeded; //counts the time during the game
let gameOngoing; //starts and stops the timer
let numberOfStars; //amount of stars
let rankingList; //global ranking list holding the best three players

//values used to exchange information about open cards when toggling between isCardOpen yes/no
let cardA;
let cardANumber;
let cardB;
let cardBNumber;

//initialize when website is loaded
onload = function(){init();};

/*
* Initializes the game, is called when website is loaded or after one round is over.
*/
let init = function(){

  reset(); //clean everything up and initializes values
  rankingList = getRankingListBackFromStorage(); //load list of best players from storage...
  updateRanking(); //...and update screen

  listOfCards = new Array();
  //creates new MemoryCards and allocates an image
  for (let counter = 0; counter < CONST_LIST_OF_ITEMS.length; counter++){
    listOfCards.push(new MemoryCard(CONST_LIST_OF_ITEMS[counter]));
    listOfCards.push(new MemoryCard(CONST_LIST_OF_ITEMS[counter])); //two times since always a pair has to be created
  }

  //shuffles the cards in the list
  shuffle(listOfCards);

  //creates the cards in the html and adds an unique identifier
  for ( let counter = 0; counter < listOfCards.length; counter++ ){
    $(".deck").append($("<li id=" + counter + " class=\"card\" >"));
    $("#" + counter).append($("<i class=\"fa " + listOfCards[counter].image + "\"></i>"));
  }

};


/*
* Event listener is called if user clicks on any card, is registered to the element
* higher in the hierarchy since this is not created dynamically.
* This function hold the main logic for the game:
* Check if the card is locked (due to match before), turns the card which was clicked,
* decides if it's the first or second card opened.
* If it was the first card, it gets the id of the card, sets the boolan value
* "isCardOpen" and waits for the next.
* If it was the second, it gets the id, compares if equal, turns to green if so,
* increases the moves and turns back the cards
*/
$(".deck").on("click", "li", function(){

  gameOngoing = true; //start counter

  //already matching pair from a round before?
  if( $(this).hasClass("locked"))
    return;

  $(this).flipCard(); //open the new card

  //case 1: no card was opened so far, get card from object list
  if(!isCardOpen){
    cardANumber = getCardNumber($(this)); //id from card in html
    cardA = listOfCards[cardANumber]; //corresponding object in list
    isCardOpen = true;
    return;
  }

  //case 2: second card is opened, get 2nd card from object list
  if(isCardOpen){

    cardBNumber = getCardNumber($(this)); //id from card in html
    if  (cardANumber === cardBNumber){ //clicked on the same card twice?
      $(this).flipCard(); //open the new card
      return;
    }
    cardB = listOfCards[cardBNumber]; //corresponding object in list
    increaseMoves();

    //cards are identical? matchedPairs plus one
    if (cardA.image == cardB.image){
      matchedPairs++;
      match($("#" + cardANumber), $("#" + cardBNumber)); //turn to green and lock

      if (matchedPairs === 8){  // maximum pairs are reached
        gameOngoing = false; //stop counter
        gameOver(); //call modal and rating
      }
    }

    //not identical? turn red and flip
    else{
         noMatch($("#" + cardANumber), $("#" + cardBNumber), CONST_DELAY); //flip back after x ms
    }
  }
  //reset values for the next round
  isCardOpen = false;
  cardA = null;
  cardANumber = 0;
  cardB = null;
  cardBNumber = 0;

});


/*
* expects the current card as an jQuery-Object and returns the relating id
*/
let getCardNumber = function(card){

  return card.attr("id");

};


/*
* Turns the card and shows the image. Expects a jQuery-object and is added to
* the jQuery functions to be called directly from the object
*/
jQuery.fn.flipCard = function() {

  var o = $(this);
  o.toggleClass("open show");
  return this;

};


/*
* Expects two cards as input and changes the colors to "match". Afterwards
* the cards are locked so that the user cannot turn back
*/
let match = function(cardA, cardB){

  cardA.addClass("match");
  cardA.addClass("locked");
  cardB.addClass("match");
  cardB.addClass("locked");

};


/*
* Expects two cards as input and changes the colors,
* after "delay" miliseconds, the cards are turned back.
*/
let noMatch = function(cardA, cardB, delay){

  cardA.toggleClass("noMatch");
  cardB.toggleClass("noMatch");
  cardA.effect("shake");
  cardB.effect("shake");
  setTimeout(function(){
    cardA.toggleClass("noMatch");
    cardB.toggleClass("noMatch");
    cardA.flipCard();
    cardB.flipCard();
  }, delay);

};


/*
* is called from gameOver(), gets the corresponding string from getResult(),
* updates it on the modal and opens the modal
*/
let showResult = function(){

  $(".finalScore").text(getResult());
  $("#myModal").show();

};


/*
* Returns score based on stars and time needed: Stars dived by time in seconds,
* rounded on three digits
*/

let getScore = function() {

  return (Math.round(numberOfStars/timeNeeded*1000));

}


/*
* Returns the string with the final score depending on the amount of moves/the stars the time the player needed
*/
let getResult = function(){

    return "You needed " + moves + " moves and " + timeNeeded + " seconds to find all matching"
    + " pairs with an overall rating of " + numberOfStars + " stars. Keep practicing and try"
    + " again! \r\n\n Total score: " + getScore() ;

};


/*
* Reduces the amount of stars and removes the highest star with an animation from the screen
*/
let removeStar = function(){

  numberOfStars--; //has to be called first since "eq" starts counting with zero
  $(".fa-star:eq(" + numberOfStars + ")").addClass("redStar").effect("pulsate").effect("explode", function(){$(".fa-star:eq(" +
  numberOfStars + ")").removeClass("redStar").removeClass("blueStar").removeAttr("style");});

}


/*
* increases the amount of moves everytime two cards were turned and updates the value on the screen. On certain thresholds
* the amount of stars is reduced
*/
let increaseMoves = function() {

  moves++;
  $("#moves-display").text(moves);

  if (moves === CONST_THREE_STARS)
    removeStar();
  if (moves === CONST_TWO_STARS)
    removeStar();
};


/*
* Starts to count the seconds once the first card is clicked and updates it on the screen
* //https://stackoverflow.com/questions/5517597/plain-count-up-timer-in-javascript
*/
let timer = setInterval( function(){
  if(gameOngoing){
      timeNeeded++;
      $("#timer-display").text(timeNeeded);
    }
},1000);


/*
* is called when no moves are left, opens all cards to the player,
* changes the color and calls showResult() to display the score
*/
let gameOver = function(){

  $(".card").flipCard();
  $(".card").addClass("gameOver");
  showResult();

};


/*
* constructor for memory cards
*/
function MemoryCard(image) {

  this.image = image;

};


/*
* Shuffle function from http://stackoverflow.com/a/2450976
*/
function shuffle(array) {

  var currentIndex = array.length, temporaryValue, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;

};


/*
* Resets all values and removes the cards
*/
let reset = function() {

  openCardCounter = 0;
  matchedPairs = 0;
  listOfCards = null;
  cardA = null;
  cardANumber = 0;
  cardB = null;
  cardBNumber = 0;
//  starRating = 3;
  moves = 0;
  gameOngoing = false;
  timeNeeded = 0;
  numberOfStars = 3;

  $(".deck").children().remove();
  $("#moves-display").text(moves);
  $(".fa-star").addClass("blueStar");
  $("#timer-display").text(timeNeeded);
  $(".playerName").val("");

};

let test = function(){
  showResult();
}

/*
*
* Part to implement the ranking of the players
*
*/

/*
* Function is called to update the ranking list in memory and on the screen.
* Therefore the rankingList is orderd highest score first, cut to three entries
* in total, then the website is updated and the current list is written back to memory
*/
let updateRanking = function() {

    sortRanking(); //right order highest score to lowest
    if (rankingList.length > 3)
      rankingList = rankingList.slice(0, 3); //just the first three stay in the list

    for (let counter = 1; counter <= rankingList.length; counter ++){
        $("table tr:eq(" + (counter) + ") td:eq(1)").text(rankingList[counter-1][0]);
        $("table tr:eq(" + (counter) + ") td:eq(2)").text(rankingList[counter-1][1]);
    }
      //since no arrays are supported by local storage, it has to be converted to a string
      localStorage.setItem("rankingList", array2String(rankingList));

};


/*
* Saved list is read out of memory. Since the rankingList is a 2dimensional-array and
* the local storage just saves strings, the list has to be reconverted to the array.
* If no list was saved (first time or list deleted by user), an empty list is generated.
*/
let getRankingListBackFromStorage = function(){

  let tempRankingList = localStorage.getItem("rankingList");
  //memory not empty?
  if(tempRankingList != null){
    tempRankingList = tempRankingList.split(","); //split from comma separated string to 1d-array
    rankingList = new Array();
    //recreate 2d-array
    for (let counter=0; counter < tempRankingList.length; counter=counter + 2) {
      rankingList.push([tempRankingList[counter], tempRankingList[counter+1]]);
    }

    return rankingList;
    //memory empty!
  } else {
      return [["",""],["",""],["",""]];
  }

};


/*
* Helper function to convert array into an comma separated string. Expects an array as input
*/

let array2String = function(array){

  let tempString;

  tempString = array[0]; //avoid leading comma

  for (let counter = 1; counter < array.length; counter++) {
    tempString = tempString + "," + array[counter];
  }

  return tempString;

};


/*
* Deletes the data locally saved
*/
let deleteRanking = function() {

  localStorage.removeItem("rankingList"); //clear list from local storage
  init(); //refresh page and table

};


/*
* Function brings the rankingList in the right order high score to low score
* with little support from https://stackoverflow.com/questions/3524827/sort-a-2d-array-by-the-second-value/3524832
*/
let sortRanking = function() {

  rankingList.sort(function (a, b) {
  return  b[1] -  a[1];
  });

};


/*
* Function is called when the player typed in his name. The name is saved with the score
* in the rankingList and will appear in the top three if the score was high enough. The
* modal disappears after the user pushed on the ok button
*/
let saveName = function(){

  modal.style.display = "none";
  rankingList.push([$(".playerName").val(), getScore()]);
  updateRanking();
  init();

};


/*
*
* Part to implement the modal to show the result with support from
* https://www.w3schools.com/howto/howto_css_modals.asp
*
*/

/*
* functions to display the modal for the final score
*/
var modal = document.getElementById('myModal');
var span = document.getElementsByClassName("close")[0];

/*
* Eventlistener for the modal
*/

$(".closeButton").click(function() {
  saveName();
});

$(".closeButton").keypress(function() {
      saveName();

});

$("#deleteButton").click(function() {
  deleteRanking();
});

//Close the modal if user clicks somewhere else
window.onclick = function(event) {

  if (event.target == modal) {
    saveName();
  }

};
