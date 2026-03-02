import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../services/domain/entities/service.dart';

/// Hizmet seçimi widget'ı
class ServiceSelection extends StatelessWidget {
  final String businessId;
  final List<Service> selectedServices;
  final Function(Service) onServiceToggle;

  const ServiceSelection({
    super.key,
    required this.businessId,
    required this.selectedServices,
    required this.onServiceToggle,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Başlık
        Text(
          'Book Your Appointment',
          style: GoogleFonts.inter(
            fontSize: 28,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
        AppSpacing.gapH8,
        Text(
          'Select your preferred services and professional for a premium grooming experience.',
          style: GoogleFonts.inter(
            fontSize: 16,
            color: AppColors.textSecondary,
          ),
        ),
        AppSpacing.gapH24,
        // Kategori filtreleri
        _buildCategoryFilters(),
        AppSpacing.gapH24,
        // Hizmet listesi
        Text(
          'Select Services',
          style: GoogleFonts.inter(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        AppSpacing.gapH4,
        Text(
          '${_mockServices.length} Available',
          style: GoogleFonts.inter(
            fontSize: 12,
            color: AppColors.textTertiary,
          ),
        ),
        AppSpacing.gapH16,
        // Services Grid
        ..._mockServices.map((service) => _buildServiceCard(service)),
      ],
    );
  }

  Widget _buildCategoryFilters() {
    final categories = ['All Services', 'Hair Styling', 'Beard Trim', 'Skin Care', 'Packages'];
    
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: categories.asMap().entries.map((entry) {
          final isSelected = entry.key == 0;
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: SelectableChip(
              label: entry.value,
              isSelected: isSelected,
              onTap: () {},
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildServiceCard(Service service) {
    final isSelected = selectedServices.any((s) => s.id == service.id);

    return GestureDetector(
      onTap: () => onServiceToggle(service),
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
            // İkon
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primaryContainer : AppColors.surfaceVariant,
                borderRadius: AppSpacing.borderRadiusSM,
              ),
              child: Icon(
                _getServiceIcon(service.category),
                color: isSelected ? AppColors.primary : AppColors.textTertiary,
                size: 24,
              ),
            ),
            AppSpacing.gapW16,
            // Bilgiler
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    service.name,
                    style: GoogleFonts.inter(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  if (service.description != null) ...[
                    AppSpacing.gapH4,
                    Text(
                      service.description!,
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        color: AppColors.textSecondary,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                  AppSpacing.gapH8,
                  Row(
                    children: [
                      Icon(
                        Icons.schedule,
                        size: 14,
                        color: AppColors.textTertiary,
                      ),
                      AppSpacing.gapW4,
                      Text(
                        service.formattedDuration,
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: AppColors.textTertiary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            // Fiyat ve seçim
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '₺${service.price.toStringAsFixed(0)}',
                  style: GoogleFonts.inter(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primary,
                  ),
                ),
                AppSpacing.gapH8,
                AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  width: 24,
                  height: 24,
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.primary : Colors.transparent,
                    border: Border.all(
                      color: isSelected ? AppColors.primary : AppColors.outline,
                      width: 2,
                    ),
                    shape: BoxShape.circle,
                  ),
                  child: isSelected
                      ? const Icon(
                          Icons.check,
                          size: 16,
                          color: Colors.white,
                        )
                      : null,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  IconData _getServiceIcon(String? category) {
    switch (category?.toLowerCase()) {
      case 'saç kesimi':
      case 'hair styling':
        return Icons.content_cut;
      case 'sakal tıraşı':
      case 'beard trim':
        return Icons.face;
      case 'cilt bakımı':
      case 'skin care':
        return Icons.spa;
      default:
        return Icons.auto_awesome;
    }
  }

  // Mock data - gerçek uygulamada Firestore'dan gelecek
  List<Service> get _mockServices => [
    Service(
      id: '1',
      businessId: businessId,
      name: 'Modern Saç Kesimi',
      description: 'Precision cut tailored to your face shape and style preference.',
      price: 250,
      durationMinutes: 45,
      category: 'Saç Kesimi',
      createdAt: DateTime.now(),
    ),
    Service(
      id: '2',
      businessId: businessId,
      name: 'Sakal Tasarım',
      description: 'Expert beard shaping, lining, and conditioning treatment.',
      price: 150,
      durationMinutes: 30,
      category: 'Sakal Tıraşı',
      createdAt: DateTime.now(),
    ),
    Service(
      id: '3',
      businessId: businessId,
      name: 'Cilt Bakımı',
      description: 'Deep cleansing facial, hot towel, and hydrating mask.',
      price: 400,
      durationMinutes: 60,
      category: 'Cilt Bakımı',
      createdAt: DateTime.now(),
    ),
  ];
}
