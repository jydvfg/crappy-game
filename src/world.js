var BootScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function BootScene() {
    Phaser.Scene.call(this, { key: "BootScene" });
  },
  preload: function () {
    this.load.image("tiles", "/assets/map/spritesheet.png");
    this.load.tilemapTiledJSON("map", "/assets/map/map.json");
    this.load.image("dragonblue", "/assets/dragonblue.png");
    this.load.spritesheet("player", "/assets/idle viking mini -Sheet.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
  },
  create: function () {
    this.scene.start("WorldScene", { map: this.map });
  },
});

var WorldScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function WorldScene() {
    Phaser.Scene.call(this, { key: "WorldScene" });
  },
  preload: function () {},
  create: function (data) {
    var map = this.make.tilemap({ key: "map" });
    // Access the map property directly
    var tiles = map.addTilesetImage("spritesheet", "tiles");

    var grass = map.createLayer("Grass", tiles, 0, 0);
    var obstacles = map.createLayer("Obstacles", tiles, 0, 0);
    obstacles.setCollisionByExclusion([-1]);
    this.anims.create({
      key: "player_idle",
      frames: this.anims.generateFrameNumbers("player"),
      frameRate: 20,
      repeat: -1,
    });

    this.player = this.physics.add.sprite(50, 100, "player", 0);
    this.player.play("player_idle");
    this.physics.world.bounds.width = map.widthInPixels;
    this.physics.world.bounds.height = map.heightInPixels;
    this.player.setCollideWorldBounds(true);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player);
    this.cameras.main.roundPixels = true;
    this.physics.add.collider(this.player, obstacles);

    // set random encounters
    this.spawns = this.physics.add.group({
      classType: Phaser.GameObjects.Zone,
    });
    for (var i = 0; i < 30; i++) {
      var x = Phaser.Math.RND.between(0, this.physics.world.bounds.width);
      var y = Phaser.Math.RND.between(0, this.physics.world.bounds.height);
      // parameters are x, y, width, height
      this.spawns.create(x, y, 20, 20);
    }
    this.physics.add.overlap(
      this.player,
      this.spawns,
      this.onMeetEnemy,
      false,
      this
    );
  },
  update: function (time, delta) {
    this.player.body.setVelocity(0);
    // Horizontal movement
    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-80);
      this.player.flipX = true;
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(80);
      this.player.flipX = false;
    }
    // Vertical movement
    if (this.cursors.up.isDown) {
      this.player.body.setVelocityY(-80);
    } else if (this.cursors.down.isDown) {
      this.player.body.setVelocityY(80);
    }
  },
  onMeetEnemy: function (player, zone) {
    zone.x = Phaser.Math.RND.between(0, this.physics.world.bounds.width);
    zone.y = Phaser.Math.RND.between(0, this.physics.world.bounds.height);
    this.cameras.main.shake(300);
    this.cameras.main.flash(300);

    this.scene.switch("BattleScene");
  },
});
