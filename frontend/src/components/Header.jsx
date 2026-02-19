import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { isCommitteeMember, getRoleLabel, getAuthUser } from '../utils/roleHelper';

const Header = () => {
    const { t, language, toggleLanguage } = useLanguage();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', content: null });

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const openModal = (type) => {
        let title = '';
        let content = null;

        switch (type) {
            case 'about':
                title = t.about.title;
                content = (
                    <div>
                        <p>{t.about.para1}</p>
                        <p>{t.about.para2}</p>
                        <p style={{ fontStyle: 'italic', color: 'var(--primary-saffron)', fontWeight: 600 }}>{t.about.highlight}</p>
                    </div>
                );
                break;
            case 'objectives':
                title = t.objectives.title;
                content = (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        <div>
                            <h4 style={{ color: 'var(--primary-blue)', marginBottom: '10px' }}>{t.objectives.emergency.title}</h4>
                            <ul style={{ paddingLeft: '20px' }}>
                                {t.objectives.emergency.items.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h4 style={{ color: 'var(--primary-blue)', marginBottom: '10px' }}>{t.objectives.education.title}</h4>
                            <ul style={{ paddingLeft: '20px' }}>
                                {t.objectives.education.items.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        </div>
                    </div>
                );
                break;
            case 'membership':
                title = t.membership.title;
                content = (
                    <ul style={{ paddingLeft: '20px', fontSize: '1.1rem', lineHeight: '1.8' }}>
                        {t.membership.items.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                );
                break;
            case 'contact':
                title = t.contact.title;
                content = (
                    <div style={{ padding: '10px' }}>
                        <p><strong>{t.contact.address_label}</strong> {t.contact.address_value}</p>
                        <p style={{ marginTop: '20px', color: 'var(--primary-saffron)', fontWeight: 700 }}>{t.contact.alert}</p>
                    </div>
                );
                break;
            default: break;
        }

        setModalConfig({ isOpen: true, title, content });
        setIsMenuOpen(false);
    };

    const handleNavigation = (path) => {
        navigate(path);
        setIsMenuOpen(false);
    };

    return (
        <>
            <header className="site-header">
                <div className="container">
                    <div className="logo-area" onClick={() => handleNavigation('/')} style={{ cursor: 'pointer' }}>
                        <h1>{t.header.title_line1} <br /><span>{t.header.title_line2}</span></h1>
                    </div>
                    <nav className="main-nav">
                        <button
                            className="mobile-menu-toggle"
                            aria-label="Menu"
                            aria-expanded={isMenuOpen}
                            onClick={toggleMenu}
                        >
                            {isMenuOpen ? '✕' : '☰'}
                        </button>
                        <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
                            <li><a href="/" onClick={(e) => { e.preventDefault(); handleNavigation('/'); }}>{t.header.nav.home}</a></li>
                            <li><a href="#about" onClick={(e) => { e.preventDefault(); openModal('about'); }}>{t.header.nav.about}</a></li>
                            <li><a href="#objectives" onClick={(e) => { e.preventDefault(); openModal('objectives'); }}>{t.header.nav.objectives}</a></li>
                            <li><a href="#membership" onClick={(e) => { e.preventDefault(); openModal('membership'); }}>{t.header.nav.membership}</a></li>
                            <li><a href="#contact" onClick={(e) => { e.preventDefault(); openModal('contact'); }}>{t.header.nav.contact}</a></li>

                            <li className="action-buttons-container">
                                {(() => {
                                    const u = getAuthUser();
                                    if (!u) {
                                        return <button onClick={() => handleNavigation('/login')} className="nav-btn-filled">Login</button>;
                                    }

                                    const handleClick = () => {
                                        let path = u.role === 'treasurer' ? '/treasurer' :
                                            (['secretary', 'joint_secretary'].includes(u.role) ? '/secretary' :
                                                (isCommitteeMember(u) ? '/admin' :
                                                    (u.role === 'family_head' ? '/family' : '/member')));
                                        handleNavigation(path);
                                    };

                                    const label = u.role === 'family_head' ? 'Family Portal' :
                                        (u.role === 'family_member' ? 'Member Portal' :
                                            getRoleLabel(u));

                                    const handleLogout = () => {
                                        localStorage.removeItem('token');
                                        localStorage.removeItem('user');
                                        navigate('/');
                                        window.location.reload(); // Refresh to clear all context
                                    };

                                    return (
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <button onClick={handleClick} className="nav-btn-filled">
                                                {label}
                                            </button>
                                            <button onClick={handleLogout} className="nav-btn-outline" style={{ padding: '8px 15px', color: 'var(--danger)', border: '1px solid var(--danger)' }}>
                                                Logout
                                            </button>
                                        </div>
                                    );
                                })()}
                            </li>

                            <li>
                                <button onClick={toggleLanguage} className="lang-toggle">
                                    {language === 'hi' ? 'EN' : 'हिन्दी'}
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </header>

            {/* Information Modal */}
            {modalConfig.isOpen && (
                <div className="info-modal-overlay" onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}>
                    <div className="info-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="info-modal-header">
                            <h3>{modalConfig.title}</h3>
                            <button className="close-btn" onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}>✕</button>
                        </div>
                        <div className="info-modal-body">
                            {modalConfig.content}
                        </div>
                        <div className="info-modal-footer">
                            <button className="nav-btn-filled" onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;
