class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        this.load.image('unicorn', 'assets/unicorn.png');
        this.load.image('dragon', 'assets/dragon.png');
        this.load.image('trex', 'assets/trex.png');
        this.load.image('peacock', 'assets/peacock.png');
        this.load.image('castle_flag', 'assets/castle_flag.png');
        this.load.image('castle_roof', 'assets/castle_roof.png');
    }

    create() {
        this.scene.start('HomeScene');
    }
}
