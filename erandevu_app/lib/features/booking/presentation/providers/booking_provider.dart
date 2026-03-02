import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../services/domain/entities/service.dart';
import '../../../staff/domain/entities/staff.dart';

/// Booking durumu
class BookingState {
  final int currentStep;
  final List<Service> selectedServices;
  final Staff? selectedStaff;
  final DateTime? selectedDate;
  final String? selectedTime;
  final String? customerName;
  final String? customerPhone;
  final String? customerEmail;
  final bool whatsappReminder;

  const BookingState({
    this.currentStep = 0,
    this.selectedServices = const [],
    this.selectedStaff,
    this.selectedDate,
    this.selectedTime,
    this.customerName,
    this.customerPhone,
    this.customerEmail,
    this.whatsappReminder = true,
  });

  /// Toplam süre (dakika)
  int get totalDuration {
    return selectedServices.fold(0, (sum, s) => sum + s.durationMinutes);
  }

  /// Toplam fiyat
  double get totalPrice {
    return selectedServices.fold(0.0, (sum, s) => sum + s.price);
  }

  /// Formatlı toplam süre
  String get formattedDuration {
    if (totalDuration < 60) {
      return '$totalDuration dk';
    }
    final hours = totalDuration ~/ 60;
    final minutes = totalDuration % 60;
    if (minutes == 0) {
      return '$hours saat';
    }
    return '$hours saat $minutes dk';
  }

  BookingState copyWith({
    int? currentStep,
    List<Service>? selectedServices,
    Staff? selectedStaff,
    DateTime? selectedDate,
    String? selectedTime,
    String? customerName,
    String? customerPhone,
    String? customerEmail,
    bool? whatsappReminder,
  }) {
    return BookingState(
      currentStep: currentStep ?? this.currentStep,
      selectedServices: selectedServices ?? this.selectedServices,
      selectedStaff: selectedStaff ?? this.selectedStaff,
      selectedDate: selectedDate ?? this.selectedDate,
      selectedTime: selectedTime ?? this.selectedTime,
      customerName: customerName ?? this.customerName,
      customerPhone: customerPhone ?? this.customerPhone,
      customerEmail: customerEmail ?? this.customerEmail,
      whatsappReminder: whatsappReminder ?? this.whatsappReminder,
    );
  }
}

/// Booking State Notifier
class BookingStateNotifier extends StateNotifier<BookingState> {
  BookingStateNotifier() : super(const BookingState());

  void toggleService(Service service) {
    final services = List<Service>.from(state.selectedServices);
    
    if (services.any((s) => s.id == service.id)) {
      services.removeWhere((s) => s.id == service.id);
    } else {
      services.add(service);
    }
    
    state = state.copyWith(selectedServices: services);
  }

  void selectStaff(Staff? staff) {
    state = state.copyWith(selectedStaff: staff);
  }

  void selectDate(DateTime date) {
    state = state.copyWith(
      selectedDate: date,
      selectedTime: null, // Tarih değişince saati sıfırla
    );
  }

  void selectTime(String time) {
    state = state.copyWith(selectedTime: time);
  }

  void updateCustomerInfo({
    String? name,
    String? phone,
    String? email,
  }) {
    state = state.copyWith(
      customerName: name ?? state.customerName,
      customerPhone: phone ?? state.customerPhone,
      customerEmail: email ?? state.customerEmail,
    );
  }

  void toggleWhatsappReminder() {
    state = state.copyWith(whatsappReminder: !state.whatsappReminder);
  }

  void nextStep() {
    if (state.currentStep < 3) {
      state = state.copyWith(currentStep: state.currentStep + 1);
    }
  }

  void previousStep() {
    if (state.currentStep > 0) {
      state = state.copyWith(currentStep: state.currentStep - 1);
    }
  }

  void goToStep(int step) {
    if (step >= 0 && step <= 3) {
      state = state.copyWith(currentStep: step);
    }
  }

  void reset() {
    state = const BookingState();
  }
}

/// Provider
final bookingStateProvider = StateNotifierProvider<BookingStateNotifier, BookingState>((ref) {
  return BookingStateNotifier();
});
