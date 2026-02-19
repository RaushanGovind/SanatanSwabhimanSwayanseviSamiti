import React from 'react';

const MemberDetailModal = ({ member, onClose }) => {
    if (!member) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.6)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 4000,
                backdropFilter: 'blur(4px)'
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'white',
                    padding: '0',
                    borderRadius: '16px',
                    width: '90%',
                    maxWidth: '600px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    overflow: 'hidden'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    background: member.gender === 'Male'
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
                    padding: '30px',
                    textAlign: 'center',
                    position: 'relative'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '15px',
                            right: '15px',
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            color: 'white',
                            fontSize: '24px',
                            cursor: 'pointer',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                    >
                        ×
                    </button>

                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px',
                        fontSize: '4rem',
                        border: '4px solid white',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
                    }}>
                        {member.gender === 'Male' ? '👨' : '👩'}
                    </div>

                    <h2 style={{ margin: '0 0 10px 0', fontSize: '1.8rem', fontWeight: 800 }}>
                        {member.full_name}
                    </h2>
                    <div style={{ fontSize: '1.1rem', opacity: 0.95, fontWeight: 600 }}>
                        {member.relation}
                    </div>
                </div>

                {/* Body */}
                <div style={{ padding: '30px' }}>
                    <div style={{ display: 'grid', gap: '15px' }}>
                        <DetailRow label="Member ID" value={member.member_id || 'Not Assigned'} icon="🆔" />
                        <DetailRow label="Gender" value={member.gender} icon={member.gender === 'Male' ? '♂️' : '♀️'} />
                        <DetailRow label="Date of Birth" value={member.dob} icon="🎂" />
                        <DetailRow label="Relation" value={member.relation} icon="👥" />

                        {member.marital_status && (
                            <DetailRow label="Marital Status" value={member.marital_status} icon="💍" />
                        )}

                        {member.occupation && (
                            <DetailRow label="Occupation" value={member.occupation} icon="💼" />
                        )}

                        {member.education && (
                            <DetailRow label="Education" value={member.education} icon="🎓" />
                        )}

                        {member.phone && (
                            <DetailRow label="Phone" value={member.phone} icon="📞" />
                        )}

                        {member.email && (
                            <DetailRow label="Email" value={member.email} icon="📧" />
                        )}

                        {member.aadhaar && (
                            <DetailRow label="Aadhaar" value={member.aadhaar} icon="🆔" />
                        )}
                    </div>

                    {/* Close Button */}
                    <div style={{ marginTop: '30px', textAlign: 'center' }}>
                        <button
                            onClick={onClose}
                            style={{
                                padding: '12px 40px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DetailRow = ({ label, value, icon }) => (
    <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 15px',
        background: '#f8f9fa',
        borderRadius: '8px',
        borderLeft: '4px solid #667eea'
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.3rem' }}>{icon}</span>
            <span style={{ fontWeight: 600, color: '#6c757d' }}>{label}:</span>
        </div>
        <span style={{ fontWeight: 700, color: '#2c3e50' }}>{value || '-'}</span>
    </div>
);

export default MemberDetailModal;
