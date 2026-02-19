import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const HelpProcess = () => {
    const { t } = useLanguage();

    return (
        <section id="process" className="section-padding">
            <div className="container">
                <h2 className="section-title">{t.process.title}</h2>
                <ol className="process-list">
                    {t.process.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                    ))}
                </ol>
            </div>
        </section>
    );
};

export default HelpProcess;
