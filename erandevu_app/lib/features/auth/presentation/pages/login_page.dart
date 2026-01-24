import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_text_field.dart';

/// Login Sayfası
class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Row(
        children: [
          // Sol taraf - Form
          Expanded(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(48),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 420),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Logo
                      _buildLogo(),
                      AppSpacing.gapH40,
                      // Başlık
                      Text(
                        'Hoş Geldiniz! 👋',
                        style: GoogleFonts.inter(
                          fontSize: 32,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      AppSpacing.gapH8,
                      Text(
                        'İşletme panelinize giriş yapın',
                        style: GoogleFonts.inter(
                          fontSize: 16,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      AppSpacing.gapH32,
                      // Form
                      _buildForm(),
                      AppSpacing.gapH24,
                      // Giriş butonu
                      PrimaryButton(
                        text: 'Giriş Yap',
                        isFullWidth: true,
                        isLoading: _isLoading,
                        onPressed: _handleLogin,
                      ),
                      AppSpacing.gapH24,
                      // Veya
                      Row(
                        children: [
                          const Expanded(child: Divider()),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: Text(
                              'veya',
                              style: GoogleFonts.inter(
                                fontSize: 14,
                                color: AppColors.textTertiary,
                              ),
                            ),
                          ),
                          const Expanded(child: Divider()),
                        ],
                      ),
                      AppSpacing.gapH24,
                      // Google ile giriş
                      SecondaryButton(
                        text: 'Google ile devam et',
                        isFullWidth: true,
                        icon: Icons.g_mobiledata,
                        onPressed: () {},
                      ),
                      AppSpacing.gapH32,
                      // Kayıt ol linki
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            'Hesabınız yok mu? ',
                            style: GoogleFonts.inter(
                              fontSize: 14,
                              color: AppColors.textSecondary,
                            ),
                          ),
                          TextButton(
                            onPressed: () {},
                            child: Text(
                              'Ücretsiz Kayıt Ol',
                              style: GoogleFonts.inter(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: AppColors.primary,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          // Sağ taraf - Görsel
          if (MediaQuery.of(context).size.width > 900)
            Expanded(
              child: Container(
                decoration: const BoxDecoration(
                  gradient: AppColors.primaryGradient,
                ),
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.all(64),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 120,
                          height: 120,
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.2),
                            borderRadius: AppSpacing.borderRadiusXL,
                          ),
                          child: const Icon(
                            Icons.calendar_today,
                            size: 56,
                            color: Colors.white,
                          ),
                        ),
                        AppSpacing.gapH32,
                        Text(
                          'eRandevu ile\nRandevularınızı Yönetin',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.inter(
                            fontSize: 36,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                            height: 1.2,
                          ),
                        ),
                        AppSpacing.gapH16,
                        Text(
                          'Modern ve kullanımı kolay randevu yönetim sistemi\nile işletmenizi bir adım öne taşıyın.',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.inter(
                            fontSize: 16,
                            color: Colors.white.withValues(alpha: 0.8),
                            height: 1.6,
                          ),
                        ),
                        AppSpacing.gapH40,
                        // Özellikler
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            _buildFeature('Online Rezervasyon'),
                            AppSpacing.gapW24,
                            _buildFeature('WhatsApp Bildirim'),
                            AppSpacing.gapW24,
                            _buildFeature('Analitik Raporlar'),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildLogo() {
    return Row(
      children: [
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            gradient: AppColors.primaryGradient,
            borderRadius: AppSpacing.borderRadiusMD,
          ),
          child: const Center(
            child: Icon(
              Icons.calendar_today,
              color: Colors.white,
              size: 24,
            ),
          ),
        ),
        AppSpacing.gapW12,
        Text(
          'eRandevu',
          style: GoogleFonts.inter(
            fontSize: 24,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
      ],
    );
  }

  Widget _buildForm() {
    return Column(
      children: [
        AppTextField(
          label: 'E-posta Adresi',
          hint: 'ornek@email.com',
          controller: _emailController,
          keyboardType: TextInputType.emailAddress,
          prefixIcon: Icons.email_outlined,
        ),
        AppSpacing.gapH20,
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Şifre',
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textPrimary,
                  ),
                ),
                TextButton(
                  onPressed: () {},
                  child: Text(
                    'Şifremi Unuttum',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: AppColors.primary,
                    ),
                  ),
                ),
              ],
            ),
            AppSpacing.gapH8,
            TextFormField(
              controller: _passwordController,
              obscureText: _obscurePassword,
              decoration: InputDecoration(
                hintText: '••••••••',
                prefixIcon: const Icon(Icons.lock_outline),
                suffixIcon: IconButton(
                  icon: Icon(
                    _obscurePassword ? Icons.visibility_off : Icons.visibility,
                    color: AppColors.textTertiary,
                  ),
                  onPressed: () {
                    setState(() {
                      _obscurePassword = !_obscurePassword;
                    });
                  },
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildFeature(String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 20,
          height: 20,
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.2),
            shape: BoxShape.circle,
          ),
          child: const Icon(
            Icons.check,
            size: 12,
            color: Colors.white,
          ),
        ),
        const SizedBox(width: 8),
        Text(
          text,
          style: GoogleFonts.inter(
            fontSize: 14,
            color: Colors.white,
          ),
        ),
      ],
    );
  }

  void _handleLogin() async {
    setState(() => _isLoading = true);
    
    // Simüle edilmiş giriş
    await Future.delayed(const Duration(seconds: 2));
    
    setState(() => _isLoading = false);
    
    // Dashboard'a yönlendir (gerçek uygulamada Firebase Auth kullanılacak)
    if (mounted) {
      // context.go('/admin');
    }
  }
}
