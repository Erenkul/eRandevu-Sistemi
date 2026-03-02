import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/widgets/app_card.dart';

/// Popüler hizmetler widget'ı
class PopularServices extends StatelessWidget {
  const PopularServices({super.key});

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Başlık
          Row(
            children: [
              const Icon(
                Icons.star_outline,
                color: AppColors.warning,
                size: 20,
              ),
              AppSpacing.gapW8,
              Text(
                'Popular Services',
                style: GoogleFonts.inter(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          AppSpacing.gapH20,
          // Hizmetler
          _buildServiceItem('Haircut', 75, AppColors.chartBlue),
          AppSpacing.gapH12,
          _buildServiceItem('Beard Trim', 45, AppColors.chartGreen),
          AppSpacing.gapH12,
          _buildServiceItem('Skin Care', 20, AppColors.chartYellow),
        ],
      ),
    );
  }

  Widget _buildServiceItem(String name, int percentage, Color color) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              name,
              style: GoogleFonts.inter(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
            ),
            Text(
              '$percentage%',
              style: GoogleFonts.inter(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: color,
              ),
            ),
          ],
        ),
        AppSpacing.gapH6,
        ClipRRect(
          borderRadius: AppSpacing.borderRadiusFull,
          child: LinearProgressIndicator(
            value: percentage / 100,
            backgroundColor: AppColors.outline,
            valueColor: AlwaysStoppedAnimation<Color>(color),
            minHeight: 6,
          ),
        ),
      ],
    );
  }
}
