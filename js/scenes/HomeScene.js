class HomeScene extends Phaser.Scene {
    constructor() {
        super('HomeScene');
    }

    create(params) {
        if (window.audioController) window.audioController.playBGM();
        const data = Utils.getData();

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
            sky.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xE0F7FA, 0xE0F7FA, 1);
        }
        sky.fillRect(0, 0, 2000, 1500);

        // Add distant mountains for depth
        const mountains = this.add.graphics();
        mountains.fillStyle(isNight ? 0x2E7D32 : 0xAED581, 1); // Darker at night
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

        if (!data.animals || data.animals.length === 0) {
            this.createAnimal(900, 1680, '🐕', isNight);
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
            { text: 'RESET', color: '#ff0000', action: () => { localStorage.clear(); location.reload(); } },
            {
                text: 'WIN++', color: '#00ff00', action: () => {
                    const d = Utils.getData();
                    d.winCount = (d.winCount || 0) + 1;
                    Utils.saveData('winCount', d.winCount);
                    this.scene.restart();
                }
            },
            {
                text: 'HATCH', color: '#ffff00', action: () => {
                    const d = Utils.getData();
                    const cycleStart = (d.eggsHatched || 0) * 5;
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
                    d.collectedHiragana = ['あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'け', 'こ', 'さ', 'し', 'す', 'せ', 'そ', 'た', 'ち', 'つ', 'て', 'と', 'な', 'に', 'ぬ', 'ね', 'の', 'は', 'ひ', 'ふ', 'へ', 'ほ', 'ま', 'み', 'む', 'め', 'も', 'や', 'ゆ', 'よ', 'ら', 'り', 'る', 'れ', 'ろ', 'わ', 'を', 'ん'];
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
        const collected = data.collectedHiragana || [];
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

        // Adjust spawn to be lower so it pops up from the egg better
        const spawnY = y + 50;

        const creature = this.add.text(x, spawnY, creatureChar, { fontSize: '100px' }).setOrigin(0.5);
        this.physics.add.existing(creature);
        creature.body.setVelocity(0, -600); // Higher jump!
        creature.body.gravity.y = 800; // Heavier gravity for better feel
        creature.body.setBounce(0.4);
        creature.body.setCollideWorldBounds(true);
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
            creature.body.setVelocityY(-450);
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
            graphics.fillStyle(isNight ? 0xFFEA00 : 0xFFFF00, 1); // Brighter yellow at night
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

    createAnimal(x, y, emoji, isNight = false) {
        const animal = this.add.text(x, y, emoji, { fontSize: '72px' }).setOrigin(0.5);
        this.physics.add.existing(animal);
        animal.setInteractive();
        animal.setDepth(y);

        // Movement logic
        if (isNight && ['🦄', '🐉', '🧚'].includes(emoji)) {
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
