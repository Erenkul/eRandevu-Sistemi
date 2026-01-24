import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';

/// Booking Sol Sidebar
class BookingSidebar extends StatelessWidget {
  final int currentStep;
  final Function(int) onStepTap;

  const BookingSidebar({
    super.key,
    required this.currentStep,
    required this.onStepTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 280,
      padding: const EdgeInsets.all(24),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(
          right: BorderSide(color: AppColors.outline),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // İşletme bilgisi
          _buildBusinessInfo(),
          AppSpacing.gapH32,
          // Adımlar
          _buildStepItem(
            index: 0,
            icon: Icons.content_cut,
            title: 'Services',
            subtitle: 'Select services',
          ),
          _buildStepItem(
            index: 1,
            icon: Icons.person,
            title: 'Barber',
            subtitle: 'Choose a professional',
          ),
          _buildStepItem(
            index: 2,
            icon: Icons.calendar_today,
            title: 'Schedule',
            subtitle: 'Pick date & time',
          ),
          _buildStepItem(
            index: 3,
            icon: Icons.receipt_long,
            title: 'Summary',
            subtitle: 'Review & confirm',
          ),
          const Spacer(),
          // Çalışma saatleri
          _buildWorkingHours(),
        ],
      ),
    );
  }

  Widget _buildBusinessInfo() {
    return Container(
      padding: AppSpacing.cardPadding,
      decoration: BoxDecoration(
        gradient: AppColors.primaryGradient,
        borderRadius: AppSpacing.borderRadiusLG,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: AppSpacing.borderRadiusSM,
                ),
                child: const Center(
                  child: Icon(
                    Icons.content_cut,
                    color: Colors.white,
                    size: 24,
                  ),
                ),
              ),
              AppSpacing.gapW12,
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Işık Erkek Kuaförü',
                      style: GoogleFonts.inter(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                    Text(
                      'Bartın, Merkez',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: Colors.white.withValues(alpha: 0.8),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStepItem({
    required int index,
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    final isActive = index == currentStep;
    final isCompleted = index < currentStep;
    final isClickable = index < currentStep;

    return GestureDetector(
      onTap: isClickable ? () => onStepTap(index) : null,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isActive ? AppColors.primaryContainer : Colors.transparent,
          borderRadius: AppSpacing.borderRadiusMD,
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: isCompleted
                    ? AppColors.success
                    : isActive
                        ? AppColors.primary
                        : AppColors.surfaceVariant,
                borderRadius: AppSpacing.borderRadiusSM,
              ),
              child: Center(
                child: isCompleted
                    ? const Icon(
                        Icons.check,
                        color: Colors.white,
                        size: 20,
                      )
                    : Icon(
                        icon,
                        color: isActive ? Colors.white : AppColors.textTertiary,
                        size: 20,
                      ),
              ),
            ),
            AppSpacing.gapW12,
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: isActive || isCompleted
                          ? AppColors.textPrimary
                          : AppColors.textTertiary,
                    ),
                  ),
                  Text(
                    subtitle,
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: AppColors.textTertiary,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWorkingHours() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'OPENING HOURS',
          style: GoogleFonts.inter(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            letterSpacing: 1,
            color: AppColors.textTertiary,
          ),
        ),
        AppSpacing.gapH8,
        _buildHourRow('Mon - Sat', '09:00 - 18:00'),
        AppSpacing.gapH4,
        _buildHourRow('Sunday', 'Closed'),
      ],
    );
  }

  Widget _buildHourRow(String day, String hours) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          day,
          style: GoogleFonts.inter(
            fontSize: 12,
            color: AppColors.textSecondary,
          ),
        ),
        Text(
          hours,
          style: GoogleFonts.inter(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: AppColors.textPrimary,
          ),
        ),
      ],
    );
  }
}
