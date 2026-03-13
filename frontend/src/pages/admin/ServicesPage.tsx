import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Clock, DollarSign, X } from 'lucide-react';
import { AdminSidebar } from '../../components/admin';
import { Card, SearchInput } from '../../components/ui';
import './ServicesPage.css';
import { useAuth } from '../../contexts';
import { useServices } from '../../hooks';
import { createService, updateService, deleteService } from '../../services/firestore';
import type { Service, ServiceFormData } from '../../types';

const categories = ['Tümü', 'Saç', 'Sakal', 'Bakım', 'Kombo', 'Diğer'];

export const ServicesPage: React.FC = () => {
    const { user } = useAuth();
    const businessId = user?.businessId;
    const { data: services, loading, refetch: refresh } = useServices(businessId);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tümü');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form definition local type helps with form state but we map to ServiceFormData on submit
    const [formData, setFormData] = useState({
        name: '',
        duration: 30,
        price: 0,
        category: 'Saç',
        description: '',
        isActive: true,
    });

    const filteredServices = (services || []).filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (service.description || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Tümü' || (service.category || 'Diğer') === selectedCategory;
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
        setFormData({
            name: service.name,
            duration: service.durationMinutes,
            price: service.price,
            category: service.category || 'Saç',
            description: service.description || '',
            isActive: service.isActive,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingService(null);
    };

    const handleSave = async () => {
        if (!formData.name || !businessId) return;

        try {
            setIsSubmitting(true);
            const serviceData: ServiceFormData = {
                name: formData.name,
                durationMinutes: formData.duration,
                price: formData.price,
                category: formData.category,
                description: formData.description,
                isActive: formData.isActive,
            };

            if (editingService) {
                await updateService(editingService.id, serviceData);
            } else {
                await createService(businessId, serviceData);
            }
            refresh(); // Refresh list
            closeModal();
        } catch (error) {
            console.error('Error saving service:', error);
            alert('Hizmet kaydedilirken bir hata oluştu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Bu hizmeti silmek istediğinizden emin misiniz?')) {
            try {
                await deleteService(id);
                refresh();
            } catch (error) {
                console.error('Error deleting service:', error);
                alert('Hizmet silinirken bir hata oluştu.');
            }
        }
    };

    const toggleActive = async (service: Service) => {
        try {
            await updateService(service.id, { isActive: !service.isActive });
            refresh();
        } catch (error) {
            console.error('Error toggling service status:', error);
        }
    };

    if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;
    // if (error) return <div className="p-8 text-center text-red-500">Hata: {error.message}</div>;

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
                                    <div className="service-category-badge">{service.category || 'Genel'}</div>
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
                                        <span>{service.durationMinutes} dk</span>
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
                                            onChange={() => toggleActive(service)}
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
                            <button className="btn-secondary" onClick={closeModal} disabled={isSubmitting}>İptal</button>
                            <button className="btn-primary" onClick={handleSave} disabled={isSubmitting}>
                                {isSubmitting ? 'Kaydediliyor...' : (editingService ? 'Güncelle' : 'Ekle')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
