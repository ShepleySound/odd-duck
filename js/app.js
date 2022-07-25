'use strict';

const cache = {
  votingButtonSection: document.querySelector('.voting-buttons'),
  showResultsBtn: document.querySelector('.show-results-button')
};

// Constructs a new Product given a name, filepath, and file extension.
function Product(productName, fileName, extension = 'jpg') {
  this.productName = productName;
  this.fileName = fileName;
  this.extension = extension;
  this.path = `${this.fileName}.${this.extension}`;
  this.votes = 0;
  this.views = 0;
}

const productsArray = [
  new Product('R2D2 Luggage', 'bag'),
  new Product('Banana Slicer', 'banana'),
  new Product('Bathroom Tablet Stand', 'bathroom'),
  new Product('Toeless Rain Boots', 'boots'),
  new Product('All-in-one Breakfast Maker', 'breakfast'),
  new Product('Meatball Bubble Gum', 'bubblegum'),
  new Product('Camel Chair', 'chair'),
  new Product('Cthulu Figurine', 'cthulhu'),
  new Product('Doggy Duck Bill', 'dog-duck'),
  new Product('Dragon Mean', 'dragon'),
  new Product('Pen Utensils', 'pen'),
  new Product('Pet Sweep', 'pet-sweep'),
  new Product('Pizza Scissors', 'scissors'),
  new Product('Stuffed Shark Toy', 'shark'),
  new Product('Baby Sweeper Onesie', 'sweep', 'png'),
  new Product('Tauntaun Blanket', 'tauntaun'),
  new Product('Unicorn Meat', 'unicorn'),
  new Product('Self-Watering Watering Can', 'water-can'),
  new Product('EZ Tip Wine Glass', 'wine-glass'),
];

// Inclusive minimum, exclusive maximum. Algorithm from MDN Docs.
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

function pickRandomUniques(choicesArray, numToPick) {
  const array = choicesArray.slice();
  const picksArray = [];
  for (let i = 0; i < numToPick; i++) {
    const randomIndex = getRandomInt(0, array.length);
    picksArray.push(array[randomIndex]);
    array.splice(randomIndex, 1);
  }
  return picksArray;
}

function drawButton(buttonElement, productObject) {
  buttonElement.innerHTML = '';
  const img = document.createElement('img');
  img.src = `img/${productObject.path}`;
  img.alt = `${productObject.productName}`;
  img.classList.add('product-image');
  img.width = '300';
  buttonElement.append(img);
  console.log(buttonElement)
}

function refreshVotingChoices(choicesArray) {
  const votingButtons = cache.votingButtonSection.children;
  const newChoices = pickRandomUniques(choicesArray, votingButtons.length);
  for (let i = 0; i < votingButtons.length; i++) {
    drawButton(votingButtons[i], newChoices[i]);
  }
  
}

cache.votingButtonSection.addEventListener('click', (e) => {
  refreshVotingChoices(productsArray)
  
});



