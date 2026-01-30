# 🕯️ Eternal Flame

**One Tap. One Day. One Promise.**

Game konsistensi harian yang tenang dan bermakna. Nyalakan lilin Anda setiap hari, bangun streak, dan raih peringkat global.

## 🎮 Fitur Utama

- ✨ **One Tap Per Day** - Satu lilin, satu kesempatan setiap hari
- 🔥 **Streak System** - Bangun konsistensi dan raih streak tertinggi
- 🏆 **Global Leaderboard** - Bersaing dengan pemain di seluruh dunia
- 🎨 **Skin System** - Unlock skin lilin dari Basic hingga Mythic
- 👑 **Title System** - Dapatkan title berdasarkan rank (Eternal Keeper, Flame Guardian, Light Bearer)
- ⭐ **Premium Cosmetics** - Fitur premium yang tidak pay-to-win
- 🎯 **Clean UI/UX** - Dark mode, minimalis, fokus pada ketenangan

## 🔧 Teknologi

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase Realtime Database
- **Authentication**: Firebase Auth
- **Hosting**: Vercel (recommended)
- **Mobile-First**: Responsive design untuk HP

## 📁 Struktur File

```
eternal-flame/
├── index.html          # Main HTML file
├── styles.css          # All styling
├── app.js             # Game logic & Firebase
└── README.md          # Documentation
```

## 🚀 Setup & Deployment

### 1. Firebase Setup

Firebase sudah dikonfigurasi dengan credentials berikut:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBPuhy-xfMyDKdRIxJn8MkR3J6FLJ3OuCE",
  authDomain: "eternal-flame-c74e4.firebaseapp.com",
  databaseURL: "https://eternal-flame-c74e4-default-rtdb.firebaseio.com",
  projectId: "eternal-flame-c74e4",
  storageBucket: "eternal-flame-c74e4.firebasestorage.app",
  messagingSenderId: "883441410566",
  appId: "1:883441410566:web:51f384d088658a91b2d987"
};
```

### 2. Firebase Database Rules

Set rules di Firebase Console:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": true,
        ".write": "$uid === auth.uid || root.child('admins').child(auth.uid).exists()"
      }
    },
    "leaderboard": {
      ".read": true,
      "$uid": {
        ".write": "$uid === auth.uid || root.child('admins').child(auth.uid).exists()"
      }
    },
    "admins": {
      ".read": "root.child('admins').child(auth.uid).exists()",
      ".write": false
    }
  }
}
```

### 3. Deploy ke Vercel

#### Cara 1: Via GitHub
1. Push code ke GitHub repository
2. Login ke [Vercel](https://vercel.com)
3. Import repository
4. Deploy (auto-detect settings)

#### Cara 2: Via Vercel CLI
```bash
npm install -g vercel
vercel login
vercel
```

#### Cara 3: Drag & Drop
1. Buka [Vercel](https://vercel.com)
2. Drag folder project ke dashboard
3. Done!

## 👤 Admin Setup

### Cara Menambah Admin

1. Buka Firebase Console
2. Pergi ke Realtime Database
3. Tambahkan struktur berikut:

```
admins/
  YOUR_UID_HERE: true
```

Cara mendapat UID:
- Login sebagai user biasa
- Buka Console Browser (F12)
- Ketik: `firebase.auth().currentUser.uid`
- Copy UID tersebut

### Fitur Admin Panel

Admin bisa:
- ✅ Ban/Unban user
- ✅ Grant/Remove premium (30 hari)
- ✅ Reset streak user
- ✅ Semua aksi real-time

Admin panel hanya muncul untuk UID yang terdaftar di `/admins`.

## 🎨 Skin System

### Tier Skin

| Tier | Nama | Unlock Requirement |
|------|------|-------------------|
| Basic | Classic Candle | Default |
| Rare | Ocean Breeze | Streak 7 hari |
| Epic | Mystic Dream | Streak 30 hari |
| Legendary | Golden Hope | Streak 100 hari |
| Mythic | Eternal Spectrum | Premium Only |

## 💎 Premium System

### Cara Kerja
1. User klik "Beli Premium"
2. Redirect ke WhatsApp Channel
3. User hubungi admin
4. Admin grant premium via Admin Panel

### WhatsApp Channel
```
https://whatsapp.com/channel/0029VbBebzhLtOjDH9Xcb23v
```

### Benefit Premium
- ⭐ Skin eksklusif (Mythic)
- 🎨 Background premium
- 🖼️ Border nama animated
- 👑 Title khusus
- 🌟 Premium badge

**PENTING**: Premium hanya kosmetik, tidak mempengaruhi gameplay!

## 🏆 Title System

Title otomatis berdasarkan rank di leaderboard:

| Rank | Title |
|------|-------|
| Top 1 | Eternal Keeper |
| Top 2-10 | Flame Guardian |
| Top 11-100 | Light Bearer |
| Lainnya | Wanderer |

## 🔒 Security Features

### Anti-Cheat
- ✅ Validasi 1x per hari via server timestamp
- ✅ Tidak bisa manipulasi waktu client
- ✅ Ban system untuk cheater
- ✅ Banned user tidak muncul di leaderboard

### Database Security
- ✅ Firebase Rules configured
- ✅ Admin-only actions
- ✅ User can only update their own data

## 📱 Mobile Optimization

- ✅ Portrait mode only
- ✅ Touch-optimized buttons
- ✅ Smooth animations
- ✅ Lightweight (< 100KB total)
- ✅ PWA-ready

## 🎵 Audio

- Ambient sound (optional)
- Sound effect saat nyalakan lilin
- Tidak mengganggu
- Auto-mute friendly

## 🐛 Troubleshooting

### User tidak bisa login
- Cek Firebase Authentication enabled
- Cek email/password format

### Streak tidak update
- Cek Firebase Database rules
- Cek timezone settings

### Admin panel tidak muncul
- Pastikan UID ada di `/admins`
- Refresh halaman
- Check console untuk errors

## 📊 Database Structure

```
firebase-db/
├── users/
│   └── {uid}/
│       ├── username: string
│       ├── email: string
│       ├── streak: number
│       ├── lastUpdate: timestamp
│       ├── skin: string
│       ├── title: string
│       ├── premium/
│       │   ├── active: boolean
│       │   └── until: timestamp
│       ├── banned: boolean
│       └── createdAt: timestamp
│
├── leaderboard/
│   └── {uid}/
│       ├── username: string
│       └── streak: number
│
└── admins/
    └── {uid}: true
```

## 🎯 Best Practices

### Untuk User
- Nyalakan lilin setiap hari di waktu yang sama
- Jangan skip sehari pun untuk maintain streak
- Unlock skin dengan konsistensi

### Untuk Admin
- Jangan abuse admin powers
- Monitor cheaters
- Respond to premium requests quickly

## 🔄 Update Log

### Version 1.0.0 (Initial Release)
- ✅ Basic game mechanics
- ✅ Firebase integration
- ✅ Leaderboard system
- ✅ Skin system (5 tiers)
- ✅ Premium system
- ✅ Admin panel
- ✅ Anti-cheat measures

## 📞 Support

Untuk bantuan atau pertanyaan:
- WhatsApp Channel: https://whatsapp.com/channel/0029VbBebzhLtOjDH9Xcb23v

## 📜 License

© 2026 Eternal Flame. All rights reserved.

---

**Remember**: One Tap. One Day. One Promise. 🕯️
