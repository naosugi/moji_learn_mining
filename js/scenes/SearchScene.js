class SearchScene extends Phaser.Scene {
    constructor() {
        super('SearchScene');
    }

    create() {
        if (window.audioController) window.audioController.stopBGM();
        this.cameras.main.fadeIn(500, 0, 0, 0);
        this.cameras.main.setBackgroundColor('#333'); // Darker background for focus

        // Game Configuration
        this.targetHiragana = this.getRandomHiragana();
        this.isGameActive = true;

        // Create a header background for the question
        const headerBg = this.add.rectangle(this.cameras.main.centerX, 60, this.cameras.main.width, 100, 0x000000, 0.5);
        headerBg.setDepth(100);

        // UI Text for Question
        this.questionText = this.add.text(this.cameras.main.centerX, 60, `「${this.targetHiragana.char}」をさがしてね`, {
            fontSize: '40px',
            color: '#ffffff',
            fontFamily: '"Hiragino Maru Gothic ProN"',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setAlpha(0);
        this.questionText.setDepth(101); // High depth to stay above everything

        // Speak the question and show text
        this.time.delayedCall(500, () => {
            Utils.speak(`${this.targetHiragana.word}の、${this.targetHiragana.char}、をさがしてね`);
            this.tweens.add({ targets: this.questionText, alpha: 1, duration: 800 });
        });

        // Create Grid of Blocks
        this.createBlocks();
    }

    getRandomHiragana() {
        const data = Utils.getData();
        const mode = data.gameMode || 'あ';
        const list = HIRAGANA_DATA[mode] || HIRAGANA_DATA['あ'];
        return Phaser.Math.RND.pick(list);
    }

    createBlocks() {
        const rows = 4;
        const cols = 4;
        const blockSize = 150; // Adjust based on screen size
        const startX = (this.cameras.main.width - (cols * blockSize)) / 2 + blockSize / 2;
        const startY = (this.cameras.main.height - (rows * blockSize)) / 2 + blockSize / 2;

        this.blocks = this.add.group();

        // Prepare grid positions
        let positions = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                positions.push({ x: startX + c * blockSize, y: startY + r * blockSize });
            }
        }

        // Shuffle positions
        positions = Phaser.Utils.Array.Shuffle(positions);

        // Place Target
        const targetPos = positions.pop();
        this.createContent(targetPos.x, targetPos.y, this.targetHiragana.char, true);

        // Place Decoys using same-mode characters
        const data = Utils.getData();
        const mode = data.gameMode || 'あ';
        const modeList = HIRAGANA_DATA[mode] || HIRAGANA_DATA['あ'];
        const decoys = modeList.map(h => h.char).filter(c => c !== this.targetHiragana.char);
        for (let i = 0; i < 3; i++) {
            if (positions.length === 0) break;
            const pos = positions.pop();
            const decoyChar = Phaser.Math.RND.pick(decoys);
            this.createContent(pos.x, pos.y, decoyChar, false);
        }

        // Place Empty/Garbage (rest are empty or just minimal graphic)
        while (positions.length > 0) {
            const pos = positions.pop();
            // Maybe put a star or flower sometimes? For now, empty underneath
            // To make it fun, maybe hidden animals?
        }

        // Cover everything with blocks
        // Re-calculate positions for covering since we popped them
        // Actually, we can just iterate grid again or store block covers
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                this.createBlock(startX + c * blockSize, startY + r * blockSize);
            }
        }
    }

    createContent(x, y, char, isTarget) {
        const text = this.add.text(x, y, char, {
            fontSize: '100px',
            color: '#ffffff',
            fontFamily: '"Hiragino Maru Gothic ProN"',
            stroke: '#000000',
            strokeThickness: 8,
            shadow: { offsetX: 4, offsetY: 4, color: '#000', blur: 4, stroke: true, fill: true }
        }).setOrigin(0.5);
        text.setDepth(10); // Above background, below question
        // Larger hit area for easier tapping
        text.setInteractive(new Phaser.Geom.Rectangle(-20, -20, text.width + 40, text.height + 40), Phaser.Geom.Rectangle.Contains);

        text.on('pointerdown', () => {
            if (!this.isGameActive) return;

            if (isTarget) {
                this.handleCorrect(text);
            } else {
                this.handleIncorrect(char);
            }
        });
    }

    createBlock(x, y) {
        const block = this.add.rectangle(x, y, 140, 140, 0x555555);
        block.setDepth(20);
        block.setInteractive();

        // Mode-specific block color tint
        const data = Utils.getData();
        const mode = data.gameMode || 'あ';
        const v = 50 + Math.random() * 40;
        const modeBlockColor = {
            'あ': Phaser.Display.Color.GetColor(v, v, v + 25),         // blue-grey
            'か': Phaser.Display.Color.GetColor(v + 25, v + 10, v),    // warm brown
            'さ': Phaser.Display.Color.GetColor(v, v + 25, v),         // green
            'た': Phaser.Display.Color.GetColor(v + 15, v, v + 30),    // purple
            'な': Phaser.Display.Color.GetColor(v, v + 20, v + 30),    // cyan/water
            'は': Phaser.Display.Color.GetColor(v + 30, v + 15, v),    // warm orange
            'ま': Phaser.Display.Color.GetColor(v + 25, v + 10, v - 10), // amber
            'や': Phaser.Display.Color.GetColor(v + 10, v + 10, v + 30), // icy blue
            'ら': Phaser.Display.Color.GetColor(v + 30, v, v + 20)     // pink
        };
        block.fillColor = modeBlockColor[mode] || modeBlockColor['あ'];

        block.on('pointerdown', () => {
            if (!this.isGameActive) return;

            // Destroy block effect
            this.createExplosion(x, y);

            // Play sound (short pop)
            window.audioController.playSE('pop');

            block.destroy();
        });
    }

    createExplosion(x, y) {
        for (let i = 0; i < 8; i++) {
            const circle = this.add.circle(x, y, Math.random() * 10 + 5, 0xffffff);
            circle.setDepth(3);
            this.physics.add.existing(circle);
            const angle = Math.random() * Math.PI * 2;
            const speed = 150 + Math.random() * 100;
            circle.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
            this.tweens.add({
                targets: circle,
                alpha: 0,
                scale: 0,
                duration: 600,
                onComplete: () => circle.destroy()
            });
        }
    }

    handleCorrect(targetObj) {
        this.isGameActive = false;

        // Sound and Effect
        window.audioController.playSE('correct');
        Utils.speak(`おめでとう！${this.targetHiragana.word}の、${this.targetHiragana.char}、をみつけたよ`);

        // Animation: Center the target and make it big
        targetObj.setDepth(200); // Higher than anything else (question is 101, blocks are 20)
        this.tweens.add({
            targets: targetObj,
            x: this.cameras.main.centerX,
            y: this.cameras.main.centerY,
            scale: 4,
            duration: 1200,
            ease: 'Back.easeOut',
            onComplete: () => {
                // Flash effect
                this.cameras.main.flash(500, 255, 255, 255);
            }
        });

        // Save progress (Level up castle, add animal, or add nature)
        const currentData = Utils.getData();
        currentData.winCount = currentData.winCount + 1;
        Utils.saveData('winCount', currentData.winCount);

        // Add to collected list

        if (!currentData.collectedHiragana.includes(this.targetHiragana.char)) {
            currentData.collectedHiragana.push(this.targetHiragana.char);
            Utils.saveData('collectedHiragana', currentData.collectedHiragana);
        }

        let message = "";

        // Mode-specific reward content
        const mode = currentData.gameMode || 'あ';
        const modeCfg = MODE_CONFIG[mode] || MODE_CONFIG['あ'];

        // Cycle between 3 reward types
        const rewardType = (currentData.castleLevel + currentData.animals.length + (currentData.floraCount / 5)) % 3;

        if (rewardType < 1) {
            currentData.castleLevel = currentData.castleLevel + 1;
            Utils.saveData('castleLevel', currentData.castleLevel);
            message = modeCfg.winCastleMsg;
        } else if (rewardType < 2) {
            const newAnimal = Phaser.Math.RND.pick(modeCfg.animalPool);
            currentData.animals.push(newAnimal);
            Utils.saveData('animals', currentData.animals);
            message = modeCfg.winAnimalMsg;
        } else {
            currentData.floraCount = currentData.floraCount + 5;
            Utils.saveData('floraCount', currentData.floraCount);
            message = modeCfg.winFloraMsg;
        }

        // Return to Home after delay
        this.time.delayedCall(4000, () => {
            Utils.speak(message);
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                // Audio is restarted in HomeScene.create()
                this.scene.start('HomeScene');
            });
        });
    }

    handleIncorrect(char) {
        Utils.speak(`これは、${char}、だよ`);
        // No penalty, maybe slight shake
        this.cameras.main.shake(200, 0.01);
    }
}
