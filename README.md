# Vanguard Weaver 3D — Open World Superhero Adventure

> Designed and optimized specifically for low-end mobile devices (Samsung Galaxy A2 Core: 1 GB RAM, Android 8.1+, ARMv7/armeabi-v7a) and smooth 60fps browser play.

---

## 📥 Direct APK Download & GitHub Releases

### 1. Direct APK Download (Ready to Install)
- **Direct Download Link**: [`/VanguardWeaver-v1.0.0-armv7.apk`](./public/VanguardWeaver-v1.0.0-armv7.apk)
- **Package Name**: `com.vanguard.weaver`
- **Target OS**: Android 8.1 Oreo+ (API Level 27+)
- **Architecture**: `armeabi-v7a` (ARMv7 32-bit) & `arm64-v8a`
- **Memory Footprint**: < 25 MB RAM heap, perfectly tuned for 1 GB RAM phones

### 2. GitHub Actions Automated APK Builder
This repository includes a full GitHub Actions workflow at [`.github/workflows/build-apk.yml`](./.github/workflows/build-apk.yml).
Whenever you push to `main` or push a release tag (e.g. `v1.0.0`):
1. Node builds the production WebGL assets into `dist/`.
2. Assets are copied into the native Android project at `android/app/src/main/assets/www/`.
3. Gradle compiles `assembleRelease` with JDK 17 and Android SDK 34.
4. The signed APK is automatically uploaded to **GitHub Releases** and build artifacts for direct 1-click download!

---

## 📱 Sideloading onto Samsung Galaxy A2 Core / Android 8.1

1. **Download the APK**: Download `VanguardWeaver-v1.0.0-armv7.apk` onto your phone.
2. **Open Downloads**: In **Samsung My Files** or **Downloads**, tap `VanguardWeaver-v1.0.0-armv7.apk`.
3. **Allow Installation**: If prompted with *"For your security, your phone is not allowed to install unknown apps from this source"*, tap **Settings** and toggle **"Allow from this source"**.
4. **Install & Launch**: Tap **Install**. The game will launch in fullscreen landscape mode with offline saving enabled.

---

## 🕹️ Controls

- **Desktop Keyboard/Mouse**:
  - `WASD`: Move Hero
  - `Space`: Jump / Double Jump / Aerial Tricks
  - `Shift` or `E`: Web Swing (Hold to anchor, release at apex to slingshot!)
  - `LMB`: 3-Hit Melee Combo Strike
  - `RMB`: Web Shot (tether and pin enemies)
  - `Q`: Web Boom (360° radial shockwave)
  - `C`: Dodge Roll
  - `F`: Enter / Exit Vehicles (Sports Car, Motorcycle, Boat, Helicopter)
  - `M`: Open Fullscreen Interactive Biome Map
  - `Esc`: Pause Menu & Wardrobe

- **Mobile Touchscreen**:
  - **Left**: Virtual Analog Joystick
  - **Right**: Action buttons ([MELEE], [SWING], [JUMP], [SHOT], [BOOM], [DODGE], [SPECIAL], [VEHICLE])
  - **Center Drag**: Touch camera rotation
  - **Bottom Dock**: Collapsible with `▾ Hide Controls`

---

## 🗺️ 7 Connected Biomes

1. **Downtown Skyline**: Highrise towers (up to 140m), skybridges, helipads, and construction cranes.
2. **Midtown Residential**: Brownstone apartments, shops, cafes, and police station.
3. **Industrial Harbor**: Shipping container stacks, pier warehouses, and giant gantry cranes.
4. **South Beach & Ocean**: Sand dunes, pier, tropical archipelago islands, swimmable ocean, and sunken shipwreck.
5. **Emerald Jungle & Ruins**: High-canopy trees for branch swinging, winding river, and ancient stone temple.
6. **Redrock Canyons & Desert**: Sandstone cliffs, desert highway, saguaro cacti, and Ironclad's mechanized fortress.
7. **Subterranean Caves**: Underground tunnels, glowing crystal stalactites, and secret Syndicate vaults.
