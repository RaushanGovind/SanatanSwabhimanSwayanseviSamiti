import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const RulesTransparency = () => {
    const { t, language } = useLanguage();
    const [stats, setStats] = React.useState({
        total_collected: 0,
        current_balance: 0,
        total_assistance_given: 0,
        families_helped: 0
    });
    const [ruleText, setRuleText] = React.useState("");

    React.useEffect(() => {
        // Fetch Stats
        fetch('/api/finance/stats')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error("Stats fetch error:", err));

        // Fetch Rules
        fetch('/api/rules')
            .then(res => res.json())
            .then(data => {
                if (data.current) {
                    const text = language === 'hi' ? data.current.text_hi : data.current.text_en;
                    setRuleText(text || data.current.text || "");
                }
            })
            .catch(err => console.error("Rules fetch error:", err));
    }, [language]);

    return (
        <section id="rules-transparency" className="section-padding" style={{ background: 'var(--bg-page)', transition: 'background 0.3s ease' }}>
            <div className="container">
                <div className="grid-layout two-col">
                    <div className="col">
                        <h2 className="section-title" style={{ color: 'var(--text-main)' }}>📜 {t.rules.rules_title}</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.6' }}>
                            {ruleText || t.rules.rules_desc || "Our samiti operates under a strict constitution ensuring equality, transparency, and collective growth for every family member."}
                        </p>
                        <div style={{ marginTop: '25px', display: 'flex', gap: '15px' }}>
                            <button className="cta-button" onClick={() => window.location.href = '/#objectives'}>
                                View Objectives
                            </button>
                            <button className="nav-btn-filled" style={{ background: '#34495e' }} onClick={() => alert("Constitution PDF will be available soon!")}>
                                📄 Download PDF
                            </button>
                        </div>
                    </div>
                    <div className="col" style={{ background: 'var(--bg-card)', padding: '40px', borderRadius: '20px', boxShadow: 'var(--shadow)' }}>
                        <h2 className="section-title" style={{ color: 'var(--text-main)', marginBottom: '30px' }}>⚖️ {t.rules.transparency_title}</h2>
                        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '25px' }}>
                            <div className="stat-item" style={{ textAlign: 'center' }}>
                                <span className="stat-number" style={{ display: 'block', fontSize: '2.2rem', fontWeight: 900, color: 'var(--primary)' }}>{stats.families_helped}+</span>
                                <span className="stat-label" style={{ color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem' }}>{t.rules.stats.families_helped}</span>
                            </div>
                            <div className="stat-item" style={{ textAlign: 'center' }}>
                                <span className="stat-number" style={{ display: 'block', fontSize: '2.2rem', fontWeight: 900, color: 'var(--secondary)' }}>₹ {stats.total_assistance_given.toLocaleString()}</span>
                                <span className="stat-label" style={{ color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem' }}>{t.rules.stats.total_help}</span>
                            </div>
                            <div className="stat-item" style={{ textAlign: 'center' }}>
                                <span className="stat-number" style={{ display: 'block', fontSize: '2.2rem', fontWeight: 900, color: '#3498db' }}>₹ {stats.current_balance.toLocaleString()}</span>
                                <span className="stat-label" style={{ color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem' }}>Current Fund Status</span>
                            </div>
                            <div className="stat-item" style={{ textAlign: 'center' }}>
                                <span className="stat-number" style={{ display: 'block', fontSize: '2.2rem', fontWeight: 900, color: '#9b59b6' }}>100%</span>
                                <span className="stat-label" style={{ color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem' }}>Transparency Seal</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default RulesTransparency;
