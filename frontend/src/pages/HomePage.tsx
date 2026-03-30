import React, { useState, useRef, useMemo } from 'react';
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
    User,
    X,
    CalendarCheck,
    CheckCircle2
} from 'lucide-react';
import { PrimaryButton, SecondaryButton } from '../components/ui';
import { useAuth } from '../contexts';
import './HomePage.css';

import { useBusinesses, useServices } from '../hooks';
import type { Business } from '../types';

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
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [activeNav, setActiveNav] = useState<ActiveNav>('home');
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const { data: businesses, loading: businessesLoading } = useBusinesses();

    // Refs for scroll
    const businessesRef = useRef<HTMLDivElement>(null);
    const howItWorksRef = useRef<HTMLDivElement>(null);
    const heroRef = useRef<HTMLDivElement>(null);

    // isOpenHelper
    const checkIsOpen = (business: Business) => {
        if (!business.workingHours) return true; // fallback
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayOfWeek = dayNames[new Date().getDay()] as keyof typeof business.workingHours;
        const todayHours = business.workingHours[dayOfWeek];
        if (!todayHours || !todayHours.isOpen) return false;

        const now = new Date();
        const currentMins = now.getHours() * 60 + now.getMinutes();

        const [openH, openM] = todayHours.openTime.split(':').map(Number);
        const [closeH, closeM] = todayHours.closeTime.split(':').map(Number);
        const openMins = openH * 60 + openM;
        const closeMins = closeH * 60 + closeM;

        return currentMins >= openMins && currentMins <= closeMins;
    };

    const filteredBusinesses = businesses.filter(business => {
        // Fallback or generic category mapping if category doesn't strictly exist on Type business
        // Real logic: Business type doesn't have a strict category string, but we can search description/name

        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
            (business.name && business.name.toLowerCase().includes(searchLower)) ||
            (business.city && business.city.toLowerCase().includes(searchLower)) ||
            (business.address && business.address.toLowerCase().includes(searchLower));

        if (selectedCategory === 'all') return matchesSearch;

        // Simplified category filter (since we don't have explicit categories in DB yet, filtering mostly by name/desc)
        return matchesSearch && (business.name && business.name.toLowerCase().includes(selectedCategory));
    });

    const dropdownResults = useMemo(() => {
        if (!searchQuery.trim() || businessesLoading) return [];
        const searchLower = searchQuery.toLowerCase();
        
        const results = businesses.map(b => {
             let score = 0;
             const nameMatch = b.name?.toLowerCase().includes(searchLower) || false;
             const cityMatch = b.city?.toLowerCase().includes(searchLower) || false;
             const addressMatch = b.address?.toLowerCase().includes(searchLower) || false;
             
             if (nameMatch) score = 3;
             else if (cityMatch) score = 2;
             else if (addressMatch) score = 1;

             return { business: b, score };
        }).filter(item => item.score > 0);

        results.sort((a, b) => b.score - a.score);
        return results.slice(0, 5);
    }, [businesses, searchQuery, businessesLoading]);

// Extract BusinessCard to manage its own services fetching
const HomeBusinessCard: React.FC<{ business: Business; isOpen: boolean; onBook: (slug: string) => void }> = ({ business, isOpen, onBook }) => {
    const { data: services, loading } = useServices(business.id);

    // Get min price or top 3 services
    const getServiceDisplay = () => {
        if (loading) return <span className="business-category">Hizmetler Yükleniyor...</span>;
        if (!services || services.length === 0) return <span className="business-category">Hizmet bilgisi yok</span>;

        const listedServices = services.slice(0, 3).map(s => s.name).join(', ');
        const minPrice = Math.min(...services.map(s => s.price));
        
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span className="business-category" style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {listedServices}{services.length > 3 ? '...' : ''}
                </span>
                <span style={{ fontSize: '13px', color: '#6366f1', fontWeight: 500 }}>
                    ₺{minPrice}'den başlayan fiyatlarla
                </span>
            </div>
        );
    };

    return (
        <div key={business.id} className="business-card">
            <div className="business-card-header">
                <div className="business-avatar">
                    {business.name.charAt(0)}
                </div>
                <div className={`business-status ${isOpen ? 'open' : 'closed'}`}>
                    <Clock size={12} />
                    {isOpen ? 'Açık' : 'Kapalı'}
                </div>
            </div>
            <div className="business-card-body">
                <h3>{business.name}</h3>
                {getServiceDisplay()}
                <div className="business-rating" style={{ marginTop: '8px' }}>
                    <Star size={14} fill="currentColor" />
                    <span>4.9</span>
                    <span className="review-count">(Yeni)</span>
                </div>
                <div className="business-location">
                    <MapPin size={14} />
                    {business.city}
                </div>
            </div>
            <div className="business-card-footer">
                <PrimaryButton
                    icon={ArrowRight}
                    iconPosition="right"
                    onClick={() => onBook(business.slug)}
                >
                    Randevu Al
                </PrimaryButton>
            </div>
        </div>
    );
};

    const handleBooking = (slug: string) => {
        navigate(`/book/${slug}`);
    };

    const handleLogin = () => {
        navigate('/login');
    };

    const handleDashboard = () => {
        if (user) {
            navigate(user.role === 'customer' ? '/customer' : '/admin');
        }
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
                    {user ? (
                        <SecondaryButton icon={User} onClick={handleDashboard}>
                            {user.displayName || 'Panelim'}
                        </SecondaryButton>
                    ) : (
                        <SecondaryButton icon={LogIn} onClick={handleLogin}>
                            Giriş Yap
                        </SecondaryButton>
                    )}
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
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                            />
                            {searchQuery && (
                                <button type="button" className="search-clear" onClick={clearSearch}>
                                    <X size={16} />
                                </button>
                            )}
                            
                            {isSearchFocused && dropdownResults.length > 0 && (
                                <div className="search-dropdown">
                                    {dropdownResults.map((item) => (
                                        <div 
                                            key={item.business.id} 
                                            className="search-dropdown-item"
                                            onMouseDown={() => handleBooking(item.business.slug)}
                                        >
                                            <span className="search-dropdown-name">{item.business.name}</span>
                                            <span className="search-dropdown-location">
                                                <MapPin size={12} />
                                                {item.business.city}{item.business.address ? `, ${item.business.address}` : ''}
                                            </span>
                                        </div>
                                    ))}
                                </div>
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

                {businessesLoading ? (
                    <div className="empty-state-inline"><p>İşletmeler yükleniyor...</p></div>
                ) : filteredBusinesses.length > 0 ? (
                    <div className="business-grid">
                        {filteredBusinesses.map((business) => {
                            const isOpen = checkIsOpen(business);
                            return (
                                <HomeBusinessCard
                                    key={business.id}
                                    business={business}
                                    isOpen={isOpen}
                                    onBook={handleBooking}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div className="no-results">
                        <div className="no-results-icon"><Search size={28} /></div>
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
                        <div className="step-icon"><Search size={26} /></div>
                        <h3>İşletme Seçin</h3>
                        <p>İstediğiniz hizmeti veren işletmeyi bulun ve seçin</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">2</div>
                        <div className="step-icon"><CalendarCheck size={26} /></div>
                        <h3>Tarih & Saat Seçin</h3>
                        <p>Size uygun tarih ve saati belirleyin</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">3</div>
                        <div className="step-icon"><CheckCircle2 size={26} /></div>
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
