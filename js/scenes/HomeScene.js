class HomeScene extends Phaser.Scene {
    constructor() {
        super('HomeScene');
    }

    create(params) {
        const data = Utils.getData();
        const mode = data.gameMode || 'あ';
        const modeCfg = MODE_CONFIG[mode] || MODE_CONFIG['あ'];

        // Stop any previous BGM and play mode-specific melody
        if (window.audioController) {
            window.audioController.stopBGM();
            window.audioController.playBGM(mode);
        }

        // --- 0. Day/Night Cycle ---
        // 20% chance of Night Mode, unless forced
        let isNight = Math.random() < 0.2;
        if (params && params.forceNight !== undefined) {
            isNight = params.forceNight;
        }
        this.currentIsNight = isNight;

        // --- 1. Environmental Atmosphere (Gradient Sky) ---
        const sky = this.add.graphics();
        if (isNight) {
            sky.fillGradientStyle(0x000033, 0x000033, 0x191970, 0x191970, 1);
        } else {
            sky.fillGradientStyle(modeCfg.skyTop, modeCfg.skyTop, modeCfg.skyBot, modeCfg.skyBot, 1);
        }
        sky.fillRect(0, 0, 2000, 1500);

        // Add distant mountains for depth
        const mountains = this.add.graphics();
        mountains.fillStyle(isNight ? 0x2E7D32 : modeCfg.mountainColor, 1);
        mountains.fillTriangle(0, 1800, 500, 1400, 1000, 1800);
        mountains.fillTriangle(600, 1800, 1200, 1300, 1800, 1800);
        mountains.fillTriangle(1400, 1800, 1800, 1500, 2200, 1800);

        // Sun or Moon
        if (isNight) {
            // Moon Glow
            const moonGlow = this.add.circle(1800, 200, 100, 0xFFFFCC, 0.3);
            this.tweens.add({
                targets: moonGlow,
                scale: 1.2,
                alpha: 0.1,
                duration: 2000,
                yoyo: true,
                repeat: -1
            });
            const moon = this.add.text(1800, 200, '🌙', { fontSize: '120px' }).setOrigin(0.5);

            // Twinkling stars
            for (let i = 0; i < 50; i++) {
                const star = this.add.text(Math.random() * 2000, Math.random() * 1000, '⭐', { fontSize: (10 + Math.random() * 20) + 'px' }).setAlpha(0.7);
                this.tweens.add({
                    targets: star,
                    alpha: 0.2,
                    duration: 1000 + Math.random() * 2000,
                    yoyo: true,
                    repeat: -1
                });
            }
        } else {
            // Sun Glow
            const sunGlow = this.add.circle(1800, 200, 120, 0xFFD700, 0.4);
            this.tweens.add({
                targets: sunGlow,
                scale: 1.3,
                alpha: 0.2,
                duration: 3000,
                yoyo: true,
                repeat: -1
            });

            const sun = this.add.text(1800, 200, '🌞', { fontSize: '150px' }).setOrigin(0.5);
            this.tweens.add({
                targets: sun,
                angle: 360,
                duration: 20000,
                repeat: -1
            });
        }

        this.physics.world.setBounds(0, 0, 2000, 2000);
        this.cameras.main.setBounds(0, 0, 2000, 2000);

        // Add soft hills for ground
        const ground = this.add.graphics();
        ground.fillStyle(isNight ? 0x4CAF50 : modeCfg.groundColor, 1);
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
        const baseLevel = data.castleLevel;
        // Move castle slightly down into the ground
        this.createCastle(1000, 1580, baseLevel, isNight);

        // --- 5. Particles (Pollen/Light) ---
        this.createAtmosphereParticles(isNight);

        // --- 6. Animals ---
        this.animals = this.physics.add.group();
        if (data.animals) {
            data.animals.forEach((animalType) => {
                this.createAnimal(1000 + (Math.random() - 0.5) * 1200, 1680 + (Math.random() - 0.5) * 100, animalType, isNight);
            });
        }



        // Camera
        this.cameras.main.startFollow(this.castlePoint);
        this.cameras.main.setZoom(1);

        // Input
        this.input.on('pointerdown', (pointer) => {
            // Create sparkle at tap location
            this.createTapSparkle(pointer.worldX, pointer.worldY);
        });

        this.input.on('pointermove', (p) => {
            if (!p.isDown) return;
            this.cameras.main.scrollX -= (p.x - p.prevPosition.x) / this.cameras.main.zoom;
            this.cameras.main.scrollY -= (p.y - p.prevPosition.y) / this.cameras.main.zoom;
        });

        this.input.addPointer(1);

        // --- 7. Collection Book (Zukan) ---
        const bookBtn = this.add.text(1880, 80, '📖', { fontSize: '80px' })
            .setOrigin(0.5)
            .setInteractive()
            .setScrollFactor(0); // Fix to screen

        bookBtn.on('pointerdown', () => {
            this.toggleCollection();
        });

        // --- 8. DEBUG MODE (URL Parameter: ?debug=true) ---
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('debug') === 'true') {
            this.createDebugUI();
        }

        // --- 9. Mode Selector ---
        this.createModeSelector(mode);

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

    createDebugUI() {
        const { width, height } = this.cameras.main;
        const buttonWidth = 200;
        const buttonHeight = 80;
        const spacing = 20;
        const startX = width - buttonWidth / 2 - 20;
        const startY = height - 600;

        const debugContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(2000);

        const buttons = [
            { text: 'RESET', color: '#ff0000', action: () => { Utils.resetData(); location.reload(); } },
            {
                text: 'WIN++', color: '#00ff00', action: () => {
                    const d = Utils.getData();
                    d.winCount = d.winCount + 1;
                    Utils.saveData('winCount', d.winCount);
                    this.scene.restart();
                }
            },
            {
                text: 'HATCH', color: '#ffff00', action: () => {
                    const d = Utils.getData();
                    const cycleStart = d.eggsHatched * 5;
                    d.winCount = cycleStart + 4;
                    Utils.saveData('winCount', d.winCount);
                    this.scene.restart();
                }
            },
            {
                text: 'DAY/NIGHT', color: '#0000ff', action: () => {
                    const currentNight = this.currentIsNight || false;
                    this.scene.restart({ forceNight: !currentNight });
                }
            },
            {
                text: 'ZUKAN', color: '#ff00ff', action: () => {
                    const d = Utils.getData();
                    d.collectedHiragana = ['あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'け', 'こ', 'さ', 'し', 'す', 'せ', 'そ', 'た', 'ち', 'つ', 'て', 'と'];
                    Utils.saveData('collectedHiragana', d.collectedHiragana);
                    Utils.speak('全部覚えたよ');
                }
            },
            { text: 'CLOSEUI', color: '#888888', action: () => { debugContainer.setVisible(!debugContainer.visible); } }
        ];

        buttons.forEach((btn, index) => {
            const y = startY + index * (buttonHeight + spacing);

            const bg = this.add.rectangle(startX, y, buttonWidth, buttonHeight, 0x000000, 0.7)
                .setInteractive();

            const text = this.add.text(startX, y, btn.text, { fontSize: '24px', color: btn.color || '#ffffff', fontStyle: 'bold' })
                .setOrigin(0.5);

            bg.on('pointerdown', () => {
                btn.action();
                this.tweens.add({
                    targets: [bg, text],
                    scale: 0.9,
                    duration: 50,
                    yoyo: true
                });
            });

            debugContainer.add(bg);
            debugContainer.add(text);
        });
    }

    toggleCollection() {
        if (this.isCollectionOpen) {
            this.collectionGroup.destroy(true);
            this.isCollectionOpen = false;
            return;
        }

        this.isCollectionOpen = true;
        this.collectionGroup = this.add.group();

        // Overlay
        const overlay = this.add.rectangle(1000, 1000, 2000, 2000, 0x000000, 0.8)
            .setInteractive()
            .setScrollFactor(0);
        this.collectionGroup.add(overlay);

        // Close button
        const closeBtn = this.add.text(1800, 200, '✖️', { fontSize: '100px', color: '#ffffff' })
            .setOrigin(0.5)
            .setInteractive()
            .setScrollFactor(0);

        closeBtn.on('pointerdown', () => {
            this.toggleCollection();
        });
        this.collectionGroup.add(closeBtn);

        // Title
        const title = this.add.text(1000, 300, 'あつめたひらがな', {
            fontSize: '80px',
            fontFamily: '"Hiragino Maru Gothic ProN"',
            color: '#FFD700',
            stroke: '#000000', strokeThickness: 4
        })
            .setOrigin(0.5)
            .setScrollFactor(0);
        this.collectionGroup.add(title);

        const data = Utils.getData();
        const collected = data.collectedHiragana;
        const uniqueChars = [...new Set(collected)].sort();

        // Calculate pages
        const itemsPerPage = 15; // 5 cols x 3 rows
        const maxPages = Math.ceil(uniqueChars.length / itemsPerPage) || 1;
        let currentPage = 1;

        // Container for grid items to easily swap pages
        const gridContainer = this.add.container(0, 0).setScrollFactor(0);
        this.collectionGroup.add(gridContainer);

        const renderPage = (page) => {
            gridContainer.removeAll(true);

            // Pagination Controls if needed
            if (maxPages > 1) {
                const pageText = this.add.text(1000, 1300, `${page} / ${maxPages}`, { fontSize: '50px', color: '#fff' })
                    .setOrigin(0.5);
                gridContainer.add(pageText);

                if (page > 1) {
                    const prevBtn = this.add.text(600, 1300, '◀️ まえ', { fontSize: '50px', backgroundColor: '#333', padding: 10 })
                        .setOrigin(0.5)
                        .setInteractive();
                    prevBtn.on('pointerdown', () => renderPage(page - 1));
                    gridContainer.add(prevBtn);
                }

                if (page < maxPages) {
                    const nextBtn = this.add.text(1400, 1300, 'つぎ ▶️', { fontSize: '50px', backgroundColor: '#333', padding: 10 })
                        .setOrigin(0.5)
                        .setInteractive();
                    nextBtn.on('pointerdown', () => renderPage(page + 1));
                    gridContainer.add(nextBtn);
                }
            }

            if (uniqueChars.length === 0) {
                const emptyTxt = this.add.text(1000, 800, 'まだなにもないよ。\nひらがなさがしにいこう！', {
                    fontSize: '60px', color: '#fff', align: 'center'
                }).setOrigin(0.5);
                gridContainer.add(emptyTxt);
                return;
            }

            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = Math.min(startIndex + itemsPerPage, uniqueChars.length);
            const pageItems = uniqueChars.slice(startIndex, endIndex);

            const cols = 5;
            const startX = 400;
            const startY = 500;
            const spaX = 300;
            const spaY = 250;

            pageItems.forEach((char, index) => {
                const c = index % cols;
                const r = Math.floor(index / cols);

                const charTxt = this.add.text(startX + c * spaX, startY + r * spaY, char, {
                    fontSize: '120px',
                    fontFamily: '"Hiragino Maru Gothic ProN"',
                    color: '#ffffff',
                    stroke: '#FFA500', strokeThickness: 6,
                    shadow: { offsetX: 4, offsetY: 4, color: '#000', blur: 4, stroke: true, fill: true }
                }).setOrigin(0.5);

                charTxt.setInteractive();
                charTxt.on('pointerdown', () => {
                    Utils.speak(char);
                    window.audioController.playSE('pop');
                    this.tweens.add({
                        targets: charTxt,
                        scale: 1.5,
                        duration: 100,
                        yoyo: true
                    });
                });

                gridContainer.add(charTxt);
            });
        };

        renderPage(currentPage);
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
        const eggsHatched = data.eggsHatched;

        // Progress for CURRENT egg
        // e.g. 1st egg: wins 0-5. 2nd egg: wins 5-10.
        // Effective wins for this egg = totalWins - (eggsHatched * 5)
        let effectiveWins = data.winCount - (eggsHatched * 5);

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
            egg.setScale(scale);
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
        // Hatch when effectiveWins >= 5 (progress >= 5)
        let isReadyToHatch = (progress >= 5);

        if (isReadyToHatch) {
            scale = 1.4;
            egg.setScale(scale);
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
        // Rare animals (Image Keys)
        const rares = ['unicorn', 'dragon', 'trex', 'peacock'];
        const creatureKey = Phaser.Math.RND.pick(rares);

        // Adjust spawn to be lower so it pops up from the egg better
        const spawnY = y + 50;

        const creature = this.add.image(x, spawnY, creatureKey).setOrigin(0.5);
        creature.setDisplaySize(150, 150); // Consistent size
        this.physics.add.existing(creature);
        creature.body.setVelocity(0, -600); // Higher jump!
        creature.body.gravity.y = 800; // Heavier gravity for better feel
        creature.body.setBounce(0.4);
        creature.body.setCollideWorldBounds(true);
        creature.setInteractive();

        // Add to permanent collection
        const data = Utils.getData();

        data.animals.push(creatureKey);

        // Update egg state to 'hatched' for this cycle, or increment 'eggsHatched'
        // For simplicity: increment a 'eggsHatched' counter to offset future winCounts
        data.eggsHatched = data.eggsHatched + 1;
        Utils.saveData('eggsHatched', data.eggsHatched);
        Utils.saveData('animals', data.animals);

        // Creature behavior
        creature.on('pointerdown', () => {
            window.audioController.playSE('jump');
            creature.body.setVelocityY(-450);
            Utils.speak('こんにちは！');

            // Simple squash animation for sprite
            this.tweens.add({
                targets: creature,
                scaleX: creature.scaleX * 1.2,
                scaleY: creature.scaleY * 0.8,
                duration: 100,
                yoyo: true
            });
        });
    }

    createNature() {
        const data = Utils.getData();
        const mode = data.gameMode || 'あ';
        const modeCfg = MODE_CONFIG[mode] || MODE_CONFIG['あ'];
        const floraCount = data.floraCount;
        const totalToSpawn = 2 + floraCount;
        const items = modeCfg.floraItems;

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

    createAtmosphereParticles(isNight = false) {
        // Fireflies at night, Light particles at day
        const color = isNight ? 0xFFFF00 : 0xffffff;
        const alpha = isNight ? 1 : 0.3;

        for (let i = 0; i < 30; i++) {
            const p = this.add.circle(Math.random() * 2000, Math.random() * 1800, isNight ? 4 : 3, color, alpha);
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

    createCastle(x, y, level, isNight = false) {
        this.castleContainer = this.add.container(x, y);
        this.castlePoint = this.add.circle(x, y, 5, 0xff0000).setVisible(false);

        // Mode-specific wall/roof colors
        const data = Utils.getData();
        const mode = data.gameMode || 'あ';
        const modeCfg = MODE_CONFIG[mode] || MODE_CONFIG['あ'];
        const wallColor = isNight ? 0xB8B8B8 : modeCfg.wallColor;
        const wallColorDark = isNight ? 0xA8A8A8 : modeCfg.wallColorDark;
        const roofColor = isNight ? 0xCC3333 : modeCfg.roofColor;
        const roofColorLight = isNight ? 0xFF6666 : modeCfg.roofColorLight;

        const graphics = this.add.graphics();
        // Visible shadow for depth
        graphics.fillStyle(0x000000, 0.15);
        graphics.fillEllipse(0, -5, 220, 50);

        graphics.fillStyle(wallColor, 1);
        graphics.fillRect(-60, -120, 120, 120);
        graphics.lineStyle(4, 0x333333, 1);
        graphics.strokeRect(-60, -120, 120, 120);
        graphics.fillStyle(roofColor, 1);
        graphics.fillTriangle(-75, -120, 75, -120, 0, -210);
        graphics.strokeTriangle(-75, -120, 75, -120, 0, -210);
        graphics.fillStyle(0x795548, 1);
        graphics.fillRect(-22, -45, 44, 45);
        graphics.strokeRect(-22, -45, 44, 45);

        if (level >= 2) {
            graphics.fillStyle(wallColorDark, 1);
            graphics.fillRect(-140, -80, 80, 80);
            graphics.strokeRect(-140, -80, 80, 80);
            graphics.fillStyle(roofColorLight, 1);
            graphics.fillTriangle(-150, -80, -50, -80, -100, -140);
            graphics.strokeTriangle(-150, -80, -50, -80, -100, -140);
        }
        if (level >= 3) {
            graphics.fillStyle(wallColorDark, 1);
            graphics.fillRect(60, -80, 80, 80);
            graphics.strokeRect(60, -80, 80, 80);
            graphics.fillStyle(roofColorLight, 1);
            graphics.fillTriangle(50, -80, 150, -80, 100, -140);
            graphics.strokeTriangle(50, -80, 150, -80, 100, -140);
        }
        if (level >= 4) {
            const roof = this.add.image(0, -180, 'castle_roof').setOrigin(0.5);
            roof.setDisplaySize(180, 150);
            this.castleContainer.add(roof);
        }
        if (level >= 5) {
            const flag = this.add.image(25, -280, 'castle_flag').setOrigin(0.5);
            flag.setDisplaySize(100, 80);
            this.castleContainer.add(flag);

            this.tweens.add({
                targets: flag,
                scaleX: 0.9,
                angle: 5,
                duration: 600,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        // Window lights always on at night, or if level >= 4
        if (isNight || level >= 4) {
            const lightL = this.add.circle(-22, -80, 8, isNight ? 0xFF9800 : 0xFFFF00, 0.8);
            const lightR = this.add.circle(22, -80, 8, isNight ? 0xFF9800 : 0xFFFF00, 0.8);
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

        // Level 6+: extended castle structure (pure graphics, no images)
        this.createCastleExtensions(level, isNight, wallColor, wallColorDark, roofColor, roofColorLight);

        // Scale the entire castle based on level (grows up to 2x)
        const castleScale = Math.min(1 + (level - 1) * 0.04, 2.0);
        this.castleContainer.setScale(castleScale);

        // Breathing animation (proportional to castle scale)
        this.tweens.add({
            targets: this.castleContainer,
            scaleX: castleScale + 0.03,
            scaleY: castleScale + 0.03,
            yoyo: true,
            repeat: -1,
            duration: 1800,
            ease: 'Sine.easeInOut'
        });
    }

    createCastleExtensions(level, isNight, wallColor, wallColorDark, roofColor, roofColorLight) {
        const container = this.castleContainer;
        const flagColors = [0xFF0000, 0xFFFF00, 0x00FF00, 0x0000FF, 0xFF00FF, 0xFF6600, 0x00FFFF];

        // Level 6: Battlements on left + right towers
        if (level >= 6) {
            const g6 = this.add.graphics();
            g6.fillStyle(wallColor, 1);
            g6.lineStyle(2, 0x333333, 1);
            // Left tower merlons (tower top is at y=-80)
            for (let i = 0; i < 3; i++) {
                g6.fillRect(-138 + i * 26, -98, 18, 20);
                g6.strokeRect(-138 + i * 26, -98, 18, 20);
            }
            // Right tower merlons
            for (let i = 0; i < 3; i++) {
                g6.fillRect(62 + i * 26, -98, 18, 20);
                g6.strokeRect(62 + i * 26, -98, 18, 20);
            }
            // Random small window on each tower
            const winColor = isNight ? 0xFF9800 : 0x87CEEB;
            g6.fillStyle(winColor, 0.9);
            g6.fillRect(-118, -70, 18, 22);
            g6.fillRect(100, -70, 18, 22);
            container.add(g6);
        }

        // Level 7: Third tower (far left)
        if (level >= 7) {
            const g7 = this.add.graphics();
            g7.fillStyle(wallColor, 1);
            g7.lineStyle(3, 0x333333, 1);
            g7.fillRect(-230, -100, 70, 100);
            g7.strokeRect(-230, -100, 70, 100);
            g7.fillStyle(roofColor, 1);
            g7.fillTriangle(-240, -100, -150, -100, -195, -170);
            g7.strokeTriangle(-240, -100, -150, -100, -195, -170);
            // Battlements
            for (let i = 0; i < 3; i++) {
                g7.fillStyle(wallColor, 1);
                g7.fillRect(-228 + i * 24, -118, 16, 20);
                g7.strokeRect(-228 + i * 24, -118, 16, 20);
            }
            container.add(g7);
        }

        // Level 8: Fourth tower (far right)
        if (level >= 8) {
            const g8 = this.add.graphics();
            g8.fillStyle(wallColor, 1);
            g8.lineStyle(3, 0x333333, 1);
            g8.fillRect(160, -100, 70, 100);
            g8.strokeRect(160, -100, 70, 100);
            g8.fillStyle(roofColor, 1);
            g8.fillTriangle(150, -100, 240, -100, 195, -170);
            g8.strokeTriangle(150, -100, 240, -100, 195, -170);
            for (let i = 0; i < 3; i++) {
                g8.fillStyle(wallColor, 1);
                g8.fillRect(162 + i * 24, -118, 16, 20);
                g8.strokeRect(162 + i * 24, -118, 16, 20);
            }
            container.add(g8);
        }

        // Level 9: Moat in front (added to back of container)
        if (level >= 9) {
            const g9 = this.add.graphics();
            g9.fillStyle(0x4FC3F7, 0.7);
            g9.fillEllipse(0, 30, 380, 55);
            g9.lineStyle(3, 0x0288D1, 0.9);
            g9.strokeEllipse(0, 30, 380, 55);
            // Small fish emoji in the moat
            const fish = this.add.text(Phaser.Math.Between(-60, 60), 30, '🐟', { fontSize: '24px' }).setOrigin(0.5);
            this.tweens.add({
                targets: fish,
                x: fish.x + (Math.random() > 0.5 ? 80 : -80),
                duration: 3000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            container.addAt(g9, 0);
            container.addAt(fish, 1);
        }

        // Level 10: Connecting outer walls
        if (level >= 10) {
            const g10 = this.add.graphics();
            g10.fillStyle(wallColorDark, 1);
            g10.lineStyle(3, 0x333333, 1);
            // Left: connect left tower to far-left tower
            g10.fillRect(-230, -45, 90, 45);
            g10.strokeRect(-230, -45, 90, 45);
            // Right: connect right tower to far-right tower
            g10.fillRect(140, -45, 90, 45);
            g10.strokeRect(140, -45, 90, 45);
            container.add(g10);
        }

        // Level 11: Pennant flags on all towers (random colors each visit)
        if (level >= 11) {
            const g11 = this.add.graphics();
            const polePositions = [
                [0, -215],     // Center
                [-100, -148],  // Left tower
                [100, -148],   // Right tower
                [-195, -175],  // Far-left tower
                [195, -175]    // Far-right tower
            ];
            polePositions.forEach(([px, py]) => {
                const col = Phaser.Math.RND.pick(flagColors);
                g11.fillStyle(col, 1);
                g11.fillTriangle(px, py, px + 28, py - 10, px, py - 25);
                g11.lineStyle(2, 0x5D4037, 1);
                g11.beginPath();
                g11.moveTo(px, py);
                g11.lineTo(px, py + 35);
                g11.strokePath();
            });
            container.add(g11);
        }

        // Level 12: Grand outer gate towers
        if (level >= 12) {
            const g12 = this.add.graphics();
            g12.fillStyle(wallColor, 1);
            g12.lineStyle(3, 0x333333, 1);
            // Massive outer pillars
            g12.fillRect(-300, -90, 60, 90);
            g12.strokeRect(-300, -90, 60, 90);
            g12.fillRect(240, -90, 60, 90);
            g12.strokeRect(240, -90, 60, 90);
            // Outer pillar roofs
            g12.fillStyle(roofColor, 1);
            g12.fillTriangle(-310, -90, -230, -90, -270, -165);
            g12.strokeTriangle(-310, -90, -230, -90, -270, -165);
            g12.fillTriangle(230, -90, 310, -90, 270, -165);
            g12.strokeTriangle(230, -90, 310, -90, 270, -165);
            // Connecting low wall
            g12.fillStyle(wallColorDark, 0.8);
            g12.fillRect(-240, -50, 480, 50);
            g12.lineStyle(2, 0x333333, 0.8);
            g12.strokeRect(-240, -50, 480, 50);
            container.addAt(g12, 0); // behind inner elements
        }

        // Level 13: Gem/sparkle decorations on key positions
        if (level >= 13) {
            const gemEmoji = ['💎', '⭐', '🌟', '✨'];
            const gemPos = [
                [0, -230], [-100, -158], [100, -158],
                [-195, -180], [195, -180],
                [-50, -145], [50, -145]
            ];
            gemPos.forEach(([gx, gy]) => {
                const gem = this.add.text(gx, gy, Phaser.Math.RND.pick(gemEmoji), { fontSize: '22px' }).setOrigin(0.5);
                container.add(gem);
                this.tweens.add({
                    targets: gem,
                    y: gy - 10,
                    alpha: { from: 0.6, to: 1 },
                    duration: 500 + Math.random() * 700,
                    yoyo: true,
                    repeat: -1
                });
            });
        }

        // Level 14: Tall super-spires on center + side towers
        if (level >= 14) {
            const g14 = this.add.graphics();
            g14.fillStyle(roofColor, 1);
            g14.lineStyle(2, 0x333333, 1);
            // Very tall thin spire on center
            g14.fillTriangle(-20, -210, 20, -210, 0, -330);
            g14.strokeTriangle(-20, -210, 20, -210, 0, -330);
            // Spires on side towers
            g14.fillTriangle(-108, -140, -92, -140, -100, -220);
            g14.fillTriangle(92, -140, 108, -140, 100, -220);
            container.add(g14);
        }

        // Level 15: Orbiting sparkle ring
        if (level >= 15) {
            const sparkEmoji = ['🌟', '✨', '💫', '⭐'];
            for (let i = 0; i < 6; i++) {
                const angle0 = (i / 6) * Math.PI * 2;
                const r = 180;
                const sx = Math.cos(angle0) * r;
                const sy = Math.sin(angle0) * r - 110;
                const sp = this.add.text(sx, sy, Phaser.Math.RND.pick(sparkEmoji), { fontSize: '28px' }).setOrigin(0.5).setAlpha(0.85);
                container.add(sp);
                // Orbit: move to next position in the ring
                const angle1 = ((i + 1) / 6) * Math.PI * 2;
                this.tweens.add({
                    targets: sp,
                    x: Math.cos(angle1) * r,
                    y: Math.sin(angle1) * r - 110,
                    duration: 3000 + i * 300,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        }

        // Random bonus decoration: sometimes add a seasonal touch (level 6+)
        if (level >= 6 && Math.random() < 0.4) {
            const bonusEmojis = ['🌈', '🎆', '🎇', '🏳️', '🪄'];
            const bonus = this.add.text(
                (Math.random() - 0.5) * 200,
                -250 - Math.random() * 80,
                Phaser.Math.RND.pick(bonusEmojis),
                { fontSize: '32px' }
            ).setOrigin(0.5).setAlpha(0.8);
            container.add(bonus);
            this.tweens.add({
                targets: bonus,
                y: bonus.y - 20,
                alpha: { from: 0.5, to: 1 },
                duration: 2000 + Math.random() * 1000,
                yoyo: true,
                repeat: -1
            });
        }
    }

    createModeSelector(currentMode) {
        const modes = ['あ', 'か', 'さ', 'た'];
        const sel = this.add.container(0, 0).setScrollFactor(0).setDepth(1000);

        modes.forEach((m, i) => {
            const cfg = MODE_CONFIG[m];
            const btnX = 80 + i * 125;
            const btnY = 80;
            const isActive = m === currentMode;

            const bg = this.add.rectangle(btnX, btnY, 108, 54, isActive ? 0xFFD700 : 0x222222, isActive ? 1 : 0.75)
                .setInteractive()
                .setStrokeStyle(2, isActive ? 0xFFAA00 : 0x888888);

            const label = this.add.text(btnX, btnY, cfg.label, {
                fontSize: '26px',
                color: isActive ? '#333333' : '#ffffff',
                fontFamily: '"Hiragino Maru Gothic ProN"',
                fontStyle: isActive ? 'bold' : 'normal'
            }).setOrigin(0.5);

            bg.on('pointerdown', (p, lx, ly, event) => {
                event.stopPropagation();
                if (m === currentMode) return;
                Utils.saveData('gameMode', m);
                this.cameras.main.fadeOut(400, 255, 255, 255);
                this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                    this.scene.restart();
                });
            });

            sel.add([bg, label]);
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

    createAnimal(x, y, type, isNight = false) {
        let animal;
        const isSprite = ['unicorn', 'dragon', 'trex', 'peacock'].includes(type);

        if (isSprite) {
            animal = this.add.image(x, y, type).setOrigin(0.5);
            animal.setDisplaySize(120, 120);
        } else {
            animal = this.add.text(x, y, type, { fontSize: '72px' }).setOrigin(0.5);
        }
        this.physics.add.existing(animal);
        animal.setInteractive();
        animal.setDepth(y);

        // Movement logic
        if (isNight && (type === 'dragon' || type === 'unicorn' || type === 'peacock')) {
            // Flying creatures at night
            animal.body.allowGravity = false;
            this.tweens.add({
                targets: animal,
                y: y - 300,
                x: x + 200,
                duration: 4000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        } else {
            // Normal walking
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
        }

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
        this.animals.add(animal);
    }
}
