import React, { useState, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Search, MapPin, ArrowRight, Scissors, Heart, Sparkles,
    Dumbbell, Stethoscope, Building2, LogIn, User, X,
    CalendarCheck, CheckCircle2, Filter
} from 'lucide-react';
import { PrimaryButton, SecondaryButton, Logo, SkeletonCard } from '../../components/ui';
import { useAuth } from '../../contexts';
import { useBusinesses } from '../../hooks';
import type { Business } from '../../types';
import { HomeBusinessCard } from './components/HomeBusinessCard';
import '../HomePage.css';

export const CITIES = [
    "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir",
    "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli",
    "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari",
    "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir",
    "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir",
    "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat",
    "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman",
    "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
];

const categories = [
    { id: 'all', name: 'Tümü', icon: Search },
    { id: 'barber', name: 'Berber', icon: Scissors },
    { id: 'beauty', name: 'Güzellik', icon: Sparkles },
    { id: 'gym', name: 'Spor', icon: Dumbbell },
    { id: 'health', name: 'Sağlık', icon: Stethoscope },
    { id: 'spa', name: 'Spa', icon: Heart },
];

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
            <div className="modal-content" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="modal-close" onClick={onClose} aria-label="Kapat"><X size={24} /></button>
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
    const [searchLocation, setSearchLocation] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [activeNav, setActiveNav] = useState<ActiveNav>('home');
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const { data: businesses, loading: businessesLoading } = useBusinesses();

    const businessesRef = useRef<HTMLDivElement>(null);
    const howItWorksRef = useRef<HTMLDivElement>(null);
    const heroRef = useRef<HTMLDivElement>(null);

    const checkIsOpen = useCallback((business: Business) => {
        if (!business.workingHours) return true;
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayOfWeek = dayNames[new Date().getDay()] as keyof typeof business.workingHours;
        const todayHours = business.workingHours[dayOfWeek];
        if (!todayHours || !todayHours.isOpen) return false;
        const now = new Date();
        const currentMins = now.getHours() * 60 + now.getMinutes();
        const [openH, openM] = todayHours.openTime.split(':').map(Number);
        const [closeH, closeM] = todayHours.closeTime.split(':').map(Number);
        return currentMins >= openH * 60 + openM && currentMins <= closeH * 60 + closeM;
    }, []);

    const filteredBusinesses = useMemo(() => businesses.filter(business => {
        const searchLower = searchQuery.toLowerCase();
        const locationLower = searchLocation.toLowerCase();
        const matchesQuery = (business.name && business.name.toLowerCase().includes(searchLower)) ||
            (business.address && business.address.toLowerCase().includes(searchLower));
        const matchesLocation = !searchLocation || (business.city && business.city.toLowerCase().includes(locationLower));
        const matchesCategory = selectedCategory === 'all' || (business.name && business.name.toLowerCase().includes(selectedCategory));
        return matchesQuery && matchesLocation && matchesCategory;
    }), [businesses, searchQuery, searchLocation, selectedCategory]);

    const dropdownResults = useMemo(() => {
        if (!searchQuery.trim() || businessesLoading) return [];
        const searchLower = searchQuery.toLowerCase();
        const results = businesses.map(b => {
            let score = 0;
            if (b.name?.toLowerCase().includes(searchLower)) score = 3;
            else if (b.city?.toLowerCase().includes(searchLower)) score = 2;
            else if (b.address?.toLowerCase().includes(searchLower)) score = 1;
            return { business: b, score };
        }).filter(item => item.score > 0);
        results.sort((a, b) => b.score - a.score);
        return results.slice(0, 5);
    }, [businesses, searchQuery, businessesLoading]);

    const handleBooking = useCallback((slug: string) => navigate(`/book/${slug}`), [navigate]);
    const handleLogin = useCallback(() => navigate('/login'), [navigate]);
    const handleDashboard = useCallback(() => { if (user) navigate(user.role === 'customer' ? '/customer' : '/admin'); }, [user, navigate]);

    const scrollToSection = (section: ActiveNav) => {
        setActiveNav(section);
        switch (section) {
            case 'home': heroRef.current?.scrollIntoView({ behavior: 'smooth' }); break;
            case 'businesses': businessesRef.current?.scrollIntoView({ behavior: 'smooth' }); break;
            case 'how-it-works': howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' }); break;
        }
    };

    const handleSearch = (e: React.FormEvent) => { e.preventDefault(); businessesRef.current?.scrollIntoView({ behavior: 'smooth' }); };
    const clearSearch = () => { setSearchQuery(''); setSelectedCategory('all'); };

    const renderModalContent = () => {
        switch (activeModal) {
            case 'pricing': return (<div className="info-content"><h3>💎 Ücretsiz Plan</h3><ul><li>Aylık 50 randevu</li><li>Temel raporlama</li><li>E-posta desteği</li></ul><h3>🚀 Pro Plan - ₺299/ay</h3><ul><li>Sınırsız randevu</li><li>WhatsApp entegrasyonu</li><li>Detaylı analitik</li><li>Öncelikli destek</li></ul><h3>🏢 Enterprise - İletişime Geçin</h3><ul><li>Özel çözümler</li><li>API erişimi</li><li>Dedicated account manager</li></ul></div>);
            case 'faq': return (<div className="info-content"><h3>Sıkça Sorulan Sorular</h3><div className="faq-item"><strong>Randevu almak için kayıt olmam gerekiyor mu?</strong><p>Hayır, kayıt olmadan da randevu alabilirsiniz.</p></div><div className="faq-item"><strong>Randevumu nasıl iptal edebilirim?</strong><p>Randevu onay mesajındaki linke tıklayarak veya işletmeyi arayarak iptal edebilirsiniz.</p></div><div className="faq-item"><strong>İşletmemi nasıl ekleyebilirim?</strong><p>"İşletme Girişi" butonuna tıklayarak ücretsiz kayıt olabilirsiniz.</p></div></div>);
            case 'about': return (<div className="info-content"><h3>Hakkımızda</h3><p>eRandevu, 2024 yılında Türkiye'de kurulan yenilikçi bir randevu platformudur.</p><p>Misyonumuz, işletmeler ve müşteriler arasındaki randevu sürecini kolaylaştırmak ve dijitalleştirmektir.</p></div>);
            case 'contact': return (<div className="info-content"><h3>İletişim</h3><p><strong>E-posta:</strong> destek@erandevu.com</p><p><strong>Telefon:</strong> 0850 123 45 67</p><p><strong>Adres:</strong> Levent, İstanbul</p></div>);
            case 'careers': return (<div className="info-content"><h3>Kariyer</h3><p>Büyüyen ekibimize katılmak ister misiniz?</p><h4>Açık Pozisyonlar:</h4><ul><li>Senior Frontend Developer</li><li>Backend Developer (Node.js)</li><li>UX Designer</li></ul><p>Başvuru için: kariyer@erandevu.com</p></div>);
            case 'privacy': return (<div className="info-content"><h3>Gizlilik Politikası</h3><p>eRandevu olarak kullanıcılarımızın gizliliğine önem veriyoruz.</p><p>Toplanan veriler yalnızca randevu hizmeti sunmak amacıyla kullanılır.</p></div>);
            case 'terms': return (<div className="info-content"><h3>Kullanım Koşulları</h3><ul><li>Platform üzerinden yapılan randevular bağlayıcıdır.</li><li>Yanıltıcı bilgi vermek yasaktır.</li><li>İşletmeler verdikleri hizmetten sorumludur.</li></ul></div>);
            case 'kvkk': return (<div className="info-content"><h3>KVKK Aydınlatma Metni</h3><ul><li>Kişisel verileriniz yalnızca randevu hizmeti için işlenir.</li><li>Verilerinize erişim, düzeltme ve silme hakkınız vardır.</li><li>Veri sorumlusu: eRandevu Teknoloji A.Ş.</li></ul></div>);
            default: return null;
        }
    };

    const modalTitles: Record<string, string> = { pricing: 'Fiyatlandırma', faq: 'SSS', about: 'Hakkımızda', contact: 'İletişim', careers: 'Kariyer', privacy: 'Gizlilik Politikası', terms: 'Kullanım Koşulları', kvkk: 'KVKK' };

    return (
        <div className="home-page">
            <header className="home-header" role="banner">
                <div className="home-header-logo" onClick={() => scrollToSection('home')} style={{ cursor: 'pointer' }}>
                    <Logo variant="compact" />
                </div>
                <div className="home-header-nav" role="navigation" aria-label="Ana sayfa navigasyonu">
                    <button className={`home-nav-link ${activeNav === 'home' ? 'active' : ''}`} onClick={() => scrollToSection('home')}>Ana Sayfa</button>
                    <button className={`home-nav-link ${activeNav === 'businesses' ? 'active' : ''}`} onClick={() => scrollToSection('businesses')}>İşletmeler</button>
                    <button className={`home-nav-link ${activeNav === 'how-it-works' ? 'active' : ''}`} onClick={() => scrollToSection('how-it-works')}>Nasıl Çalışır?</button>
                </div>
                <div className="home-header-actions">
                    {user ? (
                        <SecondaryButton icon={User} onClick={handleDashboard} className="interactive">{user.displayName || 'Sayfam'}</SecondaryButton>
                    ) : (
                        <SecondaryButton icon={LogIn} onClick={handleLogin}>Giriş Yap</SecondaryButton>
                    )}
                </div>
            </header>

            <section className="home-hero" ref={heroRef}>
                <div className="hero-content">
                    <h1>Randevu almak artık<span className="gradient-text"> çok kolay!</span></h1>
                    <p>Kayıt olmadan, istediğiniz işletmeden anında randevu alın.</p>
                    <motion.form className="hero-search" onSubmit={handleSearch} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} aria-label="Arama">
                        <div className="search-box-complex">
                            <div className="search-field interactive">
                                <Search size={20} />
                                <input type="text" placeholder="Hizmet veya işletme ara..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={() => setIsSearchFocused(true)} onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)} aria-label="Hizmet veya işletme ara" />
                            </div>
                            <div className="search-divider"></div>
                            <div className="search-field interactive">
                                <MapPin size={20} />
                                <input type="text" list="city-list" placeholder="Konum seç..." value={searchLocation} onChange={(e) => setSearchLocation(e.target.value)} aria-label="Konum seç" />
                                <datalist id="city-list">{CITIES.map((city, idx) => <option key={idx} value={city} />)}</datalist>
                            </div>
                            <div className="search-divider"></div>
                            <div className="search-field interactive">
                                <Filter size={20} />
                                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="search-select" aria-label="Kategori filtrele">
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </div>
                            {isSearchFocused && dropdownResults.length > 0 && (
                                <div className="search-dropdown">
                                    {dropdownResults.map((item) => (
                                        <div key={item.business.id} className="search-dropdown-item interactive" onMouseDown={() => handleBooking(item.business.slug)}>
                                            <span className="search-dropdown-name">{item.business.name}</span>
                                            <span className="search-dropdown-location"><MapPin size={12} />{item.business.city}{item.business.address ? `, ${item.business.address}` : ''}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <PrimaryButton type="submit" icon={Search} className="interactive submit-search-btn">Ara</PrimaryButton>
                    </motion.form>
                    <div className="hero-stats">
                        <div className="stat"><strong>10K+</strong><span>Aktif İşletme</span></div>
                        <div className="stat"><strong>50K+</strong><span>Mutlu Müşteri</span></div>
                        <div className="stat"><strong>100K+</strong><span>Başarılı Randevu</span></div>
                    </div>
                </div>
            </section>

            <section className="home-categories" ref={businessesRef}>
                <h2>Kategoriler</h2>
                <div className="category-list">
                    {categories.map((category) => {
                        const Icon = category.icon;
                        return (
                            <motion.button key={category.id} className={`category-item interactive ${selectedCategory === category.id ? 'active' : ''}`} onClick={() => setSelectedCategory(category.id)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Icon size={20} /><span>{category.name}</span>
                            </motion.button>
                        );
                    })}
                </div>
            </section>

            <section className="home-businesses">
                <div className="section-header">
                    <h2>{searchQuery ? `"${searchQuery}" için ${filteredBusinesses.length} sonuç` : 'Popüler İşletmeler'}</h2>
                    {searchQuery && <button className="see-all" onClick={clearSearch}>Aramayı Temizle <X size={16} /></button>}
                </div>
                {businessesLoading ? (
                    <div className="business-grid">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <SkeletonCard key={i} lines={3} />
                        ))}
                    </div>
                ) : filteredBusinesses.length > 0 ? (
                    <div className="business-grid">
                        {filteredBusinesses.map((business) => (
                            <HomeBusinessCard key={business.id} business={business} isOpen={checkIsOpen(business)} onBook={handleBooking} />
                        ))}
                    </div>
                ) : (
                    <div className="no-results">
                        <div className="no-results-icon"><Search size={28} /></div>
                        <h3>Sonuç bulunamadı</h3>
                        <p>"{searchQuery}" ile eşleşen işletme bulunamadı.</p>
                        <SecondaryButton onClick={clearSearch}>Aramayı Temizle</SecondaryButton>
                    </div>
                )}
            </section>

            <section className="home-how-it-works" ref={howItWorksRef}>
                <h2>Nasıl Çalışır?</h2>
                <p className="section-desc">Sadece 3 adımda randevunuzu alın</p>
                <div className="steps-grid">
                    <div className="step-card" onClick={() => scrollToSection('businesses')}><div className="step-number">1</div><div className="step-icon"><Search size={26} /></div><h3>İşletme Seçin</h3><p>İstediğiniz hizmeti veren işletmeyi bulun</p></div>
                    <div className="step-card"><div className="step-number">2</div><div className="step-icon"><CalendarCheck size={26} /></div><h3>Tarih & Saat Seçin</h3><p>Size uygun tarih ve saati belirleyin</p></div>
                    <div className="step-card"><div className="step-number">3</div><div className="step-icon"><CheckCircle2 size={26} /></div><h3>Onaylayın</h3><p>Bilgilerinizi girin ve randevunuzu onaylayın</p></div>
                </div>
            </section>

            <section className="home-cta">
                <div className="cta-content">
                    <h2>İşletmenizi eRandevu'ya Ekleyin</h2>
                    <p>Online randevu sistemiyle müşterilerinizi yönetin</p>
                    <div className="cta-buttons">
                        <PrimaryButton icon={Building2} onClick={handleLogin}>Ücretsiz Kayıt Ol</PrimaryButton>
                        <SecondaryButton icon={ArrowRight} iconPosition="right" onClick={() => setActiveModal('pricing')}>Daha Fazla Bilgi</SecondaryButton>
                    </div>
                </div>
            </section>

            <footer className="home-footer" role="contentinfo">
                <div className="footer-content">
                    <div className="footer-brand">
                        <div className="home-header-logo" onClick={() => scrollToSection('home')} style={{ cursor: 'pointer' }}><Logo variant="compact" /></div>
                        <p>Türkiye'nin en kolay randevu platformu</p>
                    </div>
                    <div className="footer-links">
                        <div className="footer-column"><h4>Platform</h4><button onClick={() => scrollToSection('how-it-works')}>Nasıl Çalışır?</button><button onClick={() => setActiveModal('pricing')}>Fiyatlandırma</button><button onClick={() => setActiveModal('faq')}>SSS</button></div>
                        <div className="footer-column"><h4>Şirket</h4><button onClick={() => setActiveModal('about')}>Hakkımızda</button><button onClick={() => setActiveModal('contact')}>İletişim</button><button onClick={() => setActiveModal('careers')}>Kariyer</button></div>
                        <div className="footer-column"><h4>Yasal</h4><button onClick={() => setActiveModal('privacy')}>Gizlilik</button><button onClick={() => setActiveModal('terms')}>Kullanım Koşulları</button><button onClick={() => setActiveModal('kvkk')}>KVKK</button></div>
                    </div>
                </div>
                <div className="footer-bottom"><span>© 2026 eRandevu. Tüm hakları saklıdır.</span></div>
            </footer>

            <Modal isOpen={activeModal !== null} onClose={() => setActiveModal(null)} title={activeModal ? modalTitles[activeModal] || '' : ''}>
                {renderModalContent()}
            </Modal>
        </div>
    );
};
