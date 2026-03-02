import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../constants/app_colors.dart';
import '../constants/app_spacing.dart';

/// Durum badge'i
class StatusBadge extends StatelessWidget {
  final String text;
  final StatusType type;
  final bool isSmall;

  const StatusBadge({
    super.key,
    required this.text,
    this.type = StatusType.info,
    this.isSmall = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isSmall ? 8 : 12,
        vertical: isSmall ? 4 : 6,
      ),
      decoration: BoxDecoration(
        color: type.backgroundColor,
        borderRadius: AppSpacing.borderRadiusFull,
      ),
      child: Text(
        text,
        style: GoogleFonts.inter(
          fontSize: isSmall ? 10 : 12,
          fontWeight: FontWeight.w600,
          color: type.textColor,
        ),
      ),
    );
  }
}

enum StatusType {
  success,
  warning,
  error,
  info,
  neutral,
}

extension StatusTypeExtension on StatusType {
  Color get backgroundColor {
    switch (this) {
      case StatusType.success:
        return AppColors.successLight;
      case StatusType.warning:
        return AppColors.warningLight;
      case StatusType.error:
        return AppColors.errorLight;
      case StatusType.info:
        return AppColors.infoLight;
      case StatusType.neutral:
        return AppColors.surfaceVariant;
    }
  }

  Color get textColor {
    switch (this) {
      case StatusType.success:
        return AppColors.success;
      case StatusType.warning:
        return AppColors.warning;
      case StatusType.error:
        return AppColors.error;
      case StatusType.info:
        return AppColors.info;
      case StatusType.neutral:
        return AppColors.textSecondary;
    }
  }
}

/// İstatistik kartı
class StatCard extends StatelessWidget {
  final String title;
  final String value;
  final String? subtitle;
  final IconData? icon;
  final Color? iconColor;
  final Color? iconBackgroundColor;
  final String? changeText;
  final bool isPositiveChange;

  const StatCard({
    super.key,
    required this.title,
    required this.value,
    this.subtitle,
    this.icon,
    this.iconColor,
    this.iconBackgroundColor,
    this.changeText,
    this.isPositiveChange = true,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: AppSpacing.cardPadding,
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
              if (icon != null) ...[
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: iconBackgroundColor ?? AppColors.primaryContainer,
                    borderRadius: AppSpacing.borderRadiusSM,
                  ),
                  child: Icon(
                    icon,
                    color: iconColor ?? AppColors.primary,
                    size: 20,
                  ),
                ),
                AppSpacing.gapW12,
              ],
              Expanded(
                child: Text(
                  title,
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textTertiary,
                  ),
                ),
              ),
              if (changeText != null) ...[
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: isPositiveChange ? AppColors.successLight : AppColors.errorLight,
                    borderRadius: AppSpacing.borderRadiusFull,
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        isPositiveChange ? Icons.trending_up : Icons.trending_down,
                        size: 12,
                        color: isPositiveChange ? AppColors.success : AppColors.error,
                      ),
                      const SizedBox(width: 2),
                      Text(
                        changeText!,
                        style: GoogleFonts.inter(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: isPositiveChange ? AppColors.success : AppColors.error,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
          AppSpacing.gapH12,
          Text(
            value,
            style: GoogleFonts.inter(
              fontSize: 28,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          if (subtitle != null) ...[
            AppSpacing.gapH4,
            Text(
              subtitle!,
              style: GoogleFonts.inter(
                fontSize: 12,
                color: AppColors.textTertiary,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

/// Avatar bileşeni
class AppAvatar extends StatelessWidget {
  final String? imageUrl;
  final String? photoUrl;
  final String? name;
  final double size;
  final Color? backgroundColor;

  const AppAvatar({
    super.key,
    this.imageUrl,
    this.photoUrl,
    this.name,
    this.size = 40,
    this.backgroundColor,
  });

  String? get _effectiveImageUrl => imageUrl ?? photoUrl;

  @override
  Widget build(BuildContext context) {
    final initials = _getInitials(name ?? '');
    final effectiveUrl = _effectiveImageUrl;
    
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: backgroundColor ?? AppColors.primaryContainer,
        borderRadius: BorderRadius.circular(size / 2),
        image: effectiveUrl != null
            ? DecorationImage(
                image: NetworkImage(effectiveUrl),
                fit: BoxFit.cover,
              )
            : null,
      ),
      child: effectiveUrl == null
          ? Center(
              child: Text(
                initials,
                style: GoogleFonts.inter(
                  fontSize: size * 0.4,
                  fontWeight: FontWeight.w600,
                  color: AppColors.primary,
                ),
              ),
            )
          : null,
    );
  }

  String _getInitials(String name) {
    if (name.isEmpty) return '';
    final parts = name.split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name.substring(0, name.length >= 2 ? 2 : 1).toUpperCase();
  }
}
