class HomeScene extends Phaser.Scene {
    constructor() {
        super('HomeScene');
    }

    create() {
        // Background color (grass/sky feel)
        this.cameras.main.setBackgroundColor('#87CEEB');

        // Create a large world bounds for scrolling
        this.physics.world.setBounds(0, 0, 2000, 2000);
        this.cameras.main.setBounds(0, 0, 2000, 2000);

        // Add some ground/grass
        const ground = this.add.rectangle(1000, 1500, 2000, 1000, 0x90EE90); // LightGreen

        // Load data
        const data = Utils.getData();
        const baseLevel = data.castleLevel || 1;

        // Draw Castle based on level
        this.createCastle(1000, 1000, baseLevel);

        // Add animals
        this.animals = this.physics.add.group();
        if (data.animals) {
            data.animals.forEach((animalType, index) => {
                // Spread them out a bit
                this.createAnimal(1000 + (Math.random() - 0.5) * 500, 1200 + (Math.random() - 0.5) * 300, animalType);
            });
        }

        // Debug animal for testing if none exist
        if (!data.animals || data.animals.length === 0) {
            this.createAnimal(900, 1200, '🐕');
        }

        // Camera controls
        this.cameras.main.startFollow(this.castlePoint);
        this.cameras.main.setZoom(1);

        // Input for camera drag (swipe)
        this.input.on('pointermove', function (p) {
            if (!p.isDown) return;
            this.cameras.main.scrollX -= (p.x - p.prevPosition.x) / this.cameras.main.zoom;
            this.cameras.main.scrollY -= (p.y - p.prevPosition.y) / this.cameras.main.zoom;
        });

        // Pinch zoom (simplified logic for touch, Phaser handles pointer events)
        this.input.addPointer(1); // Ensure multi-touch is enabled

        // Transition to Search Mode on Castle Click
        this.castleContainer.setInteractive(new Phaser.Geom.Rectangle(-100, -100, 200, 200), Phaser.Geom.Rectangle.Contains);
        this.castleContainer.on('pointerdown', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                this.scene.start('SearchScene');
            });
        });

        // BGM (Mock for now, loop nice calm music)
        // this.sound.play('bgm', { loop: true }); 
    }

    createCastle(x, y, level) {
        this.castleContainer = this.add.container(x, y);
        this.castlePoint = this.add.circle(x, y, 5, 0xff0000).setVisible(false);

        const graphics = this.add.graphics();

        // --- Central Tower ---
        graphics.fillStyle(0xE0E0E0, 1);
        graphics.fillRect(-60, -120, 120, 120); // Main tower body
        graphics.lineStyle(4, 0x333333, 1);
        graphics.strokeRect(-60, -120, 120, 120);

        // Roof
        graphics.fillStyle(0xFF5252, 1);
        graphics.fillTriangle(-70, -120, 70, -120, 0, -200);
        graphics.strokeTriangle(-70, -120, 70, -120, 0, -200);

        // --- Gate (always there) ---
        graphics.fillStyle(0x795548, 1);
        graphics.fillRect(-20, -40, 40, 40);

        // Level 2: Left Wing
        if (level >= 2) {
            graphics.fillStyle(0xD0D0D0, 1);
            graphics.fillRect(-130, -80, 70, 80);
            graphics.strokeRect(-130, -80, 70, 80);
            graphics.fillStyle(0xFF8A80, 1);
            graphics.fillTriangle(-140, -80, -50, -80, -95, -130);
            graphics.strokeTriangle(-140, -80, -50, -80, -95, -130);
        }

        // Level 3: Right Wing
        if (level >= 3) {
            graphics.fillStyle(0xD0D0D0, 1);
            graphics.fillRect(60, -80, 70, 80);
            graphics.strokeRect(60, -80, 70, 80);
            graphics.fillStyle(0xFF8A80, 1);
            graphics.fillTriangle(50, -80, 140, -80, 95, -130);
            graphics.strokeTriangle(50, -80, 140, -80, 95, -130);
        }

        // Level 4: Windows and Decorations
        if (level >= 4) {
            graphics.fillStyle(0xFFFF00, 1);
            graphics.fillRect(-30, -90, 20, 25); // Window left
            graphics.fillRect(10, -90, 20, 25);  // Window right
        }

        // Level 5: Flag
        if (level >= 5) {
            graphics.lineStyle(4, 0x616161, 1);
            graphics.lineBetween(0, -200, 0, -250);
            graphics.fillStyle(0xFFFF00, 1);
            graphics.fillTriangle(0, -250, 40, -235, 0, -220);
        }

        this.castleContainer.add(graphics);

        const text = this.add.text(0, 30, '🏰', { fontSize: '48px' }).setOrigin(0.5);
        this.castleContainer.add(text);

        this.tweens.add({
            targets: this.castleContainer,
            scaleX: 1.05,
            scaleY: 1.05,
            yoyo: true,
            repeat: -1,
            duration: 2000,
            ease: 'Sine.easeInOut'
        });
    }

    createAnimal(x, y, emoji) {
        // Map face emojis to full body if needed
        const emojiMap = {
            '🐶': '🐕',
            '🐱': '🐈',
            '🐰': '🐇',
            '🐼': '🐼', // Panda is already full mostly
            '🐨': '🐨',
            '🐯': '🐅'
        };
        const fullEmoji = emojiMap[emoji] || emoji;

        const animal = this.add.text(x, y, fullEmoji, { fontSize: '64px' }).setOrigin(0.5);
        this.physics.add.existing(animal);

        // Random movement logic
        this.time.addEvent({
            delay: 2000,
            callback: () => {
                const speed = 50;
                const angle = Math.random() * Math.PI * 2;
                animal.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

                // Flip sprite based on direction
                if (Math.cos(angle) < 0) {
                    animal.setFlipX(true);
                } else {
                    animal.setFlipX(false);
                }
            },
            loop: true
        });

        this.animals.add(animal);
    }
}
