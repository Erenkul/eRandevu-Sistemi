import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/widgets/app_card.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_components.dart';

/// Günlük program tablosu
class TodaySchedule extends StatelessWidget {
  const TodaySchedule({super.key});

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
                Icons.schedule,
                color: AppColors.textSecondary,
                size: 20,
              ),
              AppSpacing.gapW8,
              Text(
                'Today\'s Schedule',
                style: GoogleFonts.inter(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              const Spacer(),
              // Filtreler
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.surfaceVariant,
                  borderRadius: AppSpacing.borderRadiusFull,
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'All Barbers',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    AppSpacing.gapW4,
                    const Icon(
                      Icons.keyboard_arrow_down,
                      size: 16,
                      color: AppColors.textSecondary,
                    ),
                  ],
                ),
              ),
              AppSpacing.gapW8,
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: AppSpacing.borderRadiusFull,
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.filter_list,
                      size: 14,
                      color: Colors.white,
                    ),
                    AppSpacing.gapW4,
                    Text(
                      'Filter',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          AppSpacing.gapH20,
          // Tablo başlıkları
          _buildTableHeader(),
          const Divider(height: 1),
          // Randevu listesi
          ..._buildAppointmentRows(),
        ],
      ),
    );
  }

  Widget _buildTableHeader() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: [
          _buildHeaderCell('CLIENT', flex: 2),
          _buildHeaderCell('SERVICE', flex: 2),
          _buildHeaderCell('BARBER', flex: 2),
          _buildHeaderCell('TIME', flex: 1),
          _buildHeaderCell('STATUS', flex: 2),
          _buildHeaderCell('ACT', flex: 1),
        ],
      ),
    );
  }

  Widget _buildHeaderCell(String text, {int flex = 1}) {
    return Expanded(
      flex: flex,
      child: Text(
        text,
        style: GoogleFonts.inter(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.5,
          color: AppColors.textTertiary,
        ),
      ),
    );
  }

  List<Widget> _buildAppointmentRows() {
    final appointments = [
      {
        'clientName': 'Deniz Yılmaz',
        'clientInitials': 'DY',
        'service': 'Haircut & Beard',
        'barber': 'Ahmet',
        'time': '10:30',
        'status': 'CONFIRMED',
        'statusType': StatusType.success,
      },
      {
        'clientName': 'Caner Öz',
        'clientInitials': 'CÖ',
        'service': 'Haircut',
        'barber': 'Mehmet',
        'time': '11:15',
        'status': 'PENDING',
        'statusType': StatusType.warning,
      },
      {
        'clientName': 'Emre Aydın',
        'clientInitials': 'EA',
        'service': 'Beard Trim',
        'barber': 'Ahmet',
        'time': '12:00',
        'status': 'CONFIRMED',
        'statusType': StatusType.success,
      },
      {
        'clientName': 'Burak Tan',
        'clientInitials': 'BT',
        'service': 'Skin Care',
        'barber': 'Mehmet',
        'time': '13:30',
        'status': 'COMPLETED',
        'statusType': StatusType.neutral,
      },
    ];

    return appointments.map((apt) => _buildAppointmentRow(apt)).toList();
  }

  Widget _buildAppointmentRow(Map<String, dynamic> appointment) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14),
      decoration: const BoxDecoration(
        border: Border(
          bottom: BorderSide(color: AppColors.outline, width: 0.5),
        ),
      ),
      child: Row(
        children: [
          // Müşteri
          Expanded(
            flex: 2,
            child: Row(
              children: [
                AppAvatar(
                  name: appointment['clientName'],
                  size: 36,
                  backgroundColor: _getAvatarColor(appointment['clientInitials']),
                ),
                AppSpacing.gapW10,
                Expanded(
                  child: Text(
                    appointment['clientName'],
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: AppColors.textPrimary,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
          // Hizmet
          Expanded(
            flex: 2,
            child: Text(
              appointment['service'],
              style: GoogleFonts.inter(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
            ),
          ),
          // Personel
          Expanded(
            flex: 2,
            child: Row(
              children: [
                const Icon(
                  Icons.person_outline,
                  size: 16,
                  color: AppColors.textTertiary,
                ),
                AppSpacing.gapW4,
                Text(
                  appointment['barber'],
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          // Saat
          Expanded(
            flex: 1,
            child: Text(
              appointment['time'],
              style: GoogleFonts.inter(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: AppColors.textPrimary,
              ),
            ),
          ),
          // Durum
          Expanded(
            flex: 2,
            child: StatusBadge(
              text: appointment['status'],
              type: appointment['statusType'],
              isSmall: true,
            ),
          ),
          // Aksiyonlar
          Expanded(
            flex: 1,
            child: Row(
              children: [
                AppIconButton(
                  icon: Icons.more_vert,
                  size: 32,
                  onPressed: () {},
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Color _getAvatarColor(String initials) {
    final colors = [
      const Color(0xFFDDD6FE),
      const Color(0xFFBFDBFE),
      const Color(0xFFA7F3D0),
      const Color(0xFFFED7AA),
      const Color(0xFFFECACA),
    ];
    final index = initials.hashCode % colors.length;
    return colors[index.abs()];
  }
}
