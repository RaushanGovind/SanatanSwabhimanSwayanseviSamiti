export const ROLE_LABELS = {
    // Base Roles
    super_admin: "System Administrator",
    admin: "Samiti Administrator",
    family_head: "Family Head (Mukhiya)",
    member: "Samiti Member",

    // Official Positions (Posts)
    president: "President (अध्यक्ष)",
    vice_president: "Vice President (उपाध्यक्ष)",
    secretary: "Secretary (सचिव)",
    treasurer: "Treasurer (कोषाध्यक्ष)",
    executive_member: "Executive Member (कार्यकारिणी सदस्य)",
    coordinator: "Coordinator (समन्वयक)"
};

export const COMMITTEE_POSITIONS = ['president', 'vice_president', 'secretary', 'joint_secretary', 'treasurer', 'executive_member', 'coordinator'];

/**
 * Safely parse the user object from local storage
 * @returns {Object|null}
 */
export const getAuthUser = () => {
    try {
        const u = localStorage.getItem('user');
        if (!u || u === 'undefined' || u === 'null') return null;
        return JSON.parse(u);
    } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        return null;
    }
};

export const getRoleLabel = (user) => {
    if (!user) return "Dashboard";

    // If logged in specifically as Family Head, always show "Family Head" to avoid confusion
    if (user.role === 'family_head' || user.role === 'member') {
        return ROLE_LABELS[user.role] || "Member";
    }

    // Otherwise, for admins/officials, prioritize their position title
    const key = (user.position && user.position !== 'none') ? user.position : user.role;
    return ROLE_LABELS[key] || "Dashboard";
};

export const isCommitteeMember = (user) => {
    if (!user || typeof user !== 'object') return false;
    return user.role === 'admin' || user.role === 'super_admin' || COMMITTEE_POSITIONS.includes(user.position) || COMMITTEE_POSITIONS.includes(user.role);
};
