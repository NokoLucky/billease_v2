
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token } from '@capacitor/push-notifications';
import { updateUserProfile, getUserProfile } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';

const AuthContext = createContext<{ user: User | null; loading: boolean; refetchUser: () => Promise<void> }>({ user: null, loading: true, refetchUser: async () => {} });

const AUTH_ROUTES = ['/auth/signin', '/auth/signup'];
const PUBLIC_ROUTES = [...AUTH_ROUTES]; // Add any other public routes here

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();
    const router = useRouter();
    const { toast } = useToast();

    const refetchUser = useCallback(async () => {
        await auth.currentUser?.reload();
        const freshUser = auth.currentUser;
        setUser(freshUser);
    }, []);

    // Function to register for push notifications
    const registerForPushNotifications = useCallback(async (currentUser: User) => {
        if (!Capacitor.isNativePlatform()) {
            console.log('Push notifications only available on native platforms.');
            return;
        }

        try {
            await PushNotifications.removeAllListeners();

            await PushNotifications.addListener('registration', async (token: Token) => {
                console.log('Push registration success, token:', token.value);
                try {
                    const profile = await getUserProfile(currentUser.uid);
                    const currentTokens = profile.fcmTokens || [];
                    if (!currentTokens.includes(token.value)) {
                        await updateUserProfile(currentUser.uid, { fcmTokens: [...currentTokens, token.value] });
                        console.log('FCM token saved successfully');
                    }
                } catch (e) {
                     console.error('Error saving FCM token:', e);
                }
            });

            await PushNotifications.addListener('registrationError', (error: any) => {
                console.error('Error on registration:', error);
                toast({ variant: 'destructive', title: 'Push Notification Error', description: `Could not register for notifications: ${error.error}` });
            });
            
            let permStatus = await PushNotifications.checkPermissions();
            if (permStatus.receive === 'prompt') {
                permStatus = await PushNotifications.requestPermissions();
            }
            
            if (permStatus.receive !== 'granted') {
                toast({ variant: 'default', title: 'Notifications Disabled', description: 'You can enable notifications in your device settings.' });
                return;
            }

            await PushNotifications.register();
        } catch(e) {
            console.error('Error in push notification setup', e);
            toast({ variant: 'destructive', title: 'Push Notification Error', description: 'An unexpected error occurred during setup.' });
        }
    }, [toast]);
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
            if (user) {
               // registerForPushNotifications(user);
            }
        });

        return () => unsubscribe();
    }, [registerForPushNotifications]);

    useEffect(() => {
        if (loading) return;

        const isAuthRoute = AUTH_ROUTES.includes(pathname);
        const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

        if (!user && !isPublicRoute) {
            router.push('/auth/signin');
        } else if (user && isAuthRoute) {
            router.push('/');
        }

    }, [user, loading, pathname, router]);


    if (loading || (!user && !PUBLIC_ROUTES.includes(pathname))) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <AuthContext.Provider value={{ user, loading, refetchUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
