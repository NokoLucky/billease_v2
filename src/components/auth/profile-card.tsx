
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';
import { getAuth, signOut, updateProfile } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { LogOut, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

const profileSchema = z.object({
    displayName: z.string().min(1, 'Display name is required'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileCard() {
  const { user, refetchUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
        displayName: user?.displayName || '',
    }
  });

  useEffect(() => {
    if(user) {
        form.reset({
            displayName: user.displayName || '',
        })
    }
  }, [user, form]);

  const { isSubmitting } = form.formState;

  const handleSignOut = async () => {
    const auth = getAuth(app);
    await signOut(auth);
    router.push('/auth/signin');
  };

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return;
    const auth = getAuth(app);
    if (!auth.currentUser) return;
    
    try {
        await updateProfile(auth.currentUser, {
            displayName: values.displayName
        });
        await refetchUser(); // Re-fetch user data to update UI
        toast({
            title: 'Success!',
            description: 'Your profile has been updated.',
        });
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'There was a problem updating your profile.',
        });
    }
  }
  
  if (!user) {
    return null;
  }

  return (
    <Card>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardHeader>
                    <div className='flex items-center gap-4'>
                        <Avatar>
                            <AvatarImage src={user.photoURL ?? undefined} />
                            <AvatarFallback>{user.displayName?.[0].toUpperCase() || user.email?.[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle>My Profile</CardTitle>
                            <CardDescription>{user.email}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="displayName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Display Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Your Name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
                <CardFooter className='flex justify-between'>
                    <Button variant="outline" onClick={handleSignOut}>
                        <LogOut className='mr-2' />
                        Sign Out
                    </Button>
                     <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </CardFooter>
            </form>
        </Form>
    </Card>
  );
}
