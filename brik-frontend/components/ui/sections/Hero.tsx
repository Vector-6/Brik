import Link from "next/link";
import { GradientText } from "../common";

export default function Hero() {
  return (
    <section
      className="relative min-h-screen lg:py-36 flex items-center px-6 sm:px-10 md:px-16  top-0 mt-0 justify-center overflow-hidden bg-[#1c1c1c]"
      aria-label="Brik Hero Section"
    >
      {/* Mobile: Background image */}
      <div 
        className="absolute inset-0
        + top-0 bg-cover bg-center bg-no-repeat "
        style={{ backgroundImage: 'url(/images/herobg.png)' }}
        aria-hidden="true"
      />

      {/* Content Container */}
      <div className="relative z-[10] w-full max-w-7xl mx-auto py-32 flex flex-col md:flex-row items-center justify-between gap-12 min-h-[80vh]">
        
        {/* Left: Text Content */}
        <div className="flex flex-col items-start text-left w-full md:w-1/2">
          <h1 
            className="font-burbank mb-6 animate-gradient"
            style={{ 
              fontWeight: 700,
              fontSize: '74px',
              background: 'linear-gradient(90deg, #870BDD 0%, #FF0CE7 50%, #870BDD 100%)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: '64px',
              letterSpacing: '0.02em',
              animation: 'gradient-flow 3s ease infinite'
            }}
          >
            Own the Real World Directly from Your Wallet.
          </h1>
          <p 
            className="text-lg md:text-xl text-[#6e6e6e] mb-8 font-medium"
       
          >
           Swap crypto into tokenized real-world assets across chains.<br/>
Access tokenized gold, treasuries, and the most secure RWAs, all in one on-chain terminal.
          </p>
          <div className="mb-8">
            <span className="font-bold text-lg md:text-xl text-[rgb(255,214,0)]">Secure. Instant. Transparent.</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 w-full md:w-auto">
            <Link
              href="/swap"
              className="inline-flex items-center justify-center px-9 py-4 text-[#1c1c1c] rounded-xl text-xl font-semibold shadow-lg transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 bg-[rgb(255,214,0)] font-burbank "
           
            >
              Try Swap
            </Link>
            <Link
              href="/explore"
           className="inline-flex items-center justify-center px-9 py-4 text-xl text-white border border-pink-500 rounded-xl  font-semibold shadow-lg transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 font-burbank"

            >
             Explore Assets
            </Link>
          </div>
        </div>

        {/* Right: Image (Desktop only) */}
        <div className="hidden md:block w-1/2 relative">
          {/* Purple radial blob background */}
          {/* <div 
            className="absolute inset-0 -z-10"
            style={{
              background: 'radial-gradient(circle, rgba(135, 11, 221, 0.4) 0%, rgba(135, 11, 221, 0.2) 30%, rgba(135, 11, 221, 0.1) 50%, transparent 70%)',
              filter: 'blur(40px)',
              transform: 'scale(2.5)',
            }}
            aria-hidden="true"
          />
          <img 
            src="/images/herobg.png" 
            alt="Brik Hero" 
            className="w-full h-auto object-contain relative z-10"
          /> */}
   
        </div>
      </div>
    </section>
  );
}
