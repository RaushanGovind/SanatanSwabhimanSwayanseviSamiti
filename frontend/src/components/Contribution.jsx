import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const Contribution = () => {
    const { t } = useLanguage();

    return (
        <section id="contribution" className="section-padding bg-green-light">
            <div className="container text-center">
                <h2 className="section-title">{t.contribution.title}</h2>
                <div className="content-box">
                    {t.contribution.points.map((point, index) => (
                        <p key={index} dangerouslySetInnerHTML={{ __html: point }} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Contribution;
