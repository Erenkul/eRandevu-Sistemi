import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/business.dart';

/// İşletme Firestore modeli
class BusinessModel {
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
  final String type;
  final Map<String, dynamic> workingHours;
  final bool isActive;
  final DateTime createdAt;
  final DateTime? updatedAt;

  BusinessModel({
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
    this.type = 'other',
    this.workingHours = const {},
    this.isActive = true,
    required this.createdAt,
    this.updatedAt,
  });

  factory BusinessModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return BusinessModel(
      id: doc.id,
      name: data['name'] ?? '',
      description: data['description'],
      logoUrl: data['logoUrl'],
      coverImageUrl: data['coverImageUrl'],
      ownerId: data['ownerId'] ?? '',
      phone: data['phone'],
      email: data['email'],
      address: data['address'],
      city: data['city'],
      district: data['district'],
      type: data['type'] ?? 'other',
      workingHours: Map<String, dynamic>.from(data['workingHours'] ?? {}),
      isActive: data['isActive'] ?? true,
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      updatedAt: (data['updatedAt'] as Timestamp?)?.toDate(),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'name': name,
      'description': description,
      'logoUrl': logoUrl,
      'coverImageUrl': coverImageUrl,
      'ownerId': ownerId,
      'phone': phone,
      'email': email,
      'address': address,
      'city': city,
      'district': district,
      'type': type,
      'workingHours': workingHours,
      'isActive': isActive,
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': updatedAt != null ? Timestamp.fromDate(updatedAt!) : null,
    };
  }

  Business toEntity() {
    return Business(
      id: id,
      name: name,
      description: description,
      logoUrl: logoUrl,
      coverImageUrl: coverImageUrl,
      ownerId: ownerId,
      phone: phone,
      email: email,
      address: address,
      city: city,
      district: district,
      type: _parseBusinessType(type),
      workingHours: workingHours.map(
        (key, value) => MapEntry(key, WorkingHours.fromMap(value as Map<String, dynamic>)),
      ),
      isActive: isActive,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  factory BusinessModel.fromEntity(Business entity) {
    return BusinessModel(
      id: entity.id,
      name: entity.name,
      description: entity.description,
      logoUrl: entity.logoUrl,
      coverImageUrl: entity.coverImageUrl,
      ownerId: entity.ownerId,
      phone: entity.phone,
      email: entity.email,
      address: entity.address,
      city: entity.city,
      district: entity.district,
      type: entity.type.name,
      workingHours: entity.workingHours.map((key, value) => MapEntry(key, value.toMap())),
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    );
  }

  BusinessType _parseBusinessType(String type) {
    return BusinessType.values.firstWhere(
      (e) => e.name == type,
      orElse: () => BusinessType.other,
    );
  }
}
