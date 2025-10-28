import { SettingsForm } from "@/components/settings-form";
import { PageHeader } from "@/components/page-header";

export default function SettingsPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <PageHeader title="Settings" />
            <main className="flex-1 py-8 px-4 md:px-8 max-w-2xl">
                <SettingsForm />
            </main>
        </div>
    );
}
