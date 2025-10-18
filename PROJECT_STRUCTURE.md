# JijiCare - Professional React Native Project Structure

## 📁 Project Structure (Feature-Based Architecture)

```
jiji_care/
├── App.js                          # Main app entry point
├── app.json                        # Expo configuration
├── package.json                    # Dependencies (like pubspec.yaml)
├── android/                        # Native Android project
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   └── java/com/jijicare/app/
│   │   └── build.gradle
│   └── local.properties            # Android SDK path
├── src/
│   ├── features/                   # Feature modules (like Flutter features)
│   │   ├── auth/                   # Authentication feature
│   │   │   ├── screens/            # Auth screens
│   │   │   ├── components/         # Auth-specific components
│   │   │   ├── services/           # Auth API calls
│   │   │   ├── utils/              # Auth utilities
│   │   │   └── types/              # Auth type definitions
│   │   ├── profile/                # Profile feature
│   │   │   ├── screens/
│   │   │   │   ├── HomeScreen.js
│   │   │   │   └── ProfileScreen.js
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── utils/
│   │   │   └── types/
│   │   ├── health/                 # Health records feature
│   │   ├── appointments/           # Appointments feature
│   │   └── medications/            # Medications feature
│   ├── shared/                     # Shared code (like Flutter shared)
│   │   ├── components/             # Reusable components
│   │   │   ├── Button.js
│   │   │   ├── Card.js
│   │   │   └── Input.js
│   │   ├── services/               # API services
│   │   ├── utils/                  # Utility functions
│   │   │   └── imageUtils.js       # Image handling
│   │   ├── types/                  # Type definitions
│   │   ├── constants/              # App constants
│   │   │   ├── colors.js
│   │   │   └── sizes.js
│   │   └── hooks/                  # Custom React hooks
│   └── assets/                     # Static assets (like Flutter assets)
│       ├── images/                 # Images (PNG, JPG)
│       │   ├── logo.png
│       │   ├── placeholder.png
│       │   └── onboarding-*.png
│       ├── icons/                  # Icons (PNG)
│       │   ├── heart.png
│       │   ├── medicine.png
│       │   └── calendar.png
│       └── fonts/                  # Custom fonts (TTF, OTF)
└── assets/                         # Expo assets (app icons, splash)
    ├── icon.png
    ├── splash-icon.png
    └── adaptive-icon.png
```

## 🎯 Key Differences from Flutter

| Flutter            | React Native            | Notes                 |
| ------------------ | ----------------------- | --------------------- |
| `lib/`             | `src/`                  | Main source directory |
| `assets/`          | `src/assets/`           | Images, icons, fonts  |
| `pubspec.yaml`     | `package.json`          | Dependencies          |
| `main.dart`        | `App.js`                | Entry point           |
| `Widget`           | `Component`             | UI building blocks    |
| `StatefulWidget`   | `useState` hook         | State management      |
| `Navigator.push()` | `navigation.navigate()` | Navigation            |
| `AssetImage()`     | `require()`             | Image loading         |

## 🖼️ Image Handling (Just Like Flutter!)

### Adding Images:

1. **Add image files** to `src/assets/images/` or `src/assets/icons/`
2. **Import in imageUtils.js**:
   ```javascript
   export const Images = {
     logo: require("../../assets/images/logo.png"),
     heart: require("../../assets/icons/heart.png"),
   };
   ```
3. **Use in components**:

   ```javascript
   import { Images } from "../../../shared/utils/imageUtils";

   <Image source={Images.logo} style={styles.logo} />;
   ```

### Image Requirements:

- **Format**: PNG, JPG, WebP
- **Icons**: 24x24px or 32x32px
- **Logos**: 512x512px
- **Onboarding**: 400x300px

## 🚀 Development Commands

```bash
# Start development server
npm start

# Run on Android (uses your Android SDK)
npx expo run:android

# Run on iOS
npx expo run:ios

# Run on web
npx expo start --web

# Build for production
npx expo build:android
npx expo build:ios
```

## 📱 Performance Comparison

| Aspect                  | Flutter         | React Native       |
| ----------------------- | --------------- | ------------------ |
| **Development Speed**   | ⚡ Fast         | ⚡ Fast            |
| **Hot Reload**          | ⚡ Instant      | ⚡ Instant         |
| **Runtime Performance** | 🏆 Excellent    | 🏆 Excellent       |
| **App Size**            | ⚡ Smaller      | ⚡ Slightly Larger |
| **Learning Curve**      | 📚 Steep (Dart) | 📚 Easier (JS)     |

## 🎨 Styling (Similar to Flutter)

```javascript
// Colors (like Flutter's Color class)
import { Colors } from "../shared/constants/colors";

// Sizes (like Flutter's EdgeInsets)
import { Sizes } from "../shared/constants/sizes";

// Usage
const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    padding: Sizes.md,
    borderRadius: Sizes.radius.lg,
  },
});
```

This structure gives you the same professional organization as Flutter, with feature-based architecture and clean separation of concerns!
