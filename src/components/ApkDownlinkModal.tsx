import React, { useState } from 'react';
import {
  X,
  Download,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  Cpu,
  Layers,
  Sparkles,
  QrCode,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';

interface ApkDownlinkModalProps {
  onClose: () => void;
}

export const ApkDownlinkModal: React.FC<ApkDownlinkModalProps> = ({ onClose }) => {
  const { isInstallable, isInstalled, isAndroid, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [downloadingBundle, setDownloadingBundle] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-pre-yhae2ktfm5kui2ytwmfwfo-177448640629.asia-northeast1.run.app';

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) setInstalledSuccess(true);
    } else {
      // Fallback for browsers without deferred prompt
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

  const handleDownloadOfflinePackage = () => {
    setDownloadingBundle(true);
    try {
      const packageData = {
        name: 'Vanguard Weaver 3D',
        version: '1.0.0',
        targetArchitecture: 'ARMv7 / armeabi-v7a',
        targetOs: 'Android 8.1+ (Oreo Go Edition / Galaxy A2 Core)',
        ramRequirement: '1 GB RAM Optimized',
        displayMode: 'standalone',
        orientation: 'sensor-landscape',
        packageUrl: currentUrl,
        downloadTimestamp: new Date().toISOString(),
        offlineCache: {
          manifest: '/manifest.webmanifest',
          sw: '/sw.js',
          status: 'ready_for_offline',
        },
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
                ANDROID APK DOWNLINK & INSTALLER
              </h3>
              <p className="text-[11px] text-cyan-300 font-mono">
                WebAPK Package · Optimized for Samsung Galaxy A2 Core (1GB RAM)
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
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-900 text-slate-200">
          {/* Status Banner */}
          {installedSuccess || isInstalled ? (
            <div className="p-3.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-white">Application Installed!</h4>
                <p className="text-xs text-emerald-300">
                  Vanguard Weaver is registered in your Android home screen and app launcher.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-lg bg-slate-950 border border-cyan-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-white block">Ready to Install on Android</span>
                  <span className="text-slate-400">
                    Native WebAPK generation enables full hardware acceleration & fullscreen mode.
                  </span>
                </div>
              </div>
              <button
                onClick={handleInstallClick}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-extrabold text-xs rounded-lg shadow-md shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                INSTALL APK NOW
              </button>
            </div>
          )}

          {/* Device Target Specifications */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
            <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Cpu className="w-4 h-4" /> Hardware Compatibility Profile
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
                <span className="text-[10px] text-slate-400 block">TARGET FPS</span>
                <strong className="text-amber-400">30 FPS Capped</strong>
              </div>
            </div>
          </div>

          {/* Quick Downlink URL for Phone */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-cyan-400" /> Open on Mobile Phone
              </span>
              <button
                onClick={handleCopyLink}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'COPIED!' : 'COPY URL'}</span>
              </button>
            </div>
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-200/90 break-all select-all">
              {currentUrl}
            </div>
          </div>

          {/* Android Installation Instructions (Step-by-step for Galaxy A2 Core) */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">
              Samsung Galaxy A2 Core / Android 8.1 Setup Steps
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex gap-2.5 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <span>
                  Open this downlink in <strong>Chrome</strong> or <strong>Samsung Internet</strong> on your Android phone.
                </span>
              </div>
              <div className="flex gap-2.5 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <span>
                  Tap <strong>"INSTALL APK NOW"</strong> above, or tap the browser menu (<strong>⋮</strong>) and choose <strong>"Install app"</strong> / <strong>"Add to Home screen"</strong>.
                </span>
              </div>
              <div className="flex gap-2.5 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </span>
                <span>
                  Android automatically packages and installs the signed <strong>WebAPK</strong> file into your system app drawer with offline caching enabled!
                </span>
              </div>
            </div>
          </div>

          {/* Offline Manifest Download */}
          <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-xs text-slate-400">
              Need offline manifest metadata for sideloading?
            </div>
            <button
              onClick={handleDownloadOfflinePackage}
              disabled={downloadingBundle}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>{downloadingBundle ? 'PREPARING...' : 'DOWNLOAD MANIFEST JSON'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
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
