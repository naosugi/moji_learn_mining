class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Preload assets here if needed
        // For now, we generate assets programmatically using Canvas/Graphics
    }

    create() {
        this.scene.start('HomeScene');
    }
}
