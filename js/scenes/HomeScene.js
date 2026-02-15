class HomeScene extends Phaser.Scene {
    constructor() {
        super('HomeScene');
    }

    create() {
        // --- 1. Environmental Atmosphere (Gradient Sky) ---
        // Create a large rectangle for the sky gradient (simulated with Graphics)
        const sky = this.add.graphics();
        sky.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xB0E0E6, 0xB0E0E6, 1);
        sky.fillRect(0, 0, 2000, 1500);

        this.physics.world.setBounds(0, 0, 2000, 2000);
        this.cameras.main.setBounds(0, 0, 2000, 2000);

        // Add ground
        this.add.rectangle(1000, 1750, 2000, 500, 0x90EE90); // LightGreen ground

        // --- 2. Floating Clouds ---
        this.createClouds();

        // --- 3. Nature (Trees and Flowers) ---
        this.createNature();

        // Load data
        const data = Utils.getData();
        const baseLevel = data.castleLevel || 1;

        // Draw Castle
        this.createCastle(1000, 1500, baseLevel);

        // --- 4. Particles (Pollen/Light) ---
        this.createAtmosphereParticles();

        // Add animals
        this.animals = this.physics.add.group();
        if (data.animals) {
            data.animals.forEach((animalType) => {
                this.createAnimal(1000 + (Math.random() - 0.5) * 800, 1650 + (Math.random() - 0.5) * 100, animalType);
            });
        }

        if (!data.animals || data.animals.length === 0) {
            this.createAnimal(900, 1650, '🐕');
        }

        // Camera controls
        this.cameras.main.startFollow(this.castlePoint);
        this.cameras.main.setZoom(1);

        this.input.on('pointermove', function (p) {
            if (!p.isDown) return;
            this.cameras.main.scrollX -= (p.x - p.prevPosition.x) / this.cameras.main.zoom;
            this.cameras.main.scrollY -= (p.y - p.prevPosition.y) / this.cameras.main.zoom;
        });

        this.input.addPointer(1);

        // Transition logic
        this.castleContainer.setInteractive(new Phaser.Geom.Rectangle(-120, -200, 240, 250), Phaser.Geom.Rectangle.Contains);
        this.castleContainer.on('pointerdown', () => {
            window.audioController.playSE('sparkle');
            this.cameras.main.fadeOut(500, 255, 255, 255);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start('SearchScene');
            });
        });
    }

    createClouds() {
        for (let i = 0; i < 8; i++) {
            const x = Math.random() * 2000;
            const y = 100 + Math.random() * 400;
            const cloud = this.add.text(x, y, '☁️', { fontSize: (64 + Math.random() * 64) + 'px' }).setAlpha(0.6);

            // Slow drift
            this.tweens.add({
                targets: cloud,
                x: x + 100,
                duration: 5000 + Math.random() * 5000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    createNature() {
        const data = Utils.getData();
        const floraCount = data.floraCount || 0;
        const initialCount = 4; // Start with just a few elements
        const totalToSpawn = initialCount + floraCount;

        const items = ['🌲', '🌳', '🌷', '🌻', '🌼'];
        for (let i = 0; i < totalToSpawn; i++) {
            const x = Math.random() * 2000;
            const y = 1500 + Math.random() * 250; // Place on the ground correctly
            const item = this.add.text(x, y, Phaser.Math.RND.pick(items), { fontSize: '48px' }).setOrigin(0.5, 1);
            item.setInteractive();

            item.on('pointerdown', () => {
                window.audioController.playSE('shake');
                this.tweens.add({
                    targets: item,
                    angle: { from: -10, to: 10 },
                    duration: 100,
                    yoyo: true,
                    repeat: 3
                });
            });
        }
    }

    createAtmosphereParticles() {
        // Subtle floating lights
        for (let i = 0; i < 20; i++) {
            const p = this.add.circle(Math.random() * 2000, Math.random() * 2000, 2, 0xffffff, 0.4);
            this.tweens.add({
                targets: p,
                y: '-=50',
                x: '+=20',
                alpha: 0,
                duration: 3000 + Math.random() * 3000,
                repeat: -1,
                delay: Math.random() * 5000
            });
        }
    }

    createCastle(x, y, level) {
        // ... (Keep existing castle logic, just adjust interactive area if needed)
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
        const emojiMap = { '🐶': '🐕', '🐱': '🐈', '🐰': '🐇', '🐼': '🐼', '🐨': '🐨', '🐯': '🐅' };
        const fullEmoji = emojiMap[emoji] || emoji;

        const animal = this.add.text(x, y, fullEmoji, { fontSize: '64px' }).setOrigin(0.5);
        this.physics.add.existing(animal);
        animal.setInteractive();

        animal.on('pointerdown', () => {
            window.audioController.playSE('jump');
            this.tweens.add({
                targets: animal,
                y: animal.y - 100,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 200,
                yoyo: true,
                onComplete: () => {
                    // Show heart
                    const heart = this.add.text(animal.x, animal.y - 80, '❤️', { fontSize: '32px' }).setOrigin(0.5);
                    this.tweens.add({
                        targets: heart,
                        y: heart.y - 50,
                        alpha: 0,
                        duration: 800,
                        onComplete: () => heart.destroy()
                    });
                }
            });
        });

        this.time.addEvent({
            delay: 3000 + Math.random() * 2000,
            callback: () => {
                const speed = 40;
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
