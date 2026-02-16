import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { FamBotWidget } from '../features/chatbot/FamBotWidget';

export function AppLayout() {
    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
            <Sidebar />
            <main className="ml-64 min-h-screen p-8 transition-all duration-300">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
            <FamBotWidget />
        </div>
    );
}
