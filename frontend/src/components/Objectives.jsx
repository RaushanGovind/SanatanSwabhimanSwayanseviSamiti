import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const Objectives = () => {
    const { t } = useLanguage();

    return (
        <section id="objectives" className="section-padding">
            <div className="container">
                <h2 className="section-title">{t.objectives.title}</h2>
                <div className="grid-layout">
                    <div className="card">
                        <h3>{t.objectives.emergency.title}</h3>
                        <ul>
                            {t.objectives.emergency.items.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="card">
                        <h3>{t.objectives.education.title}</h3>
                        <ul>
                            {t.objectives.education.items.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="card">
                        <h3>{t.objectives.women.title}</h3>
                        <ul>
                            {t.objectives.women.items.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="card">
                        <h3>{t.objectives.social.title}</h3>
                        <ul>
                            {t.objectives.social.items.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </div>
                <p className="note-text text-center mt-4">{t.objectives.note}</p>
            </div>
        </section>
    );
};

export default Objectives;
