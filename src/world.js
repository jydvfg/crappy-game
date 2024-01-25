var BootScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function BootScene() {
    Phaser.Scene.call(this, { key: "BootScene" });
  },
  preload: function () {
    this.load.image("tiles", "/assets/My map/0x72_16x16DungeonTileset.v5.png");
    this.load.tilemapTiledJSON("map", "/assets/My map/dungeon.json");
    this.load.spritesheet("zombie", "/assets/character/Zombie.png", {
      frameWidth: 48,
      frameHeight: 30,
    });
    this.load.spritesheet(
      "player",
      "/assets/character/Adventure_Character_Simple.png",
      {
        frameWidth: 48,
        frameHeight: 48,
      }
    );
    this.load.spritesheet("creep", "/assets/character/Idle (32x32).png", {
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
    var tiles = map.addTilesetImage("dungeon", "tiles");

    var grass = map.createLayer("ground", tiles, 0, 0);
    var walls = map.createLayer("walls", tiles, 0, 0);
    walls.setCollisionByExclusion([-1]);
    this.anims.create({
      key: "player_idle",
      frames: this.anims.generateFrameNumbers("player"),
      frameRate: 20,
      repeat: -1,
    });

    this.player = this.physics.add.sprite(100, 100, "player", 0);
    this.player.play("player_idle");
    this.physics.world.bounds.width = map.widthInPixels;
    this.physics.world.bounds.height = map.heightInPixels;
    this.player.setCollideWorldBounds(true);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player);
    this.cameras.main.roundPixels = true;
    this.physics.add.collider(this.player, walls);

    this.zombieZone = this.physics.add
      .sprite(165, 200, "zombie")
      .setScale(1)
      .setDepth(1);
    this.creepZone = this.physics.add
      .sprite(500, 200, "creep")
      .setScale(1)
      .setDepth(1);

    this.anims.create({
      key: "zombie_idle",
      frames: this.anims.generateFrameNumbers("zombie"),
      frameRate: 20,
      repeat: -1,
    });
    this.anims.create({
      key: "creep_idle",
      frames: this.anims.generateFrameNumbers("creep"),
      frameRate: 20,
      repeat: -1,
    });
    this.zombieZone.play("zombie_idle");
    this.creepZone.play("creep_idle");
    // Set keys for identification
    this.zombieZone.key = "zombieZone";
    this.creepZone.key = "creepZone";
    this.physics.add.overlap(
      this.player,
      this.zombieZone,
      this.onMeetZombie,
      false,
      this
    );
    this.physics.add.overlap(
      this.player,
      this.creepZone,
      this.onMeetCreep,
      false,
      this
    );
    this.exit = this.physics.add.group({
      classType: Phaser.GameObjects.Zone,
    });
    this.exit.create(500, 350, 30, 30);
    this.physics.world.enable(this.exit);

    // Optionally, add an event listener for when the player overlaps with the zone
    this.physics.add.overlap(
      this.player,
      this.exit,
      this.onExitOverlap,
      null,
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
  onMeetZombie: function (player, zone) {
    zone.x = Phaser.Math.RND.between(0, this.physics.world.bounds.width);
    zone.y = Phaser.Math.RND.between(0, this.physics.world.bounds.height);
    this.cameras.main.shake(300);
    this.cameras.main.flash(300);

    this.scene.switch("BattleScene");
  },
  onMeetCreep: function (player, zone) {
    zone.x = Phaser.Math.RND.between(0, this.physics.world.bounds.width);
    zone.y = Phaser.Math.RND.between(0, this.physics.world.bounds.height);
    this.cameras.main.shake(300);
    this.cameras.main.flash(300);

    this.scene.switch("BattleCreep");
  },
  onExitOverlap() {
    this.scene.switch("Last");
  },
});
