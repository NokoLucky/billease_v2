
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ReceiptText,
  Calendar,
  PiggyBank,
  BarChart3,
  Settings,
  Wallet,
  LogIn,
  UserPlus,
  User,
  LogOut,
  Moon,
  Sun,
  Monitor,
} from 'lucide-react';
import { getAuth, signOut } from 'firebase/auth';
import { app as firebaseApp } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { useAuth } from './auth-provider';
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from './ui/dropdown-menu';
import { useTheme } from 'next-themes';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/bills', label: 'Bills', icon: ReceiptText },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/savings', label: 'Savings', icon: PiggyBank },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
];

const settingsItem = { href: '/settings', label: 'Settings', icon: Settings };
const profileItem = { href: '/profile', label: 'My Profile', icon: User };

const authItems = [
    { href: '/auth/signin', label: 'Sign In', icon: LogIn },
    { href: '/auth/signup', label: 'Sign Up', icon: UserPlus },
];

export function SideNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { state, setOpenMobile, isMobile } = useSidebar();
  const { user } = useAuth();
  const { setTheme } = useTheme();

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleSignOut = async () => {
    const auth = getAuth(firebaseApp);
    await signOut(auth);
    if(isMobile) setOpenMobile(false);
    router.push('/auth/signin');
  };

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <Wallet className="w-8 h-8 text-primary" />
          <h1
            className={cn(
              'font-bold text-xl transition-opacity duration-200 font-headline',
              state === 'collapsed' && 'opacity-0'
            )}
          >
            BillEase
          </h1>
        </div>
      </SidebarHeader>
      <Separator />
      <SidebarMenu className="flex-1">
        {user && navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              as={Link}
              href={item.href}
              isActive={pathname === item.href}
              tooltip={item.label}
              onClick={handleLinkClick}
              className="text-base h-10 [&>svg]:size-5"
            >
              <item.icon />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
         {!user && authItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              as={Link}
              href={item.href}
              isActive={pathname === item.href}
              tooltip={item.label}
              onClick={handleLinkClick}
              className="text-base h-10 [&>svg]:size-5"
            >
              <item.icon />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <SidebarFooter>
         <Separator className="my-2"/>
         { user ? (
            <div className={cn("p-2", state === 'collapsed' && 'p-0')}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <Button variant="ghost" className={cn("w-full justify-start p-2 h-auto", state === 'collapsed' && 'justify-center w-10 h-10 p-0')}>
                      <div className='flex items-center gap-2'>
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.photoURL ?? undefined} />
                          <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className={cn("flex flex-col items-start transition-opacity duration-200", state === 'collapsed' && 'opacity-0 hidden')}>
                           <span className='font-semibold text-sm'>{user.displayName || user.email}</span>
                           <span className='text-xs text-muted-foreground'>View Options</span>
                        </div>
                      </div>
                   </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mb-2 ml-2" side="top" align="start">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href={profileItem.href} onClick={handleLinkClick}><User className="mr-2 h-4 w-4" /><span>{profileItem.label}</span></Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                         <Link href={settingsItem.href} onClick={handleLinkClick}><Settings className="mr-2 h-4 w-4" /><span>{settingsItem.label}</span></Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                     <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="ml-2">Theme</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem onClick={() => setTheme("light")}>
                                    <Sun className="mr-2 h-4 w-4" />
                                    <span>Light</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("dark")}>
                                    <Moon className="mr-2 h-4 w-4" />
                                    <span>Dark</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("system")}>
                                    <Monitor className="mr-2 h-4 w-4" />
                                    <span>System</span>
                                </DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign Out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
         ) : (
            <div className={cn('p-2', state === 'collapsed' && 'p-0')}>
                {/* Potentially show something for logged out users, or just be empty */}
            </div>
         )}
      </SidebarFooter>
    </>
  );
}
