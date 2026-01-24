import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/business_model.dart';
import '../../domain/entities/business.dart';
import '../../../services/presentation/providers/service_provider.dart';

/// Firebase Auth instance provider
final firebaseAuthProvider = Provider<FirebaseAuth>((ref) {
  return FirebaseAuth.instance;
});

/// Mevcut kullanıcı provider
final currentUserProvider = StreamProvider<User?>((ref) {
  return ref.watch(firebaseAuthProvider).authStateChanges();
});

/// İşletme Repository Provider
final businessRepositoryProvider = Provider<BusinessRepository>((ref) {
  return BusinessRepository(ref.watch(firestoreProvider));
});

/// Kullanıcının işletmesi provider
final userBusinessProvider = StreamProvider<Business?>((ref) {
  final user = ref.watch(currentUserProvider).value;
  if (user == null) return Stream.value(null);
  
  final repository = ref.watch(businessRepositoryProvider);
  return repository.watchUserBusiness(user.uid);
});

/// İşletme detay provider (business_id bazlı)
final businessDetailProvider = StreamProvider.family<Business?, String>((ref, businessId) {
  final repository = ref.watch(businessRepositoryProvider);
  return repository.watchBusiness(businessId);
});

/// İşletme Repository
class BusinessRepository {
  final FirebaseFirestore _firestore;
  
  BusinessRepository(this._firestore);

  CollectionReference get _collection => _firestore.collection('businesses');

  /// İşletmeyi stream olarak döndür
  Stream<Business?> watchBusiness(String businessId) {
    return _collection
        .doc(businessId)
        .snapshots()
        .map((doc) {
          if (!doc.exists) return null;
          return BusinessModel.fromFirestore(doc).toEntity();
        });
  }

  /// Kullanıcının işletmesini stream olarak döndür
  Stream<Business?> watchUserBusiness(String userId) {
    return _collection
        .where('ownerId', isEqualTo: userId)
        .limit(1)
        .snapshots()
        .map((snapshot) {
          if (snapshot.docs.isEmpty) return null;
          return BusinessModel.fromFirestore(snapshot.docs.first).toEntity();
        });
  }

  /// Yeni işletme oluştur
  Future<String> createBusiness(Business business) async {
    final model = BusinessModel.fromEntity(business);
    final docRef = await _collection.add(model.toFirestore());
    return docRef.id;
  }

  /// İşletme güncelle
  Future<void> updateBusiness(Business business) async {
    final model = BusinessModel.fromEntity(business.copyWith(
      updatedAt: DateTime.now(),
    ));
    await _collection.doc(business.id).update(model.toFirestore());
  }

  /// İşletmeyi ID ile getir
  Future<Business?> getBusinessById(String businessId) async {
    final doc = await _collection.doc(businessId).get();
    if (!doc.exists) return null;
    return BusinessModel.fromFirestore(doc).toEntity();
  }

  /// İşletmeyi slug ile getir (public booking için)
  Future<Business?> getBusinessBySlug(String slug) async {
    final snapshot = await _collection
        .where('slug', isEqualTo: slug)
        .limit(1)
        .get();
    
    if (snapshot.docs.isEmpty) return null;
    return BusinessModel.fromFirestore(snapshot.docs.first).toEntity();
  }
}
