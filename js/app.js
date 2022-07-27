'use strict';
const cache = {
  votingButtonSection: document.querySelector('.voting-buttons'),
  showResultsBtn: document.querySelector('.show-results-button'),
  roundCount: document.querySelector('.round-count'),
  resultsOverlay: document.querySelector('.results-overlay'),
  resultsList: document.querySelector('.results-list'),
  resultsChartCtx: document.querySelector('.results-chart').getContext('2d'),
};

const flags = {
  resultsDisplayed: false,
  votingOver: false,
}

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
function Product(fileName, extension = 'jpg', votes = 0, views = 0) {
  this.fileName = fileName;
  this.extension = extension;
  this.path = `${this.fileName}.${this.extension}`;
  this.productName = capitalizeWords(this.fileName);
  this.votes = votes;
  this.views = views;
  Product.instances.push(this);
}

Product.instances = [];
Product.inUseSet = [];

Product.pushToStorage = function() {
  localStorage.setItem('productInstances', JSON.stringify(Product.instances));
};
Product.pullFromStorage = function() {
  Product.instances = [];
  const storedProducts = JSON.parse(localStorage.getItem('productInstances'));
  if (storedProducts) {
    storedProducts.forEach(rawProduct => {
      Product.createFromRawObject(rawProduct)
    });
  } else {Product.instantiateProducts()}
};

Product.createFromRawObject = function(object) {
  return new Product(object.fileName, object.extension, object.votes, object.views);
};

Product.prototype.getPercent = function() {
  if (this.views === 0) {
    return 0;
  }
  return this.votes / this.views;
};

Product.instantiateProducts = function() {
  new Product('bag');
  new Product('banana');
  new Product('bathroom');
  new Product('boots');
  new Product('breakfast');
  new Product('bubblegum');
  new Product('chair');
  new Product('cthulhu');
  new Product('dog-duck');
  new Product('dragon');
  new Product('pen');
  new Product('pet-sweep');
  new Product('scissors');
  new Product('shark');
  new Product('sweep', 'png');
  new Product('tauntaun');
  new Product('unicorn');
  new Product('water-can');
  new Product('wine-glass');
};

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

function capitalizeWords(string) {
  let wordsArray = string.split('-');
  wordsArray = wordsArray.map(word => `${word[0].toUpperCase()}${word.substring(1)}`);
  return wordsArray.join(' ');
}

// Inclusive minimum, exclusive maximum. Algorithm from MDN Docs.
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

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
      item.innerText = `${product.productName}: ${product.votes} / ${product.views} (${Math.round(product.getPercent() * 100)}%)`;
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
  }
  Product.pushToStorage();
}

function renderBarChart() {
  // eslint-disable-next-line no-undef
  Chart.defaults.color = '#cccccc';
  // eslint-disable-next-line no-undef
  Chart.defaults.font.family = '"Roboto Mono", monospace',
  // eslint-disable-next-line no-undef
  Chart.defaults.font.size = 14;
  // eslint-disable-next-line no-undef
  return new Chart(cache.resultsChartCtx, {
    type: 'bar',
    data: {
      labels: Product.instances.map(product => product.productName),
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
  if (!flags.resultsDisplayed) {
    populateResults();
    cache.resultsOverlay.classList.remove('hidden');
    cache.votingButtonSection.classList.add('hidden');
    cache.barChart = renderBarChart();
    flags.resultsDisplayed = true;
  }
}
function closeResultsOverlay() {
  if (flags.resultsDisplayed) {
    cache.barChart.destroy();
    cache.resultsOverlay.classList.add('hidden');
    cache.votingButtonSection.classList.remove('hidden');
    flags.resultsDisplayed = false;
  }
}

cache.votingButtonSection.addEventListener('click', handleVoteSelection);

window.addEventListener('keydown', closeResultsOverlay);
cache.showResultsBtn.addEventListener('click', openResultsOverlay);
cache.showResultsBtn.style.display = 'none';
cache.showResultsBtn.style.opacity = 0;
cache.roundCount.innerText = `${votingState.round} / ${votingState.endAfterRound}`;
Product.pullFromStorage();
refreshVotingChoices(Product.instances);
