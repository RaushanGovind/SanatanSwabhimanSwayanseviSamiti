import React from 'react';

const WhyJoin = () => {
    const cards = [
        { icon: '🛟', title: 'Support in Emergencies', desc: 'Immediate financial and moral help in times of crisis.' },
        { icon: '🎓', title: 'Future for Children', desc: 'Education support and scholarships for deserving students.' },
        { icon: '👵', title: 'Care for Elders', desc: 'Ensuring no elder or widow in our community is left alone.' },
        { icon: '🤝', title: 'Unity & Respect', desc: 'Stronger together as one family with equal respect for all.' }
    ];

    return (
        <section className="section-padding" style={{ background: '#fff' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h2 className="section-title">Why Families Trust Maa Jagdamba Samiti</h2>
                    <p style={{ fontSize: '1.2rem', color: '#666' }}>A commitment to stand by every member, in every situation.</p>
                </div>

                <div className="grid-layout">
                    {cards.map((card, idx) => (
                        <div key={idx} className="why-join-card">
                            <div className="card-icon-circle">{card.icon}</div>
                            <h3 style={{ fontSize: '1.3rem', marginBottom: '10px' }}>{card.title}</h3>
                            <p style={{ color: '#555' }}>{card.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyJoin;
