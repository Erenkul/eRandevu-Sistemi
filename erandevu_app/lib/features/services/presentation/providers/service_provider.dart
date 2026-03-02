import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/service_model.dart';
import '../../domain/entities/service.dart';

/// Firestore instance provider
final firestoreProvider = Provider<FirebaseFirestore>((ref) {
  return FirebaseFirestore.instance;
});

/// Hizmet Repository Provider
final serviceRepositoryProvider = Provider<ServiceRepository>((ref) {
  return ServiceRepository(ref.watch(firestoreProvider));
});

/// Hizmet listesi provider (business_id bazlı)
final servicesProvider = StreamProvider.family<List<Service>, String>((ref, businessId) {
  final repository = ref.watch(serviceRepositoryProvider);
  return repository.watchServices(businessId);
});

/// Aktif hizmetler provider
final activeServicesProvider = StreamProvider.family<List<Service>, String>((ref, businessId) {
  final repository = ref.watch(serviceRepositoryProvider);
  return repository.watchActiveServices(businessId);
});

/// Hizmet Repository
class ServiceRepository {
  final FirebaseFirestore _firestore;
  
  ServiceRepository(this._firestore);

  CollectionReference get _collection => _firestore.collection('services');

  /// Tüm hizmetleri stream olarak döndür
  Stream<List<Service>> watchServices(String businessId) {
    return _collection
        .where('businessId', isEqualTo: businessId)
        .orderBy('displayOrder')
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => ServiceModel.fromFirestore(doc).toEntity())
            .toList());
  }

  /// Sadece aktif hizmetleri stream olarak döndür
  Stream<List<Service>> watchActiveServices(String businessId) {
    return _collection
        .where('businessId', isEqualTo: businessId)
        .where('isActive', isEqualTo: true)
        .orderBy('displayOrder')
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => ServiceModel.fromFirestore(doc).toEntity())
            .toList());
  }

  /// Yeni hizmet ekle
  Future<String> createService(Service service) async {
    final model = ServiceModel.fromEntity(service);
    final docRef = await _collection.add(model.toFirestore());
    return docRef.id;
  }

  /// Hizmet güncelle
  Future<void> updateService(Service service) async {
    final model = ServiceModel.fromEntity(service.copyWith(
      updatedAt: DateTime.now(),
    ));
    await _collection.doc(service.id).update(model.toFirestore());
  }

  /// Hizmet sil
  Future<void> deleteService(String serviceId) async {
    await _collection.doc(serviceId).delete();
  }

  /// Hizmeti ID ile getir
  Future<Service?> getServiceById(String serviceId) async {
    final doc = await _collection.doc(serviceId).get();
    if (!doc.exists) return null;
    return ServiceModel.fromFirestore(doc).toEntity();
  }

  /// Kategoriye göre hizmetleri getir
  Stream<List<Service>> watchServicesByCategory(String businessId, String category) {
    return _collection
        .where('businessId', isEqualTo: businessId)
        .where('category', isEqualTo: category)
        .where('isActive', isEqualTo: true)
        .orderBy('displayOrder')
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => ServiceModel.fromFirestore(doc).toEntity())
            .toList());
  }
}
