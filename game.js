/* This is an implementation of Conway's Game of Life
   See: https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life

   Rules of the game are:

   1 - Any live cell with fewer than two live neighbours dies, as if caused by under-population.
   2 - Any live cell with two or three live neighbours lives on to the next generation.
   3 - Any live cell with more than three live neighbours dies, as if by overcrowding.
   4 - Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
*/

// Model
(function () {
  let _ = self.Life = function (seed) {
    this.seed = seed;
    this.height = this.seed.length;
    this.width = this.seed[0].length;

    this.prevBoard = [];
    this.board = cloneArray(this.seed);
  };

  _.prototype = {
    // https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life#Rules
    next: function () {
      this.prevBoard = cloneArray(this.board);

      for (let y= 0; y < this.height; y++){
        for (let x=0; x < this.width; x++){
          let neighbor = this.aliveNeighbors(this.prevBoard, x, y);
          
          let alive = !!this.board[y][x];
          
          if (alive){
            switch(true) {
              // Any live cell with fewer than two live neighbors dies, as if by under population.
              // Any live cell with more than three live neighbors dies, as if by overpopulation.
              case (neighbor < 2 || neighbor > 3):
                this.board[y][x] = 0;
                break;
              // Any live cell with two or three live neighbors lives on to the next generation.
              case (neighbor === 2 || neighbor === 3) :
                this.board[y][x] = 1;
                break;
            }
          } else {
            // Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.
            if (neighbor === 3) {
              this.board[y][x] = 1;
            }
          }
        }
      }
    },

    aliveNeighbors: function (array, x, y) {
      let provRow = array[y-1] || [];
      let newRow = array[y+1] || [];


      return [
        provRow[x-1], provRow[x], provRow[x+1],
        array[y][x-1], array[y][x+1],
        newRow[x-1], newRow[x], newRow[x+1]
      ].reduce(function(previousValue, currentValue){
       return previousValue + +!!currentValue;
      }, 0);
    },

    toString: function () {
      return this.board.map(function (row) {
        return row.join(' ');
      }).join('\n');
    }
  };

  // clones 2d array
  function cloneArray(array) {
    return array.slice().map(function (row) {
      return row.slice();
    })
  }
})();


// View
(function () {
  let _ = self.LifeView = function (table, size) {
    this.grid = table;
    this.size = size;
    this.autoplay = false;
    this.started = false;

    this.createGrid();
  };

  _.prototype = {
    createGrid: function () {
      let me = this;
      // invisible DOM so you don't interact with the DOM too much
      // because every DOM interaction is a performace hit
      let fragment = document.createDocumentFragment();
      this.grid.innerHtml = '';
      this.checkboxes = [];

      for (let y= 0; y < this.size; y++){
        let row = document.createElement('tr');
        this.checkboxes[y] = [];

        for (let x=0; x < this.size; x++){
          let cell = document.createElement('td');
          let checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          this.checkboxes[y][x] = checkbox;
          checkbox.coordinates = {
            y: y,
            x: x
          };

          cell.appendChild(checkbox);
          row.appendChild(cell);
        }

        fragment.appendChild(row);
      }

      this.grid.addEventListener('change', function (event) {
        if (event.target.nodeName.toLowerCase() === 'input'){
           me.started = false;
        }
      });

      this.grid.addEventListener('keyup', function (event) {
        let checkbox = event.target;

        if (checkbox.nodeName.toLowerCase() === 'input'){
          let coordinates = checkbox.coordinates;
          let x = coordinates.x;
          let y = coordinates.y;

          switch (event.keyCode){
            case 37: //left
              if (x > 0) {
                me.checkboxes[y][x-1].focus();
              }
              break;
            case 38: //up
              if (y > 0) {
                me.checkboxes[y-1][x].focus();
              }
              break;
            case 39: //right
              if (x < me.size-1) {
                me.checkboxes[y][x+1].focus();
              }
              break;
            case 40: //bottom
              if (y < me.size-1) {
                me.checkboxes[y+1][x].focus();
              }
              break;
          }
        }
      });

      this.grid.appendChild(fragment);
    },

    // return something like this [
    //     [0, 0, 0, 0, 0],
    //     [0, 0, 1, 0, 0],
    //     [0, 0, 1, 0, 0],
    //     [0, 0, 1, 0, 0],
    //     [0, 0, 0, 0, 0]
    // ]
    get boardArray() {
      return this.checkboxes.map(function (row) {
        return row.map(function (checkbox) {
          // convert boolean to 0 or 1
          return +checkbox.checked;
        })
      })
    },
    
    play: function () {
      this.game = new Life(this.boardArray);
      this.started = true;
    },
    
    next: function () {
      let me = this;

      if (!this.started || this.game){
        this.play();
      }

      this.game.next();
      let board = this.game.board;

      for (let y= 0; y < this.size; y++){
        for (let x=0; x < this.size; x++){
          this.checkboxes[y][x].checked = !!board[y][x];
        }
      }

      if (this.autoplay) {
        this.timer = setTimeout(function () {
          me.next();
        }, 1000);
      }
    }
  };
})();


// Controller
(function() {

  let buttons = {
    next: $('button.next')
  };

  buttons.next.addEventListener('click', function() {
    lifeView.autoplay = false;
    lifeView.next();
  });

  $('#autoplay').addEventListener('change', function() {
    buttons.next.disabled = this.checked;

    if (this.checked) {
      lifeView.autoplay = this.checked;
      lifeView.next();
    }
    else {
      clearTimeout(lifeView.timer);
    }
  });
})();

function $(selector, container) {
  return (container || document).querySelector(selector);
}

let lifeView = new LifeView(document.getElementById('grid'), 12);
