/**
 * Navigation Reference
 * Provides global access to navigation for programmatic navigation
 */
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  } else {
    const checkInterval = setInterval(() => {
      if (navigationRef.isReady()) {
        clearInterval(checkInterval);
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
  reset({
    index: 0,
    routes: [{ name: "Login", params }],
  });
}

