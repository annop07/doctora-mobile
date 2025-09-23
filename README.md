# 📱 Cat Tinder Frontend

แอปพลิเคชัน React Native สำหรับ Cat Tinder - แอปจับคู่แมว ที่ช่วยให้เจ้าของแมวค้นหาคู่ครองหรือเพื่อนสำหรับแมวของตน

## 🛠 เทคโนโลยีที่ใช้

- **React Native 0.81.4** - Mobile App Framework
- **Expo ~54.0.8** - Development Platform
- **Expo Router v6** - File-based Navigation
- **NativeWind 4.2.1** - Tailwind CSS for React Native
- **TypeScript** - Type Safety
- **React 19.1.0** - Latest React Features

## 📁 โครงสร้างโปรเจค

```
front_cat-tinder/
├── app/                    # หน้าต่างๆ ของแอป (Expo Router)
│   ├── _layout.tsx        # Root layout + CSS imports
│   ├── index.tsx          # หน้าแรก (Welcome screen)
│   └── globals.css        # Tailwind CSS directives
├── app-example/           # ตัวอย่างจาก Expo (ไม่ใช้)
├── assets/
│   └── images/            # รูปภาพแอป (icons, splash)
├── components/            # Components ที่จะสร้าง
├── services/              # API services ที่จะสร้าง
├── global.css             # Main Tailwind CSS file
├── tailwind.config.js     # TailwindCSS configuration
├── metro.config.js        # Metro bundler + NativeWind config
└── package.json
```

## 🚀 การติดตั้งและเริ่มใช้งาน

### 1. ติดตั้ง Dependencies

```bash
cd front_cat-tinder
npm install
```

### 2. เริ่มแอป

```bash
# เริ่ม Expo development server
npm start
# หรือ
npx expo start
```

### 3. เปิดแอปใน

- **📱 Expo Go** - สแกน QR code ด้วย Expo Go app
- **🤖 Android Emulator** - กด `a` ใน terminal
- **🍎 iOS Simulator** - กด `i` ใน terminal
- **🌐 Web Browser** - กด `w` ใน terminal

## 🎨 Styling

แอปใช้ **NativeWind** (Tailwind CSS for React Native):

```typescript
// ตัวอย่างการใช้งาน
<View className="flex-1 justify-center items-center bg-white">
  <Text className="text-2xl font-bold text-purple-600">
    Cat Tinder
  </Text>
</View>
```

## 📱 Features ที่จะพัฒนา

### 🔐 Authentication
- [ ] Login/Register screens
- [ ] User profile management
- [ ] JWT token handling

### 🐱 Cat Management
- [ ] Add cat profile
- [ ] Upload cat photos
- [ ] Edit cat information
- [ ] View my cats

### 💖 Core Features
- [ ] Cat feed (swipe interface)
- [ ] Like/Pass functionality
- [ ] Match notifications
- [ ] Chat with matches

### 🔍 Advanced Features
- [ ] Location-based filtering
- [ ] Search by breed/age
- [ ] Push notifications
- [ ] Profile verification

## 🔗 การเชื่อมต่อ Backend

แอปจะเชื่อมต่อกับ Backend API ที่ `http://localhost:4000`

### API Services Structure (จะสร้าง)
```
services/
├── api/
│   ├── index.ts          # Base API configuration
│   ├── auth.ts           # Authentication APIs
│   ├── cats.ts           # Cat management
│   └── types.ts          # TypeScript interfaces
├── hooks/
│   ├── useAuth.ts        # Authentication hook
│   └── useCats.ts        # Cat data management
└── utils/
    └── storage.ts        # AsyncStorage utilities
```

## 🔧 Scripts

```bash
npm start          # เริ่ม development server
npm run android    # เปิดใน Android emulator
npm run ios        # เปิดใน iOS simulator
npm run web        # เปิดใน web browser
npm run lint       # ตรวจสอบ code style
```

## 📱 Expo Configuration

- **App Name:** front_cat-tinder
- **Scheme:** restate
- **Platforms:** iOS, Android, Web
- **Features:**
  - New Architecture enabled
  - Typed Routes
  - React Compiler enabled

## 🛠 Development Tools

### Hot Reload
โค้ดจะ reload อัตโนมัติเมื่อมีการเปลี่ยนแปลง

### Debugging
- **Flipper** - Native debugging
- **React DevTools** - Component debugging
- **Network Inspector** - API debugging

### TypeScript
Project ใช้ TypeScript พร้อม strict mode:
```json
{
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

## 🎯 ขั้นตอนการพัฒนาถัดไป

### Phase 1: Authentication (Week 1)
1. Install HTTP client (axios)
2. Create auth screens (Login/Register)
3. Implement JWT token management
4. Create auth context

### Phase 2: Cat Management (Week 2)
1. Create cat profile screens
2. Implement photo upload
3. Add cat listing/editing
4. Connect to backend APIs

### Phase 3: Swipe Feature (Week 3)
1. Create swipe interface
2. Implement like/pass functionality
3. Add match detection
4. Basic messaging

### Phase 4: Polish (Week 4)
1. Add animations
2. Improve UI/UX
3. Add error handling
4. Performance optimization

## 🐛 Troubleshooting

### Metro bundler issues
```bash
npx expo start --clear
```

### NativeWind not working
```bash
# ตรวจสอบ tailwind.config.js และ metro.config.js
npm run web  # ทดสอบใน web ก่อน
```

### Expo Go connection issues
- ตรวจสอบให้แน่ใจว่าเครื่องและโทรศัพท์อยู่ wifi เดียวกัน
- ใช้ tunnel mode: `npx expo start --tunnel`

## 🤝 การมีส่วนร่วม

1. Fork โปรเจค
2. สร้าง feature branch: `git checkout -b feature/new-feature`
3. Commit การเปลี่ยนแปลง: `git commit -m "Add new feature"`
4. Push ไป branch: `git push origin feature/new-feature`
5. สร้าง Pull Request

## 📚 เอกสารเพิ่มเติม

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [NativeWind Documentation](https://www.nativewind.dev/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)

## 📞 ติดต่อ

หากมีปัญหาหรือข้อสงสัย กรุณาสร้าง Issue ใน GitHub repository
