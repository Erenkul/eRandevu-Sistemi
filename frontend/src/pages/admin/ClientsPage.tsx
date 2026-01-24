import React, { useState } from 'react';
import { Phone, Mail, Calendar, Star, Eye, Trash2, X } from 'lucide-react';
import { AdminSidebar } from '../../components/admin';
import { Card, SearchInput } from '../../components/ui';
import './ClientsPage.css';

interface Client {
    id: string;
    name: string;
    phone: string;
    email: string;
    avatar: string;
    totalVisits: number;
    totalSpent: number;
    lastVisit: string;
    favoriteService: string;
    rating: number;
    notes: string;
    createdAt: string;
}

const initialClients: Client[] = [
    {
        id: '1',
        name: 'Ahmet Yılmaz',
        phone: '+90 555 111 2233',
        email: 'ahmet@example.com',
        avatar: 'AY',
        totalVisits: 24,
        totalSpent: 3600,
        lastVisit: '2026-01-20',
        favoriteService: 'Saç Kesimi',
        rating: 5,
        notes: 'VIP müşteri, her zaman saç kesimi + sakal',
        createdAt: '2024-03-15'
    },
    {
        id: '2',
        name: 'Burak Demir',
        phone: '+90 555 222 3344',
        email: 'burak@example.com',
        avatar: 'BD',
        totalVisits: 18,
        totalSpent: 2700,
        lastVisit: '2026-01-18',
        favoriteService: 'Saç + Sakal',
        rating: 4,
        notes: 'Genelde hafta sonları gelir',
        createdAt: '2024-06-20'
    },
    {
        id: '3',
        name: 'Can Özkan',
        phone: '+90 555 333 4455',
        email: 'can@example.com',
        avatar: 'CO',
        totalVisits: 12,
        totalSpent: 1800,
        lastVisit: '2026-01-15',
        favoriteService: 'Cilt Bakımı',
        rating: 5,
        notes: '',
        createdAt: '2024-08-10'
    },
    {
        id: '4',
        name: 'Deniz Kaya',
        phone: '+90 555 444 5566',
        email: 'deniz@example.com',
        avatar: 'DK',
        totalVisits: 8,
        totalSpent: 1200,
        lastVisit: '2026-01-10',
        favoriteService: 'Sakal Düzeltme',
        rating: 4,
        notes: 'Hassas cilt, dikkat edilmeli',
        createdAt: '2024-09-05'
    },
    {
        id: '5',
        name: 'Emre Şahin',
        phone: '+90 555 555 6677',
        email: 'emre@example.com',
        avatar: 'EŞ',
        totalVisits: 32,
        totalSpent: 4800,
        lastVisit: '2026-01-22',
        favoriteService: 'Saç Kesimi',
        rating: 5,
        notes: 'En sadık müşterimiz',
        createdAt: '2023-12-01'
    },
];

export const ClientsPage: React.FC = () => {
    const [clients, setClients] = useState<Client[]>(initialClients);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [sortBy, setSortBy] = useState<'name' | 'visits' | 'spent' | 'lastVisit'>('lastVisit');

    const filteredClients = clients
        .filter(client =>
            client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.phone.includes(searchTerm) ||
            client.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            switch (sortBy) {
                case 'name': return a.name.localeCompare(b.name);
                case 'visits': return b.totalVisits - a.totalVisits;
                case 'spent': return b.totalSpent - a.totalSpent;
                case 'lastVisit': return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
                default: return 0;
            }
        });

    const openDetailModal = (client: Client) => {
        setSelectedClient(client);
        setIsDetailModalOpen(true);
    };

    const closeDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedClient(null);
    };

    const handleDelete = (id: string) => {
        if (confirm('Bu müşteriyi silmek istediğinizden emin misiniz?')) {
            setClients(clients.filter(c => c.id !== id));
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getVisitBadge = (visits: number) => {
        if (visits >= 20) return { class: 'gold', label: 'VIP' };
        if (visits >= 10) return { class: 'silver', label: 'Sadık' };
        return { class: 'bronze', label: 'Yeni' };
    };

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
                            <div className="stat-value">{clients.length}</div>
                            <div className="stat-label">Toplam Müşteri</div>
                        </div>
                        <div className="client-stat-card">
                            <div className="stat-value">
                                {clients.filter(c => {
                                    const lastVisit = new Date(c.lastVisit);
                                    const thirtyDaysAgo = new Date();
                                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                                    return lastVisit >= thirtyDaysAgo;
                                }).length}
                            </div>
                            <div className="stat-label">Son 30 Gün Aktif</div>
                        </div>
                        <div className="client-stat-card">
                            <div className="stat-value">
                                ₺{clients.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}
                            </div>
                            <div className="stat-label">Toplam Gelir</div>
                        </div>
                        <div className="client-stat-card">
                            <div className="stat-value">
                                {(clients.reduce((sum, c) => sum + c.rating, 0) / clients.length).toFixed(1)}
                            </div>
                            <div className="stat-label">Ort. Memnuniyet</div>
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
                                    const badge = getVisitBadge(client.totalVisits);
                                    return (
                                        <tr key={client.id}>
                                            <td>
                                                <div className="client-info">
                                                    <div className="client-avatar">{client.avatar}</div>
                                                    <div>
                                                        <div className="client-name">{client.name}</div>
                                                        <div className="client-favorite">{client.favoriteService}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="client-contact">
                                                    <div><Phone size={12} /> {client.phone}</div>
                                                    <div><Mail size={12} /> {client.email}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="visit-count">{client.totalVisits}</span>
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
                                                    <button
                                                        className="action-btn delete"
                                                        onClick={() => handleDelete(client.id)}
                                                        title="Sil"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
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
                                <div className="client-avatar large">{selectedClient.avatar}</div>
                                <div className="client-detail-info">
                                    <h3>{selectedClient.name}</h3>
                                    <div className="client-rating">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={16}
                                                fill={i < selectedClient.rating ? '#fbbf24' : 'none'}
                                                color={i < selectedClient.rating ? '#fbbf24' : '#e5e7eb'}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>Telefon</label>
                                    <span>{selectedClient.phone}</span>
                                </div>
                                <div className="detail-item">
                                    <label>E-posta</label>
                                    <span>{selectedClient.email}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Toplam Ziyaret</label>
                                    <span>{selectedClient.totalVisits} kez</span>
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
                                <div className="detail-item">
                                    <label>Favori Hizmet</label>
                                    <span>{selectedClient.favoriteService}</span>
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
                            <button className="btn-primary">Randevu Oluştur</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
