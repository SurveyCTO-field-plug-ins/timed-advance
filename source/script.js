/*class Choice {
    constructor(value, index, label, selected, image) {
        this.CHOICE_VALUE = value;
        this.CHOICE_INDEX = index;
        this.CHOICE_LABEL = label;
        this.CHOICE_SELECTED = selected;
        this.CHOICE_IMAGE = image;
    }
}

var fieldProperties = {
    "CHOICES": [],
    "APPEARANCE": ["quick"],
    "FIELDTYPE": "integer",
    "PARAMETERS": [
        {
            "key": "duration",
            "value": 10
        },
        {
            "key": "unit",
            "value": "s"
        }
    ],
    "CURRENT_ANSWER": undefined,
    "METADATA": 9000
}

function getMetaData(){
    return fieldProperties.METADATA;
}

function setMetaData(value){
    fieldProperties.METADATA = value;
}

//fieldProperties.CHOICES[0] = new Choice(0, 0, "Hi");

/*function testing(message) {
    console.log(message);
    infoDiv.innerHTML = message;
}*/
//*/

// Find the input element
var buttons = document.querySelectorAll('input[name="opt"]');
var formGroup = document.querySelector('.form-group');
var controlMessage = document.querySelector('.control-message');
var textBox = document.querySelector('#field');
var formattedSpan = document.querySelector('#formatted');
var choiceDiv = document.querySelector('#radio-buttons-container');
var choiceContainers = document.querySelectorAll(".choice-container");
var choiceLabels = document.querySelectorAll('#choicelabels');
var timerDisp = document.querySelector('#timerdisp');
var unitDisp = document.querySelector('#unitdisp');
var numButtons = buttons.length;

var infoDiv = document.querySelector('#info');

var fieldType = fieldProperties.FIELDTYPE;
var appearance = fieldProperties.APPEARANCE;
var parameters = fieldProperties.PARAMETERS;
var numParam = parameters.length;
var leftoverTime;
var error = false;
var complete = false;
var currentAnswer;

var startTime; //This will get an actual value when the timer starts in startStopTimer();
var timeStart = 10000; //Default values may be overwritten depending on the number of paramaters given,
var unit = 's'; //Default, may be changed
var round = 1000; //Default, may be changed
var missed = -99; //Default, may be changed
var timeLeft; //Starts this way for the display.
var timePassed = 0; //Time passed so far

switch (numParam) {
    case 4:
        if(parameters[3].value == 1){
            leftoverTime = getMetaData();
        }
    case 3:
        missed = parameters[2].value;
    case 2:
        unit = parameters[1].value;

        if (unit == 'ms') {
            unit = 'milliseconds'
            round = 1;
        }
        else if (unit == 'cs') {
            unit = 'centiseconds'
            round = 10;
        }
        else if (unit == 'ds') {
            unit = 'deciseconds'
            round = 100;
        }
        else {
            unit = 'seconds';
            round = 1000;
        }
    case 1:
        timeStart = parameters[0].value * 1000; //Time limit on each field in milliseconds\
}


currentAnswer = fieldProperties.CURRENT_ANSWER;

if(currentAnswer == null){ //This is so if the enumerator/respondents swipes backward then forward, the timer does not reset.
    leftoverTime = getMetaData(); //Metadata is how much time was previously left on the timer for this field
}

if (leftoverTime == null) {
    startTime = Date.now();
    timeLeft = timeStart;
    checkComplete(currentAnswer);
}
else if (leftoverTime <= 0) {
    goToNextField();
}
else {
    timeLeft = parseInt(leftoverTime);
    startTime = Date.now() - (timeStart - timeLeft);
    
}
unitDisp.innerHTML = unit;


if ((fieldType == 'select_one') || (fieldType == 'select_multiple')) {
    currentAnswer = [];
    textBox.style.display = 'none';
    formattedSpan.style.display = 'none';
    var choices = fieldProperties.CHOICES;
    var numChoices = choices.length;
    var choiceValues = [];
    for (var i = 0; i < numButtons; i++) {
        choiceLabels[i].innerHTML = choices[i].CHOICE_LABEL; //Gives each choice its HTML style

        if (fieldType == 'select_multiple') {
            buttons[i].type = "checkbox";
        }

        buttons[i].onchange = change;

        let choiceValue = choices[i].CHOICE_VALUE;
        choiceValues.push(choiceValue);
        if (choices[i].CHOICE_SELECTED) {
            currentAnswer.push(choiceValue);
        }
    }

    var missedChoice = choiceValues.indexOf(String(missed));
    if (missedChoice == -1) {
        error = true;
        var labelDiv = document.querySelector('#label');
        labelDiv.style.color = '#ff0000';
        labelDiv.innerHTML = 'Error! The form needs to have "' + missed + '" as one of the choice values.';
    }
    else {
        var passDiv = document.querySelector('#choicevalue' + missed);
        passDiv.style.display = 'none';
    }


    // Define what happens when the user attempts to clear the response
    function clearAnswer() {
        for (b of buttons) {
            b.checked = false;
        }
    }

    // Save the user's response (update the current answer)
    function change() {
        let selectedButtons = [];
        for (let i = 0; i < numButtons; i++) {
            if (buttons[i].checked) {
                selectedButtons.push(choices[i].CHOICE_VALUE);
            }
        }
        currentAnswer = selectedButtons.join(' ');
        setAnswer(currentAnswer);
        // If the appearance is 'quick', then also progress to the next field
        if (appearance.includes("quick") == true) {
            goToNextField();
        }
    }

    // When a button is pressed, call the change() function and tell it which button was pressed.

    // quick appearance
    if ((appearance.includes("quick") == true) && (fieldType == 'select_one')) {
        // go through all the available choices
        window.onload = function () {
            for (var i = 0; i < choiceContainers.length; i++) {
                // add the 'appearance-quick' class
                choiceContainers[i].classList.add("appearance-quick");
                // insert the 'quick' icon
                choiceContainers[i].getElementsByClassName("choice-label-text")[0].insertAdjacentHTML('beforeend', '<svg class="quick-appearance-icon"><use xlink:href="#quick-appearance-icon" /></svg>');
            }
        }
    }
}
else { //A text, integer, or decimal field
    if (fieldType == 'integer') {
        textBox.inputmode = 'numeric';
        textBox.type = 'number';
    }
    else if (fieldType == 'decimal') {
        textBox.inputmode = 'decimal';
        textBox.type = 'number';
    }
    else if (fieldType == 'text') {
        if (appearance.includes('numbers_phone')) {
            textBox.inputmode = 'tel';
            textBox.type = 'tel';
        }
        else if (appearance.includes('numbers_decimal')) {
            textBox.inputmode = 'decimal';
            textBox.type = 'number';
        }
        else if (appearance.includes('numbers')) {
            textBox.inputmode = 'numeric';
            textBox.type = 'number';
        }
    }
    choiceDiv.style.display = 'none';

    function clearAnswer() {
        textBox.value = '';
        setAnswer();
        timePassed = 0;
    }

    function setFocus() {
        textBox.focus();

        if (!fieldProperties.READONLY) {
            if (window.showSoftKeyboard) {
                window.showSoftKeyboard();
            }
        }
    }

    textBox.oninput = function () {
        formGroup.classList.remove('has-error');
        controlMessage.innerHTML = '';
        currentAnswer = textBox.value.toString();

        if (appearance.includes('show_formatted')) {
            let pointLoc = currentAnswer.indexOf('.');

            if (pointLoc == -1) {
                formattedSpan.innerHTML = currentAnswer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            }
            else {
                let beforePoint = currentAnswer.substring(0, pointLoc).replace(/\B(?=(\d{3})+(?!\d))/g, ","); //Before the decimal point
                let midPoint = currentAnswer.substring(pointLoc + 1, pointLoc + 3); //The first two digits after the decimal point; this is because the first two digits after the decimal point are the "tenths" and "hundredths", while after that is "thousandths"
                let afterPoint = currentAnswer.substring(pointLoc + 3, currentAnswer.length).replace(/\B(?<=(^(\d{3})+))/g, ","); //After the first two digits after the decimal point
                let total = beforePoint;

                if (midPoint != '') { //Adds the decimal point only if it is needed
                    total += '.' + midPoint;
                    if (afterPoint != '') { //Adds the comma after "midPoint" and the rest only if they are needed
                        total += ',' + afterPoint;
                    }
                }
                formattedSpan.innerHTML = total;
            }
        }

        setAnswer(currentAnswer);
    }
}

if (!error) {
    setInterval(timer, 1);
}

function cursorToEnd(el) { //Moves cursor to end of text in text box (incondistent in non-text fields)
    if (typeof el.selectionStart == "number") {
        el.selectionStart = el.selectionEnd = el.value.length;
    }
    else if (typeof el.createTextRange != "undefined") {
        el.focus();
        var range = el.createTextRange();
        range.collapse(false);
        range.select();
    }
}

function handleConstraintMessage(message) {
    formGroup.classList.add('has-error');
    controlMessage.innerHTML = message;
}

function handleRequiredMessage(message) {
    handleConstraintMessage(message)
}

function checkComplete(cur) {
    if (Array.isArray(cur)) {
        if (cur.length != 0) {
            goToNextField();
        }
    }
    else if (cur != null) {
        goToNextField();
    }
}


function timer() {
    if (!complete) {
        timePassed = Date.now() - startTime;
        timeLeft = timeStart - timePassed;
    }

    if (timeLeft < 0) { //Timer ended
        complete = true;
        timeLeft = 0;
        timerDisp.innerHTML = String(Math.ceil(timeLeft / round));

        if ((currentAnswer == null) || (Array.isArray(currentAnswer) && (currentAnswer.length == 0))) {
            setAnswer(missed);
        }
        setMetaData(0);
        goToNextField();
    }
    setMetaData(timeLeft);

    timerDisp.innerHTML = String(Math.ceil(timeLeft / round));
}
