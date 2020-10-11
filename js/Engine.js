// The engine class will only be instantiated once. It contains all the logic
// of the game relating to the interactions between the player and the
// enemy and also relating to how our enemies are created and evolve over time
class Engine {
  // The constructor has one parameter. It will refer to the DOM node that we will be adding everything to.
  // You need to provide the DOM node when you create an instance of the class
  constructor(theRoot) {
    // We need the DOM element every time we create a new enemy so we
    // store a reference to it in a property of the instance.
    this.root = theRoot;
    // We create our hamburger.
    // Please refer to Player.js for more information about what happens when you create a player
    this.player = new Player(this.root);
    // Initially, we have no enemies in the game. The enemies property refers to an array
    // that contains instances of the Enemy class
    this.enemies = [];
    this.friends = [];

    //loading bullets
    //this.bullets = []
    this.idEncountered = [] //enemies encountered
    this.friendsEncountered = [] //id of friend encountered to avoid counting multiple time the same friend.
    // We add the background image to the game
    addBackground(this.root);
    //adding text
    this.scoreText = new Text(this.root, "15px", "15px")
    this.score = 0
    this.livesText = new Text(this.root, "450px", "15px")
    this.gameOver = new Text (this.root, "230px", "300px")
    this.lives = 0
    this.restartbtn = document.getElementById("restart")
    this.restartbtn.addEventListener("click", this.restart)
  }


  
  // The gameLoop will run every few milliseconds. It does several things
  //  - Updates the enemy positions
  //  - Detects a collision between the player and any enemy
  //  - Removes enemies that are too low from the enemies array
  gameLoop = () => {
    // This code is to see how much time, in milliseconds, has elapsed since the last
    // time this method was called.
    // (new Date).getTime() evaluates to the number of milliseconds since January 1st, 1970 at midnight.
    if (this.lastFrame === undefined) {
      this.lastFrame = new Date().getTime();
    }

    let timeDiff = new Date().getTime() - this.lastFrame;

    this.lastFrame = new Date().getTime();
    // We use the number of milliseconds since the last call to gameLoop to update the enemy positions.
    // Furthermore, if any enemy is below the bottom of our game, its destroyed property will be set. (See Enemy.js)
    this.player.bulletsArray.forEach((bullet) => {
      bullet.update(timeDiff);
    });

    this.enemies.forEach((enemy) => {
      enemy.update(timeDiff);
    });
    
    this.friends.forEach((friend) => {
      friend.update(timeDiff);
    });

    // We remove all the destroyed enemies from the array referred to by \`this.enemies\`.
    // We use filter to accomplish this.
    // Remember: this.enemies only contains instances of the Enemy class.
    // adding a point counter
    this.enemies.forEach((enemy) => {
      if(enemy.y + ENEMY_HEIGHT > GAME_HEIGHT){
        this.score += 1/50
      }
    })

    this.scoreText.update(`score:  ${Math.round(this.score)}`)
    
    this.livesText.update(`lives: ${Math.floor(this.lives)}`)
    

    this.player.bulletsArray = this.player.bulletsArray.filter((bullet) => {
      return !bullet.destroyed;
    });

    this.enemies = this.enemies.filter((enemy) => {
      return !enemy.destroyed;
    });
    
    this.friends = this.friends.filter((friend) => {
      return !friend.destroyed;
    });

    let done = false
    // We need to perform the addition of enemies until we have enough enemies.
    while (this.enemies.length < MAX_ENEMIES && !done) {
      // We find the next available spot and, using this spot, we create an enemy.
      // We add this enemy to the enemies array
      const spot = nextEnemySpot(this.enemies);
      this.enemies.push(new Enemy(this.root, spot));
    }
    while (this.friends.length < 1 && !done) {
      const spot = nextFriendSpot(this.friends);
      this.friends.push(new Friend(this.root, spot));
    }

    // We check if the player is dead. If he is, we alert the user
    // and return from the method (Why is the return statement important?)
    if (this.isPlayerDead()) {
      this.gameOver.update("Game Over!")
      tryAgain.style.display = "block"
      return
    }

    this.playerLives()
    //console.log(this.idEncountered)

    this.shootingEnemies()

    // If the player is not dead, then we put a setTimeout to run the gameLoop in 20 milliseconds
    setTimeout(this.gameLoop, 20);
  };

  isPlayerDead = () => {
    let isDead = false
    
    this.enemies.forEach((enemy) =>{
      let id = enemy.domElement.id
      //console.log(this.idEncountered)
      //console.log(this.idEncountered.indexOf(id))
      if(this.player.x === enemy.x &&
        enemy.y + ENEMY_HEIGHT -7 >= GAME_HEIGHT - PLAYER_HEIGHT -10 && 
        this.lives < 1 &&
        this.idEncountered.indexOf(id) === -1){
          //console.log(this.idEncountered)
          this.idEncountered.push(id) 
          isDead = true
        } else if (this.player.x === enemy.x &&
          enemy.y + ENEMY_HEIGHT -7 >= GAME_HEIGHT - PLAYER_HEIGHT -10 &&
          this.idEncountered.indexOf(id) === -1) {
            this.lives -= 1
            this.idEncountered.push(id)
        }
    })
    return isDead
  };
  
  

  playerLives = () => {
    this.friends.forEach((friend) => {
      let friendId = friend.domElement.id
      if(this.player.x === friend.x &&
        friend.y + ENEMY_HEIGHT + 15 >= GAME_HEIGHT - PLAYER_HEIGHT -10 &&
        this.friendsEncountered.indexOf(friendId) === -1){
          this.lives += 1/10
          this.friendsEncountered.push(friendId)
        }
    })
    console.log(this.lives)
    //return this.lives
  };

  shootingEnemies = () => {
    let gotcha = false
    //console.log(this.player.bulletsArray)
    for (let i=0; i<this.player.bulletsArray.length; i++){
      for (let  j=0; j<this.enemies.length; j++){
        //console.log(`${this.player.bulletsArray[i].xpos - 25}, ${this.enemies[j].x}`)
        if(this.player.bulletsArray[i].xpos - 25 === this.enemies[j].x &&
          this.player.bulletsArray[i].ypos < this.enemies[j].y){
            this.enemies.forEach((enemy) => {
              enemy.destroyed = true
              enemy.root.removeChild(enemy.domElement)
            })
            gotcha = true
          }
      }
    }
    console.log(gotcha)
    return gotcha
  }

  restart = (e) => {
    //tryAgain.style.display = "none"
    this.lives = 0
    this.score = 0
    this.gameOver.update("")
    this.restartbtn.style.display = "none"
    this.gameLoop();
  }
}
