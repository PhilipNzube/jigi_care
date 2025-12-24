/**
 * Navigation Reference
 * Provides global access to navigation for programmatic navigation
 */
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

export function reset(state) {
  if (navigationRef.isReady()) {
    navigationRef.reset(state);
  } else {
    // If navigation is not ready, wait for it
    const unsubscribe = navigationRef.addListener('state', () => {
      if (navigationRef.isReady()) {
        navigationRef.reset(state);
        unsubscribe();
      }
    });
  }
}

export function resetToLogin() {
  reset({
    index: 0,
    routes: [{ name: "Login" }],
  });
}

