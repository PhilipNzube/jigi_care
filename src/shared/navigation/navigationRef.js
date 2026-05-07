/**
 * Navigation Reference
 * Provides global access to navigation for programmatic navigation
 */
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

let pendingNavigation = null;

export function setPendingNavigation(name, params) {
  console.log(`📌 [NAV REF] Setting pending navigation: ${name}`, params);
  pendingNavigation = { name, params };
}

export function getPendingNavigation() {
  return pendingNavigation;
}

export function clearPendingNavigation() {
  pendingNavigation = null;
}

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    // Check if we are currently on the Login screen in locked mode
    const currentRoute = navigationRef.getCurrentRoute();
    if (currentRoute?.name === "Login" && currentRoute?.params?.defaultMethod) {
      console.log("🔒 [NAV REF] App is locked. Storing pending navigation.");
      setPendingNavigation(name, params);
      return;
    }
    
    navigationRef.navigate(name, params);
  } else {
    // If navigator not ready, wait and then navigate
    const checkInterval = setInterval(() => {
      if (navigationRef.isReady()) {
        clearInterval(checkInterval);
        
        // Re-check lock state after navigator is ready
        const currentRoute = navigationRef.getCurrentRoute();
        if (currentRoute?.name === "Login" && currentRoute?.params?.defaultMethod) {
          console.log("🔒 [NAV REF] App is locked (late check). Storing pending navigation.");
          setPendingNavigation(name, params);
          return;
        }
        
        navigationRef.navigate(name, params);
      }
    }, 50);
  }
}

export function reset(state) {
  if (navigationRef.isReady()) {
    navigationRef.reset(state);
  } else {
    const checkInterval = setInterval(() => {
      if (navigationRef.isReady()) {
        clearInterval(checkInterval);
        navigationRef.reset(state);
      }
    }, 50);
  }
}

export function resetToLogin(params = {}) {
  // If this is a timeout/lock, capture the current screen to resume later
  if (params.timeout && navigationRef.isReady()) {
    const currentRoute = navigationRef.getCurrentRoute();
    if (currentRoute && currentRoute.name !== "Login") {
      console.log(`🔒 [NAV REF] Capturing resume point: ${currentRoute.name}`);
      setPendingNavigation(currentRoute.name, currentRoute.params);
    }
  }

  reset({
    index: 0,
    routes: [{ name: "Login", params }],
  });
}

