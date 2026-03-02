import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    MapPin,
    Star,
    Clock,
    ArrowRight,
    Scissors,
    Heart,
    Sparkles,
    Dumbbell,
    Stethoscope,
    Building2,
    LogIn,
    X
} from 'lucide-react';
import { PrimaryButton, SecondaryButton } from '../components/ui';
import './HomePage.css';

interface Business {
    id: string;
    name: string;
    category: string;
    rating: number;
    reviewCount: number;
    location: string;
    image: string;
    services: string[];
    openNow: boolean;
}

const mockBusinesses: Business[] = [
    {
        id: 'elite-barber',
        name: 'Elite Barber Shop',
        category: 'Berber',
        rating: 4.9,
        reviewCount: 128,
        location: 'Kadıköy, İstanbul',
        image: '💈',
        services: ['Saç Kesimi', 'Sakal', 'Cilt Bakımı'],
        openNow: true,
    },
    {
        id: 'modern-kuafor',
        name: 'Modern Kuaför',
        category: 'Kuaför',
        rating: 4.7,
        reviewCount: 256,
        location: 'Beşiktaş, İstanbul',
        image: '💇',
        services: ['Saç Kesimi', 'Boyama', 'Fön'],
        openNow: true,
    },
    {
        id: 'style-studio',
        name: 'Style Studio',
        category: 'Güzellik Salonu',
        rating: 4.8,
        reviewCount: 189,
        location: 'Şişli, İstanbul',
        image: '✨',
        services: ['Makyaj', 'Cilt Bakımı', 'Manikür'],
        openNow: false,
    },
    {
        id: 'fit-gym',
        name: 'FitLife Gym',
        category: 'Spor Salonu',
        rating: 4.6,
        reviewCount: 342,
        location: 'Ataşehir, İstanbul',
        image: '🏋️',
        services: ['Personal Training', 'Grup Dersleri', 'Pilates'],
        openNow: true,
    },
    {
        id: 'dental-smile',
        name: 'Dental Smile Kliniği',
        category: 'Diş Kliniği',
        rating: 4.9,
        reviewCount: 167,
        location: 'Levent, İstanbul',
        image: '🦷',
        services: ['Diş Temizliği', 'Dolgu', 'İmplant'],
        openNow: true,
    },
    {
        id: 'zen-spa',
        name: 'Zen Spa & Wellness',
        category: 'Spa',
        rating: 4.8,
        reviewCount: 98,
        location: 'Bebek, İstanbul',
        image: '🧘',
        services: ['Masaj', 'Sauna', 'Yüz Bakımı'],
        openNow: true,
    },
];

const categories = [
    { id: 'all', name: 'Tümü', icon: Search },
    { id: 'barber', name: 'Berber', icon: Scissors },
    { id: 'beauty', name: 'Güzellik', icon: Sparkles },
    { id: 'gym', name: 'Spor', icon: Dumbbell },
    { id: 'health', name: 'Sağlık', icon: Stethoscope },
    { id: 'spa', name: 'Spa', icon: Heart },
];

// Modal component for info pages
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="modal-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    );
};

type ActiveNav = 'home' | 'businesses' | 'how-it-works';
type ModalType = 'pricing' | 'faq' | 'about' | 'contact' | 'careers' | 'privacy' | 'terms' | 'kvkk' | null;

export const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [activeNav, setActiveNav] = useState<ActiveNav>('home');
    const [activeModal, setActiveModal] = useState<ModalType>(null);

    // Refs for scroll
    const businessesRef = useRef<HTMLDivElement>(null);
    const howItWorksRef = useRef<HTMLDivElement>(null);
    const heroRef = useRef<HTMLDivElement>(null);

    const filteredBusinesses = mockBusinesses.filter(business => {
        const matchesSearch = business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            business.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            business.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            business.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

        if (selectedCategory === 'all') return matchesSearch;

        const categoryMap: Record<string, string[]> = {
            'barber': ['Berber'],
            'beauty': ['Kuaför', 'Güzellik Salonu'],
            'gym': ['Spor Salonu'],
            'health': ['Diş Kliniği'],
            'spa': ['Spa'],
        };

        return matchesSearch && categoryMap[selectedCategory]?.includes(business.category);
    });

    const handleBooking = (businessId: string) => {
        navigate(`/book/${businessId}`);
    };

    const handleLogin = () => {
        navigate('/login');
    };

    const scrollToSection = (section: ActiveNav) => {
        setActiveNav(section);
        switch (section) {
            case 'home':
                heroRef.current?.scrollIntoView({ behavior: 'smooth' });
                break;
            case 'businesses':
                businessesRef.current?.scrollIntoView({ behavior: 'smooth' });
                break;
            case 'how-it-works':
                howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' });
                break;
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        businessesRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSelectedCategory('all');
    };

    // Modal content
    const renderModalContent = () => {
        switch (activeModal) {
            case 'pricing':
                return (
                    <div className="info-content">
                        <h3>💎 Ücretsiz Plan</h3>
                        <ul>
                            <li>Aylık 50 randevu</li>
                            <li>Temel raporlama</li>
                            <li>E-posta desteği</li>
                        </ul>
                        <h3>🚀 Pro Plan - ₺299/ay</h3>
                        <ul>
                            <li>Sınırsız randevu</li>
                            <li>WhatsApp entegrasyonu</li>
                            <li>Detaylı analitik</li>
                            <li>Öncelikli destek</li>
                        </ul>
                        <h3>🏢 Enterprise - İletişime Geçin</h3>
                        <ul>
                            <li>Özel çözümler</li>
                            <li>API erişimi</li>
                            <li>Dedicated account manager</li>
                        </ul>
                    </div>
                );
            case 'faq':
                return (
                    <div className="info-content">
                        <h3>Sıkça Sorulan Sorular</h3>
                        <div className="faq-item">
                            <strong>Randevu almak için kayıt olmam gerekiyor mu?</strong>
                            <p>Hayır, kayıt olmadan da randevu alabilirsiniz. Sadece iletişim bilgilerinizi girmeniz yeterli.</p>
                        </div>
                        <div className="faq-item">
                            <strong>Randevumu nasıl iptal edebilirim?</strong>
                            <p>Randevu onay mesajındaki linke tıklayarak veya işletmeyi arayarak iptal edebilirsiniz.</p>
                        </div>
                        <div className="faq-item">
                            <strong>İşletmemi nasıl ekleyebilirim?</strong>
                            <p>"İşletme Girişi" butonuna tıklayarak ücretsiz kayıt olabilirsiniz.</p>
                        </div>
                    </div>
                );
            case 'about':
                return (
                    <div className="info-content">
                        <h3>Hakkımızda</h3>
                        <p>eRandevu, 2024 yılında Türkiye'de kurulan yenilikçi bir randevu platformudur.</p>
                        <p>Misyonumuz, işletmeler ve müşteriler arasındaki randevu sürecini kolaylaştırmak ve dijitalleştirmektir.</p>
                        <p>Vizyonumuz, Türkiye'nin en güvenilir ve kullanıcı dostu randevu platformu olmaktır.</p>
                    </div>
                );
            case 'contact':
                return (
                    <div className="info-content">
                        <h3>İletişim</h3>
                        <p><strong>E-posta:</strong> destek@erandevu.com</p>
                        <p><strong>Telefon:</strong> 0850 123 45 67</p>
                        <p><strong>Adres:</strong> Levent, İstanbul</p>
                        <p><strong>Çalışma Saatleri:</strong> Hafta içi 09:00 - 18:00</p>
                    </div>
                );
            case 'careers':
                return (
                    <div className="info-content">
                        <h3>Kariyer</h3>
                        <p>Büyüyen ekibimize katılmak ister misiniz?</p>
                        <h4>Açık Pozisyonlar:</h4>
                        <ul>
                            <li>Senior Frontend Developer</li>
                            <li>Backend Developer (Node.js)</li>
                            <li>UX Designer</li>
                            <li>Dijital Pazarlama Uzmanı</li>
                        </ul>
                        <p>Başvuru için: kariyer@erandevu.com</p>
                    </div>
                );
            case 'privacy':
                return (
                    <div className="info-content">
                        <h3>Gizlilik Politikası</h3>
                        <p>eRandevu olarak kullanıcılarımızın gizliliğine önem veriyoruz.</p>
                        <p>Toplanan veriler yalnızca randevu hizmeti sunmak amacıyla kullanılır.</p>
                        <p>Verileriniz üçüncü taraflarla paylaşılmaz.</p>
                    </div>
                );
            case 'terms':
                return (
                    <div className="info-content">
                        <h3>Kullanım Koşulları</h3>
                        <p>eRandevu hizmetlerini kullanarak aşağıdaki koşulları kabul etmiş olursunuz:</p>
                        <ul>
                            <li>Platform üzerinden yapılan randevular bağlayıcıdır.</li>
                            <li>Yanıltıcı bilgi vermek yasaktır.</li>
                            <li>İşletmeler verdikleri hizmetten sorumludur.</li>
                        </ul>
                    </div>
                );
            case 'kvkk':
                return (
                    <div className="info-content">
                        <h3>KVKK Aydınlatma Metni</h3>
                        <p>6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında:</p>
                        <ul>
                            <li>Kişisel verileriniz yalnızca randevu hizmeti için işlenir.</li>
                            <li>Verilerinize erişim, düzeltme ve silme hakkınız vardır.</li>
                            <li>Veri sorumlusu: eRandevu Teknoloji A.Ş.</li>
                        </ul>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="home-page">
            {/* Header */}
            <header className="home-header">
                <div className="home-header-logo" onClick={() => scrollToSection('home')} style={{ cursor: 'pointer' }}>
                    e<span>Randevu</span>
                </div>
                <div className="home-header-nav">
                    <button
                        className={`home-nav-link ${activeNav === 'home' ? 'active' : ''}`}
                        onClick={() => scrollToSection('home')}
                    >
                        Ana Sayfa
                    </button>
                    <button
                        className={`home-nav-link ${activeNav === 'businesses' ? 'active' : ''}`}
                        onClick={() => scrollToSection('businesses')}
                    >
                        İşletmeler
                    </button>
                    <button
                        className={`home-nav-link ${activeNav === 'how-it-works' ? 'active' : ''}`}
                        onClick={() => scrollToSection('how-it-works')}
                    >
                        Nasıl Çalışır?
                    </button>
                </div>
                <div className="home-header-actions">
                    <SecondaryButton icon={LogIn} onClick={handleLogin}>
                        Giriş Yap
                    </SecondaryButton>
                    <PrimaryButton icon={Building2} onClick={handleLogin}>
                        İşletme Girişi
                    </PrimaryButton>
                </div>
            </header>

            {/* Hero Section */}
            <section className="home-hero" ref={heroRef}>
                <div className="hero-content">
                    <h1>
                        Randevu almak artık
                        <span className="gradient-text"> çok kolay!</span>
                    </h1>
                    <p>
                        Kayıt olmadan, istediğiniz işletmeden anında randevu alın.
                        Berber, kuaför, güzellik merkezi ve daha fazlası bir tık uzağınızda.
                    </p>

                    <form className="hero-search" onSubmit={handleSearch}>
                        <div className="search-box">
                            <Search size={20} />
                            <input
                                type="text"
                                placeholder="İşletme, hizmet veya konum ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button type="button" className="search-clear" onClick={clearSearch}>
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        <PrimaryButton type="submit" icon={Search}>
                            Ara
                        </PrimaryButton>
                    </form>

                    <div className="hero-stats">
                        <div className="stat">
                            <strong>10K+</strong>
                            <span>Aktif İşletme</span>
                        </div>
                        <div className="stat">
                            <strong>50K+</strong>
                            <span>Mutlu Müşteri</span>
                        </div>
                        <div className="stat">
                            <strong>100K+</strong>
                            <span>Başarılı Randevu</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="home-categories" ref={businessesRef}>
                <h2>Kategoriler</h2>
                <div className="category-list">
                    {categories.map((category) => {
                        const Icon = category.icon;
                        return (
                            <button
                                key={category.id}
                                className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(category.id)}
                            >
                                <Icon size={20} />
                                <span>{category.name}</span>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Business List */}
            <section className="home-businesses">
                <div className="section-header">
                    <h2>
                        {searchQuery
                            ? `"${searchQuery}" için ${filteredBusinesses.length} sonuç`
                            : 'Popüler İşletmeler'}
                    </h2>
                    {searchQuery && (
                        <button className="see-all" onClick={clearSearch}>
                            Aramayı Temizle <X size={16} />
                        </button>
                    )}
                </div>

                {filteredBusinesses.length > 0 ? (
                    <div className="business-grid">
                        {filteredBusinesses.map((business) => (
                            <div key={business.id} className="business-card">
                                <div className="business-card-header">
                                    <div className="business-avatar">{business.image}</div>
                                    <div className={`business-status ${business.openNow ? 'open' : 'closed'}`}>
                                        <Clock size={12} />
                                        {business.openNow ? 'Açık' : 'Kapalı'}
                                    </div>
                                </div>
                                <div className="business-card-body">
                                    <h3>{business.name}</h3>
                                    <span className="business-category">{business.category}</span>
                                    <div className="business-rating">
                                        <Star size={14} fill="currentColor" />
                                        <span>{business.rating}</span>
                                        <span className="review-count">({business.reviewCount} değerlendirme)</span>
                                    </div>
                                    <div className="business-location">
                                        <MapPin size={14} />
                                        {business.location}
                                    </div>
                                    <div className="business-services">
                                        {business.services.slice(0, 3).map((service, idx) => (
                                            <span key={idx} className="service-tag">{service}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="business-card-footer">
                                    <PrimaryButton
                                        icon={ArrowRight}
                                        iconPosition="right"
                                        onClick={() => handleBooking(business.id)}
                                    >
                                        Randevu Al
                                    </PrimaryButton>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-results">
                        <div className="no-results-icon">🔍</div>
                        <h3>Sonuç bulunamadı</h3>
                        <p>"{searchQuery}" ile eşleşen işletme bulunamadı. Farklı bir arama deneyin.</p>
                        <SecondaryButton onClick={clearSearch}>Aramayı Temizle</SecondaryButton>
                    </div>
                )}
            </section>

            {/* How It Works */}
            <section className="home-how-it-works" ref={howItWorksRef}>
                <h2>Nasıl Çalışır?</h2>
                <p className="section-desc">Sadece 3 adımda randevunuzu alın</p>

                <div className="steps-grid">
                    <div className="step-card" onClick={() => scrollToSection('businesses')}>
                        <div className="step-number">1</div>
                        <div className="step-icon">🔍</div>
                        <h3>İşletme Seçin</h3>
                        <p>İstediğiniz hizmeti veren işletmeyi bulun ve seçin</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">2</div>
                        <div className="step-icon">📅</div>
                        <h3>Tarih & Saat Seçin</h3>
                        <p>Size uygun tarih ve saati belirleyin</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">3</div>
                        <div className="step-icon">✅</div>
                        <h3>Onaylayın</h3>
                        <p>Bilgilerinizi girin ve randevunuzu onaylayın</p>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="home-cta">
                <div className="cta-content">
                    <h2>İşletmenizi eRandevu'ya Ekleyin</h2>
                    <p>Online randevu sistemiyle müşterilerinizi yönetin, işinizi büyütün</p>
                    <div className="cta-buttons">
                        <PrimaryButton icon={Building2} onClick={handleLogin}>
                            Ücretsiz Kayıt Ol
                        </PrimaryButton>
                        <SecondaryButton icon={ArrowRight} iconPosition="right" onClick={() => setActiveModal('pricing')}>
                            Daha Fazla Bilgi
                        </SecondaryButton>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="home-footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <div className="home-header-logo" onClick={() => scrollToSection('home')} style={{ cursor: 'pointer' }}>
                            e<span>Randevu</span>
                        </div>
                        <p>Türkiye'nin en kolay randevu platformu</p>
                    </div>
                    <div className="footer-links">
                        <div className="footer-column">
                            <h4>Platform</h4>
                            <button onClick={() => scrollToSection('how-it-works')}>Nasıl Çalışır?</button>
                            <button onClick={() => setActiveModal('pricing')}>Fiyatlandırma</button>
                            <button onClick={() => setActiveModal('faq')}>SSS</button>
                        </div>
                        <div className="footer-column">
                            <h4>Şirket</h4>
                            <button onClick={() => setActiveModal('about')}>Hakkımızda</button>
                            <button onClick={() => setActiveModal('contact')}>İletişim</button>
                            <button onClick={() => setActiveModal('careers')}>Kariyer</button>
                        </div>
                        <div className="footer-column">
                            <h4>Yasal</h4>
                            <button onClick={() => setActiveModal('privacy')}>Gizlilik</button>
                            <button onClick={() => setActiveModal('terms')}>Kullanım Koşulları</button>
                            <button onClick={() => setActiveModal('kvkk')}>KVKK</button>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <span>© 2026 eRandevu. Tüm hakları saklıdır.</span>
                </div>
            </footer>

            {/* Modal */}
            <Modal
                isOpen={activeModal !== null}
                onClose={() => setActiveModal(null)}
                title={
                    activeModal === 'pricing' ? 'Fiyatlandırma' :
                        activeModal === 'faq' ? 'SSS' :
                            activeModal === 'about' ? 'Hakkımızda' :
                                activeModal === 'contact' ? 'İletişim' :
                                    activeModal === 'careers' ? 'Kariyer' :
                                        activeModal === 'privacy' ? 'Gizlilik Politikası' :
                                            activeModal === 'terms' ? 'Kullanım Koşulları' :
                                                activeModal === 'kvkk' ? 'KVKK' : ''
                }
            >
                {renderModalContent()}
            </Modal>
        </div>
    );
};
