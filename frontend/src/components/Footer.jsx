import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
    const { t } = useLanguage();

    return (
        <footer className="site-footer" style={{
            background: 'rgba(15, 23, 42, 0.98)',
            color: '#94A3B8',
            padding: '8px 0',
            fontSize: '0.7rem',
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            backdropFilter: 'blur(15px)',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.2)',
            borderTop: '2px solid var(--primary-saffron)'
        }}>
            <div className="container" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 20px'
            }}>
                <p style={{ margin: 0, fontWeight: 600 }}>
                    © {new Date().getFullYear()} {t.footer.copyright_text}
                </p>
            </div>
        </footer>
    );
};

export default Footer;
