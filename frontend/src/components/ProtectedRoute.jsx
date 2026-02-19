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
    const hasAccess = allowedRoles && (
        allowedRoles.includes(user.role) ||
        allowedRoles.includes(user.position)
    );

    if (allowedRoles && !hasAccess) {
        // User doesn't have access to this route - redirect to appropriate dashboard
        // Check if they're a committee member (by position)
        const committeePositions = ['president', 'vice_president', 'secretary', 'treasurer', 'executive_member', 'coordinator'];
        if (committeePositions.includes(user.position)) {
            return <Navigate to="/admin" replace />;
        }

        // Otherwise redirect based on role
        if (user.role === 'admin' || user.role === 'super_admin') return <Navigate to="/admin" replace />;
        if (user.role === 'family_head') return <Navigate to="/family" replace />;
        if (user.role === 'family_member' || user.role === 'member') return <Navigate to="/member" replace />;
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
