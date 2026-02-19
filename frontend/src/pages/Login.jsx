import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import LoginCard from '../components/LoginCard';
import { isCommitteeMember, getAuthUser } from '../utils/roleHelper';

const Login = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();

    // Auto-redirect removed - routing now handled by LoginCard based on selected tab
    // useEffect(() => {
    //     const user = getAuthUser();
    //     if (user) {
    //         if (user.role === 'treasurer') navigate('/treasurer');
    //         else if (['secretary', 'joint_secretary'].includes(user.role)) navigate('/secretary');
    //         else if (isCommitteeMember(user)) navigate('/admin');
    //         else if (user.role === 'family_head') navigate('/family');
    //         else if (user.role === 'family_member') navigate('/member');
    //     }
    // }, [navigate]);

    return (
        <div className="login-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5' }}>
            <LoginCard />
        </div>
    );
};

export default Login;
