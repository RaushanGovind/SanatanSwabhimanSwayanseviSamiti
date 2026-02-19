import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import LoginCard from './LoginCard';
import { getAuthUser } from '../utils/roleHelper';

const Hero = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();

    const [counts, setCounts] = useState({ families: 0, funds: 0 });
    const [liveStats, setLiveStats] = useState({ families_helped: 0, total_assistance_given: 0 });

    useEffect(() => {
        let timer;
        fetch('/api/finance/stats')
            .then(res => res.json())
            .then(data => {
                setLiveStats(data);
                // Simple animation
                let fam = 0;
                let fund = 0;
                const targetFam = data.families_helped || 0;
                const targetFund = data.total_assistance_given || 0;

                timer = setInterval(() => {
                    fam += Math.ceil(targetFam / 20);
                    fund += Math.ceil(targetFund / 20);

                    if (fam >= targetFam && fund >= targetFund) {
                        setCounts({ families: targetFam, funds: targetFund });
                        clearInterval(timer);
                    } else {
                        setCounts({
                            families: fam > targetFam ? targetFam : fam,
                            funds: fund > targetFund ? targetFund : fund
                        });
                    }
                }, 50);
            })
            .catch(err => console.error(err));

        return () => {
            if (timer) clearInterval(timer);
        };
    }, []);


    return (
        <section id="home" className="hero-section">
            <div className="hero-overlay"></div>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2, flexWrap: 'wrap', gap: '40px' }}>

                {/* LEFT SIDE: Welcome & Intro */}
                <div className="hero-content-left" style={{ flex: '1.5', minWidth: '300px', textAlign: 'left' }}>
                    <div className="motto-box">
                        <span>🕉 {t.hero.motto}</span>
                    </div>
                    <h3 style={{ fontSize: '3.5rem', marginBottom: '20px', color: '#2C3E50', lineHeight: 1.1, fontWeight: 800 }}>
                        {t.hero.welcome}
                    </h3>
                    <p style={{ fontSize: '1.3rem', color: '#546E7A', marginBottom: '30px', fontWeight: 500 }}>
                        {t.hero.message1} <br />
                        {t.hero.message2}
                    </p>

                    {/* Trust Indicators (Moved nicely below text) */}
                    <div className="trust-strip" style={{ justifyContent: 'flex-start', marginTop: '20px' }}>
                        <div className="trust-item" style={{ textAlign: 'left', marginRight: '30px' }}>
                            <span className="trust-number" style={{ display: 'block', fontSize: '1.8rem', fontWeight: 'bold', color: '#2E7D32' }}>{counts.families}+</span>
                            <span className="trust-label" style={{ color: '#666' }}>Active Families</span>
                        </div>
                        <div className="trust-item" style={{ textAlign: 'left', marginRight: '30px' }}>
                            <span className="trust-number" style={{ display: 'block', fontSize: '1.8rem', fontWeight: 'bold', color: '#2E7D32' }}>₹ {counts.funds.toLocaleString()}</span>
                            <span className="trust-label" style={{ color: '#666' }}>Assistance Provided</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: Login / Register Actions */}
                <div className="hero-auth-right" style={{ flex: '1', minWidth: '320px', display: 'flex', justifyContent: 'center' }}>
                    {(() => {
                        const user = getAuthUser();
                        if (user) {
                            return (
                                <div style={{
                                    background: 'rgba(255, 255, 255, 0.7)',
                                    padding: '40px',
                                    borderRadius: '24px',
                                    boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                                    backdropFilter: 'blur(12px)',
                                    border: '1px solid rgba(255,255,255,0.4)',
                                    width: '100%',
                                    maxWidth: '440px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '20px' }}>👋</div>
                                    <h4 style={{ fontSize: '1.8rem', color: '#2C3E50', marginBottom: '10px', fontWeight: 800 }}>Welcome Back, {(user.name || 'User').split(' ')[0]}!</h4>
                                    <p style={{ marginBottom: '30px', color: '#546E7A', fontWeight: 500, lineHeight: '1.5' }}>
                                        You are currently logged in as <br />
                                        <span style={{ fontWeight: 800, color: '#FF9933' }}>
                                            {String((user?.position && user?.position !== 'none') ? user.position : (user?.role || 'User')).replace(/_/g, ' ').toUpperCase()}
                                        </span>
                                    </p>
                                    <button

                                        onClick={() => {
                                            const role = (user.role || '').toLowerCase();
                                            const pos = (user.position || '').toLowerCase();
                                            const committeePositions = ['admin', 'super_admin', 'president', 'vice_president', 'secretary', 'joint_secretary', 'treasurer', 'executive_member', 'auditor', 'pro', 'legal_advisor', 'medical_advisor', 'coordinator'];

                                            const isExecutive = committeePositions.includes(role) || (pos && pos !== 'none' && committeePositions.includes(pos));

                                            if (isExecutive) {
                                                navigate('/admin');
                                            } else if (role === 'family_head') {
                                                navigate('/family');
                                            } else {
                                                navigate('/member');
                                            }
                                        }}
                                        className="btn-pulse"
                                        style={{
                                            width: '100%',
                                            padding: '18px',
                                            background: 'linear-gradient(135deg, var(--primary-saffron) 0%, var(--saffron-dark) 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontSize: '1.1rem',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            boxShadow: '0 10px 20px rgba(255, 153, 51, 0.3)',
                                            marginBottom: '15px'
                                        }}
                                    >
                                        {(() => {
                                            const isExecutive = ['admin', 'super_admin', 'president', 'vice_president', 'secretary', 'joint_secretary', 'treasurer', 'executive_member', 'auditor', 'pro'].includes(user.role) || (user.position && user.position !== 'none');
                                            if (isExecutive) return "Access Management Dashboard";
                                            if (user.role === 'family_head') return "Access Family Dashboard";
                                            return "Access Member Dashboard";
                                        })()}
                                    </button>

                                    <button
                                        onClick={() => {
                                            localStorage.removeItem('token');
                                            localStorage.removeItem('user');
                                            window.location.reload();
                                        }}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#666',
                                            textDecoration: 'underline',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        Logout / Switch Account
                                    </button>
                                </div>
                            );
                        } else {
                            // Show Embedded Login Card
                            return <LoginCard isEmbedded={true} />;
                        }
                    })()}
                </div>

            </div>
        </section >
    );
};

export default Hero;
