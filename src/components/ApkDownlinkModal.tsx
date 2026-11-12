import React, { useState } from 'react';
import {
  X,
  Download,
  Smartphone,
  CheckCircle2,
  Copy,
  ExternalLink,
  Cpu,
  Sparkles,
  QrCode,
  Github,
  Package,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';

interface ApkDownlinkModalProps {
  onClose: () => void;
}

export const ApkDownlinkModal: React.FC<ApkDownlinkModalProps> = ({ onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [downloadingBundle, setDownloadingBundle] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-pre-yhae2ktfm5kui2ytwmfwfo-177448640629.asia-northeast1.run.app';
  const directApkUrl = '/VanguardWeaver-v1.0.0-armv7.apk';

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) setInstalledSuccess(true);
    } else {
      alert(
        'On your Android device:\n\n1. Tap the three dots menu (⋮) in Chrome or Samsung Internet.\n2. Tap "Install app" or "Add to Home screen".\n3. Android will automatically compile and register the native WebAPK in your app drawer!'
      );
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDirectApk = () => {
    const a = document.createElement('a');
    a.href = directApkUrl;
    a.download = 'VanguardWeaver-v1.0.0-armv7.apk';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadOfflinePackage = () => {
    setDownloadingBundle(true);
    try {
      const packageData = {
        name: 'Vanguard Weaver 3D',
        version: '1.0.0',
        targetArchitecture: 'ARMv7 / armeabi-v7a',
        targetOs: 'Android 8.1+ (Samsung Galaxy A2 Core & Low-End GPUs)',
        ramRequirement: '1 GB RAM Optimized',
        apkDownloadUrl: directApkUrl,
        githubWorkflow: '.github/workflows/build-apk.yml',
        packageUrl: currentUrl,
        downloadTimestamp: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(packageData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'VanguardWeaver-Android-WebAPK-Manifest.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {}
    setTimeout(() => setDownloadingBundle(false), 1200);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 select-none font-sans">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-slate-900 border-2 border-cyan-500/60 rounded-xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-wide">
                FULL GAME DIRECT APK & GITHUB DOWNLINK
              </h3>
              <p className="text-[11px] text-cyan-300 font-mono">
                ARMv7 / 1GB RAM · Android 8.1+ (Galaxy A2 Core)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-900 text-slate-200">
          {/* PRIMARY: DIRECT APK DOWNLOAD BUTTON */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/90 via-slate-950 to-cyan-950/90 border-2 border-emerald-500/70 shadow-lg space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
                  DIRECT APK FILE · READY TO SIDELOAD
                </span>
                <h4 className="text-lg font-black text-white mt-1">
                  VanguardWeaver-v1.0.0-armv7.apk
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Pre-compiled Android package optimized specifically for 1 GB RAM & ARMv7 chipsets.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                onClick={handleDownloadDirectApk}
                className="flex-1 py-3 px-5 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>DIRECT DOWNLOAD APK (.apk)</span>
              </button>

              <button
                onClick={handleInstallClick}
                className="py-3 px-4 rounded-lg bg-cyan-600/90 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>NATIVE WEBAPK INSTALL</span>
              </button>
            </div>
          </div>

          {/* GITHUB REPOSITORY & RELEASES CARD */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-white font-bold text-xs">
              <Github className="w-4 h-4 text-cyan-400" />
              <span>GITHUB RELEASES & CI BUILD WORKFLOW</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Full Gradle build files and a GitHub Actions workflow (<code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">.github/workflows/build-apk.yml</code>) are included in this codebase. Pushing to GitHub automatically builds signed release APKs and publishes them directly to GitHub Releases!
            </p>
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">CI Target:</span>
              <strong className="text-cyan-400">GitHub Actions · Gradle assembleRelease</strong>
            </div>
          </div>

          {/* Device Target Specifications */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
            <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Cpu className="w-4 h-4" /> Samsung Galaxy A2 Core Profile
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">MEMORY</span>
                <strong className="text-emerald-400">1 GB RAM</strong>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">TARGET OS</span>
                <strong className="text-white">Android 8.1+</strong>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">CPU ARCH</span>
                <strong className="text-cyan-400">ARMv7 32-bit</strong>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">FPS TARGET</span>
                <strong className="text-amber-400">30 FPS Capped</strong>
              </div>
            </div>
          </div>

          {/* Quick Downlink URL for Phone */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-cyan-400" /> Phone Downlink URL
              </span>
              <button
                onClick={handleCopyLink}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'COPIED!' : 'COPY URL'}</span>
              </button>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-200/90 break-all select-all">
              {currentUrl}
            </div>
          </div>

          {/* Sideloading Instructions */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
            <h4 className="font-bold text-white uppercase tracking-wide">
              How to Install .APK on Android 8.1 (Galaxy A2 Core)
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-300">
              <li>Tap <strong>DIRECT DOWNLOAD APK</strong> above to download the <code className="text-cyan-400">.apk</code> file.</li>
              <li>Open your phone's <strong>Downloads</strong> or <strong>Samsung My Files</strong> app and tap the APK.</li>
              <li>If prompted, tap <strong>Settings</strong> & enable <strong>"Allow from this source"</strong> (Install unknown apps).</li>
              <li>Tap <strong>Install</strong>. The full game will launch with fullscreen performance and offline saving!</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
          <button
            onClick={handleDownloadOfflinePackage}
            disabled={downloadingBundle}
            className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
          >
            <Package className="w-3.5 h-3.5" />
            <span>{downloadingBundle ? 'PREPARING JSON...' : 'MANIFEST JSON'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
