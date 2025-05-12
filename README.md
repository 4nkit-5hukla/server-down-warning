# Server Down Warning System

This is an [Expo](https://expo.dev) application that monitors multiple APIs at regular intervals and alerts users when any API fails to return the expected response.

## Features

- Monitor multiple API endpoints simultaneously
- Configurable polling intervals for each endpoint
- Play warning alarms when API responses don't match expected criteria
- Snooze functionality for temporarily silencing alarms
- Works across Android, iOS, and web platforms

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## How It Works

The app periodically sends requests to configured API endpoints and compares the responses against expected criteria. When a discrepancy is detected, the app triggers an alarm to notify the user. Users can configure monitoring parameters and snooze alarms as needed.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

