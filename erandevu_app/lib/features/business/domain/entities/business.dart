import 'package:equatable/equatable.dart';

/// İşletme veri modeli
class Business extends Equatable {
  final String id;
  final String name;
  final String? description;
  final String? logoUrl;
  final String? coverImageUrl;
  final String ownerId;
  final String? phone;
  final String? email;
  final String? address;
  final String? city;
  final String? district;
  final BusinessType type;
  final Map<String, WorkingHours> workingHours;
  final bool isActive;
  final DateTime createdAt;
  final DateTime? updatedAt;

  const Business({
    required this.id,
    required this.name,
    this.description,
    this.logoUrl,
    this.coverImageUrl,
    required this.ownerId,
    this.phone,
    this.email,
    this.address,
    this.city,
    this.district,
    this.type = BusinessType.other,
    this.workingHours = const {},
    this.isActive = true,
    required this.createdAt,
    this.updatedAt,
  });

  @override
  List<Object?> get props => [
        id,
        name,
        description,
        logoUrl,
        coverImageUrl,
        ownerId,
        phone,
        email,
        address,
        city,
        district,
        type,
        workingHours,
        isActive,
        createdAt,
        updatedAt,
      ];

  Business copyWith({
    String? id,
    String? name,
    String? description,
    String? logoUrl,
    String? coverImageUrl,
    String? ownerId,
    String? phone,
    String? email,
    String? address,
    String? city,
    String? district,
    BusinessType? type,
    Map<String, WorkingHours>? workingHours,
    bool? isActive,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Business(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      logoUrl: logoUrl ?? this.logoUrl,
      coverImageUrl: coverImageUrl ?? this.coverImageUrl,
      ownerId: ownerId ?? this.ownerId,
      phone: phone ?? this.phone,
      email: email ?? this.email,
      address: address ?? this.address,
      city: city ?? this.city,
      district: district ?? this.district,
      type: type ?? this.type,
      workingHours: workingHours ?? this.workingHours,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

/// İşletme türleri
enum BusinessType {
  barberShop,
  beautySalon,
  spa,
  fitnessCenter,
  medicalClinic,
  dentalClinic,
  veterinary,
  consultancy,
  other,
}

extension BusinessTypeExtension on BusinessType {
  String get displayName {
    switch (this) {
      case BusinessType.barberShop:
        return 'Berber / Kuaför';
      case BusinessType.beautySalon:
        return 'Güzellik Salonu';
      case BusinessType.spa:
        return 'Spa & Wellness';
      case BusinessType.fitnessCenter:
        return 'Spor Salonu';
      case BusinessType.medicalClinic:
        return 'Tıbbi Klinik';
      case BusinessType.dentalClinic:
        return 'Diş Kliniği';
      case BusinessType.veterinary:
        return 'Veteriner';
      case BusinessType.consultancy:
        return 'Danışmanlık';
      case BusinessType.other:
        return 'Diğer';
    }
  }

  String get icon {
    switch (this) {
      case BusinessType.barberShop:
        return '💈';
      case BusinessType.beautySalon:
        return '💅';
      case BusinessType.spa:
        return '🧘';
      case BusinessType.fitnessCenter:
        return '🏋️';
      case BusinessType.medicalClinic:
        return '🏥';
      case BusinessType.dentalClinic:
        return '🦷';
      case BusinessType.veterinary:
        return '🐾';
      case BusinessType.consultancy:
        return '💼';
      case BusinessType.other:
        return '🏢';
    }
  }
}

/// Çalışma saatleri modeli
class WorkingHours extends Equatable {
  final bool isOpen;
  final String? openTime;
  final String? closeTime;
  final String? breakStart;
  final String? breakEnd;

  const WorkingHours({
    this.isOpen = true,
    this.openTime,
    this.closeTime,
    this.breakStart,
    this.breakEnd,
  });

  @override
  List<Object?> get props => [isOpen, openTime, closeTime, breakStart, breakEnd];

  Map<String, dynamic> toMap() {
    return {
      'isOpen': isOpen,
      'openTime': openTime,
      'closeTime': closeTime,
      'breakStart': breakStart,
      'breakEnd': breakEnd,
    };
  }

  factory WorkingHours.fromMap(Map<String, dynamic> map) {
    return WorkingHours(
      isOpen: map['isOpen'] ?? true,
      openTime: map['openTime'],
      closeTime: map['closeTime'],
      breakStart: map['breakStart'],
      breakEnd: map['breakEnd'],
    );
  }

  static Map<String, WorkingHours> defaultWorkingHours() {
    return {
      'monday': const WorkingHours(isOpen: true, openTime: '09:00', closeTime: '18:00'),
      'tuesday': const WorkingHours(isOpen: true, openTime: '09:00', closeTime: '18:00'),
      'wednesday': const WorkingHours(isOpen: true, openTime: '09:00', closeTime: '18:00'),
      'thursday': const WorkingHours(isOpen: true, openTime: '09:00', closeTime: '18:00'),
      'friday': const WorkingHours(isOpen: true, openTime: '09:00', closeTime: '18:00'),
      'saturday': const WorkingHours(isOpen: true, openTime: '10:00', closeTime: '16:00'),
      'sunday': const WorkingHours(isOpen: false),
    };
  }
}
