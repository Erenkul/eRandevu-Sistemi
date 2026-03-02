import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Phone, Mail, X } from 'lucide-react';
import { AdminSidebar } from '../../components/admin';
import { Card, SearchInput } from '../../components/ui';
import './StaffPage.css';
import { useAuth } from '../../contexts';
import { useStaff } from '../../hooks';
import { createStaff, updateStaff, deleteStaff } from '../../services/firestore';
import type { Staff, StaffFormData } from '../../types';

export const StaffPage: React.FC = () => {
    const { user } = useAuth();
    const { data: staffList, loading, refetch } = useStaff(user?.businessId);

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState<StaffFormData>({
        name: '',
        role: 'barber',
        phone: '',
        email: '',
        serviceIds: [],
    });

    const filteredStaff = (staffList || []).filter(staff =>
        staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openAddModal = () => {
        setEditingStaff(null);
        setFormData({
            name: '',
            role: 'barber',
            phone: '',
            email: '',
            serviceIds: [],
        });
        setIsModalOpen(true);
    };

    const openEditModal = (staff: Staff) => {
        setEditingStaff(staff);
        setFormData({
            name: staff.name,
            role: staff.role,
            phone: staff.phone || '',
            email: staff.email || '',
            serviceIds: staff.serviceIds || [],
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingStaff(null);
    };

    const handleSave = async () => {
        if (!formData.name || !user?.businessId) return;

        try {
            setIsSubmitting(true);

            if (editingStaff) {
                await updateStaff(editingStaff.id, formData);
            } else {
                await createStaff(user.businessId, formData);
            }

            refetch();
            closeModal();
        } catch (error) {
            console.error('Error saving staff:', error);
            alert('Personel kaydedilirken bir hata oluştu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu personeli silmek istediğinizden emin misiniz?')) return;

        try {
            await deleteStaff(id);
            refetch();
        } catch (error) {
            console.error('Error deleting staff:', error);
            alert('Personel silinirken bir hata oluştu.');
        }
    };

    // Helper constants
    const roles = [
        { value: 'owner', label: 'İşletme Sahibi' },
        { value: 'barber', label: 'Berber' },
        { value: 'assistant', label: 'Çırak' },
    ];

    // Helper to get initials
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="admin-dashboard">
            <AdminSidebar />

            <main className="admin-main">
                <header className="admin-topbar">
                    <div className="topbar-title">
                        <h1>Personel</h1>
                        <p>Ekibinizi yönetin</p>
                    </div>

                    <div className="topbar-search">
                        <SearchInput
                            placeholder="Personel ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button className="add-staff-btn" onClick={openAddModal}>
                        <Plus size={18} />
                        Yeni Personel
                    </button>
                </header>

                <div className="admin-content">
                    {loading ? (
                        <div>Yükleniyor...</div>
                    ) : (
                        <div className="staff-grid">
                            {filteredStaff.map(staff => (
                                <Card key={staff.id} className={`staff-card ${!staff.isActive ? 'inactive' : ''}`}>
                                    <div className="staff-header">
                                        <div className={`staff-avatar ${!staff.isActive ? 'inactive' : ''}`}>
                                            {staff.avatarUrl ? (
                                                <img src={staff.avatarUrl} alt={staff.name} />
                                            ) : (
                                                getInitials(staff.name)
                                            )}
                                        </div>
                                        <div className="staff-actions">
                                            <button
                                                className="staff-action-btn edit"
                                                onClick={() => openEditModal(staff)}
                                                title="Düzenle"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                className="staff-action-btn delete"
                                                onClick={() => handleDelete(staff.id)}
                                                title="Sil"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="staff-info">
                                        <h3 className="staff-name">{staff.name}</h3>
                                        <div className="staff-role">
                                            {roles.find(r => r.value === staff.role)?.label || staff.role}
                                        </div>
                                    </div>

                                    <div className="staff-contact">
                                        <div className="contact-item">
                                            <Phone size={14} />
                                            <span>{staff.phone || '-'}</span>
                                        </div>
                                        <div className="contact-item">
                                            <Mail size={14} />
                                            <span>{staff.email || '-'}</span>
                                        </div>
                                    </div>

                                    <div className="staff-status">
                                        <span className={`status-badge ${staff.isActive ? 'active' : 'inactive'}`}>
                                            {staff.isActive ? 'Aktif' : 'Pasif'}
                                        </span>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingStaff ? 'Personeli Düzenle' : 'Yeni Personel Ekle'}</h2>
                            <button className="modal-close" onClick={closeModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label>Ad Soyad</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Örn: Ahmet Yılmaz"
                                />
                            </div>

                            <div className="form-group">
                                <label>Pozisyon</label>
                                <select
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                                >
                                    {roles.map(role => (
                                        <option key={role.value} value={role.value}>{role.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Telefon</label>
                                <input
                                    type="tel"
                                    value={formData.phone || ''}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+90 5XX XXX XX XX"
                                />
                            </div>

                            <div className="form-group">
                                <label>E-posta</label>
                                <input
                                    type="email"
                                    value={formData.email || ''}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="ornek@email.com"
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={closeModal} disabled={isSubmitting}>
                                İptal
                            </button>
                            <button className="btn-primary" onClick={handleSave} disabled={isSubmitting}>
                                {isSubmitting ? 'Kaydediliyor...' : (editingStaff ? 'Güncelle' : 'Ekle')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
