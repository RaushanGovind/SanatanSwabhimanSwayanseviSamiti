import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const Membership = () => {
    const { t } = useLanguage();

    const icons = ["🏠", "🤝", "👨‍👩‍👧", "🚫"];

    return (
        <section id="membership" className="section-padding bg-saffron-light">
            <div className="container">
                <h2 className="section-title">{t.membership.title}</h2>
                <div className="steps-box">
                    {t.membership.items.map((item, index) => (
                        <div className="step-item" key={index}>
                            <span className="step-icon">{icons[index]}</span>
                            <p>{item}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Membership;
