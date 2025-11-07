import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "SavingPlanner - FHEVM Savings Planning",
  description: "Privacy-preserving savings planning DApp using Zama FHEVM",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="min-h-screen w-full">
          <div className="fixed inset-0 w-full h-full z-[-1]" 
               style={{
                 background: 'linear-gradient(135deg, #0a1929 0%, #0d2137 50%, #102844 100%)'
               }}></div>
          
          {/* Header */}
          <header className="border-b border-gray-700/50 backdrop-blur-sm bg-black/20">
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl gradient-green flex items-center justify-center text-2xl shadow-lg">
                    💰
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                      SavingPlanner
                    </h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                      Privacy-Preserving Financial Planning
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="px-4 py-2 rounded-lg glass-card-light">
                    <span className="text-xs text-gray-400 uppercase tracking-wide">Powered by</span>
                    <p className="text-sm font-semibold text-white">Zama FHEVM</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-6 py-8">
            <Providers>{children}</Providers>
          </main>

          {/* Footer */}
          <footer className="border-t border-gray-700/50 backdrop-blur-sm bg-black/20 mt-16">
            <div className="max-w-7xl mx-auto px-6 py-6 text-center">
              <p className="text-sm text-gray-400">
                Encrypted savings calculations with Fully Homomorphic Encryption
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

