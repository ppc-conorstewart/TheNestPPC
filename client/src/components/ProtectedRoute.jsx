// ==============================
// src/components/ProtectedRoute.jsx
// ProtectedRoute (Discord auth temporarily disabled)
// ==============================


// Temporarily disable Discord authentication requirement.
// Always render children, but keep the old logic in comments
// so it can be restored later if needed.

export default function ProtectedRoute({ children }) {
  // --- Original Discord auth check (disabled) ---
  // const isAuthenticated = Boolean(localStorage.getItem('flyiq_user'));
  // return isAuthenticated ? children : <Navigate to="/" replace />;

  // --- Temporary override: always allow access ---
  return children;
}
