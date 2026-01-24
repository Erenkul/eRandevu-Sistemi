import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/widgets/app_card.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_components.dart';
import '../../../../core/widgets/app_text_field.dart';
import '../widgets/admin_sidebar.dart';
import '../widgets/dashboard_stats.dart';
import '../widgets/today_schedule.dart';
import '../widgets/popular_services.dart';

/// Admin Dashboard Ana Sayfası
class AdminDashboardPage extends ConsumerStatefulWidget {
  const AdminDashboardPage({super.key});

  @override
  ConsumerState<AdminDashboardPage> createState() => _AdminDashboardPageState();
}

class _AdminDashboardPageState extends ConsumerState<AdminDashboardPage> {
  int _selectedNavIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Row(
        children: [
          // Sol Sidebar
          AdminSidebar(
            selectedIndex: _selectedNavIndex,
            onItemSelected: (index) {
              setState(() {
                _selectedNavIndex = index;
              });
            },
          ),
          // Ana İçerik
          Expanded(
            child: Column(
              children: [
                // Üst Bar
                _buildTopBar(),
                // İçerik
                Expanded(
                  child: _buildContent(),
                ),
              ],
            ),
          ),
        ],
      ),
      // FAB
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          // Yeni randevu oluştur
        },
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add, color: Colors.white),
        label: Text(
          'NEW APPOINTMENT',
          style: GoogleFonts.inter(
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
      ),
    );
  }

  Widget _buildTopBar() {
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
          // Başlık
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Overview',
                style: GoogleFonts.inter(
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              Text(
                'Welcome back, here\'s what\'s happening today.',
                style: GoogleFonts.inter(
                  fontSize: 14,
                  color: AppColors.textTertiary,
                ),
              ),
            ],
          ),
          const Spacer(),
          // Arama
          SizedBox(
            width: 280,
            child: SearchTextField(
              hint: 'Search appointments...',
            ),
          ),
          AppSpacing.gapW16,
          // Bildirimler
          AppIconButton(
            icon: Icons.notifications_outlined,
            onPressed: () {},
            tooltip: 'Bildirimler',
          ),
        ],
      ),
    );
  }

  Widget _buildContent() {
    switch (_selectedNavIndex) {
      case 0:
        return _buildDashboardContent();
      case 1:
        return _buildBarbersContent();
      case 2:
        return _buildServicesContent();
      case 3:
        return _buildClientsContent();
      case 4:
        return _buildScheduleContent();
      default:
        return _buildDashboardContent();
    }
  }

  Widget _buildDashboardContent() {
    return SingleChildScrollView(
      padding: AppSpacing.pagePadding,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // İstatistik kartları
          const DashboardStats(),
          AppSpacing.gapH24,
          // Alt içerik - Günlük program ve popüler hizmetler
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Günlük program
              Expanded(
                flex: 2,
                child: const TodaySchedule(),
              ),
              AppSpacing.gapW24,
              // Popüler hizmetler + Haftalık özet
              Expanded(
                child: Column(
                  children: [
                    const PopularServices(),
                    AppSpacing.gapH24,
                    _buildWeeklySummary(),
                    AppSpacing.gapH24,
                    _buildCapacityIndicator(),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildWeeklySummary() {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: AppColors.warningLight,
                  borderRadius: AppSpacing.borderRadiusSM,
                ),
                child: const Icon(
                  Icons.bolt,
                  color: AppColors.warning,
                  size: 18,
                ),
              ),
              AppSpacing.gapW12,
              Expanded(
                child: Row(
                  children: [
                    _buildWeeklyTab('WEEKLY', true),
                    AppSpacing.gapW16,
                    _buildWeeklyTab('NEW', false),
                  ],
                ),
              ),
            ],
          ),
          AppSpacing.gapH16,
          Row(
            children: [
              Text(
                '+12%',
                style: GoogleFonts.inter(
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  color: AppColors.success,
                ),
              ),
              Text(
                ' vs. last',
                style: GoogleFonts.inter(
                  fontSize: 14,
                  color: AppColors.textTertiary,
                ),
              ),
            ],
          ),
          Text(
            'week',
            style: GoogleFonts.inter(
              fontSize: 14,
              color: AppColors.textTertiary,
            ),
          ),
          AppSpacing.gapH8,
          Text(
            'Clients\ntoday',
            style: GoogleFonts.inter(
              fontSize: 12,
              color: AppColors.textTertiary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWeeklyTab(String label, bool isActive) {
    return Text(
      label,
      style: GoogleFonts.inter(
        fontSize: 12,
        fontWeight: FontWeight.w600,
        color: isActive ? AppColors.textPrimary : AppColors.textTertiary,
      ),
    );
  }

  Widget _buildCapacityIndicator() {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Capacity',
            style: GoogleFonts.inter(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
          AppSpacing.gapH12,
          ClipRRect(
            borderRadius: AppSpacing.borderRadiusFull,
            child: LinearProgressIndicator(
              value: 0.7,
              backgroundColor: AppColors.outline,
              valueColor: const AlwaysStoppedAnimation<Color>(AppColors.success),
              minHeight: 8,
            ),
          ),
          AppSpacing.gapH8,
          Text(
            '70% booked today',
            style: GoogleFonts.inter(
              fontSize: 12,
              color: AppColors.textTertiary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBarbersContent() {
    return Center(
      child: Text(
        'Personel Yönetimi - Yakında',
        style: GoogleFonts.inter(
          fontSize: 24,
          fontWeight: FontWeight.w600,
          color: AppColors.textSecondary,
        ),
      ),
    );
  }

  Widget _buildServicesContent() {
    return Center(
      child: Text(
        'Hizmet Yönetimi - Yakında',
        style: GoogleFonts.inter(
          fontSize: 24,
          fontWeight: FontWeight.w600,
          color: AppColors.textSecondary,
        ),
      ),
    );
  }

  Widget _buildClientsContent() {
    return Center(
      child: Text(
        'Müşteri Yönetimi - Yakında',
        style: GoogleFonts.inter(
          fontSize: 24,
          fontWeight: FontWeight.w600,
          color: AppColors.textSecondary,
        ),
      ),
    );
  }

  Widget _buildScheduleContent() {
    return Center(
      child: Text(
        'Takvim - Yakında',
        style: GoogleFonts.inter(
          fontSize: 24,
          fontWeight: FontWeight.w600,
          color: AppColors.textSecondary,
        ),
      ),
    );
  }
}
