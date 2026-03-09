import React, { useState } from 'react';
import { IonPage, IonContent, IonButton, IonInput, IonToast, IonIcon } from '@ionic/react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { walletOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { getFriendlyAuthError } from '../../lib/authErrors';

const inputStyle = {
  '--background': 'var(--ion-card-background)',
  '--color': 'var(--ion-text-color)',
  '--placeholder-color': 'var(--ion-color-medium)',
  borderRadius: 10,
  border: '1.5px solid var(--be-border)',
  '--padding-start': '12px',
  '--padding-end': '12px',
} as React.CSSProperties;

const SignInPage: React.FC = () => {
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      history.replace('/dashboard');
    } catch (e: any) {
      setErrorMsg(getFriendlyAuthError(e));
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent style={{ '--background': 'var(--ion-background-color)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%', padding: '40px 24px' }}>

          {/* Logo */}
          <div style={{ marginBottom: 32, textAlign: 'center' }}>
            <div style={{
              width: 72, height: 72, borderRadius: 20,
              background: 'linear-gradient(135deg, var(--be-green-500), var(--be-green-700))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px', boxShadow: '0 8px 32px rgba(34,197,94,0.3)',
            }}>
              <IonIcon icon={walletOutline} style={{ fontSize: 36, color: 'white' }} />
            </div>
            <div style={{ fontWeight: 800, fontSize: 28, color: 'var(--be-green-700)', letterSpacing: '-0.04em' }}>BillEase</div>
            <div style={{ fontSize: 14, color: 'var(--ion-color-medium)', marginTop: 4 }}>Manage your bills with ease</div>
          </div>

          {/* Form card */}
          <div style={{ width: '100%', maxWidth: 360, background: 'var(--ion-card-background)', borderRadius: 20, padding: 24, border: '1px solid var(--be-green-100)', boxShadow: '0 4px 24px rgba(34,197,94,0.08)' }}>
            <h2 style={{ fontWeight: 800, fontSize: 20, color: 'var(--ion-text-color)', margin: '0 0 20px', letterSpacing: '-0.02em' }}>Welcome back</h2>

            {/* Email */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ion-text-color)', marginBottom: 6 }}>Email</div>
              <IonInput type="email" value={email} onIonInput={e => setEmail(e.detail.value ?? '')}
                placeholder="you@example.com" style={inputStyle} />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ion-text-color)', marginBottom: 6 }}>Password</div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <IonInput
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onIonInput={e => setPassword(e.detail.value ?? '')}
                  placeholder="••••••••"
                  onKeyDown={e => e.key === 'Enter' && handleSignIn()}
                  style={{ ...inputStyle, '--padding-end': '44px', flex: 1 }}
                />
                <IonIcon
                  icon={showPassword ? eyeOffOutline : eyeOutline}
                  onClick={() => setShowPassword(p => !p)}
                  style={{
                    position: 'absolute', right: 12,
                    fontSize: 20, color: 'var(--ion-color-medium)', cursor: 'pointer', zIndex: 10,
                  }}
                />
              </div>
            </div>

            <IonButton expand="block" onClick={handleSignIn} disabled={loading || !email || !password}
              style={{ '--background': 'var(--be-green-500)', '--color': '#ffffff', '--border-radius': '12px', fontWeight: 700, height: 50, marginBottom: 16 }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </IonButton>

            <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--ion-color-medium)' }}>
              Don't have an account?{' '}
              <span onClick={() => history.push('/auth/signup')} style={{ color: 'var(--be-green-600)', fontWeight: 700, cursor: 'pointer' }}>
                Sign up
              </span>
            </div>
          </div>
        </div>

        <IonToast isOpen={showToast} message={errorMsg} duration={3000} onDidDismiss={() => setShowToast(false)} position="top" color="danger" />
      </IonContent>
    </IonPage>
  );
};

export default SignInPage;
