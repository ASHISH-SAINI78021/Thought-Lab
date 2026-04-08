import React, { useState } from 'react';
import styles from './LogTimeModal.module.css';

const QUICK_PRESETS_MANUAL = [{ label: '15m', minutes: 15 }, { label: '30m', minutes: 30 }, { label: '1h', minutes: 60 }, { label: '2h', minutes: 120 }];
const QUICK_PRESETS_COUNTDOWN = [{ label: '10m', minutes: 10 }, { label: '15m', minutes: 15 }, { label: '30m', minutes: 30 }, { label: '1h', minutes: 60 }];

const fmt = (n) => String(n).padStart(2, '0');

export default function LogTimeModal({ habit, onClose, onLogManual, onStartTimer }) {
    const [mode, setMode] = useState('manual');

    // Manual / Countdown State
    const [h, setH] = useState(0);
    const [m, setM] = useState(15);
    const [preset, setPreset] = useState(15);

    const applyPreset = (mins) => {
        setPreset(mins);
        setH(Math.floor(mins / 60));
        setM(mins % 60);
    };

    const handleManual = () => onLogManual(habit._id, Math.max(h * 60 + m, 1));
    const handleStartStopwatch = () => onStartTimer({ habitId: habit._id, type: 'stopwatch' });
    const handleStartCountdown = () => onStartTimer({ habitId: habit._id, type: 'countdown', target: (h * 60 * 60) + (m * 60) });

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <div className={styles.modalIcon} style={{ background: `${habit.color}22`, border: `2px solid ${habit.color}` }}>{habit.emoji}</div>
                    <div className={styles.modalTitle}>Log Time</div>
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div className={styles.tabs}>
                    {['manual', 'stopwatch', 'countdown'].map(t => (
                        <button key={t} className={`${styles.tab} ${mode === t ? styles.tabActive : ''}`}
                            style={mode === t ? { background: habit.color } : {}}
                            onClick={() => setMode(t)}>
                            {t === 'manual' ? '✏ Manual' : t === 'stopwatch' ? '⏱ Stopwatch' : '⏳ Countdown'}
                        </button>
                    ))}
                </div>

                {mode === 'manual' && (
                    <div className={styles.body}>
                        <div className={styles.bigDisplay} style={{ borderColor: habit.color + '44' }}>
                            <span className={styles.bigTime} style={{ color: habit.color }}>
                                {h > 0 ? `${h}h ${fmt(m)}m` : `${m}m`}
                            </span>
                        </div>
                        <div className={styles.presets}>
                            {QUICK_PRESETS_MANUAL.map(p => (
                                <button key={p.minutes} className={`${styles.preset} ${preset === p.minutes ? styles.presetActive : ''}`}
                                    style={preset === p.minutes ? { background: habit.color, borderColor: habit.color } : {}}
                                    onClick={() => applyPreset(p.minutes)}>{p.label}</button>
                            ))}
                        </div>
                        <TimeSpinners h={h} m={m} setH={setH} setM={setM} color={habit.color} />
                        <button className={styles.logBtn} style={{ background: habit.color }} onClick={handleManual}>
                            ✓ Log Time Directly
                        </button>
                    </div>
                )}

                {mode === 'stopwatch' && (
                    <div className={styles.body}>
                        <div className={styles.watchHero}>
                            <div className={styles.heroEmoji} style={{ color: habit.color }}>⏱</div>
                            <p className={styles.heroText}>Start tracking time in the background.</p>
                        </div>
                        <button className={styles.logBtn} style={{ background: habit.color, marginTop: '20px' }} onClick={handleStartStopwatch}>
                            ▶ Start Stopwatch
                        </button>
                    </div>
                )}

                {mode === 'countdown' && (
                    <div className={styles.body}>
                        <div className={styles.bigDisplay} style={{ borderColor: habit.color + '44' }}>
                            <span className={styles.bigTime} style={{ color: habit.color }}>
                                {h > 0 ? `${h}h ${fmt(m)}m` : `${m}m`}
                            </span>
                        </div>
                        <div className={styles.presets}>
                            {QUICK_PRESETS_COUNTDOWN.map(p => (
                                <button key={p.minutes} className={`${styles.preset} ${preset === p.minutes ? styles.presetActive : ''}`}
                                    style={preset === p.minutes ? { background: habit.color, borderColor: habit.color } : {}}
                                    onClick={() => applyPreset(p.minutes)}>{p.label}</button>
                            ))}
                        </div>
                        <TimeSpinners h={h} m={m} setH={setH} setM={setM} color={habit.color} />
                        <button className={styles.logBtn} style={{ background: habit.color }} onClick={handleStartCountdown} disabled={(h === 0 && m === 0)}>
                            ▶ Start Countdown Timer
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

const TimeSpinners = ({ h, m, setH, setM, color }) => (
    <div className={styles.spinners}>
        <div className={styles.spinner}>
            <span className={styles.spinnerLabel}>Hours</span>
            <button className={styles.spinArrow} onClick={() => setH(v => Math.min(v + 1, 23))}>▲</button>
            <span className={styles.spinValue} style={{ color }}>{h}</span>
            <button className={styles.spinArrow} onClick={() => setH(v => Math.max(v - 1, 0))}>▼</button>
        </div>
        <div className={styles.spinDivider} />
        <div className={styles.spinner}>
            <span className={styles.spinnerLabel}>Minutes</span>
            <button className={styles.spinArrow} onClick={() => setM(v => (v + 1) % 60)}>▲</button>
            <span className={styles.spinValue} style={{ color }}>{fmt(m)}</span>
            <button className={styles.spinArrow} onClick={() => setM(v => (v - 1 + 60) % 60)}>▼</button>
        </div>
    </div>
);
