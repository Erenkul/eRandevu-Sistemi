import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:table_calendar/table_calendar.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';

/// Tarih ve saat seçimi widget'ı
class DateTimeSelection extends StatefulWidget {
  final DateTime? selectedDate;
  final String? selectedTime;
  final int totalDuration;
  final Function(DateTime) onDateSelected;
  final Function(String) onTimeSelected;

  const DateTimeSelection({
    super.key,
    required this.selectedDate,
    required this.selectedTime,
    required this.totalDuration,
    required this.onDateSelected,
    required this.onTimeSelected,
  });

  @override
  State<DateTimeSelection> createState() => _DateTimeSelectionState();
}

class _DateTimeSelectionState extends State<DateTimeSelection> {
  late DateTime _focusedDay;

  @override
  void initState() {
    super.initState();
    _focusedDay = widget.selectedDate ?? DateTime.now();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Başlık
        Text(
          'Choose Date & Time',
          style: GoogleFonts.inter(
            fontSize: 28,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
        AppSpacing.gapH8,
        Text(
          'Select an available slot for your appointment.',
          style: GoogleFonts.inter(
            fontSize: 16,
            color: AppColors.textSecondary,
          ),
        ),
        AppSpacing.gapH24,
        // İçerik
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Takvim
            Expanded(
              child: _buildCalendar(),
            ),
            AppSpacing.gapW24,
            // Seçili tarih bilgisi
            SizedBox(
              width: 180,
              child: _buildSelectedDateInfo(),
            ),
          ],
        ),
        AppSpacing.gapH32,
        // Saat seçimi
        _buildTimeSlots(),
      ],
    );
  }

  Widget _buildCalendar() {
    return Container(
      padding: AppSpacing.cardPadding,
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: AppSpacing.borderRadiusLG,
        border: Border.all(color: AppColors.outline),
      ),
      child: TableCalendar(
        firstDay: DateTime.now(),
        lastDay: DateTime.now().add(const Duration(days: 90)),
        focusedDay: _focusedDay,
        selectedDayPredicate: (day) => isSameDay(widget.selectedDate, day),
        calendarFormat: CalendarFormat.month,
        startingDayOfWeek: StartingDayOfWeek.sunday,
        headerStyle: HeaderStyle(
          formatButtonVisible: false,
          titleCentered: true,
          titleTextStyle: GoogleFonts.inter(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
          leftChevronIcon: const Icon(
            Icons.chevron_left,
            color: AppColors.textSecondary,
          ),
          rightChevronIcon: const Icon(
            Icons.chevron_right,
            color: AppColors.textSecondary,
          ),
        ),
        daysOfWeekStyle: DaysOfWeekStyle(
          weekdayStyle: GoogleFonts.inter(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: AppColors.textTertiary,
          ),
          weekendStyle: GoogleFonts.inter(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: AppColors.textTertiary,
          ),
        ),
        calendarStyle: CalendarStyle(
          outsideDaysVisible: false,
          todayDecoration: BoxDecoration(
            color: AppColors.primaryContainer,
            shape: BoxShape.circle,
          ),
          todayTextStyle: GoogleFonts.inter(
            color: AppColors.primary,
            fontWeight: FontWeight.w600,
          ),
          selectedDecoration: const BoxDecoration(
            color: AppColors.primary,
            shape: BoxShape.circle,
          ),
          selectedTextStyle: GoogleFonts.inter(
            color: Colors.white,
            fontWeight: FontWeight.w600,
          ),
          defaultTextStyle: GoogleFonts.inter(
            color: AppColors.textPrimary,
          ),
          weekendTextStyle: GoogleFonts.inter(
            color: AppColors.textTertiary,
          ),
          disabledTextStyle: GoogleFonts.inter(
            color: AppColors.outline,
          ),
        ),
        onDaySelected: (selectedDay, focusedDay) {
          widget.onDateSelected(selectedDay);
          setState(() {
            _focusedDay = focusedDay;
          });
        },
        enabledDayPredicate: (day) {
          // Pazar günleri kapalı (örnek)
          return day.weekday != DateTime.sunday;
        },
      ),
    );
  }

  Widget _buildSelectedDateInfo() {
    if (widget.selectedDate == null) {
      return Container(
        padding: AppSpacing.cardPadding,
        decoration: BoxDecoration(
          color: AppColors.surfaceVariant,
          borderRadius: AppSpacing.borderRadiusLG,
        ),
        child: Column(
          children: [
            const Icon(
              Icons.calendar_today,
              color: AppColors.textTertiary,
              size: 32,
            ),
            AppSpacing.gapH12,
            Text(
              'Select a date',
              style: GoogleFonts.inter(
                fontSize: 14,
                color: AppColors.textTertiary,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }

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
          Text(
            'SELECTED DATE',
            style: GoogleFonts.inter(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              letterSpacing: 1,
              color: AppColors.primary,
            ),
          ),
          AppSpacing.gapH8,
          Text(
            _getMonthName(widget.selectedDate!.month),
            style: GoogleFonts.inter(
              fontSize: 14,
              color: AppColors.textSecondary,
            ),
          ),
          Text(
            '${widget.selectedDate!.day}',
            style: GoogleFonts.inter(
              fontSize: 36,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          Text(
            _getDayName(widget.selectedDate!.weekday),
            style: GoogleFonts.inter(
              fontSize: 14,
              color: AppColors.textTertiary,
            ),
          ),
          AppSpacing.gapH16,
          const Divider(),
          AppSpacing.gapH12,
          // Legend
          _buildLegendItem(AppColors.primary, 'Selected'),
          AppSpacing.gapH8,
          _buildLegendItem(AppColors.surfaceVariant, 'Available'),
          AppSpacing.gapH8,
          _buildLegendItem(AppColors.outline, 'Booked'),
        ],
      ),
    );
  }

  Widget _buildLegendItem(Color color, String label) {
    return Row(
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        AppSpacing.gapW8,
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 12,
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }

  Widget _buildTimeSlots() {
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
              const Icon(
                Icons.schedule,
                color: AppColors.textSecondary,
                size: 20,
              ),
              AppSpacing.gapW8,
              Text(
                'Select Time Slot',
                style: GoogleFonts.inter(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.primaryContainer,
                  borderRadius: AppSpacing.borderRadiusFull,
                ),
                child: Text(
                  '${widget.totalDuration} Min Duration',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: AppColors.primary,
                  ),
                ),
              ),
            ],
          ),
          AppSpacing.gapH20,
          // Sabah saatleri
          _buildTimeSection('MORNING', '☀️', ['09:00', '10:00', '11:30']),
          AppSpacing.gapH16,
          // Öğleden sonra
          _buildTimeSection('AFTERNOON', '🌤️', ['14:00', '15:15', '16:30', '17:45']),
          AppSpacing.gapH16,
          // Akşam
          _buildTimeSection('EVENING', '🌙', ['19:00', '20:15']),
        ],
      ),
    );
  }

  Widget _buildTimeSection(String label, String emoji, List<String> times) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(emoji, style: const TextStyle(fontSize: 14)),
            AppSpacing.gapW8,
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                letterSpacing: 1,
                color: AppColors.textTertiary,
              ),
            ),
          ],
        ),
        AppSpacing.gapH12,
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: times.map((time) => _buildTimeChip(time)).toList(),
        ),
      ],
    );
  }

  Widget _buildTimeChip(String time) {
    final isSelected = widget.selectedTime == time;
    final isDisabled = time == '12:00'; // Örnek: dolmuş saat

    return GestureDetector(
      onTap: isDisabled ? null : () => widget.onTimeSelected(time),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary
              : isDisabled
                  ? AppColors.surfaceVariant
                  : AppColors.surface,
          borderRadius: AppSpacing.borderRadiusSM,
          border: Border.all(
            color: isSelected
                ? AppColors.primary
                : isDisabled
                    ? AppColors.outline
                    : AppColors.outline,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              time,
              style: GoogleFonts.inter(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: isSelected
                    ? Colors.white
                    : isDisabled
                        ? AppColors.textTertiary
                        : AppColors.textPrimary,
              ),
            ),
            if (isSelected) ...[
              AppSpacing.gapW8,
              const Icon(
                Icons.check,
                size: 16,
                color: Colors.white,
              ),
            ],
          ],
        ),
      ),
    );
  }

  String _getMonthName(int month) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  }

  String _getDayName(int weekday) {
    const days = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[weekday];
  }
}
