import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/widgets/app_button.dart';
import '../widgets/booking_header.dart';
import '../widgets/booking_sidebar.dart';
import '../widgets/service_selection.dart';
import '../widgets/staff_selection.dart';
import '../widgets/date_time_selection.dart';
import '../widgets/booking_summary.dart';
import '../providers/booking_provider.dart';

/// Public Booking Sayfası - erandevu.com/{business_id}
class BookingPage extends ConsumerStatefulWidget {
  final String businessId;

  const BookingPage({
    super.key,
    required this.businessId,
  });

  @override
  ConsumerState<BookingPage> createState() => _BookingPageState();
}

class _BookingPageState extends ConsumerState<BookingPage> {
  @override
  Widget build(BuildContext context) {
    final bookingState = ref.watch(bookingStateProvider);
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth > 1024;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Column(
        children: [
          // Header
          BookingHeader(
            currentStep: bookingState.currentStep,
          ),
          // İçerik
          Expanded(
            child: isDesktop
                ? _buildDesktopLayout(bookingState)
                : _buildMobileLayout(bookingState),
          ),
        ],
      ),
    );
  }

  Widget _buildDesktopLayout(BookingState state) {
    return Row(
      children: [
        // Sol Sidebar
        BookingSidebar(
          currentStep: state.currentStep,
          onStepTap: (step) {
            if (step < state.currentStep) {
              ref.read(bookingStateProvider.notifier).goToStep(step);
            }
          },
        ),
        // Ana İçerik
        Expanded(
          child: _buildMainContent(state),
        ),
      ],
    );
  }

  Widget _buildMobileLayout(BookingState state) {
    return _buildMainContent(state);
  }

  Widget _buildMainContent(BookingState state) {
    return Row(
      children: [
        // Hizmet/Personel/Tarih seçimi
        Expanded(
          flex: 2,
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(32),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildStepContent(state),
                AppSpacing.gapH32,
                _buildNavigationButtons(state),
              ],
            ),
          ),
        ),
        // Sağ taraf - Özet (sadece desktop)
        if (MediaQuery.of(context).size.width > 1024)
          SizedBox(
            width: 360,
            child: BookingSummary(
              selectedServices: state.selectedServices,
              selectedStaff: state.selectedStaff,
              selectedDate: state.selectedDate,
              selectedTime: state.selectedTime,
              onConfirm: state.currentStep == 3 ? _handleConfirmBooking : null,
            ),
          ),
      ],
    );
  }

  Widget _buildStepContent(BookingState state) {
    switch (state.currentStep) {
      case 0:
        return ServiceSelection(
          businessId: widget.businessId,
          selectedServices: state.selectedServices,
          onServiceToggle: (service) {
            ref.read(bookingStateProvider.notifier).toggleService(service);
          },
        );
      case 1:
        return StaffSelection(
          businessId: widget.businessId,
          selectedStaff: state.selectedStaff,
          onStaffSelected: (staff) {
            ref.read(bookingStateProvider.notifier).selectStaff(staff);
          },
        );
      case 2:
        return DateTimeSelection(
          selectedDate: state.selectedDate,
          selectedTime: state.selectedTime,
          totalDuration: state.totalDuration,
          onDateSelected: (date) {
            ref.read(bookingStateProvider.notifier).selectDate(date);
          },
          onTimeSelected: (time) {
            ref.read(bookingStateProvider.notifier).selectTime(time);
          },
        );
      case 3:
        return _buildContactForm();
      default:
        return const SizedBox();
    }
  }

  Widget _buildContactForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'İletişim Bilgileri',
          style: GoogleFonts.inter(
            fontSize: 28,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
        AppSpacing.gapH8,
        Text(
          'Rezervasyon detaylarını size iletebilmemiz için bilgilerinizi girin.',
          style: GoogleFonts.inter(
            fontSize: 16,
            color: AppColors.textSecondary,
          ),
        ),
        AppSpacing.gapH32,
        // Kişisel bilgiler kartı
        Container(
          padding: AppSpacing.cardPaddingLarge,
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: AppSpacing.borderRadiusLG,
            border: Border.all(color: AppColors.outline),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: AppColors.primaryContainer,
                      borderRadius: AppSpacing.borderRadiusSM,
                    ),
                    child: const Icon(
                      Icons.person_outline,
                      color: AppColors.primary,
                      size: 20,
                    ),
                  ),
                  AppSpacing.gapW12,
                  Text(
                    'Kişisel Bilgiler',
                    style: GoogleFonts.inter(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
              AppSpacing.gapH24,
              TextFormField(
                decoration: const InputDecoration(
                  labelText: 'Ad Soyad',
                  hintText: 'Adınızı ve soyadınızı girin',
                ),
              ),
              AppSpacing.gapH16,
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      keyboardType: TextInputType.phone,
                      decoration: const InputDecoration(
                        labelText: 'Telefon Numarası',
                        hintText: '05XX XXX XX XX',
                        prefixIcon: Icon(Icons.phone_outlined),
                      ),
                    ),
                  ),
                  AppSpacing.gapW16,
                  Expanded(
                    child: TextFormField(
                      keyboardType: TextInputType.emailAddress,
                      decoration: const InputDecoration(
                        labelText: 'E-posta Adresi',
                        hintText: 'ornek@email.com',
                        prefixIcon: Icon(Icons.email_outlined),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        AppSpacing.gapH24,
        // WhatsApp hatırlatma
        Container(
          padding: AppSpacing.cardPadding,
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: AppSpacing.borderRadiusLG,
            border: Border.all(color: AppColors.outline),
          ),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: const Color(0xFF25D366).withValues(alpha: 0.1),
                  borderRadius: AppSpacing.borderRadiusSM,
                ),
                child: const Icon(
                  Icons.chat,
                  color: Color(0xFF25D366),
                  size: 20,
                ),
              ),
              AppSpacing.gapW12,
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'WhatsApp Hatırlatma',
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Text(
                      'Randevu saatinden 1 saat önce mesaj al.',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              Switch(
                value: true,
                onChanged: (value) {},
                activeColor: AppColors.primary,
              ),
            ],
          ),
        ),
        AppSpacing.gapH24,
        // KVKK metni
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(
              Icons.shield_outlined,
              size: 16,
              color: AppColors.textTertiary,
            ),
            AppSpacing.gapW8,
            Expanded(
              child: RichText(
                text: TextSpan(
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: AppColors.textTertiary,
                    height: 1.5,
                  ),
                  children: [
                    const TextSpan(
                      text: 'Kişisel verileriniz 6698 sayılı KVKK kapsamında işlenmekte ve korunmaktadır. Randevunuzu onaylayarak ',
                    ),
                    TextSpan(
                      text: 'Aydınlatma Metni',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: AppColors.primary,
                        decoration: TextDecoration.underline,
                      ),
                    ),
                    const TextSpan(
                      text: '\'ni okuduğunuzu kabul edersiniz.',
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildNavigationButtons(BookingState state) {
    final canProceed = _canProceedToNextStep(state);

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        if (state.currentStep > 0)
          SecondaryButton(
            text: 'Back',
            icon: Icons.arrow_back,
            onPressed: () {
              ref.read(bookingStateProvider.notifier).previousStep();
            },
          )
        else
          const SizedBox(),
        PrimaryButton(
          text: state.currentStep == 3 ? 'Randevuyu Onayla' : 'Continue',
          icon: state.currentStep == 3 ? Icons.check : Icons.arrow_forward,
          onPressed: canProceed
              ? () {
                  if (state.currentStep == 3) {
                    _handleConfirmBooking();
                  } else {
                    ref.read(bookingStateProvider.notifier).nextStep();
                  }
                }
              : null,
        ),
      ],
    );
  }

  bool _canProceedToNextStep(BookingState state) {
    switch (state.currentStep) {
      case 0:
        return state.selectedServices.isNotEmpty;
      case 1:
        return state.selectedStaff != null;
      case 2:
        return state.selectedDate != null && state.selectedTime != null;
      case 3:
        return true; // Form validation'a bağlı olacak
      default:
        return false;
    }
  }

  void _handleConfirmBooking() {
    // Randevu oluşturma işlemi
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Randevu Onaylandı!'),
        content: const Text('Randevunuz başarıyla oluşturuldu. WhatsApp üzerinden hatırlatma alacaksınız.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Tamam'),
          ),
        ],
      ),
    );
  }
}
