class HomeScene extends Phaser.Scene {
    constructor() {
        super('HomeScene');
    }

    create() {
        if (window.audioController) window.audioController.playBGM();
        const data = Utils.getData();

        // --- 1. Environmental Atmosphere (Gradient Sky) ---
        const sky = this.add.graphics();
        sky.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xE0F7FA, 0xE0F7FA, 1);
        sky.fillRect(0, 0, 2000, 1500);

        // Add distant mountains for depth
        const mountains = this.add.graphics();
        mountains.fillStyle(0xAED581, 1);
        mountains.fillTriangle(0, 1800, 500, 1400, 1000, 1800);
        mountains.fillTriangle(600, 1800, 1200, 1300, 1800, 1800);
        mountains.fillTriangle(1400, 1800, 1800, 1500, 2200, 1800);

        // Smiling Sun
        const sun = this.add.text(1800, 200, '🌞', { fontSize: '150px' }).setOrigin(0.5);
        this.tweens.add({
            targets: sun,
            angle: 360,
            duration: 20000,
            repeat: -1
        });

        this.physics.world.setBounds(0, 0, 2000, 2000);
        this.cameras.main.setBounds(0, 0, 2000, 2000);

        // Add soft hills for ground
        const ground = this.add.graphics();
        ground.fillStyle(0x90EE90, 1);
        // Larger, flatter ellipses for better grounding
        ground.fillEllipse(1000, 1850, 3000, 700);
        ground.fillEllipse(300, 1800, 1200, 400);
        ground.fillEllipse(1700, 1800, 1200, 400);

        // --- 2. Floating Clouds & Rainbow & Egg ---
        this.createMysteryEgg();
        this.createSkyObjects();

        if (data.winCount >= 3) {
            this.createRainbow();
        }
        this.createClouds();

        // --- 3. Nature (Trees and Flowers) ---
        this.createNature();

        // --- 4. Castle ---
        const baseLevel = data.castleLevel || 1;
        // Move castle slightly down into the ground
        this.createCastle(1000, 1580, baseLevel);

        // --- 5. Particles (Pollen/Light) ---
        this.createAtmosphereParticles();

        // --- 6. Animals ---
        this.animals = this.physics.add.group();
        if (data.animals) {
            data.animals.forEach((animalType) => {
                this.createAnimal(1000 + (Math.random() - 0.5) * 1200, 1680 + (Math.random() - 0.5) * 100, animalType);
            });
        }

        if (!data.animals || data.animals.length === 0) {
            this.createAnimal(900, 1680, '🐕');
        }

        // Camera
        this.cameras.main.startFollow(this.castlePoint);
        this.cameras.main.setZoom(1);

        // Input
        this.input.on('pointerdown', (pointer) => {
            // Create sparkle at tap location
            this.createTapSparkle(pointer.worldX, pointer.worldY);
        });

        this.input.on('pointermove', function (p) {
            if (!p.isDown) return;
            this.cameras.main.scrollX -= (p.x - p.prevPosition.x) / this.cameras.main.zoom;
            this.cameras.main.scrollY -= (p.y - p.prevPosition.y) / this.cameras.main.zoom;
        });

        this.input.addPointer(1);

        // Transition logic (Castle area)
        this.castleContainer.setInteractive(new Phaser.Geom.Rectangle(-120, -200, 240, 250), Phaser.Geom.Rectangle.Contains);
        this.castleContainer.on('pointerdown', (p, x, y, event) => {
            event.stopPropagation(); // Don't trigger world sparkle
            window.audioController.playSE('sparkle');
            this.cameras.main.fadeOut(800, 255, 255, 255);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start('SearchScene');
            });
        });
    }

    createRainbow() {
        const data = Utils.getData();
        const colors = [0xFF0000, 0xFF7F00, 0xFFFF00, 0x00FF00, 0x0000FF, 0x4B0082, 0x9400D3];
        const alpha = Math.min(0.1 + (data.winCount - 3) * 0.1, 0.6);

        const rb = this.add.graphics();
        rb.setAlpha(alpha);

        for (let i = 0; i < colors.length; i++) {
            rb.lineStyle(20, colors[i], 1);
            rb.beginPath();
            rb.arc(600, 1500, 800 + i * 20, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340), false);
            rb.strokePath();
        }
    }

    createTapSparkle(x, y) {
        window.audioController.playSE('pollen');
        for (let i = 0; i < 5; i++) {
            const sparkle = this.add.text(x, y, '✨', { fontSize: '24px' }).setOrigin(0.5);
            this.physics.add.existing(sparkle);
            const angle = Math.random() * Math.PI * 2;
            const speed = 100 + Math.random() * 100;
            sparkle.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
            this.tweens.add({
                targets: sparkle,
                alpha: 0,
                scale: 0.5,
                duration: 600,
                onComplete: () => sparkle.destroy()
            });
        }
    }

    createClouds() {
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * 2000;
            const y = 100 + Math.random() * 500;
            const cloud = this.add.text(x, y, '☁️', { fontSize: (80 + Math.random() * 80) + 'px' }).setAlpha(0.6);
            this.tweens.add({
                targets: cloud,
                x: x + (Math.random() > 0.5 ? 100 : -100),
                duration: 8000 + Math.random() * 8000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    createMysteryEgg() {
        const data = Utils.getData();
        const eggsHatched = data.eggsHatched || 0;

        // Progress for CURRENT egg
        // e.g. 1st egg: wins 0-5. 2nd egg: wins 5-10.
        // Effective wins for this egg = totalWins - (eggsHatched * 5)
        let effectiveWins = (data.winCount || 0) - (eggsHatched * 5);

        // Safety cap if win count is low (shouldn't happen with correct logic but safe)
        if (effectiveWins < 0) effectiveWins = 0;

        // Hatch happens when effectiveWins >= 5
        let progress = effectiveWins;

        const eggX = 1300;
        const eggY = 1600;

        let scale = 1.0;

        const egg = this.add.text(eggX, eggY, '🥚', { fontSize: '100px' }).setOrigin(0.5, 1);
        egg.setScale(scale);
        egg.setInteractive();

        // If close to hatching (4 wins), make it wobble and bigger
        if (progress === 4) {
            scale = 1.3;
            this.tweens.add({
                targets: egg,
                angle: { from: -10, to: 10 },
                duration: 120, // Fast wobble!
                yoyo: true,
                repeat: -1
            });
        }

        // Wobble animation if close to hatching
        if (progress >= 1 && progress < 4) {
            this.tweens.add({
                targets: egg,
                angle: { from: -5, to: 5 },
                duration: 200 - (progress * 30), // Faster wobble as progress increase
                yoyo: true,
                repeat: -1
            });
        }

        // --- HATCHING MOMENT ---
        // If we just hit 5 wins (progress 0 BUT winCount > 0), trigger hatch!
        // We use a local state check or just check if it should hatch now
        // Simplification: Tap to hatch if ready?

        let isReadyToHatch = (progress === 0 && data.winCount > 0 && state === 0);

        if (isReadyToHatch) {
            scale = 1.4;
            egg.setText('🥚✨'); // Mark as special

            // Auto hatch animation sequence on tap
            egg.off('pointerdown');
            egg.on('pointerdown', () => {
                this.hatchEgg(egg);
            });
        } else {
            // Normal tap behavior
            egg.on('pointerdown', () => {
                window.audioController.playSE('shake');
                this.tweens.add({
                    targets: egg,
                    scaleX: scale * 1.2,
                    scaleY: scale * 0.8,
                    duration: 100,
                    yoyo: true,
                    onComplete: () => {
                        if (progress === 4) {
                            Utils.speak('もうすぐうまれるよ！');
                        } else {
                            Utils.speak('なにがうまれるかな？');
                        }
                    }
                });
            });
        }
    }

    hatchEgg(egg) {
        window.audioController.playSE('correct'); // Fanfare
        Utils.speak('やったー！うまれたよ！');

        this.tweens.add({
            targets: egg,
            scale: 2.0,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                egg.destroy();
                this.spawnRareCreature(1300, 1600);
            }
        });
    }

    spawnRareCreature(x, y) {
        // Rare animals
        const rares = ['🦄', '🐉', '🦖', '🦚', '🧚'];
        const creatureChar = Phaser.Math.RND.pick(rares);

        const creature = this.add.text(x, y, creatureChar, { fontSize: '100px' }).setOrigin(0.5);
        this.physics.add.existing(creature);
        creature.body.setVelocity(0, -200); // Jump up!
        creature.body.gravity.y = 500;
        creature.setInteractive();

        // Add to permanent collection
        const data = Utils.getData();
        if (!data.animals) data.animals = [];
        data.animals.push(creatureChar);

        // Update egg state to 'hatched' for this cycle, or increment 'eggsHatched'
        // For simplicity: increment a 'eggsHatched' counter to offset future winCounts
        data.eggsHatched = (data.eggsHatched || 0) + 1;
        Utils.saveData('eggsHatched', data.eggsHatched);
        Utils.saveData('animals', data.animals);

        // Creature behavior
        creature.on('pointerdown', () => {
            window.audioController.playSE('jump');
            creature.body.setVelocityY(-350);
            Utils.speak('こんにちは！');
        });
    }

    createNature() {
        const data = Utils.getData();
        const floraCount = data.floraCount || 0;
        const totalToSpawn = 2 + floraCount; // Start even smaller
        const items = ['🌲', '🌳', '🌷', '🌻', '🌼', '🍀', '🍓'];

        for (let i = 0; i < totalToSpawn; i++) {
            const x = Math.random() * 2000;
            const y = 1580 + Math.random() * 250;
            const item = this.add.text(x, y, Phaser.Math.RND.pick(items), { fontSize: '56px' }).setOrigin(0.5, 1);
            item.setInteractive();
            item.setDepth(y); // Pseudo-3D

            item.on('pointerdown', (p, x, y, event) => {
                event.stopPropagation();
                window.audioController.playSE('shake');
                this.tweens.add({
                    targets: item,
                    scaleY: 0.8,
                    scaleX: 1.2,
                    duration: 100,
                    yoyo: true,
                    onComplete: () => {
                        this.tweens.add({
                            targets: item,
                            angle: { from: -15, to: 15 },
                            duration: 80,
                            yoyo: true,
                            repeat: 2
                        });
                    }
                });
            });
        }
    }

    createAtmosphereParticles() {
        for (let i = 0; i < 30; i++) {
            const p = this.add.circle(Math.random() * 2000, Math.random() * 1800, 3, 0xffffff, 0.3);
            this.tweens.add({
                targets: p,
                y: '-=100',
                x: '+=30',
                alpha: 0,
                duration: 4000 + Math.random() * 4000,
                repeat: -1,
                delay: Math.random() * 5000
            });
        }
    }

    createCastle(x, y, level) {
        this.castleContainer = this.add.container(x, y);
        this.castlePoint = this.add.circle(x, y, 5, 0xff0000).setVisible(false);

        const graphics = this.add.graphics();
        // Visible shadow for depth
        graphics.fillStyle(0x000000, 0.15);
        graphics.fillEllipse(0, -5, 220, 50);

        graphics.fillStyle(0xE0E0E0, 1);
        graphics.fillRect(-60, -120, 120, 120);
        graphics.lineStyle(4, 0x333333, 1);
        graphics.strokeRect(-60, -120, 120, 120);
        graphics.fillStyle(0xFF5252, 1);
        graphics.fillTriangle(-75, -120, 75, -120, 0, -210);
        graphics.strokeTriangle(-75, -120, 75, -120, 0, -210);
        graphics.fillStyle(0x795548, 1);
        graphics.fillRect(-22, -45, 44, 45);
        graphics.strokeRect(-22, -45, 44, 45);

        if (level >= 2) {
            graphics.fillStyle(0xD0D0D0, 1);
            graphics.fillRect(-140, -80, 80, 80);
            graphics.strokeRect(-140, -80, 80, 80);
            graphics.fillStyle(0xFF8A80, 1);
            graphics.fillTriangle(-150, -80, -50, -80, -100, -140);
            graphics.strokeTriangle(-150, -80, -50, -80, -100, -140);
        }
        if (level >= 3) {
            graphics.fillStyle(0xD0D0D0, 1);
            graphics.fillRect(60, -80, 80, 80);
            graphics.strokeRect(60, -80, 80, 80);
            graphics.fillStyle(0xFF8A80, 1);
            graphics.fillTriangle(50, -80, 150, -80, 100, -140);
            graphics.strokeTriangle(50, -80, 150, -80, 100, -140);
        }
        if (level >= 4) {
            graphics.fillStyle(0xFFFF00, 1);
            graphics.fillRect(-35, -95, 25, 30);
            graphics.fillRect(10, -95, 25, 30);
        }
        if (level >= 5) {
            graphics.lineStyle(5, 0x424242, 1);
            graphics.lineBetween(0, -210, 0, -270);
            graphics.fillStyle(0xFFFF00, 1);
            graphics.fillTriangle(0, -270, 50, -245, 0, -220);
            graphics.strokeTriangle(0, -270, 50, -245, 0, -220);

            // Animated flag text
            const flag = this.add.text(25, -260, '🚩', { fontSize: '40px' }).setOrigin(0.5);
            this.castleContainer.add(flag);
            this.tweens.add({
                targets: flag,
                scaleX: 0.8,
                duration: 300,
                yoyo: true,
                repeat: -1
            });
        }

        // Window lights (Level 4+)
        if (level >= 4) {
            const lightL = this.add.circle(-22, -80, 8, 0xFFFF00, 0.8);
            const lightR = this.add.circle(22, -80, 8, 0xFFFF00, 0.8);
            this.castleContainer.add(lightL);
            this.castleContainer.add(lightR);

            this.tweens.add({
                targets: [lightL, lightR],
                alpha: 0.4,
                duration: 1000 + Math.random() * 500,
                yoyo: true,
                repeat: -1
            });
        }

        this.castleContainer.add(graphics);
        const text = this.add.text(0, 40, '👑', { fontSize: '56px' }).setOrigin(0.5);
        this.castleContainer.add(text);

        this.tweens.add({
            targets: this.castleContainer,
            scaleX: 1.03,
            scaleY: 1.03,
            yoyo: true,
            repeat: -1,
            duration: 1800,
            ease: 'Sine.easeInOut'
        });
    }

    createSkyObjects() {
        // Airplane
        const plane = this.add.text(-200, 300, '✈️', { fontSize: '80px' }).setOrigin(0.5);
        this.tweens.add({
            targets: plane,
            x: 2200,
            duration: 15000,
            repeat: -1,
            delay: 5000
        });

        // Balloon
        const balloon = this.add.text(2200, 500, '🎈', { fontSize: '80px' }).setOrigin(0.5);
        this.tweens.add({
            targets: balloon,
            x: -200,
            y: 400,
            duration: 25000,
            repeat: -1,
            delay: 0
        });
    }

    createAnimal(x, y, emoji) {
        const animal = this.add.text(x, y, emoji, { fontSize: '72px' }).setOrigin(0.5);
        this.physics.add.existing(animal);
        animal.setInteractive();
        animal.setDepth(y);

        animal.on('pointerdown', (p, lx, ly, event) => {
            event.stopPropagation();
            window.audioController.playSE('jump');

            // Squash and stretch
            this.tweens.add({
                targets: animal,
                y: animal.y - 120,
                scaleX: 1.3,
                scaleY: 0.7,
                duration: 250,
                yoyo: true,
                onComplete: () => {
                    const bubbleItems = ['❤️', '🍭', '🍓', '🌟', '🥕', '🍦'];
                    const heart = this.add.text(animal.x, animal.y - 100, Phaser.Math.RND.pick(bubbleItems), { fontSize: '40px' }).setOrigin(0.5);
                    this.tweens.add({
                        targets: heart,
                        y: heart.y - 80,
                        alpha: 0,
                        scale: 1.5,
                        duration: 1000,
                        onComplete: () => heart.destroy()
                    });
                }
            });
        });

        this.time.addEvent({
            delay: 4000 + Math.random() * 3000,
            callback: () => {
                if (!animal.body) return;
                const speed = 45;
                const angle = Math.random() * Math.PI * 2;
                animal.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
                animal.setFlipX(Math.cos(angle) < 0);
                animal.setDepth(animal.y);
            },
            loop: true
        });
        this.animals.add(animal);
    }
}
