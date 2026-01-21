// core_security.js
import { auth, onAuthStateChanged, getUserRole, checkAbsensiPermission, checkPenilaianPermission } from './config_firebase.js';

// Function to check page permission
async function checkPagePermission(page, user) {
    if (!user) return false;
    
    const userRole = await getUserRole(user.uid);
    const userEmail = user.email.toLowerCase();
    
    switch(page) {
        case "absensi.html":
            return checkAbsensiPermission(userRole, userEmail);
            
        case "penilaian.html":
            return checkPenilaianPermission(userRole, userEmail);
            
        case "index.html":
        case "":
            return true; // Login page accessible to all
            
        default:
            // For other pages, check if user is logged in
            return !!user;
    }
}

// Main security check
onAuthStateChanged(auth, async (user) => {
    // Get current page
    const path = window.location.pathname;
    const page = path.split("/").pop();
    
    // Skip check for login page
    if (page === "index.html" || page === "") {
        return;
    }
    
    // If no user and not on login page, redirect to login
    if (!user) {
        console.log("No user found, redirecting to login...");
        window.location.href = "index.html";
        return;
    }
    
    // Check permission for current page
    const hasPermission = await checkPagePermission(page, user);
    
    if (!hasPermission) {
        console.log(`Permission denied for ${page}, redirecting...`);
        
        // Show alert before redirecting
        alert(`Akses ditolak: Anda tidak memiliki izin untuk mengakses halaman ini.\n\nRole Anda: ${await getUserRole(user.uid)}\nHalaman: ${page}`);
        
        // Redirect to index
        window.location.href = "index.html";
    }
});

// Export functions if needed
export { checkPagePermission };