/*
* Memory card game with 4x4 cards. Three rounds can be played,
* if two cards match the user can try again in the same round.
* Matching pair is one point, 8 points in total possible.
*/

//constants
const CONST_LIST_OF_ITEMS = ["fa-diamond", "fa-paper-plane-o", "fa-anchor", "fa-bolt", "fa-cube", "fa-leaf", "fa-bicycle", "fa-bomb"];
const CONST_DELAY = 1000; //sets the delay after a not matching pair is turned
const CONST_MOVES = 3; //change here if you want to have more tries

//global variables
let listOfCards; //global list holding all card objects
let points; //global variable representing the received points
let moves; //global variable representing the moves left
let isCardOpen; //variable to decide if there is alread an open card
let startingTime;
let starRating;
let date;
let gameOngoing;

//values used to exchange information about open cards when toggling between isCardOpen yes/no
let cardA;
let cardANumber;
let cardB;
let cardBNumber;


/*
* Initializes the game, is called when website is loaded or after one round is over.
*/
let init = function(){

  reset(); //clean everything up

  date = new Date();
  startingTime = date.getTime();
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

//from https://stackoverflow.com/questions/19429890/javascript-timer-just-for-minutes-and-seconds

$(document).ready(function (e) {
    var $timer = $("#timer");

    function update() {
        var myTime = $timer.html();
        var ss = myTime.split(":");
        var dt = new Date();
        dt.setHours(0);
        dt.setMinutes(ss[0]);
        dt.setSeconds(ss[1]);

        var dt2 = new Date(dt.valueOf() + 1000);
        var temp = dt2.toTimeString().split(" ");
        var ts = temp[0].split(":");

        $timer.html(ts[1]+":"+ts[2]);
        if(gameOngoing){
          setTimeout(update, 1000);
        }
    }
      setTimeout(update, 1000);

});

/*
* Event listener is called if user clicks on any card, is registered to the element
* higher in the hierarchy since this is not created dynamically.
* This function hold the main logic for the game:
* Turns the card which was clicked, decides if it's the first or second card opened.
* If it was the first card, it gets the id of the card, sets the boolan value
* "isCardOpen" and waits for the next.
* If it was the second, it gets the id, compares if equal, increases the points if so
* or turns back the cards and decreases the moves left.
*/
$(".deck").on("click", "li", function(){

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
    increaseMoves();
    cardBNumber = getCardNumber($(this)); //id from card in html
    cardB = listOfCards[cardBNumber]; //corresponding object in list

    //cards are identical? points plus one
    if (cardA.image == cardB.image){
      increasePoints();
      match($("#" + cardANumber), $("#" + cardBNumber));
      if (points === 8){  // maximum points are reached
        gameOngoing = false;
        gameOver();
      }
    }
    //not identical? turn red and flip
    else{
      //count moves down until zero, then call gameOver
      // if (reduceMoves() == true){
      //   noMatch($("#" + cardANumber), $("#" + cardBNumber), 0); //flip back immediately
      //   gameOver();
      // } else {
         noMatch($("#" + cardANumber), $("#" + cardBNumber), CONST_DELAY); //flip back after x ms
      // }
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
  //var o = $(this[0]);
  o.toggleClass("open show");
  return this;

};


/*
* Expects two cards as input and changes the colors
*/
let match = function(cardA, cardB){

  cardA.addClass("match");
  cardB.addClass("match");

};


/*
* Expects two cards as input and changes the colors,
* after "delay" miliseconds, the cards are turned back.
* "delay" as additional variable is necessary for the last move
* when gameOver() is called, otherwise the last selected cards flip back
* after delay
*/
let noMatch = function(cardA, cardB, delay){

  cardA.toggleClass("noMatch");
  cardB.toggleClass("noMatch");
  setTimeout(function(){
    cardA.toggleClass("noMatch");
    cardB.toggleClass("noMatch");
    cardA.flipCard();
    cardB.flipCard();
  }, delay);

};


/*
* is called from gameOver(), gets the corresponding string from getResult(),
* updated it on the modal and opens the modal
*/
let showResult = function(){

  $("#finalScore").text(getResult());
  $("#myModal").show();

};


/*
* returns a string depending on the points the player received
*/
let getResult = function(){

    return "You needed " + moves + " moves to find all matching pairs and it needed " + $("#timer").text() + " for it";

};


/*
* reduceds the amount of moves which can be played, returns true if no moves left
*/
let increaseMoves = function() {
  moves++;
  $("#moves").text(moves);
  // if (moves === 0)
  // return true;
  // return false;
};


/*
* increases the points by one and updates the display
*/
let increasePoints = function(){

  points++;
  $("#points").text(points);

};


/*
* is called when no moves are left, opens all cards to the player,
* changes the color and displays the result
*/
let gameOver = function(){

  $("li").flipCard();
  $("li").addClass("gameOver");
  showResult();

};

let getTimeNeeded = function(){

  let currentTime = date.getTime();
  let timesInSecond = currentTime - startingTime;

  return timesInSecond;
}

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
  points = 0;
  listOfCards = null;
  cardA = null;
  cardANumber = 0;
  cardB = null;
  cardBNumber = 0;
  startingTime = 0;
  starRating = 0;
  // moves = CONST_MOVES;
  moves = 0;
  gameOngoing = true;

  $(".deck").children().remove();
  $("#points").text(points);
  $("#moves").text(moves);

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
*  When the user clicks on <span> (x), close the modal
*/
span.onclick = function() {

  modal.style.display = "none";
  init();

};


/*
* Close the modal if user clicks somewhere else
*/
window.onclick = function(event) {

  if (event.target == modal) {
    modal.style.display = "none";
    init();
  }

};
