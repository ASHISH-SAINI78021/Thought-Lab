import React, { useState } from 'react';
import styles from './Devices.module.css';
import Footer from '../Footer/Footer';
import SplashCursor from '../react-bits/SplashCursor';

// Image imports
import imgMindWave from '../../assets/mind-wave.png';
import imgPuzzleBox from '../../assets/puzzle-box.png';
import imgMindFlex from '../../assets/mind-flex.png';
import imgQuantum from '../../assets/quantum-resonance-body-analyzer.png';
import imgMemory from '../../assets/memory-circle.png';
import imgVR from '../../assets/vr-box.png';
import imgMuse from '../../assets/muse.png';
import imgPip from '../../assets/pip-stress-tracker.png';
import imgESense from '../../assets/e-sense.png';

const devices = [
    {
        id: 'mindwave',
        name: 'MindWave Mobile 2',
        tagline: 'Read Your Mind in Real Time',
        category: 'EEG Headset',
        image: imgMindWave,
        description:
            'The MindWave Mobile 2 safely measures and outputs EEG power spectrums (alpha, beta, theta, delta, gamma), NeuroSky eSense meters (attention and meditation), and eye blinks. The EEG electrode rests on the forehead (FP1).',
        specs: [
            { label: 'Electrode Position', value: 'FP1 (Forehead)' },
            { label: 'Battery', value: 'Single AAA (8 Hours)' },
            { label: 'Output', value: 'EEG, Attention, Eye Blinks' }
        ],
        accentColor: '#00d4ff',
        gradientStart: '#f0f9ff',
        gradientEnd: '#e0f2fe',
    },
    {
        id: 'puzzlebox',
        name: 'Puzzlebox Orbit',
        tagline: 'Fly with the Power of Thought',
        category: 'Brain-Controlled RC',
        image: imgPuzzleBox,
        description:
            'Puzzlebox creates open-source software letting you fly RC helicopters solely using the power of your mind! Target a mental state to action a flight path (like hover in place). Introduce yourself to brain-computer interfaces (BCI).',
        specs: [
            { label: 'Flight Time', value: '~8 Minutes' },
            { label: 'Charge Time', value: '30 Minutes' },
            { label: 'Interface', value: 'BCI' }
        ],
        accentColor: '#a855f7',
        gradientStart: '#f5f3ff',
        gradientEnd: '#ede9fe',
    },
    {
        id: 'mindflex',
        name: 'Mindflex',
        tagline: 'Levitate with Your Mind',
        category: 'Neurofeedback Game',
        image: imgMindFlex,
        description:
            'Mindflex introduces a whole new way to play. Strap on the headset, connect the ear clip, and move a foam ball quivering on a cushion of air. As you alternately focus and relax your mind, the ball responds by rising and falling!',
        specs: [
            { label: 'Sensors', value: 'Forehead + Ear Clip' },
            { label: 'Mechanism', value: 'Air Cushion Levitation' },
            { label: 'Skill Trained', value: 'Focus & Relaxation' }
        ],
        accentColor: '#00d4ff',
        gradientStart: '#f0fdfa',
        gradientEnd: '#ccfbf1',
    },
    {
        id: 'quantum',
        name: 'Quantum Resonance Analyser',
        tagline: 'Holistic Health Reports in Minutes',
        category: 'Health Analyser',
        image: imgQuantum,
        description:
            'A non-invasive health assessment device using quantum physics and magnetic resonance to analyze the body\'s electromagnetic field. Collects data through sensors and generates reports on organ function, nutritional deficiencies, and more.',
        specs: [
            { label: 'Method', value: 'Magnetic Resonance' },
            { label: 'Reports', value: 'Organs, Nutrition' },
            { label: 'Type', value: 'Non-Invasive' }
        ],
        accentColor: '#ff7c3a',
        gradientStart: '#fff7ed',
        gradientEnd: '#ffedd5',
    },
    {
        id: 'memory',
        name: 'Memory Circle',
        tagline: 'Train Your Memory & Reflexes',
        category: 'Cognitive Training',
        image: imgMemory,
        description:
            'Memory Circle is an electronic game challenging players to recall and repeat increasingly complex sequences of lights and sounds. A classic test of memory, concentration, and reflexes popular with both children and adults.',
        specs: [
            { label: 'Format', value: 'Light & Sound Sequence' },
            { label: 'Target', value: 'Memory & Reflexes' },
            { label: 'Users', value: 'All Ages' }
        ],
        accentColor: '#a855f7',
        gradientStart: '#faf5ff',
        gradientEnd: '#f3e8ff',
    },
    {
        id: 'vr',
        name: 'VR Box Headset',
        tagline: 'Immersive Virtual Reality',
        category: 'Virtual Reality',
        image: imgVR,
        description:
            'A head-mounted VR Box device worn over the eyes like goggles. Providing an immersive virtual reality experience for meditation and visualisation therapies. Compatible with Android and iPhone mobiles.',
        specs: [
            { label: 'Compatibility', value: 'Android & iOS' },
            { label: 'Format', value: 'Head-Mounted Display' },
            { label: 'Goal', value: 'Immersive VR Experience' }
        ],
        accentColor: '#00d4ff',
        gradientStart: '#f0f9ff',
        gradientEnd: '#e0f2fe',
    },
    {
        id: 'muse',
        name: 'Muse Brain Headband',
        tagline: 'Understand Your Brain Waves',
        category: 'Meditation Headband',
        image: imgMuse,
        description:
            'Track your mental activity directly. Muse reads Delta for sleep, Theta for deep relaxation, Alpha for calm, Beta for active thinking, and Gamma for higher mental activity and consolidation.',
        specs: [
            { label: 'Alpha (8-13 Hz)', value: 'Relaxed & Calm' },
            { label: 'Beta (14-30 Hz)', value: 'Active Thinking' },
            { label: 'Gamma (>30 Hz)', value: 'Higher Cognition' }
        ],
        accentColor: '#a855f7',
        gradientStart: '#f5f3ff',
        gradientEnd: '#ede9fe',
        isMuse: true,
    },
    {
        id: 'pip',
        name: 'Pip Stress Tracker',
        tagline: 'Visualise Your Emotional State',
        category: 'Stress Monitor',
        image: imgPip,
        description:
            'Pip helps you become more self-aware of your emotional state. Apply what you learn from your Pip data to understand your triggers, track your stress responses, and build long-term resilience.',
        specs: [
            { label: 'Measurement', value: 'Stress Responses' },
            { label: 'Goal', value: 'Emotional Awareness' },
            { label: 'Form Factor', value: 'Handheld Tracker' }
        ],
        accentColor: '#ff7c3a',
        gradientStart: '#fff7ed',
        gradientEnd: '#ffedd5',
    },
    {
        id: 'esense',
        name: 'Mindfield eSense GSR',
        tagline: 'Master Your Skin Response',
        category: 'Biofeedback',
        image: imgESense,
        description:
            'A small sensor using two electrodes to measure skin conductance (GSR) via your index and middle fingers. Sweating is controlled by the sympathetic nervous system, making it an excellent indicator of stress and anxiety.',
        specs: [
            { label: 'Metric', value: 'Skin Response' },
            { label: 'Placement', value: 'Index & Middle' },
            { label: 'Feedback', value: 'Visual & Audio' }
        ],
        accentColor: '#00d4ff',
        gradientStart: '#f0fdfa',
        gradientEnd: '#ccfbf1',

    },
];

const MuseWaves = () => {
    const waves = [
        { label: 'Delta', range: '0–3 Hz', desc: 'Sleep', width: '20%' },
        { label: 'Theta', range: '4–7 Hz', desc: 'Deep Relax', width: '35%' },
        { label: 'Alpha', range: '8–13 Hz', desc: 'Calm', width: '55%' },
        { label: 'Beta', range: '14–30 Hz', desc: 'Thinking', width: '75%' },
        { label: 'Gamma', range: '>30 Hz', desc: 'Activity', width: '95%' },
    ];
    return (
        <div className={styles.museWaves}>
            {waves.map((w) => (
                <div key={w.label} className={styles.waveRow}>
                    <span className={styles.waveLabel}>{w.label}</span>
                    <div className={styles.waveBarBg}>
                        <div className={styles.waveBar} style={{ width: w.width }} />
                    </div>
                </div>
            ))}
        </div>
    );
};

const DeviceCard = ({ device, index }) => {
    const [flipped, setFlipped] = useState(false);
    const isEven = index % 2 === 0;

    return (
        <div className={`${styles.deviceRow} ${isEven ? styles.rowNormal : styles.rowReverse}`}>
            {/* Visual Panel (Flip Card) */}
            <div
                className={styles.visualPanel}
                onClick={() => setFlipped(!flipped)}
            >
                <div className={`${styles.flipInner} ${flipped ? styles.flipped : ''}`}>
                    {/* Front */}
                    <div className={styles.flipFront}>
                        <img src={device.image} alt={device.name} className={styles.deviceImage} />
                        <div className={styles.imageOverlay}>
                            <p className={styles.flipHintFront}>Tap for specs →</p>
                        </div>
                    </div>
                    {/* Back */}
                    <div className={styles.flipBack} style={{ borderRight: `6px solid ${device.accentColor}` }}>
                        <img src={device.image} alt={device.name} className={styles.backImage} />
                        <div className={styles.backContent}>
                            <h4 className={styles.specsTitle} style={{ color: device.accentColor }}>{device.name}</h4>
                            <div className={styles.specsList}>
                                {device.specs.map((s) => (
                                    <div key={s.label} className={styles.specItem}>
                                        <span className={styles.specLabel}>{s.label}</span>
                                        <span className={styles.specValue} style={{ color: device.accentColor }}>{s.value}</span>
                                    </div>
                                ))}
                            </div>
                            {device.isMuse && <MuseWaves />}
                            <p className={styles.flipHint} style={{ color: device.accentColor }}>← Back</p>
                        </div>
                    </div>
                </div>
                {/* Decorative border matching accent */}
                <div className={styles.panelBorder} style={{ borderColor: device.accentColor }} />
            </div>

            {/* Text Panel */}
            <div className={styles.textPanel}>
                <div className={styles.categoryBadge} style={{ color: device.accentColor }}>
                    <span className={styles.categoryDot} style={{ background: device.accentColor }} />
                    {device.category}
                </div>
                <h2 className={styles.deviceName}>{device.name}</h2>
                <p className={styles.deviceTagline}>{device.tagline}</p>
                <p className={styles.deviceDesc}>{device.description}</p>
            </div>
        </div>
    );
};

const Devices = () => {
    return (
        <>
            <SplashCursor />
            <div className={styles.page}>
                <header className={styles.hero}>
                    <div className={styles.heroOrbTeal} />
                    <div className={styles.heroOrbViolet} />

                    <div className={styles.heroContent}>
                        <p className={styles.heroEyebrow}>Thought Lab Devices</p>
                        <h1 className={styles.heroTitle}>
                            Neuroscience & <br />
                            <span className={styles.heroAccent}>Wellness Tech</span>
                        </h1>
                        <p className={styles.heroSubtitle}>
                            Explore our cutting-edge brain-computer interfaces, biofeedback monitors, and cognitive training devices used at Thought Lab RTU Kota.
                        </p>
                        <div className={styles.heroStats}>
                            <div className={styles.heroStat}>
                                <span>9</span>
                                <small>Innovations</small>
                            </div>
                            <div className={styles.heroStatDiv} />
                            <div className={styles.heroStat}>
                                <span>BCI</span>
                                <small>Interfaces</small>
                            </div>
                            <div className={styles.heroStatDiv} />
                            <div className={styles.heroStat}>
                                <span>RTU</span>
                                <small>Kota Lab</small>
                            </div>
                        </div>
                    </div>
                </header>

                <main className={styles.main}>
                    {devices.map((device, i) => (
                        <DeviceCard key={device.id} device={device} index={i} />
                    ))}
                </main>
                <Footer />
            </div>
        </>
    );
};

export default Devices;
