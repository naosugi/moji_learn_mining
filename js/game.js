const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#87CEEB', // Sky blue
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [BootScene, HomeScene, SearchScene]
};

// Start button logic to handle audio context restriction
document.getElementById('start-button').addEventListener('click', () => {
    document.getElementById('start-overlay').style.display = 'none';

    // Initialize game only after user interaction
    const game = new Phaser.Game(config);

    // Initial speech to unlock audio on iOS
    Utils.speak('はじまるよ！');

    // Resume AudioContext
    window.audioController.resume();
    window.audioController.playBGM();
});
