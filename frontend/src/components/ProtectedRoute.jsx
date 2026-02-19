import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getAuthUser } from '../utils/roleHelper';

const ProtectedRoute = ({ allowedRoles }) => {
    const token = localStorage.getItem('token');
    const user = getAuthUser();

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    // Check if user has access based on role OR position
    const userRole = (user.role || '').toLowerCase();
    const userPos = (user.position || '').toLowerCase();

    const hasAccess = allowedRoles && (
        allowedRoles.includes(userRole) ||
        allowedRoles.includes(userPos) ||
        (userRole === 'super_admin') // Super admin always has access
    );

    if (allowedRoles && !hasAccess) {
        // User doesn't have access to this route - redirect to appropriate dashboard

        // Check if they're a committee member (by position)
        const committeePositions = ['admin', 'super_admin', 'president', 'vice_president', 'secretary', 'joint_secretary', 'treasurer', 'executive_member', 'coordinator', 'auditor', 'pro', 'legal_advisor', 'medical_advisor'];
        if (committeePositions.includes(userPos) || committeePositions.includes(userRole)) {
            return <Navigate to="/admin" replace />;
        }

        // Otherwise redirect based on role
        if (userRole === 'family_head') return <Navigate to="/family" replace />;
        if (userRole === 'family_member' || userRole === 'member') return <Navigate to="/member" replace />;
        return <Navigate to="/" replace />;
    }

    // Gating for Family Heads with Incomplete Profiles
    if (user.role === 'family_head' && user.status === 'Profile Incomplete') {
        const currentPath = window.location.pathname;
        if (currentPath !== '/family' && !currentPath.startsWith('/family/')) {
            return <Navigate to="/family" replace />;
        }
    }

    return <Outlet />;
};

export default ProtectedRoute;
