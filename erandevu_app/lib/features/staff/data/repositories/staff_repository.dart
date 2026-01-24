import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/staff_model.dart';
import '../../domain/entities/staff.dart';
import '../../../services/presentation/providers/service_provider.dart';

/// Personel Repository Provider
final staffRepositoryProvider = Provider<StaffRepository>((ref) {
  return StaffRepository(ref.watch(firestoreProvider));
});

/// Personel listesi provider (business_id bazlı)
final staffListProvider = StreamProvider.family<List<Staff>, String>((ref, businessId) {
  final repository = ref.watch(staffRepositoryProvider);
  return repository.watchStaff(businessId);
});

/// Aktif personel provider
final activeStaffProvider = StreamProvider.family<List<Staff>, String>((ref, businessId) {
  final repository = ref.watch(staffRepositoryProvider);
  return repository.watchActiveStaff(businessId);
});

/// Belirli bir hizmeti sunan personeller
final staffByServiceProvider = StreamProvider.family<List<Staff>, ({String businessId, String serviceId})>((ref, params) {
  final repository = ref.watch(staffRepositoryProvider);
  return repository.watchStaffByService(params.businessId, params.serviceId);
});

/// Personel Repository
class StaffRepository {
  final FirebaseFirestore _firestore;
  
  StaffRepository(this._firestore);

  CollectionReference get _collection => _firestore.collection('staff');

  /// Tüm personelleri stream olarak döndür
  Stream<List<Staff>> watchStaff(String businessId) {
    return _collection
        .where('businessId', isEqualTo: businessId)
        .orderBy('displayOrder')
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => StaffModel.fromFirestore(doc).toEntity())
            .toList());
  }

  /// Sadece aktif personelleri stream olarak döndür
  Stream<List<Staff>> watchActiveStaff(String businessId) {
    return _collection
        .where('businessId', isEqualTo: businessId)
        .where('isActive', isEqualTo: true)
        .orderBy('displayOrder')
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => StaffModel.fromFirestore(doc).toEntity())
            .toList());
  }

  /// Belirli bir hizmeti sunan personelleri döndür
  Stream<List<Staff>> watchStaffByService(String businessId, String serviceId) {
    return _collection
        .where('businessId', isEqualTo: businessId)
        .where('serviceIds', arrayContains: serviceId)
        .where('isActive', isEqualTo: true)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => StaffModel.fromFirestore(doc).toEntity())
            .toList());
  }

  /// Yeni personel ekle
  Future<String> createStaff(Staff staff) async {
    final model = StaffModel.fromEntity(staff);
    final docRef = await _collection.add(model.toFirestore());
    return docRef.id;
  }

  /// Personel güncelle
  Future<void> updateStaff(Staff staff) async {
    final model = StaffModel.fromEntity(staff.copyWith(
      updatedAt: DateTime.now(),
    ));
    await _collection.doc(staff.id).update(model.toFirestore());
  }

  /// Personel sil
  Future<void> deleteStaff(String staffId) async {
    await _collection.doc(staffId).delete();
  }

  /// Personeli ID ile getir
  Future<Staff?> getStaffById(String staffId) async {
    final doc = await _collection.doc(staffId).get();
    if (!doc.exists) return null;
    return StaffModel.fromFirestore(doc).toEntity();
  }
}
