/*
* Memory card game with 4x4 cards. Three rounds can be played,
* if two cards match the user can try again in the same round.
* Matching pair is one point, 8 points in total possible.
*/


//constants
const CONST_DELAY = 1000;
const listOfItems = ["fa-diamond", "fa-paper-plane-o", "fa-anchor", "fa-bolt", "fa-cube", "fa-leaf", "fa-bicycle", "fa-bomb"];

//global variables
let listOfCards = null; //global list holding all card objects
let points = 0; //global variable representing the received points
let moves = 3; //global variable representing the moves left
let isCardOpen = false; //variable to decide if there is alread an open card


let cardA = null;
let cardANumber = 0;
let cardB = null;
let cardBNumber = 0;


/*
* Initializes the game, is called when website is loaded or after one round is over.
*/
let init = function(){
  reset(); //clean everything up

  listOfCards = new Array();
  //creates new MemoryCards and allocates an image
  for (let counter = 0; counter < listOfItems.length; counter++){
    listOfCards.push(new MemoryCard(listOfItems[counter]));
    listOfCards.push(new MemoryCard(listOfItems[counter])); //two times since always a pair has to be created
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
    cardANumber = getCardNumber($(this));
    cardA = listOfCards[cardANumber];
    isCardOpen = true;
    return;
  }

//case 2: second card is opened, get 2nd card from object list
  if(isCardOpen){
    cardBNumber = getCardNumber($(this));
    cardB = listOfCards[cardBNumber];

//cards are identical? points plus one
    if (cardA.image == cardB.image){
      increasePoints();
      match($("#" + cardANumber), $("#" + cardBNumber));
    }
//not identical? turn red and flip
    else{
      noMatch($("#" + cardANumber), $("#" + cardBNumber));
//count moves down until zero, then call gameOver
      if (reduceMoves() == true){
        noMatch($("#" + cardANumber), $("#" + cardBNumber));
        gameOver();
      }
    }
  }
  isCardOpen = false;
});

//constructor for memory cards
function MemoryCard(image) {
  this.image = image;
};


//reduceds the amount of moves which can be played, returns true if no moves left
let reduceMoves = function() {
  moves--;
  $("#moves").text(moves);
  if (moves === 0)
    return true;
  return false;
}

//increases the points by one and updates the display
let increasePoints = function(){

  points++;
  $("#points").text(points);

}

/*
* expects the current card as an jQuery-Object and returns the relating id
*/
let getCardNumber = function(card){

  return card.attr("id");

}

/*
* is called when no moves are left, opens all cards to the player,
* changes the color and displays the result
*/
let gameOver = function(){

  $("li").flipCard();
  $("li").addClass("gameOver");
  showResult();

}

/*
* is called from gameOver(), gets the corresponding string from getResult(),
* updated it on the modal and opens the modal
*/
let showResult = function(){

  $("#finalScore").text(getResult());
  $("#myModal").show();

}

/*
* returns a string depending on the points the player received
*/
let getResult = function(){

    switch(points){
      case (0):
        return "Too bad! You didn't find a single pair!";
        break;
      case (1):
      return "Could be better, you just have 1 point!";
      break;
      case( 2):
        return "Could be better, you just have 2 points!";
        break;
      case (3):
        case(4):
          case(5):
           return "Great job! You have " + points + " points!";
           break;
      case (6):
          return "Awesome! You almost found all pairs and received 6 points!";
          break;
      //7 cannot exist since there is just one pair left
      case (8):
          return "Perfect! You found all pairs!";
          break;
    }

  }

/*
* Turns the card and shows the image. Expects a jQuery-object and is added to
* the jQuery functions to be called directly from the object
*/
  jQuery.fn.flipCard = function() {

      var o = $(this[0]);
      o.toggleClass("open show");
      return this;

  };

/*
* Expects two cards as input and changes the colors,
* after CONST_DELAY miliseconds, the cards are turned back
*/
let noMatch = function(cardA, cardB){

  cardA.toggleClass("noMatch");
  cardB.toggleClass("noMatch");
  setTimeout(function(){
    cardA.toggleClass("noMatch");
    cardB.toggleClass("noMatch");
    cardA.flipCard();
    cardB.flipCard();
  }, CONST_DELAY);

};

/*
* Expects two cards as input and changes the colors
*/
let match = function(cardA, cardB){

  cardA.addClass("match");
  cardB.addClass("match");

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
  moves = 3;
  listOfCards = null;
  $(".deck").children().remove();
  $("#points").text(points);
  $("#moves").text(moves);

};

/*
* Part to implement the modal to show the result
*/

//functions to display the modal for the final score
 var modal = document.getElementById('myModal');
 var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
  span.onclick = function() {

    modal.style.display = "none";
    init();

  };

// Close the modal if user clicks somewhere else
window.onclick = function(event) {

    if (event.target == modal) {
        modal.style.display = "none";
        init();
    }

};
