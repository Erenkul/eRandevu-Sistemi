import 'package:equatable/equatable.dart';

/// Hizmet veri modeli
class Service extends Equatable {
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

  const Service({
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

  /// Süreyi okunabilir formatta döndürür
  String get formattedDuration {
    if (durationMinutes < 60) {
      return '$durationMinutes dk';
    }
    final hours = durationMinutes ~/ 60;
    final minutes = durationMinutes % 60;
    if (minutes == 0) {
      return '$hours saat';
    }
    return '$hours saat $minutes dk';
  }

  /// Fiyatı formatlı döndürür
  String get formattedPrice {
    return '₺${price.toStringAsFixed(2)}';
  }

  @override
  List<Object?> get props => [
        id,
        businessId,
        name,
        description,
        price,
        durationMinutes,
        category,
        imageUrl,
        isActive,
        displayOrder,
        createdAt,
        updatedAt,
      ];

  Service copyWith({
    String? id,
    String? businessId,
    String? name,
    String? description,
    double? price,
    int? durationMinutes,
    String? category,
    String? imageUrl,
    bool? isActive,
    int? displayOrder,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Service(
      id: id ?? this.id,
      businessId: businessId ?? this.businessId,
      name: name ?? this.name,
      description: description ?? this.description,
      price: price ?? this.price,
      durationMinutes: durationMinutes ?? this.durationMinutes,
      category: category ?? this.category,
      imageUrl: imageUrl ?? this.imageUrl,
      isActive: isActive ?? this.isActive,
      displayOrder: displayOrder ?? this.displayOrder,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

/// Hizmet kategorileri
class ServiceCategory {
  static const String haircut = 'Saç Kesimi';
  static const String beardTrim = 'Sakal Tıraşı';
  static const String skinCare = 'Cilt Bakımı';
  static const String hairStyling = 'Saç Şekillendirme';
  static const String packages = 'Paketler';
  static const String other = 'Diğer';

  static List<String> get all => [
        haircut,
        beardTrim,
        skinCare,
        hairStyling,
        packages,
        other,
      ];
}
