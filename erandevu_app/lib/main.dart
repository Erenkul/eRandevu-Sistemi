import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'core/theme/app_theme.dart';
import 'core/utils/router.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Firebase başlatma - gerçek uygulamada aktif edilecek
  // await Firebase.initializeApp(
  //   options: DefaultFirebaseOptions.currentPlatform,
  // );
  
  runApp(
    const ProviderScope(
      child: ErandevuApp(),
    ),
  );
}

class ErandevuApp extends StatelessWidget {
  const ErandevuApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'eRandevu - Randevu Yönetim Platformu',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      routerConfig: router,
      builder: (context, child) {
        // Google Fonts yükleme sorunları için fallback
        return MediaQuery(
          data: MediaQuery.of(context).copyWith(
            textScaler: TextScaler.noScaling,
          ),
          child: child ?? const SizedBox(),
        );
      },
    );
  }
}
