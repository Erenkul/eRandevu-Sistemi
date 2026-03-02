import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/appointment_model.dart';
import '../../domain/entities/appointment.dart';
import '../../../services/presentation/providers/service_provider.dart';

/// Randevu Repository Provider
final appointmentRepositoryProvider = Provider<AppointmentRepository>((ref) {
  return AppointmentRepository(ref.watch(firestoreProvider));
});

/// Günlük randevular provider
final dailyAppointmentsProvider = StreamProvider.family<List<Appointment>, ({String businessId, DateTime date})>((ref, params) {
  final repository = ref.watch(appointmentRepositoryProvider);
  return repository.watchDailyAppointments(params.businessId, params.date);
});

/// Personel randevuları provider
final staffAppointmentsProvider = StreamProvider.family<List<Appointment>, ({String staffId, DateTime date})>((ref, params) {
  final repository = ref.watch(appointmentRepositoryProvider);
  return repository.watchStaffAppointments(params.staffId, params.date);
});

/// Bugünkü randevular provider
final todayAppointmentsProvider = StreamProvider.family<List<Appointment>, String>((ref, businessId) {
  final repository = ref.watch(appointmentRepositoryProvider);
  return repository.watchDailyAppointments(businessId, DateTime.now());
});

/// Randevu Repository
class AppointmentRepository {
  final FirebaseFirestore _firestore;
  
  AppointmentRepository(this._firestore);

  CollectionReference get _collection => _firestore.collection('appointments');

  /// Günlük randevuları stream olarak döndür
  Stream<List<Appointment>> watchDailyAppointments(String businessId, DateTime date) {
    final startOfDay = DateTime(date.year, date.month, date.day);
    final endOfDay = DateTime(date.year, date.month, date.day, 23, 59, 59);
    
    return _collection
        .where('businessId', isEqualTo: businessId)
        .where('dateTime', isGreaterThanOrEqualTo: Timestamp.fromDate(startOfDay))
        .where('dateTime', isLessThanOrEqualTo: Timestamp.fromDate(endOfDay))
        .orderBy('dateTime')
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => AppointmentModel.fromFirestore(doc).toEntity())
            .toList());
  }

  /// Personel randevularını stream olarak döndür
  Stream<List<Appointment>> watchStaffAppointments(String staffId, DateTime date) {
    final startOfDay = DateTime(date.year, date.month, date.day);
    final endOfDay = DateTime(date.year, date.month, date.day, 23, 59, 59);
    
    return _collection
        .where('staffId', isEqualTo: staffId)
        .where('dateTime', isGreaterThanOrEqualTo: Timestamp.fromDate(startOfDay))
        .where('dateTime', isLessThanOrEqualTo: Timestamp.fromDate(endOfDay))
        .orderBy('dateTime')
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => AppointmentModel.fromFirestore(doc).toEntity())
            .toList());
  }

  /// Yeni randevu oluştur
  Future<String> createAppointment(Appointment appointment) async {
    final model = AppointmentModel.fromEntity(appointment);
    final docRef = await _collection.add(model.toFirestore());
    return docRef.id;
  }

  /// Randevu durumunu güncelle
  Future<void> updateAppointmentStatus(String appointmentId, AppointmentStatus status, {String? cancellationReason}) async {
    final updates = <String, dynamic>{
      'status': status.name,
      'updatedAt': Timestamp.fromDate(DateTime.now()),
    };
    
    if (cancellationReason != null) {
      updates['cancellationReason'] = cancellationReason;
    }
    
    await _collection.doc(appointmentId).update(updates);
  }

  /// Randevu güncelle
  Future<void> updateAppointment(Appointment appointment) async {
    final model = AppointmentModel.fromEntity(appointment.copyWith(
      updatedAt: DateTime.now(),
    ));
    await _collection.doc(appointment.id).update(model.toFirestore());
  }

  /// Randevu iptal et
  Future<void> cancelAppointment(String appointmentId, String reason) async {
    await updateAppointmentStatus(appointmentId, AppointmentStatus.cancelled, cancellationReason: reason);
  }

  /// Müsait zaman dilimlerini hesapla
  Future<List<DateTime>> getAvailableSlots({
    required String businessId,
    required String staffId,
    required DateTime date,
    required int durationMinutes,
    required String openTime,
    required String closeTime,
  }) async {
    // Mevcut randevuları al
    final startOfDay = DateTime(date.year, date.month, date.day);
    final endOfDay = DateTime(date.year, date.month, date.day, 23, 59, 59);
    
    final snapshot = await _collection
        .where('staffId', isEqualTo: staffId)
        .where('dateTime', isGreaterThanOrEqualTo: Timestamp.fromDate(startOfDay))
        .where('dateTime', isLessThanOrEqualTo: Timestamp.fromDate(endOfDay))
        .where('status', whereNotIn: ['cancelled', 'noShow'])
        .get();
    
    final existingAppointments = snapshot.docs
        .map((doc) => AppointmentModel.fromFirestore(doc).toEntity())
        .toList();
    
    // Müsait slotları hesapla
    final availableSlots = <DateTime>[];
    
    final openParts = openTime.split(':');
    final closeParts = closeTime.split(':');
    
    var currentSlot = DateTime(
      date.year,
      date.month,
      date.day,
      int.parse(openParts[0]),
      int.parse(openParts[1]),
    );
    
    final closeDateTime = DateTime(
      date.year,
      date.month,
      date.day,
      int.parse(closeParts[0]),
      int.parse(closeParts[1]),
    );
    
    while (currentSlot.add(Duration(minutes: durationMinutes)).isBefore(closeDateTime) ||
           currentSlot.add(Duration(minutes: durationMinutes)).isAtSameMomentAs(closeDateTime)) {
      final slotEnd = currentSlot.add(Duration(minutes: durationMinutes));
      
      // Bu slot başka bir randevuyla çakışıyor mu kontrol et
      final hasConflict = existingAppointments.any((apt) {
        final aptStart = apt.dateTime;
        final aptEnd = apt.endDateTime;
        
        // Çakışma kontrolü
        return (currentSlot.isBefore(aptEnd) && slotEnd.isAfter(aptStart));
      });
      
      if (!hasConflict && currentSlot.isAfter(DateTime.now())) {
        availableSlots.add(currentSlot);
      }
      
      currentSlot = currentSlot.add(const Duration(minutes: 30)); // 30 dakikalık aralıklar
    }
    
    return availableSlots;
  }
}
