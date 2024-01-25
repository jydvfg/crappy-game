// units objects
var Unit = new Phaser.Class({
  Extends: Phaser.GameObjects.Sprite,
  initialize: function Unit(scene, x, y, texture, frame, type, hp, damage) {
    Phaser.GameObjects.Sprite.call(this, scene, x, y, texture, frame);
    this.type = type;
    this.maxHp = this.hp = hp;
    this.damage = damage;
    this.hpText = null;
    this.living = true;
    this.menuItem = null;
  },
  setMenuItem(item) {
    this.menuItem = item;
  },
  createHpText(scene) {
    this.hpText = new MenuItem(0, 0, this.getCurrentHP(), scene);
    scene.add.existing(this.hpText);
  },
  updateHpText() {
    if (this.hpText) {
      this.hpText.setText(this.getCurrentHP());
    }
  },
  attack(target) {
    target.takeDamage(this.damage);
  },
  takeDamage: function (damage) {
    this.hp -= damage;
    this.hp = Math.max(0, this.hp);
    this.updateHpText();

    if (this.hp <= 0) {
      this.hp = 0;

      if (this.menuItem) {
        this.menuItem.unitKilled();
      }

      this.living = false;
      this.visible = false;
      this.menuItem = null;
    }
  },
  getCurrentHP() {
    return this.hp;
  },
});

var Enemy = new Phaser.Class({
  Extends: Units,
  initialize: function Enemy(scene, x, y, texture, frame, type, hp, damage) {
    Units.call(this, scene, x, y, texture, frame, type, hp, damage);
    this.setScale(2.5);
    this.flipX = true;
  },
});

var PlayerCharacter = new Phaser.Class({
  Extends: Units,
  initialize: function PlayerCharacter(
    scene,
    x,
    y,
    texture,
    frame,
    type,
    hp,
    damage
  ) {
    Units.call(this, scene, x, y, texture, frame, type, hp, damage);

    this.setScale(2);
  },
});

//Menus

var MenuItem = new Phaser.Class({
  Extends: Phaser.GameObjects.Text,

  initialize: function MenuItem(x, y, text, scene) {
    Phaser.GameObjects.Text.call(this, scene, x, y, text, {
      color: "#ffffff",
      align: "left",
      fontSize: 15,
    });
  },

  select: function () {
    this.setColor("#f8ff38");
  },

  deselect: function () {
    this.setColor("#ffffff");
  },
});

var Menu = new Phaser.Class({
  Extends: Phaser.GameObjects.Container,

  initialize: function Menu(x, y, scene, heroes) {
    Phaser.GameObjects.Container.call(this, scene, x, y);
    this.menuItems = [];
    this.menuItemIndex = 0;
    this.heroes = heroes;
    this.x = x;
    this.y = y;
  },
  addMenuItem: function (unit) {
    var menuItem = new MenuItem(
      0,
      this.menuItems.length * 20,
      unit,
      this.scene
    );
    this.menuItems.push(menuItem);
    this.add(menuItem);
  },
  moveSelectionUp: function () {
    this.menuItems[this.menuItemIndex].deselect();
    this.menuItemIndex--;
    if (this.menuItemIndex < 0) this.menuItemIndex = this.menuItems.length - 1;
    this.menuItems[this.menuItemIndex].select();
  },
  moveSelectionDown: function () {
    this.menuItems[this.menuItemIndex].deselect();
    this.menuItemIndex++;
    if (this.menuItemIndex >= this.menuItems.length) this.menuItemIndex = 0;
    this.menuItems[this.menuItemIndex].select();
  },
  select: function (index) {
    if (!index) index = 0;
    this.menuItems[this.menuItemIndex].deselect();
    this.menuItemIndex = index;
    this.menuItems[this.menuItemIndex].select();
  },
  deselect: function () {
    this.menuItems[this.menuItemIndex].deselect();
    this.menuItemIndex = 0;
  },
  clear: function () {
    for (let i = 0; i < this.menuItems.length; i++) {
      this.menuItems[i].destroy();
    }
    this.menuItems.length = 0;
    this.menuItemIndex = 0;
  },
  remap: function (units) {
    this.clear();
    for (let i = 0; i < units.length; i++) {
      let unit = units[i];

      let menuItemText = unit.type;

      this.addMenuItem(menuItemText);
    }
  },
  confirm: function () {
    //actions
  },
});

var HeroesMenu = new Phaser.Class({
  Extends: Menu,

  initialize: function HeroesMenu(x, y, scene) {
    Menu.call(this, x, y, scene);
  },
});

var ActionsMenu = new Phaser.Class({
  Extends: Menu,

  initialize: function ActionsMenu(x, y, scene) {
    Menu.call(this, x, y, scene);
    this.addMenuItem("Attack");
  },
  confirm: function () {
    this.scene.events.emit("SelectEnemies");
  },
});

var EnemiesMenu = new Phaser.Class({
  Extends: Menu,

  initialize: function EnemiesMenu(x, y, scene) {
    Menu.call(this, x, y, scene);
  },
  confirm: function () {
    this.scene.events.emit("Enemy", this.menuItemIndex);
  },
});

var BattleCreep = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function BattleCreep() {
    Phaser.Scene.call(this, { key: "BattleCreep" });
    this.sceneKey = "BattleCreep";
  },
  create: function () {
    this.cameras.main.setBackgroundColor("rgba(0, 200, 0, 0.5)");

    // player character - developer
    var dev = new PlayerCharacter(
      this,
      50,
      75,
      "player",
      1,
      "Developer",
      50,
      15
    );
    dev.createHpText(this);
    dev.hpText.x = 30;
    dev.hpText.y = 125;
    dev.hpText.setDepth(1);

    this.add.existing(dev);
    this.anims.create({
      key: "player_idle",
      frames: this.anims.generateFrameNumbers("player"),
      frameRate: 20,
      repeat: -1,
    });

    dev.play("player_idle");

    var creep = new Enemy(this, 225, 75, "creep", null, "U8 creep", 50, 10);
    creep.createHpText(this);
    creep.hpText.x = 230;
    creep.hpText.y = 125;
    creep.hpText.setDepth(1);

    this.anims.create({
      key: "creep_idle",
      frames: this.anims.generateFrameNumbers("creep"),
      frameRate: 20,
      repeat: -1,
    });

    this.add.existing(creep);
    creep.play("creep_idle");

    this.heroes = [dev];
    this.enemies = [creep];
    this.units = this.heroes.concat(this.enemies);

    this.scene.launch("UIScene2");

    this.events.emit("battleCreepStart");
    this.input.keyboard.on("keydown-ESC", this.endBattle, this);
    this.sys.events.on("wake", this.wake, this);
    this.index = -1;
  },
  wake: function () {
    this.scene.run("UIScene2");
    this.time.addEvent({
      delay: 2000,
      callback: this.exitBattle,
      callbackScope: this,
    });
  },
  receivePlayerSelection: function (action, target) {
    if (action == "attack") {
      var player = this.units[this.index];
      var enemy = this.enemies[target];
      var newDamage = Math.floor(Math.random() * (15 - 10 + 1)) + 10;

      enemy.takeDamage(newDamage);

      var message =
        player.type +
        " attacks " +
        enemy.type +
        " for " +
        newDamage +
        " damage!";
      this.events.emit("Message", message);
    }

    this.time.addEvent({
      delay: 3000,
      callback: this.nextTurn,
      callbackScope: this,
    });
  },
  nextTurn: function () {
    if (this.checkEndBattle2()) {
      this.endBattle();
      return;
    }
    this.index++;

    if (this.index >= this.units.length) {
      this.index = 0;
    }

    if (this.units[this.index]) {
      if (this.units[this.index] instanceof PlayerCharacter) {
        this.events.emit("PlayerSelect", this.index);
      } else {
        var enemy = this.units[this.index];
        var player = this.heroes[0];
        var damage = enemy.damage;
        var ogDamage = enemy.damage;

        var newDmg = Math.floor(Math.random() * ogDamage + 5);
        player.takeDamage(newDmg);

        var message =
          enemy.type +
          " attacks " +
          player.type +
          " for " +
          newDmg +
          " damage!";
        this.events.emit("Message", message);
        this.events.emit("Message", message);
        this.events.emit("UpdateHP", player.getCurrentHP());

        if (player.getCurrentHP() <= 0) {
          var gameOverMessage = "Game Over!";
          this.events.emit("Message", gameOverMessage);
          this.endBattle();
          return;
        }

        if (enemy.getCurrentHP() <= 0) {
          this.events.emit("Message", enemy.type + " defeated!");
          this.time.addEvent({
            delay: 3000,
            callback: this.endBattle,
            callbackScope: this,
          });

          this.endBattle();
          return;
        }
        this.time.addEvent({
          delay: 3000,
          callback: this.nextTurn,
          callbackScope: this,
        });
      }
    }
  },
  checkEndBattle2: function () {
    let heroes, enemies;

    heroes = this.enemies;
    enemies = this.heroes;

    let victory = enemies && enemies.every((enemy) => !enemy.living);
    let gameOver = heroes && heroes.every((hero) => !hero.living);

    return victory || gameOver;
  },
  endBattle: function () {
    this.scene.sleep("UIScene2");

    this.time.addEvent({
      delay: 2000,
      callback: function () {
        this.events.off();
        this.scene.stop().run("WorldScene");
      },
      callbackScope: this,
    });
  },
});

var UIScene2 = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function UIScene2() {
    Phaser.Scene.call(this, { key: "UIScene2" });
  },
  init: function () {
    this.game.events.on("battleSceneStart", this.handleBattleSceneStart, this);
  },
  remapHeroes: function () {
    var heroes = this.battleScene.heroes;
    if (Array.isArray(heroes) && heroes.length > 0) {
      this.heroesMenu.remap(heroes);
    }
  },
  remapEnemies: function () {
    var enemies = this.battleScene.enemies;
    if (Array.isArray(enemies) && enemies.length > 0) {
      this.enemiesMenu.remap(enemies);
    }
  },
  handleBattleSceneStart: function () {
    this.battleScene = this.scene.get("BattleCreep");

    if (this.battleScene) {
      this.remapHeroes();
      this.remapEnemies();
    }
  },
  onPlayerSelect: function (id) {
    this.heroesMenu.select(id);
    this.actionsMenu.select(0);
    this.currentMenu = this.actionsMenu;
  },
  onSelectEnemies: function () {
    this.currentMenu = this.enemiesMenu;
    this.enemiesMenu.select(0);
  },
  onEnemy: function (index) {
    this.heroesMenu.deselect();
    this.actionsMenu.deselect();
    this.enemiesMenu.deselect();
    this.currentMenu = null;
    this.battleScene.receivePlayerSelection("attack", index);
  },
  create: function () {
    this.graphics = this.add.graphics();
    this.graphics.lineStyle(1, 0xffffff);
    this.graphics.fillStyle(0x00000, 1);
    this.graphics.strokeRect(2, 150, 90, 100);
    this.graphics.fillRect(2, 150, 90, 100);
    this.graphics.strokeRect(95, 150, 90, 100);
    this.graphics.fillRect(95, 150, 90, 100);
    this.graphics.strokeRect(188, 150, 130, 100);
    this.graphics.fillRect(188, 150, 130, 100);
    this.menus = this.add.container();

    this.heroesMenu = new HeroesMenu(8, 153, this);
    this.actionsMenu = new ActionsMenu(100, 153, this);
    this.enemiesMenu = new EnemiesMenu(195, 153, this);

    // the currently selected menu
    this.currentMenu = this.actionsMenu;

    // add menus to the container
    this.menus.add(this.heroesMenu);
    this.menus.add(this.actionsMenu);
    this.menus.add(this.enemiesMenu);

    this.battleScene = this.scene.get("BattleCreep");
    if (this.battleScene) {
      this.remapHeroes();
      this.remapEnemies();
    }
    this.input.keyboard.on("keydown", this.onKeyInput, this);
    this.battleScene.events.on("PlayerSelect", this.onPlayerSelect, this);
    this.events.on("SelectEnemies", this.onSelectEnemies, this);
    this.events.on("Enemy", this.onEnemy, this);
    this.battleScene.nextTurn();
    this.message = new Message(this, this.battleScene.events);
    this.add.existing(this.message);

    // Call remapHeroes and remapEnemies after the menus are set up
    this.remapHeroes();
    this.remapEnemies();
  },
  onKeyInput: function (event) {
    if (this.currentMenu) {
      if (event.code === "ArrowUp") {
        this.currentMenu.moveSelectionUp();
      } else if (event.code === "ArrowDown") {
        this.currentMenu.moveSelectionDown();
      } else if (event.code === "ArrowRight" || event.code === "Shift") {
      } else if (event.code === "Space" || event.code === "ArrowRight") {
        this.currentMenu.confirm();
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
