import React, { useEffect, useRef } from 'react';
import styles from './Intro.module.css';
import SplashCursor from '../react-bits/SplashCursor';

const Intro = () => {
    const observerRef = useRef(null);

    useEffect(() => {
        // Intersection Observer for scroll animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(styles.visible);

                    // Animate metric bars
                    if (entry.target.classList.contains(styles.dataColumn)) {
                        const bars = entry.target.querySelectorAll(`.${styles.metricFill}`);
                        bars.forEach(bar => {
                            const width = bar.dataset.width;
                            setTimeout(() => {
                                bar.style.width = width + '%';
                            }, 300);
                        });
                    }
                }
            });
        }, { threshold: 0.15 });

        const revealElements = document.querySelectorAll(`.${styles.reveal}, .${styles.revealLeft}, .${styles.revealRight}`);
        const dataColumns = document.querySelectorAll(`.${styles.dataColumn}`);

        revealElements.forEach(el => observer.observe(el));
        dataColumns.forEach(el => observer.observe(el));

        observerRef.current = observer;

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    return (
        <>
            <SplashCursor />
            <div className={styles.container}>
                {/* NAV */}
                <nav className={styles.nav}>
                    <div className={styles.navLogo}>Thought<span className={styles.accentText}>Lab</span></div>
                    <ul className={styles.navLinks}>
                        <li><a href="#neuroplasticity" className={styles.navLink}>Neuroplasticity</a></li>
                        <li><a href="#meditation" className={styles.navLink}>Meditation</a></li>
                        <li><a href="#thoughts" className={styles.navLink}>Destiny</a></li>
                        <li><a href="#tools" className={styles.navLink}>Tools</a></li>
                        <li><a href="#data" className={styles.navLink}>Data</a></li>
                    </ul>
                </nav>

                {/* HERO */}
                <section className={styles.hero}>
                    <div className={styles.heroLeft}>
                        <p className={styles.heroEyebrow}>Science of the Mind</p>
                        <h1 className={styles.heroTitle}>
                            Rewire Your<br />
                            <em className={styles.italic}>Brain,</em> Reshape<br />
                            Your <span className={styles.accent}>Destiny</span>
                        </h1>
                        <p className={styles.heroSub}>
                            Your brain is not fixed. Every thought, every breath, every moment of stillness is an opportunity to forge new neural pathways and transform who you are.
                        </p>
                        <div className={styles.heroCta}>
                            <a href="#neuroplasticity" className={styles.btnPrimary}>Explore the Science</a>
                            <a href="#meditation" className={styles.btnGhost}>Begin Meditating</a>
                        </div>
                    </div>

                    <div className={styles.heroRight}>
                        <div className={styles.orbitContainer}>
                            <div className={`${styles.orbit} ${styles.orbit1}`}><div className={styles.orbitDot}></div></div>
                            <div className={`${styles.orbit} ${styles.orbit2}`}><div className={`${styles.orbitDot} ${styles.orbitDotBottom}`}></div></div>
                            <div className={styles.brainCard}>
                                <div className={styles.brainEmoji}>🧠</div>
                                <div className={styles.brainLabel}>Always Evolving</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* NEUROPLASTICITY */}
                <section id="neuroplasticity" className={styles.section}>
                    <div className={styles.reveal}>
                        <p className={styles.sectionTag}>The Brain's Superpower</p>
                        <h2 className={styles.sectionTitle}>Understanding <em className={styles.italic}>Neuroplasticity</em></h2>
                        <p className={styles.sectionDesc}>Your brain physically reshapes itself based on your experiences, thoughts, and habits — this is neuroplasticity in action.</p>
                    </div>

                    <div className={styles.neuroGrid}>
                        <div className={styles.revealLeft}>
                            <div className={styles.neuroTypes}>
                                <div className={`${styles.typeCard} ${styles.delay1} ${styles.reveal}`}>
                                    <div className={styles.typeIcon}>🏗️</div>
                                    <div className={styles.typeName}>Structural Plasticity</div>
                                    <div className={styles.typeDesc}>Experiences and memories physically alter the brain's architecture — new synaptic connections form with every learning moment.</div>
                                </div>
                                <div className={`${styles.typeCard} ${styles.delay2} ${styles.reveal}`}>
                                    <div className={styles.typeIcon}>⚡</div>
                                    <div className={styles.typeName}>Functional Plasticity</div>
                                    <div className={styles.typeDesc}>When one area is damaged, the brain reroutes — healthy regions take over the functions of impaired areas.</div>
                                </div>
                                <div className={`${styles.typeCard} ${styles.delay3} ${styles.reveal} ${styles.fullWidth}`}>
                                    <div className={styles.typeIcon}>🔗</div>
                                    <div className={styles.typeName}>How It Works</div>
                                    <div className={styles.typeDesc}>Cognitive reserve → Increased neuron connections → Higher synaptic density → Enhanced cognitive ability → Better everyday functioning.</div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.positivityGrid}>
                            <div className={`${styles.plasticityCard} ${styles.plasticityPos}`}>
                                <div className={styles.plasticityTitle}>✅ Positive Neuroplasticity</div>
                                <ul className={styles.plasticityList}>
                                    <li>Cognitive Remediation</li>
                                    <li>Active Lifestyle</li>
                                    <li>Neuroleptic Agents</li>
                                    <li>Good Nutrition</li>
                                    <li>Good Sleep Hygiene</li>
                                    <li>Positive Mood</li>
                                    <li>Physical Exercise</li>
                                </ul>
                            </div>
                            <div className={`${styles.plasticityCard} ${styles.plasticityNeg}`}>
                                <div className={styles.plasticityTitle}>⚠️ Negative Neuroplasticity</div>
                                <ul className={styles.plasticityList}>
                                    <li>Non-Stimulating Activities</li>
                                    <li>Poor Nutrition</li>
                                    <li>Poor Sleep Hygiene</li>
                                    <li>Depression</li>
                                    <li>Poor Health</li>
                                    <li>Sedentary Lifestyle</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* MEDITATION */}
                <section id="meditation" className={`${styles.section} ${styles.meditationSection}`}>
                    <div className={styles.reveal}>
                        <p className={styles.sectionTag}>Transform Through Practice</p>
                        <h2 className={styles.sectionTitle}>Meditation <em className={styles.italic}>Changes Everything</em></h2>
                        <p className={styles.sectionDesc}>A consistent meditation practice rewires the brain for calm, focus, and emotional balance — backed by measurable data.</p>
                    </div>

                    <div className={styles.meditationHero}>
                        <div className={styles.beforeAfter}>
                            <div className={`${styles.baCard} ${styles.baBefore}`}>
                                <div className={styles.baIcon}>😤</div>
                                <div className={styles.baContent}>
                                    <div className={styles.baLabel}>Before Meditation</div>
                                    <div className={styles.baHeading}>The Stressed Mind</div>
                                    <ul className={styles.baPoints}>
                                        <li>High, unmanaged stress levels</li>
                                        <li>Scattered focus and attention</li>
                                        <li>Disturbed, chaotic thought patterns</li>
                                    </ul>
                                </div>
                            </div>
                            <div className={`${styles.baCard} ${styles.baAfter}`}>
                                <div className={styles.baIcon}>😌</div>
                                <div className={styles.baContent}>
                                    <div className={styles.baLabel}>After Meditation</div>
                                    <div className={styles.baHeading}>The Calm Mind</div>
                                    <ul className={styles.baPoints}>
                                        <li>Calm, stable, and peaceful mind</li>
                                        <li>Improved concentration and clarity</li>
                                        <li>Better emotional balance and resilience</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className={styles.meditationVisual}>
                            <div className={styles.lotusCenter}>🧘</div>
                            <div className={styles.statsRow}>
                                <div className={styles.statPill}>
                                    <div className={styles.statNum}>58%</div>
                                    <div className={styles.statLabel}>Reduction in stress response</div>
                                </div>
                                <div className={styles.statPill}>
                                    <div className={styles.statNum}>47%</div>
                                    <div className={styles.statLabel}>Increase in focus time</div>
                                </div>
                                <div className={styles.statPill}>
                                    <div className={styles.statNum}>69%</div>
                                    <div className={styles.statLabel}>Improved emotional stability</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* THOUGHTS & DESTINY */}
                <section id="thoughts" className={styles.section}>
                    <div className={styles.reveal}>
                        <p className={styles.sectionTag}>The Chain of Causation</p>
                        <h2 className={styles.sectionTitle}>How <em className={styles.italic}>Thoughts</em> Create Your Destiny</h2>
                        <p className={styles.sectionDesc}>Every thought plants a seed. Watch how one small shift in thinking cascades into a completely different life.</p>
                    </div>

                    <div className={styles.thoughtsLayout}>
                        <div className={styles.stepsChain}>
                            <div className={`${styles.step} ${styles.reveal} ${styles.delay1}`}>
                                <div className={styles.stepNumber}>Step 01</div>
                                <div className={styles.stepName}>💭 Thoughts</div>
                                <div className={styles.stepDesc}>It begins here. The quiet seed planted in the mind — a belief, an intention, a possibility.</div>
                            </div>
                            <div className={`${styles.step} ${styles.reveal} ${styles.delay2}`}>
                                <div className={styles.stepNumber}>Step 02</div>
                                <div className={styles.stepName}>💛 Feelings</div>
                                <div className={styles.stepDesc}>Thoughts generate emotions. Feelings are the energy that begins to move things from invisible to visible.</div>
                            </div>
                            <div className={`${styles.step} ${styles.reveal} ${styles.delay3}`}>
                                <div className={styles.stepNumber}>Step 03</div>
                                <div className={styles.stepName}>🌟 Attitude</div>
                                <div className={styles.stepDesc}>Feelings shape your attitude — the lens through which you perceive and approach everything.</div>
                            </div>
                            <div className={`${styles.step} ${styles.reveal} ${styles.delay4}`}>
                                <div className={styles.stepNumber}>Step 04</div>
                                <div className={styles.stepName}>🎯 Actions</div>
                                <div className={styles.stepDesc}>Attitude drives behavior. What you do — and don't do — flows from who you believe yourself to be.</div>
                            </div>
                            <div className={`${styles.step} ${styles.reveal} ${styles.delay5}`}>
                                <div className={styles.stepNumber}>Step 05</div>
                                <div className={styles.stepName}>🌱 Habits</div>
                                <div className={styles.stepDesc}>Repeated actions become automatic habits — the grooves worn into your daily existence.</div>
                            </div>
                            <div className={`${styles.step} ${styles.reveal} ${styles.delay5}`}>
                                <div className={styles.stepNumber}>Step 06</div>
                                <div className={styles.stepName}>✨ Personality → Destiny</div>
                                <div className={styles.stepDesc}>Habits forge your personality. And your personality — who you truly are — creates your destiny.</div>
                            </div>
                        </div>

                        <div className={styles.destinyVisual}>
                            <p className={styles.destinyQuote}>"Watch your thoughts, for they become <strong>words</strong>. Watch your words, for they become <strong>destiny</strong>."</p>
                            <div className={styles.mindChain}>
                                <span className={styles.chainItem}>Thought</span>
                                <span className={styles.chainArrow}>→</span>
                                <span className={styles.chainItem}>Feeling</span>
                                <span className={styles.chainArrow}>→</span>
                                <span className={styles.chainItem}>Attitude</span>
                                <span className={styles.chainArrow}>→</span>
                                <span className={styles.chainItem}>Action</span>
                                <span className={styles.chainArrow}>→</span>
                                <span className={styles.chainItem}>Habit</span>
                                <span className={styles.chainArrow}>→</span>
                                <span className={styles.chainItem}>Personality</span>
                                <span className={styles.chainArrow}>→</span>
                                <span className={`${styles.chainItem} ${styles.destinyChain}`}>✦ Destiny</span>
                            </div>

                            <div className={styles.choiceCard}>
                                <div className={styles.choiceTitle}>The Power of Choice</div>
                                <p className={styles.choiceDesc}>At every step in this chain, you have the power to pause, reflect, and consciously choose differently. Meditation gives you the gap between stimulus and response — that gap is where your freedom lives.</p>
                            </div>

                            <div className={styles.growthGrid}>
                                <div className={styles.growthCard}>
                                    <div className={styles.growthEmoji}>🌱</div>
                                    <div className={styles.growthLabel}>Nurture Growth</div>
                                </div>
                                <div className={`${styles.growthCard} ${styles.growthCardPurple}`}>
                                    <div className={styles.growthEmoji}>🌌</div>
                                    <div className={styles.growthLabel}>Shape Reality</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SPIRITUAL TOOLS */}
                <section id="tools" className={`${styles.section} ${styles.toolsSection}`}>
                    <div className={styles.reveal}>
                        <p className={styles.sectionTag}>Your Practice Toolkit</p>
                        <h2 className={styles.sectionTitle}><em className={styles.italic}>Spiritual Tools</em> for Inner Transformation</h2>
                        <p className={styles.sectionDesc}>Six practices orbiting the sacred center of meditation — each one a doorway to a deeper, more awakened version of yourself.</p>
                    </div>

                    <div className={styles.toolsGrid}>
                        <div className={`${styles.toolCard} ${styles.reveal} ${styles.delay1}`}>
                            <span className={styles.toolIcon}>🪞</span>
                            <div className={styles.toolName}>Reflection</div>
                            <div className={styles.toolDesc}>Turn the lens inward. Honest self-observation dissolves illusions and reveals the truth of who you are and who you're becoming.</div>
                        </div>
                        <div className={`${styles.toolCard} ${styles.centerCard} ${styles.reveal} ${styles.delay2}`}>
                            <span className={styles.toolIcon}>🧘‍♀️</span>
                            <div className={styles.toolName}>Meditation</div>
                            <div className={styles.toolDesc}>The centerpiece of all transformation. Stillness of mind creates the space for every other tool to work its deepest magic.</div>
                        </div>
                        <div className={`${styles.toolCard} ${styles.reveal} ${styles.delay3}`}>
                            <span className={styles.toolIcon}>👍</span>
                            <div className={styles.toolName}>Appreciation</div>
                            <div className={styles.toolDesc}>Gratitude rewires the brain toward abundance. What you appreciate appreciates — it grows and multiplies in your life.</div>
                        </div>
                    </div>

                    <div className={styles.toolsRow2}>
                        <div className={`${styles.toolCard} ${styles.reveal} ${styles.delay1}`}>
                            <span className={styles.toolIcon}>🎭</span>
                            <div className={styles.toolName}>Play</div>
                            <div className={styles.toolDesc}>Joy is a spiritual practice. When you play with full presence, you access a creative flow state that transcends ordinary consciousness.</div>
                        </div>
                        <div className={`${styles.toolCard} ${styles.reveal} ${styles.delay2}`}>
                            <span className={styles.toolIcon}>🎨</span>
                            <div className={styles.toolName}>Creativity</div>
                            <div className={styles.toolDesc}>To create is to channel the divine. Art, music, writing — any act of creation aligns you with the generative force of the universe.</div>
                        </div>
                        <div className={`${styles.toolCard} ${styles.reveal} ${styles.delay3}`}>
                            <span className={styles.toolIcon}>🎧</span>
                            <div className={styles.toolName}>Listening</div>
                            <div className={styles.toolDesc}>Deep listening — to others, to nature, to your own inner voice — is a sacred act that fosters empathy, wisdom, and connection.</div>
                        </div>
                    </div>

                    <div className={`${styles.toolCard} ${styles.visualizationCard} ${styles.reveal}`}>
                        <span className={styles.visualizationIcon}>🌅</span>
                        <div>
                            <div className={`${styles.toolName} ${styles.leftAlign}`}>Visualization</div>
                            <div className={styles.toolDesc}>Your imagination is a preview of life's coming attractions. By vividly picturing your desired future, you encode it into your nervous system — making it neurologically real before it manifests physically.</div>
                        </div>
                    </div>
                </section>

                {/* DATA SECTION */}
                <section id="data" className={styles.section}>
                    <div className={styles.reveal}>
                        <p className={styles.sectionTag}>The Numbers Don't Lie</p>
                        <h2 className={styles.sectionTitle}>Measurable <em className={styles.italic}>Change</em> in Brain Activity</h2>
                        <p className={styles.sectionDesc}>Before and after meditation metrics showing real, quantifiable shifts in cognitive patterns and neural efficiency.</p>
                    </div>

                    <div className={styles.dataGrid}>
                        <div className={`${styles.dataColumn} ${styles.dataBefore} ${styles.revealLeft}`}>
                            <div className={styles.dataHeader}>😤 Before Meditation</div>
                            <div className={styles.metric}>
                                <div className={styles.metricName}><span>Time Decrease (Reaction)</span><span>58.27%</span></div>
                                <div className={styles.metricBar}><div className={styles.metricFill} data-width="58"></div></div>
                            </div>
                            <div className={styles.metric}>
                                <div className={styles.metricName}><span>Time Increase (Task)</span><span>32.69%</span></div>
                                <div className={styles.metricBar}><div className={styles.metricFill} data-width="32"></div></div>
                            </div>
                            <div className={styles.metric}>
                                <div className={styles.metricName}><span>Dominant Hand Performance</span><span>48.39%</span></div>
                                <div className={styles.metricBar}><div className={styles.metricFill} data-width="48"></div></div>
                            </div>
                            <div className={styles.metric}>
                                <div className={styles.metricName}><span>Task Completion Rate</span><span>54.45%</span></div>
                                <div className={styles.metricBar}><div className={styles.metricFill} data-width="54"></div></div>
                            </div>
                        </div>

                        <div className={`${styles.dataColumn} ${styles.dataAfter} ${styles.revealRight}`}>
                            <div className={styles.dataHeader}>😌 After Meditation</div>
                            <div className={styles.metric}>
                                <div className={styles.metricName}><span>Time Decrease (Reaction)</span><span>69.88%</span></div>
                                <div className={styles.metricBar}><div className={styles.metricFill} data-width="69"></div></div>
                            </div>
                            <div className={styles.metric}>
                                <div className={styles.metricName}><span>Time Increase (Task)</span><span>24.59%</span></div>
                                <div className={styles.metricBar}><div className={styles.metricFill} data-width="24"></div></div>
                            </div>
                            <div className={styles.metric}>
                                <div className={styles.metricName}><span>Dominant Hand Performance</span><span>46.03%</span></div>
                                <div className={styles.metricBar}><div className={styles.metricFill} data-width="46"></div></div>
                            </div>
                            <div className={styles.metric}>
                                <div className={styles.metricName}><span>Task Completion Rate</span><span>47.56%</span></div>
                                <div className={styles.metricBar}><div className={styles.metricFill} data-width="47"></div></div>
                            </div>
                        </div>
                    </div>

                    <div className={`${styles.takeawayCard} ${styles.reveal}`}>
                        <div className={styles.takeawayTitle}>The Takeaway</div>
                        <p className={styles.takeawayText}>Meditation improves neural efficiency — the brain learns to accomplish more with less reactive effort. This is neuroplasticity in its most beautiful form.</p>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className={styles.footer}>
                    <div className={styles.footerLogo}>Thought<span className={styles.accentText}>Lab</span></div>
                    <p className={styles.footerTagline}>Your brain is the most extraordinary tool you'll ever own.</p>
                    <div className={styles.footerLinks}>
                        <a href="#neuroplasticity" className={styles.footerLink}>Neuroplasticity</a>
                        <a href="#meditation" className={styles.footerLink}>Meditation</a>
                        <a href="#thoughts" className={styles.footerLink}>Thoughts</a>
                        <a href="#tools" className={styles.footerLink}>Spiritual Tools</a>
                    </div>
                    <div className={styles.footerDivider}></div>
                    <p className={styles.footerCopy}>© {new Date().getFullYear()} RTU Thought Lab — Rewire Your Brain, Reshape Your Destiny</p>
                </footer>
            </div>
        </>
    );
};

export default Intro;