import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_components.dart';
import '../../../services/domain/entities/service.dart';
import '../../../staff/domain/entities/staff.dart';

/// Booking özet paneli
class BookingSummary extends StatelessWidget {
  final List<Service> selectedServices;
  final Staff? selectedStaff;
  final DateTime? selectedDate;
  final String? selectedTime;
  final VoidCallback? onConfirm;

  const BookingSummary({
    super.key,
    required this.selectedServices,
    this.selectedStaff,
    this.selectedDate,
    this.selectedTime,
    this.onConfirm,
  });

  @override
  Widget build(BuildContext context) {
    final totalPrice = selectedServices.fold(0.0, (sum, s) => sum + s.price);
    final totalDuration = selectedServices.fold(0, (sum, s) => sum + s.durationMinutes);

    return Container(
      margin: const EdgeInsets.all(24),
      padding: AppSpacing.cardPaddingLarge,
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: AppSpacing.borderRadiusXL,
        border: Border.all(color: AppColors.outline),
        boxShadow: AppColors.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Başlık
          Text(
            'RANDEVU ÖZETİ',
            style: GoogleFonts.inter(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              letterSpacing: 1,
              color: AppColors.primary,
            ),
          ),
          AppSpacing.gapH8,
          // Tarih
          if (selectedDate != null)
            Text(
              _formatDate(selectedDate!),
              style: GoogleFonts.inter(
                fontSize: 24,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            )
          else
            Text(
              'Tarih seçilmedi',
              style: GoogleFonts.inter(
                fontSize: 18,
                color: AppColors.textTertiary,
              ),
            ),
          AppSpacing.gapH24,
          // Personel
          if (selectedStaff != null) ...[
            Row(
              children: [
                AppAvatar(
                  name: selectedStaff!.name,
                  photoUrl: selectedStaff!.photoUrl,
                  size: 48,
                ),
                AppSpacing.gapW12,
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Seçilen Berber',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        color: AppColors.textTertiary,
                      ),
                    ),
                    Text(
                      selectedStaff!.name,
                      style: GoogleFonts.inter(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            AppSpacing.gapH20,
          ],
          // Saat
          if (selectedTime != null) ...[
            _buildInfoRow(
              icon: Icons.schedule,
              label: 'Saat',
              value: '$selectedTime - ${_calculateEndTime(selectedTime!, totalDuration)}',
            ),
            AppSpacing.gapH16,
          ],
          const Divider(),
          AppSpacing.gapH16,
          // Seçilen hizmetler
          Text(
            'SERVICES',
            style: GoogleFonts.inter(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              letterSpacing: 1,
              color: AppColors.textTertiary,
            ),
          ),
          AppSpacing.gapH12,
          if (selectedServices.isEmpty)
            Text(
              'Henüz hizmet seçilmedi',
              style: GoogleFonts.inter(
                fontSize: 14,
                color: AppColors.textTertiary,
              ),
            )
          else
            ...selectedServices.map((service) => _buildServiceItem(service)),
          const Spacer(),
          // Toplam
          const Divider(),
          AppSpacing.gapH16,
          // Hizmet bedeli
          _buildPriceRow('Hizmet Bedeli', totalPrice, isTotal: false),
          AppSpacing.gapH8,
          // Vergi
          _buildPriceRow('Vergiler dahildir', 0, isSubtext: true),
          AppSpacing.gapH16,
          // Toplam tutar
          Container(
            padding: AppSpacing.cardPadding,
            decoration: BoxDecoration(
              color: AppColors.surfaceVariant,
              borderRadius: AppSpacing.borderRadiusMD,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'TOPLAM TUTAR',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textSecondary,
                  ),
                ),
                RichText(
                  text: TextSpan(
                    children: [
                      TextSpan(
                        text: '₺${totalPrice.toStringAsFixed(0)}',
                        style: GoogleFonts.inter(
                          fontSize: 28,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      TextSpan(
                        text: '.00TL',
                        style: GoogleFonts.inter(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: AppColors.textTertiary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          AppSpacing.gapH20,
          // Onay butonu
          if (onConfirm != null)
            PrimaryButton(
              text: 'Randevuyu Onayla',
              icon: Icons.arrow_forward,
              onPressed: onConfirm,
              isFullWidth: true,
            ),
          AppSpacing.gapH12,
          // Alt bilgi
          Center(
            child: Text(
              'Ödeme işlemi salonda yapılacaktır',
              style: GoogleFonts.inter(
                fontSize: 12,
                color: AppColors.textTertiary,
              ),
            ),
          ),
          AppSpacing.gapH16,
          // Güvenlik bilgisi
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildFooterItem(Icons.lock_outline, 'GÜVENLİ İŞLEM'),
              AppSpacing.gapW24,
              _buildFooterItem(Icons.sentiment_satisfied_alt_outlined, 'MÜŞTERİ MEMNUNİYETİ'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Row(
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: AppColors.primaryContainer,
            borderRadius: AppSpacing.borderRadiusSM,
          ),
          child: Icon(
            icon,
            color: AppColors.primary,
            size: 18,
          ),
        ),
        AppSpacing.gapW12,
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 11,
                color: AppColors.textTertiary,
              ),
            ),
            Text(
              value,
              style: GoogleFonts.inter(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildServiceItem(Service service) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  service.name,
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textPrimary,
                  ),
                ),
                Text(
                  service.formattedDuration,
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: AppColors.textTertiary,
                  ),
                ),
              ],
            ),
          ),
          Text(
            '₺${service.price.toStringAsFixed(2)}',
            style: GoogleFonts.inter(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPriceRow(String label, double price, {bool isTotal = false, bool isSubtext = false}) {
    if (isSubtext) {
      return Text(
        label,
        style: GoogleFonts.inter(
          fontSize: 11,
          color: AppColors.textTertiary,
        ),
      );
    }

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 14,
            color: AppColors.textSecondary,
          ),
        ),
        Text(
          isTotal ? '₺${price.toStringAsFixed(2)}' : '${price > 0 ? "₺${price.toStringAsFixed(2)}" : "0.00TL"}',
          style: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: isTotal ? FontWeight.w700 : FontWeight.w500,
            color: isTotal ? AppColors.primary : AppColors.textPrimary,
          ),
        ),
      ],
    );
  }

  Widget _buildFooterItem(IconData icon, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          icon,
          size: 14,
          color: AppColors.textTertiary,
        ),
        const SizedBox(width: 4),
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 10,
            fontWeight: FontWeight.w500,
            color: AppColors.textTertiary,
          ),
        ),
      ],
    );
  }

  String _formatDate(DateTime date) {
    final day = date.day;
    final months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    return '$day ${months[date.month - 1]} ${date.year}';
  }

  String _calculateEndTime(String startTime, int durationMinutes) {
    final parts = startTime.split(':');
    final startHour = int.parse(parts[0]);
    final startMinute = int.parse(parts[1]);
    
    final totalMinutes = startHour * 60 + startMinute + durationMinutes;
    final endHour = (totalMinutes ~/ 60) % 24;
    final endMinute = totalMinutes % 60;
    
    return '${endHour.toString().padLeft(2, '0')}:${endMinute.toString().padLeft(2, '0')}';
  }
}
