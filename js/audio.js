class AudioController {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.bgmOscillators = [];
        this.isMuted = false;
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.masterGain.gain.value = 0.3; // Global volume
    }

    resume() {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playBGM() {
        if (this.isPlayingBGM) return;
        this.isPlayingBGM = true;
        this.stopBGMFlag = false;

        const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88]; // C Major
        // Simple melody loop
        const melody = [
            { note: 0, dur: 0.5 }, { note: 2, dur: 0.5 }, { note: 4, dur: 1.0 },
            { note: 2, dur: 0.5 }, { note: 4, dur: 0.5 }, { note: 5, dur: 1.0 },
            { note: 4, dur: 0.5 }, { note: 2, dur: 0.5 }, { note: 0, dur: 1.0 },
            { note: 2, dur: 0.5 }, { note: -1, dur: 0.5 } // Rest
        ];

        let noteIndex = 0;
        const playNextNote = () => {
            if (this.stopBGMFlag) return;

            const n = melody[noteIndex];
            noteIndex = (noteIndex + 1) % melody.length;

            if (n.note !== -1) {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'sine';
                osc.frequency.value = notes[n.note];

                gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + n.dur);

                osc.connect(gain);
                gain.connect(this.masterGain);

                osc.start();
                osc.stop(this.ctx.currentTime + n.dur);
            }

            this.bgmTimeout = setTimeout(playNextNote, n.dur * 1000);
        };

        this.stopBGMFlag = false;
        playNextNote();
    }

    stopBGM() {
        this.stopBGMFlag = true;
        this.isPlayingBGM = false;
        if (this.bgmTimeout) clearTimeout(this.bgmTimeout);
    }

    playSE(type) {
        this.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterGain);

        const now = this.ctx.currentTime;

        switch (type) {
            case 'pop':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
                gain.gain.setValueAtTime(0.5, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;

            case 'correct':
                osc.type = 'sine';
                // Fanfare-ish: C - E - G
                this.playTone(523.25, 0.1, 0, 'sine');
                this.playTone(659.25, 0.1, 0.1, 'sine');
                this.playTone(783.99, 0.3, 0.2, 'sine');
                break;

            case 'incorrect':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.linearRampToValueAtTime(100, now + 0.3);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;

            case 'jump':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.exponentialRampToValueAtTime(600, now + 0.2);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;

            case 'shake':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(100, now);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;

            case 'sparkle':
                // Magic chime
                this.playTone(880, 0.05, 0, 'sine');
                this.playTone(1108.73, 0.05, 0.05, 'sine');
                this.playTone(1318.51, 0.05, 0.1, 'sine');
                this.playTone(1760, 0.1, 0.15, 'sine');
                break;

            case 'pollen':
                // Very high pitch small twinkle
                this.playTone(2000 + Math.random() * 1000, 0.05, 0, 'sine');
                break;
        }
    }

    playTone(freq, duration, delay, type = 'sine') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(this.masterGain);

        const now = this.ctx.currentTime + delay;
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.start(now);
        osc.stop(now + duration);
    }
}

// Global instance
window.audioController = new AudioController();
