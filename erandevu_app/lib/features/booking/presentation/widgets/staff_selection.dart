import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/widgets/app_components.dart';
import '../../../staff/domain/entities/staff.dart';

/// Personel seçimi widget'ı
class StaffSelection extends StatelessWidget {
  final String businessId;
  final Staff? selectedStaff;
  final Function(Staff) onStaffSelected;

  const StaffSelection({
    super.key,
    required this.businessId,
    required this.selectedStaff,
    required this.onStaffSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Başlık
        Text(
          'Select Professional',
          style: GoogleFonts.inter(
            fontSize: 28,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
        AppSpacing.gapH8,
        Text(
          'Choose your preferred barber for the session.',
          style: GoogleFonts.inter(
            fontSize: 16,
            color: AppColors.textSecondary,
          ),
        ),
        AppSpacing.gapH24,
        // Personel listesi
        ..._mockStaff.map((staff) => _buildStaffCard(staff)),
        AppSpacing.gapH24,
        // Not
        Container(
          padding: AppSpacing.cardPadding,
          decoration: BoxDecoration(
            color: AppColors.infoLight,
            borderRadius: AppSpacing.borderRadiusMD,
          ),
          child: Row(
            children: [
              const Icon(
                Icons.info_outline,
                color: AppColors.info,
                size: 20,
              ),
              AppSpacing.gapW12,
              Expanded(
                child: Text(
                  'Pricing may vary slightly depending on the professional\'s level of experience.',
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    color: AppColors.info,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStaffCard(Staff staff) {
    final isSelected = selectedStaff?.id == staff.id;

    return GestureDetector(
      onTap: () => onStaffSelected(staff),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(bottom: 12),
        padding: AppSpacing.cardPadding,
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: AppSpacing.borderRadiusMD,
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.outline,
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected ? AppColors.cardShadow : null,
        ),
        child: Row(
          children: [
            // Fotoğraf
            Stack(
              children: [
                AppAvatar(
                  name: staff.name,
                  photoUrl: staff.photoUrl,
                  size: 56,
                ),
                if (isSelected)
                  Positioned(
                    right: 0,
                    bottom: 0,
                    child: Container(
                      width: 20,
                      height: 20,
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 2),
                      ),
                      child: const Icon(
                        Icons.check,
                        size: 12,
                        color: Colors.white,
                      ),
                    ),
                  ),
              ],
            ),
            AppSpacing.gapW16,
            // Bilgiler
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    staff.name,
                    style: GoogleFonts.inter(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  Text(
                    staff.title ?? 'Stylist',
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      color: AppColors.primary,
                    ),
                  ),
                  if (staff.bio != null) ...[
                    AppSpacing.gapH4,
                    Text(
                      staff.bio!,
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: AppColors.textTertiary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ],
              ),
            ),
            // Rating
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.star,
                      color: AppColors.warning,
                      size: 16,
                    ),
                    AppSpacing.gapW4,
                    Text(
                      '4.9',
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ],
                ),
                AppSpacing.gapH4,
                Text(
                  '128 reviews',
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    color: AppColors.textTertiary,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // Mock data
  List<Staff> get _mockStaff => [
    Staff(
      id: '1',
      businessId: businessId,
      name: 'Mehmet Ali',
      title: 'MASTER BARBER',
      bio: '10+ years experience in modern haircuts',
      createdAt: DateTime.now(),
    ),
    Staff(
      id: '2',
      businessId: businessId,
      name: 'Ahmet Yılmaz',
      title: 'STYLIST',
      bio: 'Specialist in beard styling and grooming',
      createdAt: DateTime.now(),
    ),
  ];
}
