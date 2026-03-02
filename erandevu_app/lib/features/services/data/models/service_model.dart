import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/service.dart';

/// Hizmet Firestore modeli
class ServiceModel {
  final String id;
  final String businessId;
  final String name;
  final String? description;
  final double price;
  final int durationMinutes;
  final String? category;
  final String? imageUrl;
  final bool isActive;
  final int displayOrder;
  final DateTime createdAt;
  final DateTime? updatedAt;

  ServiceModel({
    required this.id,
    required this.businessId,
    required this.name,
    this.description,
    required this.price,
    required this.durationMinutes,
    this.category,
    this.imageUrl,
    this.isActive = true,
    this.displayOrder = 0,
    required this.createdAt,
    this.updatedAt,
  });

  factory ServiceModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return ServiceModel(
      id: doc.id,
      businessId: data['businessId'] ?? '',
      name: data['name'] ?? '',
      description: data['description'],
      price: (data['price'] ?? 0).toDouble(),
      durationMinutes: data['durationMinutes'] ?? 30,
      category: data['category'],
      imageUrl: data['imageUrl'],
      isActive: data['isActive'] ?? true,
      displayOrder: data['displayOrder'] ?? 0,
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      updatedAt: (data['updatedAt'] as Timestamp?)?.toDate(),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'businessId': businessId,
      'name': name,
      'description': description,
      'price': price,
      'durationMinutes': durationMinutes,
      'category': category,
      'imageUrl': imageUrl,
      'isActive': isActive,
      'displayOrder': displayOrder,
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': updatedAt != null ? Timestamp.fromDate(updatedAt!) : null,
    };
  }

  Service toEntity() {
    return Service(
      id: id,
      businessId: businessId,
      name: name,
      description: description,
      price: price,
      durationMinutes: durationMinutes,
      category: category,
      imageUrl: imageUrl,
      isActive: isActive,
      displayOrder: displayOrder,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  factory ServiceModel.fromEntity(Service entity) {
    return ServiceModel(
      id: entity.id,
      businessId: entity.businessId,
      name: entity.name,
      description: entity.description,
      price: entity.price,
      durationMinutes: entity.durationMinutes,
      category: entity.category,
      imageUrl: entity.imageUrl,
      isActive: entity.isActive,
      displayOrder: entity.displayOrder,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    );
  }
}
