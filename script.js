// Global Variables
let i, j, k, l, m, n, x, y;
let iFrac, kFrac; // for checking fractions
let min, max; // smallest and largest possible numbers to use in analysis
let pattern = []; // original pattern array
let finalNumber;
let possibleKeys = [];
let previousKeys = [];
let bestKey = [];

// https://www.fibonicci.com/numerical-reasoning/number-sequences-test/easy/

$("#number-input-submit").click(function() {
  if (processUserInput() === "invalid") { return; }
  determineSearchType();
  findPattern();
  finalNumber = useKey(bestKey, pattern.length - 1);
  displayToUser();
  console.log(possibleKeys);
});

$("#show-next").click(function() {
  if (possibleKeys.length === 0) { // error handling
    return false;
  }
  previousKeys.push(bestKey);
  let oldIndex = possibleKeys.indexOf(bestKey);
  possibleKeys.splice(oldIndex, 1);
  findBestKey();
  finalNumber = useKey(bestKey, pattern.length - 1);
  displayToUser();
});

$("#show-prev").click(function() {
  if (previousKeys.length === 0) { // error handling
    return false;
  }
  bestKey = previousKeys[previousKeys.length - 1];
  previousKeys.splice(previousKeys.length - 1, 1);
  possibleKeys.unshift(bestKey);
  finalNumber = useKey(bestKey, pattern.length - 1);
  displayToUser();
});

// Function Declarations
function processUserInput() {
  let rawUserInput = document.getElementById("number-input").value;
  let re = /-?[.\d]+/g; // gets ints, negatives, and decimals
  pattern = rawUserInput.match(re);
  // convert array of strings into array of numbers
  for (i = 0; i < pattern.length; i++) {
    pattern[i] = parseInt(pattern[i])
  }
  // check if pattern is long enough
  if (pattern.length < 3) {
    $("#error-message-length").show()
    return "invalid";
  } else {
    $("#error-message-length").hide()
  }
  return "valid";
}

function determineSearchType() {
  /* max and min are used to determine search complexity */
  // get the selected option from the radio buttons
  max = parseInt($('input[name = "search-type"]:checked').val());
  min = max * -1;
}

function findPattern() {
  possibleKeys = []; // clear cache
  generateKeys();
  findBestKey();
}

function generateKeys() {
  for (i = min; i <= max; i++) {
    for (j = min; j <= max; j++) {
      for (k = min; k <= max; k++) {
        for (l = min; l <= max; l++) {
          testKey([i, j, k, l]);
          iFrac = 1 / i;
          testKey([iFrac, j, k, l]);
          kFrac = 1 / k;
          testKey([i, j, kFrac, l]);
          testKey([iFrac, j, kFrac, l]);
        }
      }
    }
  }
}

function testKey(key) {
  // check if this key fits the pattern, either by multiplying or adding first
  for (m = 0; m < pattern.length - 1; m++) {
    x = pattern[m] * (key[0] + key[1] * (m)) + (key[2] + key[3] * m);
    y = (pattern[m] + key[0] + key[1] * m) * (key[2] + key[3] * m);
    //NOTE: this isn't perfect because we're checking both at the same time
    if (x !== pattern[m + 1] && y !== pattern[m + 1]) {
      return;
    }
  }
  if (x === pattern[pattern.length - 1]) {
    key.push("multiplyThenAdd")
  } else {
    key.push("addThenMultiply")
  }
  // check for duplicates
  for (n = 0; n < possibleKeys.length; n++) {
    if (key[0] === possibleKeys[n][0] && key[1] === possibleKeys[n][1] &&
        key[2] === possibleKeys[n][2] && key[3] === possibleKeys[n][3]) {
      return;
    }
  }
  possibleKeys.push(key);
}

function useKey(key, index) {
  // use the key to find the next number in the pattern and return that
  if (key[4] === "multiplyThenAdd") {
    return pattern[index] * (key[0] + key[1] * (index)) + (key[2] + key[3] * (index));
  } else {
    return (pattern[index] + key[0] + key[1] * index) * (key[2] + key[3] * index);
  }
}

function findBestKey() {
  /* this is a simple way to find what might be the best key
     the best key will probably have a zero or a low number in it
     so that's what we use to deterimine scoreBest */
  bestKey = null; // initialize
  let scoreBest = 0; // initialize
  let current, scoreCurrent;
  for (i = 0; i < possibleKeys.length; i++) {
    current = possibleKeys[i];
    scoreCurrent = 0;
    for (j = 0; j < current.length - 1; j++) {
      if (current[j] === 0) {
        scoreCurrent++;
      }
      if (current[j] >= -2 && current[j] <= 2) {
        scoreCurrent++;
      }
    }
    if (scoreCurrent >= scoreBest) {
      bestKey = current;
      scoreBest = scoreCurrent;
    }
  }
}

function displayToUser() {
  let firstMessage, secondMessage;
  let html = "";
  let explanation;
  let resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "";
  
  if (bestKey[4] === "multiplyThenAdd") {
    firstMessage = "Multiply by ";
    secondMessage = "add ";
  }
  else if (bestKey[4] === "addThenMultiply") {
    firstMessage = "Add ";
    secondMessage = "multiply by ";
  }
  for (i = 0; i < pattern.length; i++) {
    html += '<p class="number">' + pattern[i] + "</p>";
    explanation = "";
    let shouldAddThen = true;
    if (bestKey[0] !== 1 || bestKey[1] !== 0) {
      let shouldAddThen = true;
      explanation += firstMessage + bestKey[0] + " ";
      if (bestKey[1] !== 0) {
        explanation += "+ " + (bestKey[1] * i) + " (increment of " + bestKey[1] + ") ";
      }
    } else {
      shouldAddThen = false;
    }
    if (bestKey[2] !== 0 || bestKey[3] !== 0) {
      if (shouldAddThen === true) {
        explanation += "then ";
      }
      explanation += secondMessage + bestKey[2] + " ";
      if (bestKey[3] !== 0) {
        explanation += "+ " + (bestKey[3] * i) + " (increment of " + bestKey[3] + ") ";
      }
      explanation += "=";
    }
    html += '<p class="explanation">' + explanation + "</p>";
  }
  html += '<p class="number">Final Number: ' + finalNumber + "</p>";
  $(resultDiv).html(html);
  showOrHideButtons();
}

function showOrHideButtons() {
  if (possibleKeys.length > 1) {
    $("#show-next").show();
  } else {
    $("#show-next").hide();
  }
  if (previousKeys.length > 0) {
    $("#show-prev").show();
  } else {
    $("#show-prev").hide();
  }
}
