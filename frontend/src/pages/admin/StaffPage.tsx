import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Phone, Mail, Calendar, Star, X, Clock } from 'lucide-react';
import { AdminSidebar } from '../../components/admin';
import { Card, SearchInput } from '../../components/ui';
import './StaffPage.css';

interface Staff {
    id: string;
    name: string;
    role: string;
    phone: string;
    email: string;
    avatar: string;
    rating: number;
    totalAppointments: number;
    workingDays: string[];
    workingHours: { start: string; end: string };
    isActive: boolean;
    specialties: string[];
}

const initialStaff: Staff[] = [
    {
        id: '1',
        name: 'Mehmet Usta',
        role: 'Kıdemli Berber',
        phone: '+90 555 123 4567',
        email: 'mehmet@example.com',
        avatar: 'MU',
        rating: 4.9,
        totalAppointments: 1250,
        workingDays: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'],
        workingHours: { start: '09:00', end: '19:00' },
        isActive: true,
        specialties: ['Saç Kesimi', 'Sakal Düzeltme', 'Cilt Bakımı']
    },
    {
        id: '2',
        name: 'Ali Usta',
        role: 'Berber',
        phone: '+90 555 234 5678',
        email: 'ali@example.com',
        avatar: 'AU',
        rating: 4.7,
        totalAppointments: 890,
        workingDays: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
        workingHours: { start: '10:00', end: '20:00' },
        isActive: true,
        specialties: ['Saç Kesimi', 'Boya']
    },
    {
        id: '3',
        name: 'Ahmet Kalfa',
        role: 'Çırak',
        phone: '+90 555 345 6789',
        email: 'ahmet@example.com',
        avatar: 'AK',
        rating: 4.5,
        totalAppointments: 320,
        workingDays: ['Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
        workingHours: { start: '11:00', end: '19:00' },
        isActive: true,
        specialties: ['Saç Yıkama', 'Sakal Düzeltme']
    },
    {
        id: '4',
        name: 'Can Usta',
        role: 'Berber',
        phone: '+90 555 456 7890',
        email: 'can@example.com',
        avatar: 'CU',
        rating: 4.6,
        totalAppointments: 560,
        workingDays: ['Pazartesi', 'Çarşamba', 'Cuma', 'Cumartesi', 'Pazar'],
        workingHours: { start: '09:00', end: '18:00' },
        isActive: false,
        specialties: ['Saç Kesimi', 'Saç + Sakal']
    },
];

const allDays = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const roles = ['Kıdemli Berber', 'Berber', 'Çırak', 'Stajyer'];

export const StaffPage: React.FC = () => {
    const [staffList, setStaffList] = useState<Staff[]>(initialStaff);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [formData, setFormData] = useState<Partial<Staff>>({
        name: '',
        role: 'Berber',
        phone: '',
        email: '',
        workingDays: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'],
        workingHours: { start: '09:00', end: '18:00' },
        isActive: true,
        specialties: [],
    });

    const filteredStaff = staffList.filter(staff =>
        staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openAddModal = () => {
        setEditingStaff(null);
        setFormData({
            name: '',
            role: 'Berber',
            phone: '',
            email: '',
            workingDays: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'],
            workingHours: { start: '09:00', end: '18:00' },
            isActive: true,
            specialties: [],
        });
        setIsModalOpen(true);
    };

    const openEditModal = (staff: Staff) => {
        setEditingStaff(staff);
        setFormData(staff);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingStaff(null);
    };

    const handleSave = () => {
        if (!formData.name || !formData.phone) return;

        if (editingStaff) {
            setStaffList(staffList.map(s =>
                s.id === editingStaff.id ? { ...s, ...formData } as Staff : s
            ));
        } else {
            const newStaff: Staff = {
                id: Date.now().toString(),
                name: formData.name || '',
                role: formData.role || 'Berber',
                phone: formData.phone || '',
                email: formData.email || '',
                avatar: formData.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'XX',
                rating: 5.0,
                totalAppointments: 0,
                workingDays: formData.workingDays || [],
                workingHours: formData.workingHours || { start: '09:00', end: '18:00' },
                isActive: formData.isActive ?? true,
                specialties: formData.specialties || [],
            };
            setStaffList([...staffList, newStaff]);
        }
        closeModal();
    };

    const handleDelete = (id: string) => {
        if (confirm('Bu personeli silmek istediğinizden emin misiniz?')) {
            setStaffList(staffList.filter(s => s.id !== id));
        }
    };

    const toggleDay = (day: string) => {
        const currentDays = formData.workingDays || [];
        if (currentDays.includes(day)) {
            setFormData({ ...formData, workingDays: currentDays.filter(d => d !== day) });
        } else {
            setFormData({ ...formData, workingDays: [...currentDays, day] });
        }
    };

    return (
        <div className="admin-dashboard">
            <AdminSidebar />

            <main className="admin-main">
                <header className="admin-topbar">
                    <div className="topbar-title">
                        <h1>Personel</h1>
                        <p>Ekibinizi ve çalışma saatlerini yönetin</p>
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
                    {/* Staff Stats */}
                    <div className="staff-stats">
                        <div className="staff-stat-card">
                            <div className="stat-value">{staffList.length}</div>
                            <div className="stat-label">Toplam Personel</div>
                        </div>
                        <div className="staff-stat-card">
                            <div className="stat-value">{staffList.filter(s => s.isActive).length}</div>
                            <div className="stat-label">Aktif</div>
                        </div>
                        <div className="staff-stat-card">
                            <div className="stat-value">
                                {(staffList.reduce((sum, s) => sum + s.rating, 0) / staffList.length).toFixed(1)}
                            </div>
                            <div className="stat-label">Ort. Puan</div>
                        </div>
                        <div className="staff-stat-card">
                            <div className="stat-value">
                                {staffList.reduce((sum, s) => sum + s.totalAppointments, 0)}
                            </div>
                            <div className="stat-label">Toplam Randevu</div>
                        </div>
                    </div>

                    {/* Staff Grid */}
                    <div className="staff-grid">
                        {filteredStaff.map(staff => (
                            <Card key={staff.id} className={`staff-card ${!staff.isActive ? 'inactive' : ''}`}>
                                <div className="staff-header">
                                    <div className={`staff-avatar ${!staff.isActive ? 'inactive' : ''}`}>
                                        {staff.avatar}
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
                                    <div className="staff-role">{staff.role}</div>
                                </div>

                                <div className="staff-rating">
                                    <Star size={14} fill="#fbbf24" color="#fbbf24" />
                                    <span>{staff.rating}</span>
                                    <span className="rating-count">({staff.totalAppointments} randevu)</span>
                                </div>

                                <div className="staff-contact">
                                    <div className="contact-item">
                                        <Phone size={14} />
                                        <span>{staff.phone}</span>
                                    </div>
                                    <div className="contact-item">
                                        <Mail size={14} />
                                        <span>{staff.email}</span>
                                    </div>
                                </div>

                                <div className="staff-schedule">
                                    <div className="schedule-item">
                                        <Calendar size={14} />
                                        <span>{staff.workingDays.length} gün/hafta</span>
                                    </div>
                                    <div className="schedule-item">
                                        <Clock size={14} />
                                        <span>{staff.workingHours.start} - {staff.workingHours.end}</span>
                                    </div>
                                </div>

                                <div className="staff-specialties">
                                    {staff.specialties.slice(0, 3).map((specialty, index) => (
                                        <span key={index} className="specialty-tag">{specialty}</span>
                                    ))}
                                </div>

                                <div className="staff-status">
                                    <span className={`status-badge ${staff.isActive ? 'active' : 'inactive'}`}>
                                        {staff.isActive ? 'Aktif' : 'Pasif'}
                                    </span>
                                </div>
                            </Card>
                        ))}

                        {/* Add New Staff Card */}
                        <Card className="staff-card add-card" onClick={openAddModal}>
                            <div className="add-card-content">
                                <Plus size={32} />
                                <span>Yeni Personel Ekle</span>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content large" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingStaff ? 'Personeli Düzenle' : 'Yeni Personel Ekle'}</h2>
                            <button className="modal-close" onClick={closeModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Ad Soyad</label>
                                    <input
                                        type="text"
                                        value={formData.name || ''}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Örn: Ahmet Yılmaz"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Pozisyon</label>
                                    <select
                                        value={formData.role || 'Berber'}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        {roles.map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
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

                            <div className="form-group">
                                <label>Çalışma Günleri</label>
                                <div className="days-grid">
                                    {allDays.map(day => (
                                        <button
                                            key={day}
                                            type="button"
                                            className={`day-btn ${formData.workingDays?.includes(day) ? 'active' : ''}`}
                                            onClick={() => toggleDay(day)}
                                        >
                                            {day.substring(0, 3)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Başlangıç Saati</label>
                                    <input
                                        type="time"
                                        value={formData.workingHours?.start || '09:00'}
                                        onChange={e => setFormData({
                                            ...formData,
                                            workingHours: { ...formData.workingHours!, start: e.target.value }
                                        })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Bitiş Saati</label>
                                    <input
                                        type="time"
                                        value={formData.workingHours?.end || '18:00'}
                                        onChange={e => setFormData({
                                            ...formData,
                                            workingHours: { ...formData.workingHours!, end: e.target.value }
                                        })}
                                    />
                                </div>
                            </div>

                            <div className="form-group checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive ?? true}
                                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                    />
                                    <span>Personel aktif</span>
                                </label>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={closeModal}>İptal</button>
                            <button className="btn-primary" onClick={handleSave}>
                                {editingStaff ? 'Güncelle' : 'Ekle'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
