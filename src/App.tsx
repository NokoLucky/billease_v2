import React from 'react';
import { IonApp, IonRouterOutlet, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonLoading, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect } from 'react-router-dom';
import {
  homeOutline, home,
  receiptOutline, receipt,
  calendarOutline, calendar,
  saveOutline, save,
  statsChartOutline, statsChart,
} from 'ionicons/icons';

import { AuthProvider, useAuth } from './components/AuthProvider';
import { ThemeProvider } from './components/ThemeProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useProfile } from './lib/firestore';
import './theme/global.css';

// Pages
import DashboardPage from './pages/DashboardPage';
import BillsPage from './pages/BillsPage';
import BillImportPage from './pages/BillImportPage';
import CalendarPage from './pages/CalendarPage';
import SavingsPage from './pages/SavingsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import OnboardingPage from './pages/OnboardingPage';
import SignInPage from './pages/auth/SignInPage';
import SignUpPage from './pages/auth/SignUpPage';

setupIonicReact({ mode: 'ios' });

const AppRoutes: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [timedOut, setTimedOut] = React.useState(false);

  // Safety valve — never show spinner for more than 5 seconds
  React.useEffect(() => {
    if (authLoading || profileLoading) {
      const timer = setTimeout(() => setTimedOut(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [authLoading, profileLoading]);

  const isLoading = !timedOut && (authLoading || (user && profileLoading));

  if (isLoading) {
    return <IonLoading isOpen={true} message="Loading BillEase..." />;
  }

  // Not signed in — show auth screens
  if (!user) {
    return (
      <IonRouterOutlet>
        <Route path="/auth/signin" component={SignInPage} exact />
        <Route path="/auth/signup" component={SignUpPage} exact />
        <Redirect to="/auth/signin" />
      </IonRouterOutlet>
    );
  }

  // Signed in but onboarding not complete — show onboarding
  if (profile && !profile.onboardingComplete) {
    return (
      <IonRouterOutlet>
        <Route path="/onboarding" component={OnboardingPage} exact />
        <Redirect to="/onboarding" />
      </IonRouterOutlet>
    );
  }

  // Fully set up — show main app
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route path="/dashboard" component={DashboardPage} exact />
        <Route path="/bills" component={BillsPage} exact />
        <Route path="/bills/import" component={BillImportPage} exact />
        <Route path="/calendar" component={CalendarPage} exact />
        <Route path="/savings" component={SavingsPage} exact />
        <Route path="/reports" component={ReportsPage} exact />
        <Route path="/settings" component={SettingsPage} exact />
        <Route path="/profile" component={ProfilePage} exact />
        <Route path="/auth/signin" component={SignInPage} exact />
        <Route path="/auth/signup" component={SignUpPage} exact />
        <Redirect exact from="/" to="/dashboard" />
      </IonRouterOutlet>

      <IonTabBar slot="bottom">
        <IonTabButton tab="dashboard" href="/dashboard">
          <IonIcon ios={homeOutline} md={home} />
          <IonLabel>Home</IonLabel>
        </IonTabButton>
        <IonTabButton tab="bills" href="/bills">
          <IonIcon ios={receiptOutline} md={receipt} />
          <IonLabel>Bills</IonLabel>
        </IonTabButton>
        <IonTabButton tab="calendar" href="/calendar">
          <IonIcon ios={calendarOutline} md={calendar} />
          <IonLabel>Calendar</IonLabel>
        </IonTabButton>
        <IonTabButton tab="savings" href="/savings">
          <IonIcon ios={saveOutline} md={save} />
          <IonLabel>Savings</IonLabel>
        </IonTabButton>
        <IonTabButton tab="reports" href="/reports">
          <IonIcon ios={statsChartOutline} md={statsChart} />
          <IonLabel>Reports</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

const App: React.FC = () => (
  <ErrorBoundary>
    <IonApp>
      <ThemeProvider>
        <AuthProvider>
          <IonReactRouter>
            <AppRoutes />
          </IonReactRouter>
        </AuthProvider>
      </ThemeProvider>
    </IonApp>
  </ErrorBoundary>
);

export default App;
