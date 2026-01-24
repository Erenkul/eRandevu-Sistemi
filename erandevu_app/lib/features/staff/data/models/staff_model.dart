import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/staff.dart';

/// Personel Firestore modeli
class StaffModel {
  final String id;
  final String businessId;
  final String name;
  final String? title;
  final String? photoUrl;
  final String? phone;
  final String? email;
  final List<String> serviceIds;
  final Map<String, dynamic> availability;
  final bool isActive;
  final String? bio;
  final int displayOrder;
  final DateTime createdAt;
  final DateTime? updatedAt;

  StaffModel({
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

  factory StaffModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return StaffModel(
      id: doc.id,
      businessId: data['businessId'] ?? '',
      name: data['name'] ?? '',
      title: data['title'],
      photoUrl: data['photoUrl'],
      phone: data['phone'],
      email: data['email'],
      serviceIds: List<String>.from(data['serviceIds'] ?? []),
      availability: Map<String, dynamic>.from(data['availability'] ?? {}),
      isActive: data['isActive'] ?? true,
      bio: data['bio'],
      displayOrder: data['displayOrder'] ?? 0,
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      updatedAt: (data['updatedAt'] as Timestamp?)?.toDate(),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'businessId': businessId,
      'name': name,
      'title': title,
      'photoUrl': photoUrl,
      'phone': phone,
      'email': email,
      'serviceIds': serviceIds,
      'availability': availability,
      'isActive': isActive,
      'bio': bio,
      'displayOrder': displayOrder,
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': updatedAt != null ? Timestamp.fromDate(updatedAt!) : null,
    };
  }

  Staff toEntity() {
    return Staff(
      id: id,
      businessId: businessId,
      name: name,
      title: title,
      photoUrl: photoUrl,
      phone: phone,
      email: email,
      serviceIds: serviceIds,
      availability: availability.map(
        (key, value) => MapEntry(key, StaffWorkingHours.fromMap(value as Map<String, dynamic>)),
      ),
      isActive: isActive,
      bio: bio,
      displayOrder: displayOrder,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  factory StaffModel.fromEntity(Staff entity) {
    return StaffModel(
      id: entity.id,
      businessId: entity.businessId,
      name: entity.name,
      title: entity.title,
      photoUrl: entity.photoUrl,
      phone: entity.phone,
      email: entity.email,
      serviceIds: entity.serviceIds,
      availability: entity.availability.map((key, value) => MapEntry(key, value.toMap())),
      isActive: entity.isActive,
      bio: entity.bio,
      displayOrder: entity.displayOrder,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    );
  }
}
