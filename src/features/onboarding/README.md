# Onboarding Feature

This feature handles the app's initial user experience including splash screen, onboarding flow, and welcome screen.

## Structure

```
onboarding/
├── screens/
│   ├── SplashScreen.js          # Initial splash screen with logo
│   ├── OnboardingScreen.js      # 3-slide onboarding flow
│   └── WelcomeScreen.js         # Final welcome screen
├── components/
│   └── PaginationDots.js        # Reusable pagination component
├── utils/
│   └── (future utility functions)
└── README.md
```

## Screens

### 1. SplashScreen

- **Purpose**: Initial app loading screen
- **Duration**: 3 seconds auto-navigation
- **Features**:
  - Background image (splash_img.png)
  - App logo and title
  - Loading animation
  - Auto-navigation to onboarding

### 2. OnboardingScreen

- **Purpose**: 3-slide introduction to app features
- **Slides**:
  1. "Healthcare that comes to you" - Home healthcare services
  2. "Doctors just a call away" - Telemedicine features
  3. "Stay on top of your Health" - Health tracking
- **Features**:
  - Horizontal scrolling
  - Pagination dots
  - Skip functionality
  - Continue button

### 3. WelcomeScreen

- **Purpose**: Final screen before main app
- **Features**:
  - Doctor collage image
  - Welcome message
  - Get Started button
  - Login option

## Navigation Flow

```
SplashScreen (3s) → OnboardingScreen → WelcomeScreen → MainApp
```

## Image Requirements

Place these images in `src/assets/images/`:

- `splash_img.png` - Splash screen background (1080x1920px)
- `onboarding-1.png` - First onboarding slide (400x300px)
- `onboarding-2.png` - Second onboarding slide (400x300px)
- `onboarding-3.png` - Third onboarding slide (400x300px)
- `welcome-doctors.png` - Welcome screen doctors collage (400x300px)

## Usage

The onboarding flow is automatically triggered on first app launch. To reset the onboarding (for testing):

```javascript
// In AppNavigator.js, set isFirstLaunch to true
const [isFirstLaunch, setIsFirstLaunch] = useState(true);
```

## Customization

### Colors

Update colors in `src/shared/constants/colors.js`:

- `Colors.primary` - Main brand color
- `Colors.textPrimary` - Title text color
- `Colors.textSecondary` - Description text color

### Timing

Adjust splash screen duration in `SplashScreen.js`:

```javascript
setTimeout(() => {
  navigation.replace("Onboarding");
}, 3000); // Change 3000 to desired milliseconds
```

### Content

Update slide content in `OnboardingScreen.js`:

```javascript
const onboardingData = [
  {
    id: 1,
    image: Images.onboarding1,
    title: "Your Title",
    description: "Your description",
  },
  // ... more slides
];
```
