# Images Folder

This folder contains all the images used in the JijiCare app.

## Structure:

- `logo.png` - Main app logo
- `logo-white.png` - White version of logo (for dark backgrounds)
- `placeholder.png` - Default placeholder image
- `avatar-placeholder.png` - Default user avatar
- `onboarding-1.png` - Onboarding screen 1
- `onboarding-2.png` - Onboarding screen 2
- `onboarding-3.png` - Onboarding screen 3

## Usage:

```javascript
import { Images } from '../../shared/utils/imageUtils';

// In your component:
<Image source={Images.logo} style={styles.logo} />
<Image source={Images.heart} style={styles.icon} />
```

## Image Requirements:

- **Logo**: 512x512px, PNG format
- **Icons**: 24x24px or 32x32px, PNG format
- **Onboarding**: 400x300px, PNG format
- **Avatars**: 100x100px, PNG format

## Adding New Images:

1. Add the image file to this folder
2. Add the import in `src/shared/utils/imageUtils.js`
3. Use it in your components with `Images.yourImageName`
