import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const About = () => {
    const { t } = useLanguage();

    return (
        <section id="about" className="section-padding bg-light">
            <div className="container">
                <h2 className="section-title">{t.about.title}</h2>
                <div className="content-box">
                    <p>{t.about.para1}</p>
                    <p>{t.about.para2}</p>
                    <p className="highlight">{t.about.highlight}</p>
                </div>
            </div>
        </section>
    );
};

export default About;
