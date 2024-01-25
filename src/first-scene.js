// create a new scene
const firstScene = new Phaser.Scene("First");

// load assets:
firstScene.preload = function () {
  this.load.image(
    "background",
    "/assets/images/monster-tamer/map/level_background.png"
  );
  this.load.tilemapTiledJSON("level", "/assets/data/level.json");
  this.load.image(
    "collision",
    "/assets/images/monster-tamer/map/collision.png"
  );
  this.load.image(
    "foreground",
    "/assets/images/monster-tamer/map/level_foreground.png"
  );
  this.load.spritesheet("player", "/assets/idle viking mini -Sheet.png", {
    frameWidth: 32,
    frameHeight: 32,
  });
  this.load.spritesheet("enemy", "/assets/Woodcutter_idle.png", {
    frameWidth: 48,
    frameHeight: 48,
  });
};

firstScene.create = function () {
  const bg = this.add.sprite(0, 0, "background");
  const fg = this.add.sprite(0, 0, "foreground").setDepth(3);
  const level = this.make.tilemap({ key: "level" });
  const collisionLayer = level.createLayer("Collision", "", 0, 0);
  const collisionTiles = level.addTilesetImage("Collision", "level");
  this.player = this.physics.add
    .sprite(100, 300, "player")
    .setScale(2)
    .setDepth(1);
  this.enemy = this.physics.add
    .sprite(200, 300, "enemy")
    .setScale(9)
    .setDepth(1);

  this.anims.create({
    key: "player_idle",
    frames: this.anims.generateFrameNumbers("player"),
    frameRate: 20,
    repeat: -1,
  });
  this.anims.create({
    key: "enemy_idle",
    frames: this.anims.generateFrameNumbers("enemy"),
    frameRate: 10,
    repeat: -1,
  });

  this.player.play("player_idle");
  this.enemy.play("enemy_idle");
  this.enemy.flipX = true;
  this.enemy.scale = 1;
  this.scaleDirection = 1;
  this.cursors = this.input.keyboard.createCursorKeys();
  this.cameras.main.setBounds(0, 0, bg.widthInPixels, bg.heightInPixels);
  this.cameras.main.startFollow(this.player);
  this.cameras.main.roundPixels = true;
  this.physics.world.bounds.width = bg.widthInPixels;
  this.physics.world.bounds.height = bg.heightInPixels;
  this.player.setCollideWorldBounds(true);
  this.messageBox = new Message(this, this.events);
  this.add.existing(this.messageBox);

  this.physics.add.overlap(
    this.player,
    this.enemy,
    this.onMeetEnemy,
    null,
    this
  );
};
firstScene.update = function (time, delta) {
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
};
firstScene.onMeetEnemy = function (player, zone) {
  if (!this.messagesAreDisplayed) {
    this.messagesAreDisplayed = true;

    var messages = [
      "HELLO JUAN",
      "THERE IS A BAHNSTREIK TODAY",
      "YOU'LL HAVE TO TAKE THE U8",
      "OH NO!!!",
    ];

    const delayBetweenMessages = 2000;

    for (let i = 0; i < messages.length; i++) {
      this.time.delayedCall(i * delayBetweenMessages, () => {
        this.messageBox.x = this.enemy.x;
        this.messageBox.y = this.enemy.y - 50;
        this.messageBox.showMessage(messages[i]);

        if (i === messages.length - 1) {
          this.time.delayedCall(delayBetweenMessages, () => {
            this.messagesAreDisplayed = false;
            this.scene.start("BootScene");
          });
        }
      });
    }
  }
};

var Message = new Phaser.Class({
  Extends: Phaser.GameObjects.Container,
  initialize: function Message(scene, events) {
    Phaser.GameObjects.Container.call(this, scene, 200, 50);
    var graphics = this.scene.add.graphics();
    this.add(graphics);
    graphics.lineStyle(1, 0xffffff, 0.8);
    graphics.fillStyle(0x031f4c, 0.3);
    graphics.strokeRect(-90, -15, 180, 30);
    graphics.fillRect(-90, -15, 180, 30);
    this.text = new Phaser.GameObjects.Text(scene, 0, 0, "", {
      color: "#ffffff",
      align: "center",
      fontSize: 13,
      wordWrap: { width: 160, useAdvancedWrap: true },
    });
    this.add(this.text);
    this.text.setOrigin(0.5);
    events.on("Message", this.showMessage, this);
    this.visible = false;
  },
  showMessage: function (text) {
    this.text.setText(text);
    this.visible = true;
    if (this.hideEvent) this.hideEvent.remove(false);
    this.hideEvent = this.scene.time.addEvent({
      delay: 2000,
      callback: this.hideMessage,
      callbackScope: this,
    });
  },
  hideMessage: function () {
    this.hideEvent = null;
    this.visible = false;
  },
});
