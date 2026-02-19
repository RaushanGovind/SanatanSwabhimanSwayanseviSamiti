import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import About from '../components/About';
import Footer from '../components/Footer';
import AnnouncementBar from '../components/AnnouncementBar';
import WhyJoin from '../components/WhyJoin';
import RulesTransparency from '../components/RulesTransparency';
import FinalCTA from '../components/FinalCTA';
import Contact from '../components/Contact';


import { useNavigate } from 'react-router-dom';
import { getAuthUser } from '../utils/roleHelper';

function Landing() {
    const navigate = useNavigate();
    const [backendStatus, setBackendStatus] = useState('Checking...');
    const [notices, setNotices] = useState([]);

    useEffect(() => {
        const user = getAuthUser();
        // Redirect incomplete family heads to their form immediately
        if (user && user.role === 'family_head' && user.status === 'Profile Incomplete') {
            navigate('/family');
            return;
        }

        fetch('/api/status')
            .then(res => res.json())
            .then(data => setBackendStatus(data?.status || 'Offline'))
            .catch(err => setBackendStatus('Offline'));

        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        fetch('/api/notices', { headers })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setNotices(data);
                else setNotices([]);
            })
            .catch(err => {
                console.error(err);
                setNotices([]);
            });
    }, []);

    const getPriorityColor = (p) => {
        if (p === 'urgent' || p === 'emergency' || p === 'high') return '#ef4444';
        return 'var(--primary)';
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: '60px' }}>
            <AnnouncementBar />
            <Header />
            <main style={{ flex: 1 }}>
                {/* Full Width Hero/Welcome Section */}
                <Hero />

                {/* Latest Community Updates */}
                <section style={{ padding: '80px 0', background: 'var(--bg-page)' }}>
                    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                            <h3 style={{ margin: 0, color: 'var(--text-main)', fontWeight: 900, fontSize: '2.5rem', letterSpacing: '-1px' }}>
                                📣 Community Billboard
                            </h3>
                            <p style={{ marginTop: '10px', color: 'var(--text-muted)', fontSize: '1.1rem' }}>Stay updated with the latest happenings in our Samiti.</p>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                            gap: '25px'
                        }}>
                            {notices.length > 0 ? notices.map((n, i) => (
                                <div key={i} style={{
                                    background: 'var(--bg-card)',
                                    padding: '30px',
                                    borderRadius: '24px',
                                    border: '1px solid var(--border-color)',
                                    boxShadow: 'var(--shadow)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.3s ease',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{
                                        position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                                        background: getPriorityColor(n.priority)
                                    }} />

                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                        <span style={{
                                            background: 'var(--bg-page)',
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            color: 'var(--text-muted)',
                                            border: '1px solid var(--border-color)'
                                        }}>
                                            🏷️ {n.category || 'General'}
                                        </span>
                                        <small style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                                            {new Date(n.created_at).toLocaleDateString()}
                                        </small>
                                    </div>

                                    <h4 style={{ margin: '0 0 15px 0', color: 'var(--text-main)', fontSize: '1.3rem', fontWeight: 800, lineHeight: 1.3 }}>
                                        {n.title}
                                    </h4>

                                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.7', flex: 1 }}>
                                        {n.content}
                                    </p>

                                    {n.priority === 'urgent' && (
                                        <div style={{ marginTop: '20px', color: '#ef4444', fontWeight: 900, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <span className="pulse-dot"></span> IMMEDIATE ACTION REQUIRED
                                        </div>
                                    )}
                                </div>
                            )) : (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', padding: '100px 20px', background: 'var(--bg-card)', borderRadius: '30px', border: '2px dashed var(--border-color)' }}>
                                    <span style={{ fontSize: '5rem', display: 'block', marginBottom: '20px' }}>📬</span>
                                    <h3 style={{ margin: 0, color: 'var(--text-main)' }}>All Quiet Here</h3>
                                    <p style={{ fontSize: '1.1rem', marginTop: '10px' }}>No new announcements have been posted yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* <RulesTransparency /> */}
                <FinalCTA />
                {/* <Contact /> */}
            </main>

            <Footer />
        </div>
    );
}

export default Landing;
