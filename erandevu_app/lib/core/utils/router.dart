import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../features/business/presentation/pages/admin_dashboard_page.dart';
import '../../features/booking/presentation/pages/booking_page.dart';
import '../../features/auth/presentation/pages/login_page.dart';

/// Uygulama routing yapılandırması
final router = GoRouter(
  initialLocation: '/',
  debugLogDiagnostics: true,
  routes: [
    // Ana sayfa - yönlendirme
    GoRoute(
      path: '/',
      redirect: (context, state) => '/admin',
    ),
    
    // Admin Dashboard
    GoRoute(
      path: '/admin',
      name: 'admin',
      builder: (context, state) => const AdminDashboardPage(),
      routes: [
        // Alt sayfalar buraya eklenebilir
        GoRoute(
          path: 'services',
          name: 'admin-services',
          builder: (context, state) => const Scaffold(
            body: Center(child: Text('Hizmet Yönetimi')),
          ),
        ),
        GoRoute(
          path: 'staff',
          name: 'admin-staff',
          builder: (context, state) => const Scaffold(
            body: Center(child: Text('Personel Yönetimi')),
          ),
        ),
      ],
    ),
    
    // Giriş sayfası
    GoRoute(
      path: '/login',
      name: 'login',
      builder: (context, state) => const LoginPage(),
    ),
    
    // Kayıt sayfası
    GoRoute(
      path: '/register',
      name: 'register',
      builder: (context, state) => const Scaffold(
        body: Center(child: Text('Kayıt Sayfası')),
      ),
    ),
    
    // Public Booking sayfası - erandevu.com/{business_id}
    GoRoute(
      path: '/book/:businessId',
      name: 'booking',
      builder: (context, state) {
        final businessId = state.pathParameters['businessId'] ?? '';
        return BookingPage(businessId: businessId);
      },
    ),
    
    // Kısa URL için de destek
    GoRoute(
      path: '/:businessId',
      name: 'booking-short',
      builder: (context, state) {
        final businessId = state.pathParameters['businessId'] ?? '';
        // Admin ve login gibi rezerve edilmiş yolları kontrol et
        if (['admin', 'login', 'register'].contains(businessId)) {
          return const Scaffold(
            body: Center(child: Text('Sayfa bulunamadı')),
          );
        }
        return BookingPage(businessId: businessId);
      },
    ),
  ],
  
  // 404 sayfası
  errorBuilder: (context, state) => Scaffold(
    body: Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.error_outline,
            size: 64,
            color: Colors.grey,
          ),
          const SizedBox(height: 16),
          const Text(
            '404',
            style: TextStyle(
              fontSize: 48,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Sayfa bulunamadı',
            style: TextStyle(
              fontSize: 18,
              color: Colors.grey,
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () => context.go('/'),
            child: const Text('Ana Sayfaya Dön'),
          ),
        ],
      ),
    ),
  ),
);
