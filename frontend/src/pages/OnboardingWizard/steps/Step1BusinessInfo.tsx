import React from 'react';
import { formatOnboardingPhone, type BusinessInfoData } from '../hooks/useOnboardingState';

interface Step1BusinessInfoProps {
    businessInfo: BusinessInfoData;
    onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBusinessInfoChange: (info: BusinessInfoData) => void;
}

export const Step1BusinessInfo: React.FC<Step1BusinessInfoProps> = ({
    businessInfo,
    onNameChange,
    onBusinessInfoChange,
}) => (
    <>
        <div className="step-header">
            <h2>İşletme Bilgileri</h2>
            <p>İşletmenizin temel bilgilerini girin</p>
        </div>

        <div className="form-group">
            <label>İşletme Adı</label>
            <input
                type="text"
                value={businessInfo.name}
                onChange={onNameChange}
                placeholder="Örn: Makas Kuaför"
            />
        </div>

        <div className="form-group">
            <label>İşletme Linki</label>
            <input
                type="text"
                value={businessInfo.slug}
                onChange={(e) => onBusinessInfoChange({ ...businessInfo, slug: e.target.value })}
                placeholder="makas-kuafor"
            />
            <div className="slug-preview">
                erandevu.com/book/<strong>{businessInfo.slug || 'isletme-adi'}</strong>
            </div>
        </div>

        <div className="form-row">
            <div className="form-group">
                <label>Telefon</label>
                <input
                    type="tel"
                    value={businessInfo.phone}
                    onChange={(e) => onBusinessInfoChange({ ...businessInfo, phone: formatOnboardingPhone(e.target.value) })}
                    placeholder="5XX XXX XX XX"
                />
            </div>
            <div className="form-group">
                <label>Şehir</label>
                <select
                    value={businessInfo.city}
                    onChange={(e) => onBusinessInfoChange({ ...businessInfo, city: e.target.value })}
                >
                    <option value="">Seçiniz</option>
                    {[
                        'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin', 'Aydın', 'Balıkesir',
                        'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli',
                        'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari',
                        'Hatay', 'Isparta', 'Mersin', 'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir',
                        'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla', 'Muş', 'Nevşehir',
                        'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Tekirdağ', 'Tokat',
                        'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak', 'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman',
                        'Kırıkkale', 'Batman', 'Şırnak', 'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye',
                        'Düzce'
                    ].map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>
        </div>

        <div className="form-group">
            <label>Adres</label>
            <input
                type="text"
                value={businessInfo.address}
                onChange={(e) => onBusinessInfoChange({ ...businessInfo, address: e.target.value })}
                placeholder="Mahalle, Cadde, No..."
            />
        </div>
    </>
);
