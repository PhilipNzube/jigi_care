# Icons Folder

This folder contains all the icons used in the JijiCare app.

## Structure:

- `heart.png` - Heart icon for health features
- `medicine.png` - Medicine icon for medications
- `calendar.png` - Calendar icon for appointments
- `user.png` - User icon for profile
- `home.png` - Home icon
- `settings.png` - Settings icon
- `notification.png` - Notification icon

## Usage:

```javascript
import { Images } from '../../shared/utils/imageUtils';

// In your component:
<Image source={Images.heart} style={styles.icon} />
<Image source={Images.medicine} style={styles.icon} />
```

## Icon Requirements:

- **Size**: 24x24px or 32x32px
- **Format**: PNG with transparency
- **Style**: Material Design or similar
- **Color**: Can be colored or monochrome (will be styled in code)

## Adding New Icons:

1. Add the icon file to this folder
2. Add the import in `src/shared/utils/imageUtils.js`
3. Use it in your components with `Images.yourIconName`
