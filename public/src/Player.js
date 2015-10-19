require([], function () {
  Q.Sprite.extend('Player', {
    init: function (p, randomIdTemp) {
      this._super(p, {
        sheet: 'player',
        //tagged: false,
        invincible: false,
        vyMult: 1,
        socket: socket
      });
      this.randomId = randomIdTemp.randomId;
      this.add('2d, stepControls, animation');

      this.addEventListeners();
    },

    addEventListeners: function () {
      this.on('hit', function (collision) {
        //if (this.p.tagged && collision.obj.isA('Actor') && !collision.obj.p.tagged && !collision.obj.p.invincible) {
        //  this.p.socket.emit('tag', { playerId: collision.obj.p.playerId });
        //  this.p.tagged = false;
        //  this.p.sheet = 'player';
        //  this.p.invincible = true;
        //  this.p.opacity = 0.5;
        //  this.p.speed = 300;
        //  this.p.vyMult = 1.5;
        //  var temp = this;
        //  setTimeout(function () {
        //    temp.p.invincible = false;
        //    temp.p.opacity = 1;
        //    temp.p.speed = 200;
        //    temp.p.vyMult = 1;
        //  }, 3000);
        //}
        console.log("You hit someone")
      });
 
      this.on('join', function () {
        this.p.invincible = true;
        this.p.opacity = 0.5;
        this.p.speed = 300;
        this.p.vyMult = 1.5;
        var temp = this;
        setTimeout(function () {
          temp.p.invincible = false;
          temp.p.opacity = 1;
          temp.p.speed = 200;
          temp.p.vyMult = 1;
        }, 3000);
      });
    },
    
    step: function (dt) {
      //if (Q.inputs['up']) {
      //  this.p.vy = -200;
      //} else if (Q.inputs['down']) {
      //  this.p.vy = 200;
      //} else if (!Q.inputs['down'] && !Q.inputs['up']) {
      //  this.p.vy = 0;
      //}
      console.log(this.p.x + " " + this.p.y);
      this.p.socket.emit('update', { playerId: this.p.playerId, x: this.p.x, y: this.p.y, sheet: this.p.sheet });
    }
  });
  
  Q.Sprite.extend('Actor', {
    init: function (p) {
      this._super(p, {
        update: true
      });
   
      var temp = this;
      setInterval(function () {
        if (!temp.p.update) {
          temp.destroy();
        }
        temp.p.update = false;
      }, 3000);
    }
  });
  
});