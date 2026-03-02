import React, { useState } from 'react';
import { Phone, Mail, Calendar, Eye, X } from 'lucide-react';
import { AdminSidebar } from '../../components/admin';
import { Card, SearchInput } from '../../components/ui';
import './ClientsPage.css';
import { useAuth } from '../../contexts/AuthContext';
import { useCustomers } from '../../hooks';
import type { Customer } from '../../types';

export const ClientsPage: React.FC = () => {
    const { user } = useAuth();
    const { data: clients, loading } = useCustomers(user?.businessId);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState<Customer | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [sortBy, setSortBy] = useState<'name' | 'visits' | 'spent' | 'lastVisit'>('lastVisit');

    const filteredClients = (clients || [])
        .filter(client =>
            client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.phone.includes(searchTerm) ||
            (client.email || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            switch (sortBy) {
                case 'name': return a.name.localeCompare(b.name);
                case 'visits': return b.totalAppointments - a.totalAppointments;
                case 'spent': return b.totalSpent - a.totalSpent;
                case 'lastVisit':
                    const dateA = a.lastVisit ? a.lastVisit.toMillis() : 0;
                    const dateB = b.lastVisit ? b.lastVisit.toMillis() : 0;
                    return dateB - dateA;
                default: return 0;
            }
        });

    const openDetailModal = (client: Customer) => {
        setSelectedClient(client);
        setIsDetailModalOpen(true);
    };

    const closeDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedClient(null);
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '-';
        return timestamp.toDate().toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getVisitBadge = (visits: number) => {
        if (visits >= 20) return { class: 'gold', label: 'VIP' };
        if (visits >= 10) return { class: 'silver', label: 'Sadık' };
        return { class: 'bronze', label: 'Yeni' };
    };

    if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;

    const totalSpent = (clients || []).reduce((sum, c) => sum + c.totalSpent, 0);
    const activeClientsCount = (clients || []).filter(c => {
        if (!c.lastVisit) return false;
        const lastVisitDate = c.lastVisit.toDate();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return lastVisitDate >= thirtyDaysAgo;
    }).length;

    return (
        <div className="admin-dashboard">
            <AdminSidebar />

            <main className="admin-main">
                <header className="admin-topbar">
                    <div className="topbar-title">
                        <h1>Müşteriler</h1>
                        <p>Müşteri bilgilerini ve geçmişlerini görüntüleyin</p>
                    </div>

                    <div className="topbar-search">
                        <SearchInput
                            placeholder="Müşteri ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </header>

                <div className="admin-content">
                    {/* Stats Summary */}
                    <div className="clients-stats">
                        <div className="client-stat-card">
                            <div className="stat-value">{clients?.length || 0}</div>
                            <div className="stat-label">Toplam Müşteri</div>
                        </div>
                        <div className="client-stat-card">
                            <div className="stat-value">{activeClientsCount}</div>
                            <div className="stat-label">Son 30 Gün Aktif</div>
                        </div>
                        <div className="client-stat-card">
                            <div className="stat-value">
                                ₺{totalSpent.toLocaleString()}
                            </div>
                            <div className="stat-label">Toplam Gelir</div>
                        </div>
                    </div>

                    {/* Sort Options */}
                    <div className="sort-options">
                        <span>Sırala:</span>
                        <button
                            className={sortBy === 'lastVisit' ? 'active' : ''}
                            onClick={() => setSortBy('lastVisit')}
                        >
                            Son Ziyaret
                        </button>
                        <button
                            className={sortBy === 'visits' ? 'active' : ''}
                            onClick={() => setSortBy('visits')}
                        >
                            Ziyaret Sayısı
                        </button>
                        <button
                            className={sortBy === 'spent' ? 'active' : ''}
                            onClick={() => setSortBy('spent')}
                        >
                            Harcama
                        </button>
                        <button
                            className={sortBy === 'name' ? 'active' : ''}
                            onClick={() => setSortBy('name')}
                        >
                            İsim
                        </button>
                    </div>

                    {/* Clients Table */}
                    <Card className="clients-table-card">
                        <table className="clients-table">
                            <thead>
                                <tr>
                                    <th>Müşteri</th>
                                    <th>İletişim</th>
                                    <th>Ziyaret</th>
                                    <th>Harcama</th>
                                    <th>Son Ziyaret</th>
                                    <th>Durum</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClients.map(client => {
                                    const badge = getVisitBadge(client.totalAppointments);
                                    return (
                                        <tr key={client.id}>
                                            <td>
                                                <div className="client-info">
                                                    <div className="client-avatar">{getInitials(client.name)}</div>
                                                    <div>
                                                        <div className="client-name">{client.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="client-contact">
                                                    <div><Phone size={12} /> {client.phone}</div>
                                                    {client.email && <div><Mail size={12} /> {client.email}</div>}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="visit-count">{client.totalAppointments}</span>
                                            </td>
                                            <td>
                                                <span className="spent-amount">₺{client.totalSpent.toLocaleString()}</span>
                                            </td>
                                            <td>
                                                <div className="last-visit">
                                                    <Calendar size={12} />
                                                    {formatDate(client.lastVisit)}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`client-badge ${badge.class}`}>
                                                    {badge.label}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="table-actions">
                                                    <button
                                                        className="action-btn view"
                                                        onClick={() => openDetailModal(client)}
                                                        title="Detay"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredClients.length === 0 && (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                                            Müşteri bulunamadı.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </Card>
                </div>
            </main>

            {/* Detail Modal */}
            {isDetailModalOpen && selectedClient && (
                <div className="modal-overlay" onClick={closeDetailModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Müşteri Detayları</h2>
                            <button className="modal-close" onClick={closeDetailModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="client-detail-header">
                                <div className="client-avatar large">{getInitials(selectedClient.name)}</div>
                                <div className="client-detail-info">
                                    <h3>{selectedClient.name}</h3>
                                </div>
                            </div>

                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>Telefon</label>
                                    <span>{selectedClient.phone}</span>
                                </div>
                                <div className="detail-item">
                                    <label>E-posta</label>
                                    <span>{selectedClient.email || '-'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Toplam Ziyaret</label>
                                    <span>{selectedClient.totalAppointments} kez</span>
                                </div>
                                <div className="detail-item">
                                    <label>Toplam Harcama</label>
                                    <span>₺{selectedClient.totalSpent.toLocaleString()}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Son Ziyaret</label>
                                    <span>{formatDate(selectedClient.lastVisit)}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Müşteri Olduğu Tarih</label>
                                    <span>{formatDate(selectedClient.createdAt)}</span>
                                </div>
                            </div>

                            {selectedClient.notes && (
                                <div className="detail-notes">
                                    <label>Notlar</label>
                                    <p>{selectedClient.notes}</p>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={closeDetailModal}>Kapat</button>
                            {/* Future: Add 'Create Appointment' button that navigates to Booking page with this client pre-selected? */}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
