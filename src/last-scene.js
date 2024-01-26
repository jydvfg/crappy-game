var lastScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function lastScene() {
    Phaser.Scene.call(this, { key: "Last" });
  },
  preload: function () {
    this.load.image("tiles", "/assets/My map/Wooden House.png");
    this.load.image("objects", "/assets/My map/Basic_Furniture.png");
    this.load.tilemapTiledJSON("class", "/assets/My map/class.json");
    this.load.spritesheet(
      "player",
      "/assets/character/Adventure_Character_Simple.png",
      {
        frameWidth: 48,
        frameHeight: 48,
      }
    );
    this.load.spritesheet("omar", "/assets/character/Character2.png", {
      frameWidth: 48,
      frameHeight: 30,
    });
  },
  create(data) {
    const classroom = this.make.tilemap({ key: "class" });
    const tileset = classroom.addTilesetImage("Wooden House", "tiles");
    const items = classroom.addTilesetImage("objects", "objects");
    const floor = classroom.createLayer("ground", tileset, 0, 0);
    const walls = classroom.createLayer("walls", tileset, 0, 0);
    const objects = classroom.createLayer("objects", items, 0, 0);
    this.player = this.physics.add
      .sprite(160, 150, "player")
      .setScale(1)
      .setDepth(1);
    this.omar = this.physics.add
      .sprite(160, 75, "omar")
      .setScale(1)
      .setDepth(1);
    this.anims.create({
      key: "player_idle",
      frames: this.anims.generateFrameNumbers("player"),
      frameRate: 15,
      repeat: -1,
    });
    this.anims.create({
      key: "omar_idle",
      frames: this.anims.generateFrameNumbers("omar"),
      frameRate: 10,
      repeat: -1,
    });
    this.player.play("player_idle");
    this.omar.play("omar_idle");
    this.omar.flipX = true;
    this.scaleDirection = 1;
    this.cursors = this.input.keyboard.createCursorKeys();
    this.cameras.main.setBounds(
      0,
      0,
      classroom.widthInPixels,
      classroom.heightInPixels
    );
    walls.setCollisionByExclusion([-1]);
    objects.setCollisionByExclusion([-1]);
    this.cameras.main.startFollow(this.player);
    this.cameras.main.roundPixels = true;
    this.cameras.main.setBounds(
      0,
      0,
      classroom.widthInPixels,
      classroom.heightInPixels
    );
    this.physics.world.bounds.width = classroom.widthInPixels;
    this.physics.world.bounds.height = classroom.heightInPixels;
    this.player.setCollideWorldBounds(true);
    this.messageBox = new Message(this, this.events);
    this.add.existing(this.messageBox);
    this.physics.add.collider(this.player, walls);
    this.physics.add.collider(this.player, objects);
    this.physics.add.overlap(
      this.player,
      this.omar,
      this.onMeetOmar,
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
  onMeetOmar(player, zone) {
    if (!this.messagesAreDisplayed) {
      this.messagesAreDisplayed = true;

      var messages = [
        "HELLO JUAN",
        "GLAD YOU MADE IT DESPITE THE STRIKE",
        "TODAY WE'LL BE STUDYING DOM",
        "OH NO!!!",
      ];

      const delayBetweenMessages = 2000;

      for (let i = 0; i < messages.length; i++) {
        this.time.delayedCall(i * delayBetweenMessages, () => {
          this.messageBox.x = this.omar.x;
          this.messageBox.y = this.omar.y - 50;
          this.messageBox.showMessage(messages[i]);

          if (i === messages.length - 1) {
            this.time.delayedCall(delayBetweenMessages, () => {
              this.messagesAreDisplayed = false;
              this.scene.start("First");
            });
          }
        });
      }
    }
  },
});

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
