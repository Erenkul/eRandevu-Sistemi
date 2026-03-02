import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Phone, Globe, AlertCircle } from 'lucide-react';
import { Input, PrimaryButton } from '../components/ui';
import { useAuth } from '../contexts';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, COLLECTIONS } from '../lib/firebase';

export const BusinessOnboardingPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: user?.businessName || '',
        slug: '',
        phone: user?.phoneNumber || '',
        address: '',
        city: 'İstanbul', // Default
        description: ''
    });

    // Auto-generate slug from name
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const slug = name
            .toLowerCase()
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ı/g, 'i')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-');

        setFormData(prev => ({ ...prev, name, slug }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) return;

        setLoading(true);
        setError(null);

        try {
            // 1. Create Business Document
            const businessId = `biz_${Date.now()}`; // Simple ID generation
            const businessRef = doc(db, COLLECTIONS.BUSINESSES, businessId);

            await setDoc(businessRef, {
                id: businessId,
                ownerId: user.uid,
                name: formData.name,
                slug: formData.slug,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                description: formData.description,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                isActive: true
            });

            // 2. Update User Profile with businessId
            const userRef = doc(db, COLLECTIONS.USERS, user.uid);
            await updateDoc(userRef, {
                businessId: businessId,
                businessName: formData.name
            });

            // 3. Redirect to Admin Dashboard
            // Force reload to refresh AuthContext or trigger re-fetch? 
            // Better to rely on realtime listener in AuthContext if possible, 
            // but for now a simple navigation should work if we handle state update.
            navigate('/admin');
            window.location.reload(); // Simple way to ensure context updates with new businessId

        } catch (err: any) {
            console.error('Error creating business:', err);
            setError(err.message || 'İşletme oluşturulurken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-logo">
                    <h1>e<span>Randevu</span></h1>
                    <p style={{ marginTop: '10px', color: '#666' }}>İşletme Kurulumu</p>
                </div>

                <div className="auth-title">
                    <h2>İşletmenizi Tanımlayın</h2>
                    <p>Randevu almaya başlamak için işletme bilgilerinizi girin.</p>
                </div>

                {error && (
                    <div className="auth-error-message" style={{ margin: '1rem 0' }}>
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-field">
                        <Input
                            label="İşletme Adı"
                            icon={Building2}
                            value={formData.name}
                            onChange={handleNameChange}
                            required
                            placeholder="Örn: Makas Kuaför"
                        />
                    </div>

                    <div className="form-field">
                        <Input
                            label="İşletme Linki (otomatik)"
                            icon={Globe}
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            required
                            placeholder="makas-kuafor"
                        />
                        <span style={{ fontSize: '12px', color: '#666', marginTop: '4px', display: 'block' }}>
                            erandevu.com/book/<strong>{formData.slug || 'isletme-adi'}</strong>
                        </span>
                    </div>

                    <div className="form-field">
                        <Input
                            label="Telefon"
                            icon={Phone}
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                            placeholder="05XX XXX XX XX"
                        />
                    </div>

                    <div className="form-field">
                        <Input
                            label="Adres"
                            icon={MapPin}
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            required
                            placeholder="Mahalle, Cadde, No..."
                        />
                    </div>

                    <div className="auth-submit">
                        <PrimaryButton type="submit" disabled={loading}>
                            {loading ? 'Oluşturuluyor...' : 'Tamamla ve Panele Git'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </div>
    );
};
