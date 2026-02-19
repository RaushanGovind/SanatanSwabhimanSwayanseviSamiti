import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import CommonDashboardContent from '../components/dashboard/CommonDashboardContent';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

import DashboardOverview from '../components/dashboard/DashboardOverview';

const MemberDashboard = () => {
    const { tab } = useParams();
    const navigate = useNavigate();
    const activeTab = tab || 'overview';
    const [notices, setNotices] = useState([]);
    const [familyData, setFamilyData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Get current user info from local storage
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [noticesRes, famRes] = await Promise.all([
                    api.getNotices().catch(() => ({ data: [] })),
                    api.getMyFamily().catch(() => ({ data: null }))
                ]);
                setNotices(noticesRes.data);
                setFamilyData(famRes.data);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <DashboardLayout
            role="family_member"
            title="Member Portal"
            showTitle={false}
            banner={(
                <div style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    padding: '24px 32px',
                    borderRadius: '0',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: 'white',
                    width: '100%'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            background: 'rgba(255,255,255,0.15)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.75rem',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            👤
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.85, marginBottom: '4px', letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: 500 }}>Member Dashboard</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                                FAMILY MEMBER
                            </div>
                            <div style={{ fontSize: '0.875rem', opacity: 0.9, marginTop: '2px' }}>
                                {user?.name}
                            </div>
                        </div>
                    </div>
                    <div style={{
                        background: 'rgba(255,255,255,0.15)',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        letterSpacing: '0.3px'
                    }}>
                        👥 Member Access
                    </div>
                </div>
            )}
        >

            {loading ? <p>Loading...</p> : (
                <>
                    {/* Common Tabs */}
                    {['funds', 'contributions', 'rules', 'accounts', 'notices', 'coordinator', 'profile', 'audit', 'inquiries', 'elections', 'governance', 'history', 'roles'].includes(activeTab) && (
                        <CommonDashboardContent activeTab={activeTab} role={user?.role} user={user} familyData={familyData} />
                    )}

                    {activeTab === 'overview' && (
                        <DashboardOverview role={user?.role} user={user} />
                    )}

                    {activeTab === 'family' && (
                        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            <h3>My Family Details</h3>
                            {familyData ? (
                                <>
                                    <p style={{ fontSize: '1.1rem' }}>Family ID: <strong>{familyData.family_unique_id}</strong></p>
                                    <p>Head of Family: <strong>{familyData.head_details?.full_name || familyData.head_name}</strong></p>
                                    <p>Address: {familyData.current_address?.village_town_city}, {familyData.current_address?.district}</p>

                                    <h4 style={{ marginTop: '20px' }}>Short Summary</h4>
                                    <p>Total Members: {familyData.members?.length}</p>
                                </>
                            ) : (
                                <p>Family details not linked or pending approval.</p>
                            )}

                            <p style={{ fontStyle: 'italic', color: '#666', marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                                Note: Only the Family Head can add or edit member details. Please contact them for any corrections.
                            </p>
                        </div>
                    )}
                </>
            )}

        </DashboardLayout>
    );
};

export default MemberDashboard;
