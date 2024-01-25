var config = {
  type: Phaser.AUTO,
  parent: "content",
  width: 320,
  height: 240,
  zoom: 2,
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: true, // set to true to view zones
    },
  },
  scene: [
    firstScene,
    BootScene,
    WorldScene,
    BattleScene,
    BattleCreep,
    UIScene,
    UIScene2,
    lastScene,
  ],
};
var game = new Phaser.Game(config);
