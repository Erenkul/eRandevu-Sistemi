import 'package:equatable/equatable.dart';

/// Randevu veri modeli
class Appointment extends Equatable {
  final String id;
  final String businessId;
  final String staffId;
  final String? staffName;
  final String? customerId;
  final String customerName;
  final String customerPhone;
  final String? customerEmail;
  final List<AppointmentService> services;
  final DateTime dateTime;
  final int totalDurationMinutes;
  final double totalPrice;
  final AppointmentStatus status;
  final String? notes;
  final String? cancellationReason;
  final bool whatsappReminderEnabled;
  final bool whatsappReminderSent;
  final DateTime createdAt;
  final DateTime? updatedAt;

  const Appointment({
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
    this.status = AppointmentStatus.pending,
    this.notes,
    this.cancellationReason,
    this.whatsappReminderEnabled = true,
    this.whatsappReminderSent = false,
    required this.createdAt,
    this.updatedAt,
  });

  /// Randevunun bitiş zamanını hesaplar
  DateTime get endDateTime => dateTime.add(Duration(minutes: totalDurationMinutes));

  /// Randevunun formatlı tarih/saat bilgisini döndürür
  String get formattedDateTime {
    final day = dateTime.day.toString().padLeft(2, '0');
    final month = _getMonthName(dateTime.month);
    final year = dateTime.year;
    final hour = dateTime.hour.toString().padLeft(2, '0');
    final minute = dateTime.minute.toString().padLeft(2, '0');
    return '$day $month $year, $hour:$minute';
  }

  /// Randevunun formatlı saat aralığını döndürür
  String get formattedTimeRange {
    final startHour = dateTime.hour.toString().padLeft(2, '0');
    final startMinute = dateTime.minute.toString().padLeft(2, '0');
    final endHour = endDateTime.hour.toString().padLeft(2, '0');
    final endMinute = endDateTime.minute.toString().padLeft(2, '0');
    return '$startHour:$startMinute - $endHour:$endMinute';
  }

  String _getMonthName(int month) {
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    return months[month - 1];
  }

  @override
  List<Object?> get props => [
        id,
        businessId,
        staffId,
        staffName,
        customerId,
        customerName,
        customerPhone,
        customerEmail,
        services,
        dateTime,
        totalDurationMinutes,
        totalPrice,
        status,
        notes,
        cancellationReason,
        whatsappReminderEnabled,
        whatsappReminderSent,
        createdAt,
        updatedAt,
      ];

  Appointment copyWith({
    String? id,
    String? businessId,
    String? staffId,
    String? staffName,
    String? customerId,
    String? customerName,
    String? customerPhone,
    String? customerEmail,
    List<AppointmentService>? services,
    DateTime? dateTime,
    int? totalDurationMinutes,
    double? totalPrice,
    AppointmentStatus? status,
    String? notes,
    String? cancellationReason,
    bool? whatsappReminderEnabled,
    bool? whatsappReminderSent,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Appointment(
      id: id ?? this.id,
      businessId: businessId ?? this.businessId,
      staffId: staffId ?? this.staffId,
      staffName: staffName ?? this.staffName,
      customerId: customerId ?? this.customerId,
      customerName: customerName ?? this.customerName,
      customerPhone: customerPhone ?? this.customerPhone,
      customerEmail: customerEmail ?? this.customerEmail,
      services: services ?? this.services,
      dateTime: dateTime ?? this.dateTime,
      totalDurationMinutes: totalDurationMinutes ?? this.totalDurationMinutes,
      totalPrice: totalPrice ?? this.totalPrice,
      status: status ?? this.status,
      notes: notes ?? this.notes,
      cancellationReason: cancellationReason ?? this.cancellationReason,
      whatsappReminderEnabled: whatsappReminderEnabled ?? this.whatsappReminderEnabled,
      whatsappReminderSent: whatsappReminderSent ?? this.whatsappReminderSent,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

/// Randevu içindeki hizmet bilgisi
class AppointmentService extends Equatable {
  final String serviceId;
  final String serviceName;
  final double price;
  final int durationMinutes;

  const AppointmentService({
    required this.serviceId,
    required this.serviceName,
    required this.price,
    required this.durationMinutes,
  });

  @override
  List<Object?> get props => [serviceId, serviceName, price, durationMinutes];

  Map<String, dynamic> toMap() {
    return {
      'serviceId': serviceId,
      'serviceName': serviceName,
      'price': price,
      'durationMinutes': durationMinutes,
    };
  }

  factory AppointmentService.fromMap(Map<String, dynamic> map) {
    return AppointmentService(
      serviceId: map['serviceId'] ?? '',
      serviceName: map['serviceName'] ?? '',
      price: (map['price'] ?? 0).toDouble(),
      durationMinutes: map['durationMinutes'] ?? 0,
    );
  }
}

/// Randevu durumu
enum AppointmentStatus {
  pending,
  confirmed,
  inProgress,
  completed,
  cancelled,
  noShow,
}

extension AppointmentStatusExtension on AppointmentStatus {
  String get displayName {
    switch (this) {
      case AppointmentStatus.pending:
        return 'Beklemede';
      case AppointmentStatus.confirmed:
        return 'Onaylı';
      case AppointmentStatus.inProgress:
        return 'Devam Ediyor';
      case AppointmentStatus.completed:
        return 'Tamamlandı';
      case AppointmentStatus.cancelled:
        return 'İptal Edildi';
      case AppointmentStatus.noShow:
        return 'Gelmedi';
    }
  }

  String get color {
    switch (this) {
      case AppointmentStatus.pending:
        return '#F59E0B';
      case AppointmentStatus.confirmed:
        return '#10B981';
      case AppointmentStatus.inProgress:
        return '#3B82F6';
      case AppointmentStatus.completed:
        return '#6B7280';
      case AppointmentStatus.cancelled:
        return '#EF4444';
      case AppointmentStatus.noShow:
        return '#DC2626';
    }
  }
}
