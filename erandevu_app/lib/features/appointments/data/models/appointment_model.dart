import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/appointment.dart';

/// Randevu Firestore modeli
class AppointmentModel {
  final String id;
  final String businessId;
  final String staffId;
  final String? staffName;
  final String? customerId;
  final String customerName;
  final String customerPhone;
  final String? customerEmail;
  final List<Map<String, dynamic>> services;
  final DateTime dateTime;
  final int totalDurationMinutes;
  final double totalPrice;
  final String status;
  final String? notes;
  final String? cancellationReason;
  final bool whatsappReminderEnabled;
  final bool whatsappReminderSent;
  final DateTime createdAt;
  final DateTime? updatedAt;

  AppointmentModel({
    required this.id,
    required this.businessId,
    required this.staffId,
    this.staffName,
    this.customerId,
    required this.customerName,
    required this.customerPhone,
    this.customerEmail,
    required this.services,
    required this.dateTime,
    required this.totalDurationMinutes,
    required this.totalPrice,
    this.status = 'pending',
    this.notes,
    this.cancellationReason,
    this.whatsappReminderEnabled = true,
    this.whatsappReminderSent = false,
    required this.createdAt,
    this.updatedAt,
  });

  factory AppointmentModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return AppointmentModel(
      id: doc.id,
      businessId: data['businessId'] ?? '',
      staffId: data['staffId'] ?? '',
      staffName: data['staffName'],
      customerId: data['customerId'],
      customerName: data['customerName'] ?? '',
      customerPhone: data['customerPhone'] ?? '',
      customerEmail: data['customerEmail'],
      services: List<Map<String, dynamic>>.from(data['services'] ?? []),
      dateTime: (data['dateTime'] as Timestamp?)?.toDate() ?? DateTime.now(),
      totalDurationMinutes: data['totalDurationMinutes'] ?? 0,
      totalPrice: (data['totalPrice'] ?? 0).toDouble(),
      status: data['status'] ?? 'pending',
      notes: data['notes'],
      cancellationReason: data['cancellationReason'],
      whatsappReminderEnabled: data['whatsappReminderEnabled'] ?? true,
      whatsappReminderSent: data['whatsappReminderSent'] ?? false,
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      updatedAt: (data['updatedAt'] as Timestamp?)?.toDate(),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'businessId': businessId,
      'staffId': staffId,
      'staffName': staffName,
      'customerId': customerId,
      'customerName': customerName,
      'customerPhone': customerPhone,
      'customerEmail': customerEmail,
      'services': services,
      'dateTime': Timestamp.fromDate(dateTime),
      'totalDurationMinutes': totalDurationMinutes,
      'totalPrice': totalPrice,
      'status': status,
      'notes': notes,
      'cancellationReason': cancellationReason,
      'whatsappReminderEnabled': whatsappReminderEnabled,
      'whatsappReminderSent': whatsappReminderSent,
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': updatedAt != null ? Timestamp.fromDate(updatedAt!) : null,
    };
  }

  Appointment toEntity() {
    return Appointment(
      id: id,
      businessId: businessId,
      staffId: staffId,
      staffName: staffName,
      customerId: customerId,
      customerName: customerName,
      customerPhone: customerPhone,
      customerEmail: customerEmail,
      services: services.map((s) => AppointmentService.fromMap(s)).toList(),
      dateTime: dateTime,
      totalDurationMinutes: totalDurationMinutes,
      totalPrice: totalPrice,
      status: _parseStatus(status),
      notes: notes,
      cancellationReason: cancellationReason,
      whatsappReminderEnabled: whatsappReminderEnabled,
      whatsappReminderSent: whatsappReminderSent,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  factory AppointmentModel.fromEntity(Appointment entity) {
    return AppointmentModel(
      id: entity.id,
      businessId: entity.businessId,
      staffId: entity.staffId,
      staffName: entity.staffName,
      customerId: entity.customerId,
      customerName: entity.customerName,
      customerPhone: entity.customerPhone,
      customerEmail: entity.customerEmail,
      services: entity.services.map((s) => s.toMap()).toList(),
      dateTime: entity.dateTime,
      totalDurationMinutes: entity.totalDurationMinutes,
      totalPrice: entity.totalPrice,
      status: entity.status.name,
      notes: entity.notes,
      cancellationReason: entity.cancellationReason,
      whatsappReminderEnabled: entity.whatsappReminderEnabled,
      whatsappReminderSent: entity.whatsappReminderSent,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    );
  }

  AppointmentStatus _parseStatus(String status) {
    return AppointmentStatus.values.firstWhere(
      (e) => e.name == status,
      orElse: () => AppointmentStatus.pending,
    );
  }
}
