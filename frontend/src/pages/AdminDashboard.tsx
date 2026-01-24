import React from 'react';
import { Bell, Plus } from 'lucide-react';
import { AdminSidebar, DashboardStats, TodaySchedule, PopularServices } from '../components/admin';
import { SearchInput, IconButton, Card } from '../components/ui';
import './AdminDashboard.css';

export const AdminDashboard: React.FC = () => {
    return (
        <div className="admin-dashboard">
            <AdminSidebar />

            <main className="admin-main">
                <header className="admin-topbar">
                    <div className="topbar-title">
                        <h1>Overview</h1>
                        <p>Welcome back, here's what's happening today.</p>
                    </div>

                    <div className="topbar-search">
                        <SearchInput placeholder="Search appointments..." />
                    </div>

                    <IconButton icon={Bell} tooltip="Bildirimler" />
                </header>

                <div className="admin-content">
                    <DashboardStats />

                    <div className="dashboard-grid">
                        <TodaySchedule />

                        <div className="dashboard-sidebar-widgets">
                            <PopularServices />

                            <Card className="capacity-card">
                                <div className="capacity-header">Capacity</div>
                                <div className="capacity-bar">
                                    <div className="capacity-fill" style={{ width: '70%' }} />
                                </div>
                                <div className="capacity-label">70% booked today</div>
                            </Card>
                        </div>
                    </div>
                </div>

                <button className="fab-button">
                    <Plus size={20} />
                    NEW APPOINTMENT
                </button>
            </main>
        </div>
    );
};
