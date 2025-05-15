
# Guardian Angel - Mental Health & Wellbeing Tracker for Kids

Guardian Angel is a Next.js web application designed to help parents monitor their child's activity levels, health metrics, and online safety by detecting potential bullying in text communications.

## Overview

The app provides a centralized dashboard for parents to view their child's activity data (steps, calories, distance, active minutes), real-time health indicators (heart rate, SpO2, body temperature - simulated), and receive alerts for potential cyberbullying incidents. It leverages AI for text analysis and offers a user-friendly interface built with modern web technologies.

## Core Features

1.  **Activity Dashboard**:
    *   Visualizes key activity metrics: Steps, Calories Burned, Distance Walked, and Active Minutes.
    *   Each metric is displayed with a progress bar indicating progress towards a daily goal.
    *   Clear icons and values for easy understanding.
    *   Includes a weekly activity chart showing trends for steps and calories burned.

2.  **Bullying Alerts**:
    *   **Text Analysis**: Parents can input text (from SMS, social media, etc.) to be analyzed by an AI model for potential bullying or hate speech.
    *   **Speech Input**: Users can speak directly into the app. The transcribed text is then analyzed for bullying.
    *   **Incident Reporting**: Detected incidents are flagged with:
        *   Timestamp
        *   Severity level (as a percentage)
        *   The original text snippet
        *   An AI-generated explanation for the flagging.
    *   **Incident History**: A collapsible list displays all recorded incidents, allowing parents to review details.
    *   Incidents are stored locally in the browser.

3.  **Real-Time Health Metrics (Simulated)**:
    *   **Live Heart Rate**: Displays a live BPM (beats per minute) with an animated heartbeat icon.
    *   **Other Key Indicators**: Shows simulated SpO2 (Oxygen Saturation), Body Temperature, and Last Sleep Duration.
    *   **Data Refresh**: Health data is automatically refreshed every 30 seconds to simulate real-time updates from a connected device.
    *   **Health Trends**:
        *   Toggleable tabs for historical daily and weekly heart rate averages.
        *   Charts for historical sleep patterns and stress levels (HRV-based, simulated).

4.  **Parental Controls & Settings**:
    *   **Profile Management**: Parents can update their name, email, and child's name.
    *   **Notification Preferences**: Toggles for enabling/disabling bullying alerts, weekly activity summaries, and critical health alerts (UI placeholders for functionality).
    *   **Data & Privacy**: Section for managing data sources, including a simulated Health Connect status.

5.  **User Interface & Styling**:
    *   **Color Scheme**: Uses a soft blue primary, light teal secondary, off-white background, and light orange for accents.
    *   **Modern Components**: Built with ShadCN UI components for a clean and professional look.
    *   **Responsive Design**: Adapts to different screen sizes.
    *   **Navigation**: A collapsible sidebar for easy navigation between Dashboard, Bullying Alerts, Health Metrics, and Settings.
    *   **Icons**: Uses Lucide-React for a consistent icon set.

## Technology Stack

*   **Frontend Framework**: [Next.js](https://nextjs.org/) (with App Router)
*   **UI Library**: [React](https://reactjs.org/)
*   **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Generative AI**: [Genkit (by Google)](https://firebase.google.com/docs/genkit)
    *   Used for the `detectBullying` flow to analyze text.
*   **Programming Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Charts**: [Recharts](https://recharts.org/) (integrated via ShadCN UI Chart components)
*   **Speech Recognition**: Web Speech API (for voice input on the Bullying Alerts page)
*   **State Management**: React Context API, `useState`, `useEffect` for local component state and client-side storage (localStorage).
*   **Form Handling**: `react-hook-form` with `zod` for validation.

## Getting Started

1.  **Prerequisites**:
    *   Node.js (version 18.x or later recommended)
    *   npm or yarn

2.  **Clone the repository (if applicable)**:
    ```bash
    git clone <repository-url>
    cd guardian-angel-app
    ```

3.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

4.  **Set up Environment Variables**:
    *   Create a `.env` file in the root of the project.
    *   If required by Genkit or other services, add your API keys:
        ```
        GOOGLE_API_KEY=YOUR_GOOGLE_AI_STUDIO_API_KEY
        ```

5.  **Run the development server**:
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The application will typically be available at `http://localhost:9002`.

6.  **Run the Genkit development server (in a separate terminal)**:
    ```bash
    npm run genkit:dev
    ```
    This starts the Genkit flows, which are necessary for AI-powered features like bullying detection.

## Walkthrough

### 1. Logging In / Signing Up (Conceptual)

*   The app includes UI for **Login** (`/login`) and **Sign Up** (`/signup`) pages.
*   These are currently placeholders and do not have backend authentication implemented.
*   Upon starting the app, you are redirected to the `/dashboard`.

### 2. Dashboard

*   **Access**: Navigate to the "Dashboard" link in the sidebar.
*   **View Activity Metrics**:
    *   Observe cards for "Steps", "Calories Burned", "Distance Walked", and "Active Minutes" for the placeholder child, "John".
    *   Each card shows the current value, the daily goal, and a progress bar.
*   **View Weekly Activity Chart**:
    *   Below the metric cards, a bar chart displays simulated steps and calories burned for each day of the past week.

### 3. Bullying Alerts

*   **Access**: Navigate to the "Bullying Alerts" link in the sidebar.
*   **Analyze Text Manually**:
    1.  In the "Analyze Text for Bullying" card, type or paste text (e.g., a suspicious message) into the text area.
    2.  Click the "Analyze Text" button.
    3.  The AI will process the text. Results will appear below the form, indicating if bullying was detected, the severity, and an explanation.
*   **Analyze Text via Speech**:
    1.  Click the "Speak to Analyze" button.
    2.  Your browser may request microphone permission. Allow it.
    3.  The button will change to "Stop Listening". Speak the text you want to analyze.
    4.  The transcribed text will appear in the text area.
    5.  Click "Stop Listening" or wait for it to stop automatically.
    6.  Click the "Analyze Text" button to submit the transcribed text for analysis.
*   **View Incident History**:
    *   If any incidents have been detected and saved (they are saved to browser localStorage), they will appear in the "Incident History" section.
    *   Each incident is a collapsible item. Click on an incident to expand it and see details like the full text, explanation, timestamp, and severity.
    *   Incidents are color-coded (red for bullying, green for safe).

### 4. Health Metrics

*   **Access**: Navigate to the "Health Metrics" link in the sidebar.
*   **View Live (Simulated) Data**:
    *   **Heart Rate Widget**: Shows the current (simulated) BPM with an animated heart icon.
    *   Other cards display (simulated):
        *   Average Sleep (last recorded)
        *   Oxygen Saturation (SpO2)
        *   Body Temperature
    *   Notice the "Last updated" timestamp at the top right of the content area. This data simulates fetching from a Health Connect-like source and refreshes every 30 seconds.
*   **View Health Trends**:
    *   Below the live metrics, there are tabs for "Heart Rate Trends", "Sleep Patterns", and "Stress Levels".
    *   **Heart Rate Trends**:
        *   Contains two line charts: "Historical Daily Heart Rate" and "Historical Weekly Heart Rate Avg." showing simulated data.
    *   **Sleep Patterns**:
        *   Shows a line chart for "Historical Weekly Sleep Duration".
    *   **Stress Levels**:
        *   Shows a line chart for "Historical Weekly Stress Levels".

### 5. Settings

*   **Access**: Navigate to the "Settings" link in the sidebar.
*   **Profile**:
    *   View and edit (UI only, no backend persistence) the Parent's Name, Email, and Child's Name.
    *   A "Save Changes" button is present (UI only).
*   **Notifications**:
    *   Toggle switches for "Bullying Alerts", "Weekly Activity Summary", and "Critical Health Alerts". These are UI elements and don't trigger actual notifications in the current version.
*   **Data & Privacy**:
    *   Shows a (simulated) "Health Connect (Simulated)" status, indicating it's "Connected (Simulated)".
    *   Placeholders for "SMS/Social Media Monitoring" configuration and a "View Privacy Policy" link.

### 6. Sidebar Navigation & User Profile

*   The **collapsible sidebar** on the left allows easy access to all main sections of the app. It can be collapsed to show only icons.
*   At the bottom of the sidebar, the placeholder parent's avatar, name ("Sarah Connor"), and email are displayed.
*   A "Logout" button is present (UI only).

This walkthrough should provide a good understanding of how to navigate and use the Guardian Angel application.
