'use strict';
const cache = {
  votingButtonSection: document.querySelector('.voting-buttons'),
  showResultsBtn: document.querySelector('.show-results-button'),
  roundCount: document.querySelector('.round-count'),
  resultsOverlay: document.querySelector('.results-overlay'),
  resultsList: document.querySelector('.results-list'),
  resultsChartCanvas: document.querySelector('.results-chart').getContext('2d'),
};

const votingState = {
  endAfterRound: 25,
  round: 1,
  incrementRound() {
    this.round++;
  },
  isResultDisplayable() {
    if (this.round >= this.endAfterRound) {
      return true;
    } else {
      return false;
    }
  }
};

// Constructs a new Product given a name, filepath, and file extension.
function Product(productName, fileName, extension = 'jpg') {
  this.productName = productName;
  this.fileName = fileName;
  this.extension = extension;
  this.path = `${this.fileName}.${this.extension}`;
  this.votes = 0;
  this.views = 0;
  Product.instances.push(this);
}
Product.instances = [];
Product.inUseSet = [];

Product.prototype.getPercent = function() {
  if (this.views === 0) {
    return 0;
  }
  return this.votes / this.views;
};

new Product('R2D2 Luggage', 'bag');
new Product('Banana Slicer', 'banana');
new Product('Bathroom Tablet Stand', 'bathroom');
new Product('Toeless Rain Boots', 'boots');
new Product('All-in-one Breakfast Maker', 'breakfast');
new Product('Meatball Bubble Gum', 'bubblegum');
new Product('Camel Chair', 'chair');
new Product('Cthulu Figurine', 'cthulhu');
new Product('Doggy Duck Bill', 'dog-duck');
new Product('Dragon Mean', 'dragon');
new Product('Pen Utensils', 'pen');
new Product('Pet Sweep', 'pet-sweep');
new Product('Pizza Scissors', 'scissors');
new Product('Stuffed Shark Toy', 'shark');
new Product('Baby Sweeper Onesie', 'sweep', 'png');
new Product('Tauntaun Blanket', 'tauntaun');
new Product('Unicorn Meat', 'unicorn');
new Product('Self-Watering Watering Can', 'water-can');
new Product('EZ Tip Wine Glass', 'wine-glass');

// Inclusive minimum, exclusive maximum. Algorithm from MDN Docs.
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

Product.pickRandomUniques = function(numToPick) {
  let successes = 0;
  // Handles getting items unique to the current set AND previous set.
  while (successes < numToPick) {
    const randomIndex = getRandomInt(0, Product.instances.length);
    const randomProduct = Product.instances[randomIndex];
    if (Product.inUseSet.includes(randomProduct)) {
      console.log('Duplicate attempted. Retrying...');
    }
    if (!Product.inUseSet.includes(randomProduct)) {
      successes++;
      randomProduct.views++;
      Product.inUseSet.unshift(randomProduct);
    }
  }
  Product.inUseSet.splice(numToPick);
  return Product.inUseSet;
};

// Draws an image to a buttonElement using given productObject properties.
function drawButton(buttonElement, productObject) {
  buttonElement.innerHTML = '';
  buttonElement.id = productObject.fileName;
  const img = document.createElement('img');
  img.src = `img/${productObject.path}`;
  img.alt = `${productObject.productName}`;
  img.classList.add('product-image');
  img.width = '300';
  // No need for event listeners to interact with the images directly.
  img.style.pointerEvents = 'none';
  buttonElement.append(img);
}

// Creates new voting choices for user.
function refreshVotingChoices() {
  const votingButtons = cache.votingButtonSection.children;
  const newChoices = Product.pickRandomUniques(votingButtons.length);
  for (let i = 0; i < votingButtons.length; i++) {
    drawButton(votingButtons[i], newChoices[i]);
  }
}

function handleVotingEnd() {
  if (votingState.isResultDisplayable()) {
    cache.showResultsBtn.style.display = 'block';
    cache.showResultsBtn.style.opacity = 100;
    cache.votingButtonSection.removeEventListener('click', handleVoteSelection);
    const votingButtons = cache.votingButtonSection.children;
    for (let i = 0; i < votingButtons.length; i++) {
      votingButtons[i].classList.add('disabled');
    }
  }
}

// Clears result list and pushes session results to the page.
function populateResults() {
  if (votingState.isResultDisplayable) {
    cache.resultsList.innerHTML = '';

    Product.instances.forEach(product => {
      const item = document.createElement('li');
      item.innerText = `${product.fileName}: ${product.votes} / ${product.views} (${Math.round(product.getPercent() * 100)}%)`;
      cache.resultsList.append(item);
    });
  }
}

function handleVoteSelection(event) {
  const chosenProduct = Product.instances.find(product => {
    return product.fileName === event.target.id;
  });

  if (!chosenProduct) {
    return;
  }

  chosenProduct.votes++;
  if (!votingState.isResultDisplayable()) {
    refreshVotingChoices(Product.instances);
    votingState.incrementRound();
    cache.roundCount.innerText = `${votingState.round} / ${votingState.endAfterRound}`;
  } else {
    handleVotingEnd();
    cache.roundCount.innerText = 'Voting Over';
  }
}

function buildBarChart() {
  // eslint-disable-next-line no-undef
  Chart.defaults.color = '#cccccc';
  // eslint-disable-next-line no-undef
  Chart.defaults.font.family = '"Roboto Mono", monospace',
  // eslint-disable-next-line no-undef
  Chart.defaults.font.size = 14;
  // eslint-disable-next-line no-undef
  new Chart(cache.resultsChartCanvas, {
    type: 'bar',
    data: {
      labels: Product.instances.map(product => product.fileName),
      datasets: [{
        label: '# of Views',
        data: Product.instances.map(product => product.views),
        backgroundColor: [
          '#CACFB53f',
          '#9FA9933f',
          '#9DA9A13f',
          '#BDB2A83f',
          '#906A653f',
        ],
        borderWidth: 1
      },
      {
        label: '# of Votes',
        data: Product.instances.map(product => product.votes),
        backgroundColor: [
          '#D9E59D',
          '#A2BD81',
          '#94B49D',
          '#D0B194',
          '#B84D3F',
        ],
        borderColor: [
          '#121212'
        ],
        borderWidth: 1
      }],
    },
    options: {
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: true,
          ticks: {
            font: {
              size: 14
            },
            maxRotation: 90
          }
        },
        y: {
          ticks: {
            precision: 0
          },
          stacked: false
        }
      }
    },
  });
}

function openResultsOverlay() {
  populateResults();
  cache.resultsOverlay.classList.remove('hidden');
  cache.votingButtonSection.classList.add('hidden');
  buildBarChart();
}
function closeResultsOverlay() {
  cache.resultsOverlay.classList.add('hidden');
  cache.votingButtonSection.classList.remove('hidden');
}



cache.votingButtonSection.addEventListener('click', handleVoteSelection);

window.addEventListener('keydown', closeResultsOverlay);
cache.showResultsBtn.addEventListener('click', openResultsOverlay);
cache.showResultsBtn.style.display = 'none';
cache.showResultsBtn.style.opacity = 0;
cache.roundCount.innerText = `${votingState.round} / ${votingState.endAfterRound}`;
refreshVotingChoices(Product.instances);
