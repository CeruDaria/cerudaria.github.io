//Declaring page-wide variables
let currentID = "default-tooltip";
let tickBoxesInUse = [0,0,0];
let selectedFood = [];
let currentDishes = [];
let currentScore = 0;
let usedIng = [];

//Dishes
let dishes = {
    pizza: ["cheese,flour,tomato", "Pizza", 9],
    kimbab: ["egg,nori,rice", "Kimbab", 7],
    mpasta: ["mushroom,pasta", "Mushroom Pasta", 6],
    soup: ["beans,carrot,onion", "Vegetable Soup", 8],
    salad: ["lettuce,onion,tomato", "Fresh Salad", 7],
    burger: ["bun,cheese,lettuce", "Cheese Burger XL", 7],
    fries: ["potato", "Fries", 5],
    omelette: ["egg,onion,potato", "Spanish Omelette", 9],
    cotc: ["corn", "Corn on the Cob", 5],
    raclette: ["cheese,lettuce,potato", "Raclette", 9],
    cburger: ["bun,cheese", "Cheese Burger", 6],
    not: ["not", "Not Quite A Meal", 3],
    mystery: ["mystery", "Mystery Meal", 0],
    abomination: ["abomination", "ABOMINATION!", 0]
}

let deathlyGroupFat = ["egg","mushroom","cheese","milk"];
let deathlyGroupCarb = ["flour","nori","pasta","bun","rice"];

//Functions
////Showing tooltips when you hover over a tile in the table
function showTooltip(food) {
    let alt = food.alt;
    if(currentID) document.getElementById(currentID).style.display = "none";
    currentID = alt;
    document.getElementById(alt).style.display = "block";
}

////What happens when you click on a tile
function triggerOnIngClick(food) {
    let id = food.alt;
    let arr = getRecipe();
    let index = arr.indexOf(id);

    if(index >= 0) removeBox(index); //If re-selecting one selected tile, deselect it
    else tickBox(id); //Else select one tile

    arr = getRecipe();
    fillList(arr); //Fill selected ingredients list (HTML)
}

////Quick loop to get current selected ingredients
function getRecipe() {
    if(selectedFood) {
        let result = [];
        for(let i = 0; i < selectedFood.length; i++) {
            if(selectedFood[i]) result.push(selectedFood[i][0]);
        }
        return result;
    }
}

////What happens when you try to deselect an ingredient
function removeBox(index) {
    let tickBox = selectedFood[index][1];
    let tickBoxIdx = tickBox.substring(tickBox.length - 1) - 1;

    //Update in-use status
    tickBoxesInUse[tickBoxIdx] = 0;

    //Disable glowing effect
    document.getElementById(tickBox).style.display = "none";

    //Remove ingredient from selected ingredients list
    selectedFood.splice(index,1);
}

////What happens when you select an ingredient
function tickBox(id) {
    let boxId = id+"-box";
    for(let i = 0; i < tickBoxesInUse.length; i++) {
        let tickId = "tick"+(i+1);
        if(tickBoxesInUse[i] === 0){
            document.getElementById(boxId).appendChild(document.getElementById(tickId));
            document.getElementById(tickId).style.display = "block";
            tickBoxesInUse[i] = 1;
            selectedFood.push([id,tickId]);
            return;
        }   
    }
}

////Dynamically update the selected ingredient list
function fillList(arr) {
    for(let i=0; i < tickBoxesInUse.length; i++) {
        let slotId = "slot"+(i+1);
        if(arr[i]) document.getElementById(slotId).innerHTML = arr[i].substring(0,1).toUpperCase() + arr[i].substring(1);
        else document.getElementById(slotId).innerHTML = "";
    }
}

////Quick function similar to Excel's
function randBetween(b,t) {
    return Math.floor(Math.random() * (t - b) + b);
}

////What happens when you click the "START COOKING" button
function submitRecipe(arr) {
    let recipe = arr.sort().toString();
    let fatCount = 0;
    let carbCount = 0;

    //Card for classic dishes
    document.getElementById("overlay").style.display = "block";
    for(const val in dishes) {
        if(recipe === dishes[val][0]) {
            currentDishes.push(val);
            currentScore += dishes[val][2];
            document.getElementById(val).style.display = "block";
            document.getElementById("intro").innerHTML = "Congratulations! You have suggested a classic dish!";
            document.getElementById("dish-title").innerHTML = dishes[val][1];
            document.getElementById("desc").innerHTML = "Nam surely enjoyed this classic recipe you suggested!";
            return;
        }
    }

    //Card for poison
    if(arr.length >= 2) {
        for(let i=0; i<deathlyGroupFat.length; i++) {
            if(arr.indexOf(deathlyGroupFat[i]) >= 0) {
                fatCount++;
            }
        }
    
        for(let i=0; i<deathlyGroupCarb.length; i++) {
            if(arr.indexOf(deathlyGroupCarb[i]) >= 0) {
                carbCount++;
            }
        }
        if(fatCount > 1 || carbCount > 1) {
            currentScore *= -1;
            document.getElementById(dishes.abomination[0]).style.display = "block";
            document.getElementById("game-over").style.display = "block";
            document.getElementById("intro").innerHTML = "You murderer! You have made Nam eat an...";
            document.getElementById("desc").innerHTML = "Nam unfortunately was not able to survive such a foul creation. We have called the police on you!";
            document.getElementById("dish-title").innerHTML = dishes.abomination[1];
            return;
        }
    }

    //Card for only one ingredient (apart from Fries)
    if(arr.length === 1) {
        currentDishes.push(dishes.not[0]);
        currentScore += randBetween(1,3);
        document.getElementById(dishes.not[0]).style.display = "block";
        document.getElementById("intro").innerHTML = "That meal was quite disappointing...";
        document.getElementById("desc").innerHTML = "That was barely enough for an appetizer. Nam went to bed hungry.";
        document.getElementById("dish-title").innerHTML = dishes.not[1];
        return;
    }

    //Default card (mystery dish)
    currentDishes.push(dishes.mystery[0]);
    currentScore += randBetween(3,6);
    document.getElementById(dishes.mystery[0]).style.display = "block";
    document.getElementById("intro").innerHTML = "Hmm, no one has ever combined these ingredients together.";
    document.getElementById("desc").innerHTML = "Nam's roommate remarked curiously on the strange dish and refused to take even a bite.";
    document.getElementById("dish-title").innerHTML = dishes.mystery[1];
}

////Run the progress bar
function updateBar() {
    let day = currentDishes.length;
    let i = (day-1)*20;
    let itv = setInterval(runBar, 15);
    function runBar() {
        if(i >= day*20) clearInterval(itv);
        else {
            i++;
            document.getElementById("progress-bar").style.width = i + "%";
        }
    }
}

////What happens when you click on any card button
function onClickSubmitButton() {
    let arr = getRecipe();
    if(arr.length === 0) return;

    submitRecipe(arr);
    if(currentDishes.length < 5) {
        if(currentScore > 0) document.getElementById("game-continue").style.display = "block";
    }
    else if(currentScore >= 32) {
        document.getElementById("game-win").style.display = "block";
    } else {
        document.getElementById("game-lose").style.display = "block";
    }
    //Update current progress
    updateBar();
}

////What happens when you click the "NEXT DAY" button
function nextGame() {
    let arr = getRecipe();

    //Hide the overlay
    document.getElementById("overlay").style.display = "none";

    //Hide the current dish image
    document.getElementById(currentDishes[currentDishes.length - 1]).style.display = "none";

    //Hide the next day button
    document.getElementById("game-continue").style.display = "none";

    //Clear the list of selected ingredients (in HTML)
    fillList([]);

    for(let j=0;j<3;j++) {
        //Hide the glowing tile decoration
        document.getElementById("tick"+(j+1)).style.display = "none";
        //Clear in-use status for tickboxes
        tickBoxesInUse[j] = 0;
    }

    //Clear the list of selected ingredients (in JS)
    selectedFood = [];

    //Keep track of ingredients already used
    usedIng = usedIng.concat(arr);

    //Display "out of stock" tile decoration
    for(let i=0; i<usedIng.length; i++) {
        document.getElementById(usedIng[i]+"-oos").style.display = "block";
    }
}

////What happens when you hover over a day in the progress bar
function onHoverProgressBar(dotw) {
    let day = dotw.id;
    let dishNo = day.substring(day.length - 1)*1;
    if(dishNo <= currentDishes.length) {
        document.getElementById("on-hover-day").innerHTML = "On this day, Nam ate " + dishes[currentDishes[dishNo-1]][1].toUpperCase();
        document.getElementById("on-hover-day").style.display = "block";
    }
}

function onLeavingProgressBar() {
    document.getElementById("on-hover-day").style.display = "none";
}
    

 
