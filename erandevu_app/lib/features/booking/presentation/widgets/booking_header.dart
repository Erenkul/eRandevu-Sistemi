import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';

/// Booking header - step indicator
class BookingHeader extends StatelessWidget {
  final int currentStep;

  const BookingHeader({
    super.key,
    required this.currentStep,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 72,
      padding: const EdgeInsets.symmetric(horizontal: 24),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(
          bottom: BorderSide(color: AppColors.outline),
        ),
      ),
      child: Row(
        children: [
          // Logo
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  gradient: AppColors.primaryGradient,
                  borderRadius: AppSpacing.borderRadiusSM,
                ),
                child: const Center(
                  child: Icon(
                    Icons.content_cut,
                    color: Colors.white,
                    size: 20,
                  ),
                ),
              ),
              AppSpacing.gapW12,
              Text(
                'Işık Erkek Kuaförü',
                style: GoogleFonts.inter(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const Spacer(),
          // Adım göstergesi
          _buildStepIndicator(),
          const Spacer(),
          // Yardım linki
          TextButton(
            onPressed: () {},
            child: Text(
              'Yardım',
              style: GoogleFonts.inter(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStepIndicator() {
    final steps = ['HİZMET', 'ZAMAN', 'ÖZET'];

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(steps.length * 2 - 1, (index) {
        if (index.isOdd) {
          // Connector
          final stepIndex = index ~/ 2;
          return _buildConnector(stepIndex < currentStep);
        }
        // Step
        final stepIndex = index ~/ 2;
        return _buildStep(
          number: stepIndex + 1,
          label: steps[stepIndex],
          isActive: stepIndex == currentStep,
          isCompleted: stepIndex < currentStep,
        );
      }),
    );
  }

  Widget _buildStep({
    required int number,
    required String label,
    required bool isActive,
    required bool isCompleted,
  }) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 28,
          height: 28,
          decoration: BoxDecoration(
            color: isCompleted
                ? AppColors.success
                : isActive
                    ? AppColors.primary
                    : AppColors.surfaceVariant,
            shape: BoxShape.circle,
          ),
          child: Center(
            child: isCompleted
                ? const Icon(
                    Icons.check,
                    color: Colors.white,
                    size: 16,
                  )
                : Text(
                    '$number',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: isActive ? Colors.white : AppColors.textTertiary,
                    ),
                  ),
          ),
        ),
        AppSpacing.gapW8,
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: isActive || isCompleted
                ? AppColors.primary
                : AppColors.textTertiary,
          ),
        ),
      ],
    );
  }

  Widget _buildConnector(bool isCompleted) {
    return Container(
      width: 60,
      height: 2,
      margin: const EdgeInsets.symmetric(horizontal: 8),
      decoration: BoxDecoration(
        color: isCompleted ? AppColors.primary : AppColors.outline,
        borderRadius: AppSpacing.borderRadiusFull,
      ),
    );
  }
}
