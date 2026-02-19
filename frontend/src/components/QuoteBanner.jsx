import React from 'react';

const QuoteBanner = () => {
    return (
        <section className="quote-banner">
            <div className="container">
                <div style={{ opacity: 0.8, fontSize: '3rem', marginBottom: '-20px' }}>❝</div>
                <p className="quote-text">Seva hi sabse bada dharm hai</p>
                <div className="spiritual-divider" style={{ margin: '20px 0', padding: 0 }}><span>🕉</span></div>
                <p className="quote-sub">(SERVICE IS THE GREATEST DUTY)</p>
            </div>
        </section>
    );
};

export default QuoteBanner;
