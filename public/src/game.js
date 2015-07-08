require(['socket.io/socket.io.js']);

var players   = [];
var socket    = io.connect("http://" + window.location.hostname + ":80");
var UiPlayers = document.getElementById("players");

var Q = Quintus({audioSupported: [ 'wav','mp3' ]})
      .include('Sprites, Scenes, Input, 2D, Anim, Touch, UI, Audio')
      .setup({ maximize: true })
      .enableSound()
      .controls().touch();
 
Q.gravityY = 0;

var objectFiles = [
  '/src/Player.js'
];

require(objectFiles, function () {
  function setUp (stage) {
    socket.on('count', function (data) {
      UiPlayers.innerHTML = 'Players: ' + data['playerCount'];
    });
 
    socket.on('connected', function (data) {
      selfId = data['playerId'];
      if (data['tagged']) {
        player = new Q.Player({ playerId: selfId, x: 48, y: 48, socket: socket });
        player.p.sheet = 'enemy'
        player.p.tagged = true;
        stage.insert(player);
      } else {
        player = new Q.Player({ playerId: selfId, x: 48, y: 48, socket: socket });
        stage.insert(player);
        player.trigger('join');
      }
      stage.add('viewport').follow(player);
    });
 
    socket.on('updated', function (data) {
      var actor = players.filter(function (obj) {
        return obj.playerId == data['playerId'];
      })[0];
      if (actor) {
        actor.player.p.x = data['x'];
        actor.player.p.y = data['y'];
        actor.player.p.sheet = data['sheet'];
        actor.player.p.opacity = data['opacity'];
        actor.player.p.invincible = data['invincible'];
        actor.player.p.tagged = data['tagged'];
        actor.player.p.update = true;
      } else {
        var temp = new Q.Actor({ playerId: data['playerId'], x: data['x'], y: data['y'], sheet: data['sheet'], opacity: data['opacity'], invincible: data['invincible'], tagged: data['tagged'] });
        players.push({ player: temp, playerId: data['playerId'] });
        stage.insert(temp);
      }
    });
 
    socket.on('tagged', function (data) {
      if (data['playerId'] == selfId) {
        player.p.sheet = 'enemy';
        player.p.tagged = true;
      } else {
        var actor = players.filter(function (obj) {
          return obj.playerId == data['playerId'];
        })[0];
        if (actor) {
          actor.player.p.sheet = 'enemy'
        }
      }
    });
    socket.on('action', function (data){
      
      if (data['command'] == "move") {
        /*
        switch(data['parameter']){
        case "left":  player.p.x += -32; break;
        case "right": player.p.x += 32; break;
        case "up":    player.p.y += -32; break;
        case "down":  player.p.y += 32; break;
        default: break;
        }
        */
        switch(data['parameter']){
          case "left":  player.p.vx = -200; break;   
          case "right": player.p.vx = 200; break;
          case "up":    player.p.vy = -200; break;
          case "down":  player.p.vy = 200; break;
          default: break;
        }
        //Make something better later.
        setTimeout(function() {
              player.p.vx = 0;
              player.p.vy = 0;
        }, 153);
        player.p.socket.emit('update', { playerId: this.p.playerId, x: this.p.x, y: this.p.y, sheet: this.p.sheet });  
      } else {
        console.log("Receiving post request: Command : " + data['command'] + ", but it is not recognized.");
      }
    });
  }

  Q.scene('arena', function (stage) {
    //stage.collisionLayer(new Q.TileLayer({ dataAsset: '/maps/arena.json', sheet: 'tiles' }));
 
    stage.collisionLayer(new Q.TileLayer({
        tileW: 32,  // Default tile width
        tileH: 32,  // Default tile height
        blockTileW: 10,  // Default pre-render size
        blockTileH: 10,
        type: Q.SPRITE_DEFAULT, // Default type (for collisions)
        dataAsset: "/maps/arena.json",
        sheet: "tiles"
        }));

    setUp(stage);
  });
 
  var files = [
    '/images/tiles.png',
    '/maps/arena.json',
    '/images/sprites.png',
    '/images/sprites.json'
  ];
 
  Q.load(files.join(','), function () {
    Q.sheet('tiles', '/images/tiles.png', { tilew: 32, tileh: 32 });
    Q.compileSheets('/images/sprites.png', '/images/sprites.json');
    Q.stageScene('arena', 0);
  });
});