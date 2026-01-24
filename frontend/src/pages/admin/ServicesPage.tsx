import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Clock, DollarSign, X } from 'lucide-react';
import { AdminSidebar } from '../../components/admin';
import { Card, SearchInput } from '../../components/ui';
import './ServicesPage.css';

interface Service {
    id: string;
    name: string;
    duration: number; // minutes
    price: number;
    category: string;
    description: string;
    isActive: boolean;
}

const initialServices: Service[] = [
    { id: '1', name: 'Saç Kesimi', duration: 30, price: 150, category: 'Saç', description: 'Klasik erkek saç kesimi', isActive: true },
    { id: '2', name: 'Sakal Düzeltme', duration: 20, price: 80, category: 'Sakal', description: 'Sakal şekillendirme ve düzeltme', isActive: true },
    { id: '3', name: 'Saç + Sakal', duration: 45, price: 200, category: 'Kombo', description: 'Saç kesimi ve sakal düzeltme paketi', isActive: true },
    { id: '4', name: 'Cilt Bakımı', duration: 40, price: 250, category: 'Bakım', description: 'Yüz maskesi ve cilt bakımı', isActive: true },
    { id: '5', name: 'Boya', duration: 60, price: 350, category: 'Saç', description: 'Saç boyama işlemi', isActive: false },
    { id: '6', name: 'Saç Yıkama', duration: 15, price: 50, category: 'Saç', description: 'Masajlı saç yıkama', isActive: true },
];

const categories = ['Tümü', 'Saç', 'Sakal', 'Bakım', 'Kombo'];

export const ServicesPage: React.FC = () => {
    const [services, setServices] = useState<Service[]>(initialServices);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tümü');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [formData, setFormData] = useState<Partial<Service>>({
        name: '',
        duration: 30,
        price: 0,
        category: 'Saç',
        description: '',
        isActive: true,
    });

    const filteredServices = services.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Tümü' || service.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const openAddModal = () => {
        setEditingService(null);
        setFormData({
            name: '',
            duration: 30,
            price: 0,
            category: 'Saç',
            description: '',
            isActive: true,
        });
        setIsModalOpen(true);
    };

    const openEditModal = (service: Service) => {
        setEditingService(service);
        setFormData(service);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingService(null);
    };

    const handleSave = () => {
        if (!formData.name || !formData.price) return;

        if (editingService) {
            setServices(services.map(s =>
                s.id === editingService.id ? { ...s, ...formData } as Service : s
            ));
        } else {
            const newService: Service = {
                id: Date.now().toString(),
                name: formData.name || '',
                duration: formData.duration || 30,
                price: formData.price || 0,
                category: formData.category || 'Saç',
                description: formData.description || '',
                isActive: formData.isActive ?? true,
            };
            setServices([...services, newService]);
        }
        closeModal();
    };

    const handleDelete = (id: string) => {
        if (confirm('Bu hizmeti silmek istediğinizden emin misiniz?')) {
            setServices(services.filter(s => s.id !== id));
        }
    };

    const toggleActive = (id: string) => {
        setServices(services.map(s =>
            s.id === id ? { ...s, isActive: !s.isActive } : s
        ));
    };

    return (
        <div className="admin-dashboard">
            <AdminSidebar />

            <main className="admin-main">
                <header className="admin-topbar">
                    <div className="topbar-title">
                        <h1>Hizmetler</h1>
                        <p>İşletmenizde sunduğunuz hizmetleri yönetin</p>
                    </div>

                    <div className="topbar-search">
                        <SearchInput
                            placeholder="Hizmet ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button className="add-service-btn" onClick={openAddModal}>
                        <Plus size={18} />
                        Yeni Hizmet
                    </button>
                </header>

                <div className="admin-content">
                    {/* Category Filters */}
                    <div className="category-filters">
                        {categories.map(category => (
                            <button
                                key={category}
                                className={`category-chip ${selectedCategory === category ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Services Grid */}
                    <div className="services-grid">
                        {filteredServices.map(service => (
                            <Card key={service.id} className={`service-card ${!service.isActive ? 'inactive' : ''}`}>
                                <div className="service-header">
                                    <div className="service-category-badge">{service.category}</div>
                                    <div className="service-actions">
                                        <button
                                            className="service-action-btn edit"
                                            onClick={() => openEditModal(service)}
                                            title="Düzenle"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            className="service-action-btn delete"
                                            onClick={() => handleDelete(service.id)}
                                            title="Sil"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="service-name">{service.name}</h3>
                                <p className="service-description">{service.description}</p>

                                <div className="service-details">
                                    <div className="service-detail">
                                        <Clock size={14} />
                                        <span>{service.duration} dk</span>
                                    </div>
                                    <div className="service-detail price">
                                        <DollarSign size={14} />
                                        <span>₺{service.price}</span>
                                    </div>
                                </div>

                                <div className="service-footer">
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={service.isActive}
                                            onChange={() => toggleActive(service.id)}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                    <span className="toggle-label">
                                        {service.isActive ? 'Aktif' : 'Pasif'}
                                    </span>
                                </div>
                            </Card>
                        ))}

                        {/* Add New Service Card */}
                        <Card className="service-card add-card" onClick={openAddModal}>
                            <div className="add-card-content">
                                <Plus size={32} />
                                <span>Yeni Hizmet Ekle</span>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingService ? 'Hizmeti Düzenle' : 'Yeni Hizmet Ekle'}</h2>
                            <button className="modal-close" onClick={closeModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label>Hizmet Adı</label>
                                <input
                                    type="text"
                                    value={formData.name || ''}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Örn: Saç Kesimi"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Süre (dakika)</label>
                                    <input
                                        type="number"
                                        value={formData.duration || 30}
                                        onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                        min="5"
                                        step="5"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Fiyat (₺)</label>
                                    <input
                                        type="number"
                                        value={formData.price || 0}
                                        onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) })}
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Kategori</label>
                                <select
                                    value={formData.category || 'Saç'}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {categories.filter(c => c !== 'Tümü').map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Açıklama</label>
                                <textarea
                                    value={formData.description || ''}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Hizmet açıklaması..."
                                    rows={3}
                                />
                            </div>

                            <div className="form-group checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive ?? true}
                                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                    />
                                    <span>Hizmet aktif</span>
                                </label>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={closeModal}>İptal</button>
                            <button className="btn-primary" onClick={handleSave}>
                                {editingService ? 'Güncelle' : 'Ekle'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
