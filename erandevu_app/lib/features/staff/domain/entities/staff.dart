import 'package:equatable/equatable.dart';

/// Personel veri modeli
class Staff extends Equatable {
  final String id;
  final String businessId;
  final String name;
  final String? title;
  final String? photoUrl;
  final String? phone;
  final String? email;
  final List<String> serviceIds;
  final Map<String, StaffWorkingHours> availability;
  final bool isActive;
  final String? bio;
  final int displayOrder;
  final DateTime createdAt;
  final DateTime? updatedAt;

  const Staff({
    required this.id,
    required this.businessId,
    required this.name,
    this.title,
    this.photoUrl,
    this.phone,
    this.email,
    this.serviceIds = const [],
    this.availability = const {},
    this.isActive = true,
    this.bio,
    this.displayOrder = 0,
    required this.createdAt,
    this.updatedAt,
  });

  /// Personelin belirli bir gün müsait olup olmadığını kontrol eder
  bool isAvailableOn(String day) {
    final dayAvailability = availability[day.toLowerCase()];
    return dayAvailability?.isAvailable ?? false;
  }

  /// Personelin belirli bir hizmeti sunup sunmadığını kontrol eder
  bool providesService(String serviceId) {
    return serviceIds.contains(serviceId);
  }

  @override
  List<Object?> get props => [
        id,
        businessId,
        name,
        title,
        photoUrl,
        phone,
        email,
        serviceIds,
        availability,
        isActive,
        bio,
        displayOrder,
        createdAt,
        updatedAt,
      ];

  Staff copyWith({
    String? id,
    String? businessId,
    String? name,
    String? title,
    String? photoUrl,
    String? phone,
    String? email,
    List<String>? serviceIds,
    Map<String, StaffWorkingHours>? availability,
    bool? isActive,
    String? bio,
    int? displayOrder,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Staff(
      id: id ?? this.id,
      businessId: businessId ?? this.businessId,
      name: name ?? this.name,
      title: title ?? this.title,
      photoUrl: photoUrl ?? this.photoUrl,
      phone: phone ?? this.phone,
      email: email ?? this.email,
      serviceIds: serviceIds ?? this.serviceIds,
      availability: availability ?? this.availability,
      isActive: isActive ?? this.isActive,
      bio: bio ?? this.bio,
      displayOrder: displayOrder ?? this.displayOrder,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

/// Personel çalışma saatleri
class StaffWorkingHours extends Equatable {
  final bool isAvailable;
  final String? startTime;
  final String? endTime;
  final String? breakStart;
  final String? breakEnd;

  const StaffWorkingHours({
    this.isAvailable = true,
    this.startTime,
    this.endTime,
    this.breakStart,
    this.breakEnd,
  });

  @override
  List<Object?> get props => [isAvailable, startTime, endTime, breakStart, breakEnd];

  Map<String, dynamic> toMap() {
    return {
      'isAvailable': isAvailable,
      'startTime': startTime,
      'endTime': endTime,
      'breakStart': breakStart,
      'breakEnd': breakEnd,
    };
  }

  factory StaffWorkingHours.fromMap(Map<String, dynamic> map) {
    return StaffWorkingHours(
      isAvailable: map['isAvailable'] ?? true,
      startTime: map['startTime'],
      endTime: map['endTime'],
      breakStart: map['breakStart'],
      breakEnd: map['breakEnd'],
    );
  }

  static Map<String, StaffWorkingHours> defaultAvailability() {
    return {
      'monday': const StaffWorkingHours(isAvailable: true, startTime: '09:00', endTime: '18:00'),
      'tuesday': const StaffWorkingHours(isAvailable: true, startTime: '09:00', endTime: '18:00'),
      'wednesday': const StaffWorkingHours(isAvailable: true, startTime: '09:00', endTime: '18:00'),
      'thursday': const StaffWorkingHours(isAvailable: true, startTime: '09:00', endTime: '18:00'),
      'friday': const StaffWorkingHours(isAvailable: true, startTime: '09:00', endTime: '18:00'),
      'saturday': const StaffWorkingHours(isAvailable: true, startTime: '10:00', endTime: '16:00'),
      'sunday': const StaffWorkingHours(isAvailable: false),
    };
  }
}
