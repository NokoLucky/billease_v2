
import { ProfileCard } from "@/components/auth/profile-card";
import { PageHeader } from "@/components/page-header";

export default function ProfilePage() {
    return (
        <div className="flex flex-col min-h-screen">
            <PageHeader title="My Profile" />
            <main className="flex-1 py-8 px-4 md:px-8 max-w-2xl">
                <ProfileCard />
            </main>
        </div>
    );
}
