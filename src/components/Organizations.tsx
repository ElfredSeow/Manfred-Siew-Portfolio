export function Organizations() {
  return (
    <section className="py-12 border-y border-black/10 dark:border-white/10 relative overflow-hidden transition-colors duration-300">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-12 bg-[#4ea8de]/10 blur-[100px] pointer-events-none rounded-full" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center justify-center">
          <p className="micro-label mb-10 text-center opacity-40 text-black dark:text-white">Trusted By</p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-16 md:gap-24 w-full">
            
            {/* The Air Force */}
            <div className="group flex flex-col items-center justify-center transition-all duration-300 hover:scale-105">
              <div className="h-16 md:h-20 w-48 md:w-56 relative flex items-center justify-center">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/e/ea/Republic_of_Singapore_Air_Force_Logo.svg" 
                  alt="Republic of Singapore Air Force" 
                  className="max-h-full max-w-full object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 dark:invert-0"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden absolute inset-0 flex flex-col items-center justify-center text-center font-bold tracking-tighter">
                  <span className="text-[10px] uppercase text-gray-500 dark:text-white/50 font-mono tracking-widest whitespace-nowrap mb-1">Republic of Singapore</span>
                  <span className="text-2xl italic text-gray-800 dark:text-white/80 group-hover:text-blue-500 transition-colors">THE AIR FORCE</span>
                </div>
              </div>
            </div>

            {/* RAiD */}
            <div className="group flex flex-col items-center justify-center transition-all duration-300 hover:scale-105">
               <div className="h-16 md:h-20 w-48 md:w-56 relative flex items-center justify-center">
                <img 
                  src="/Black_RAiD__Reg_.png" 
                  alt="RAiD" 
                  className="max-h-full max-w-full object-contain transition-all duration-500 dark:invert dark:hue-rotate-180"
                />
              </div>
            </div>

            {/* Temasek Polytechnic */}
            <div className="group flex flex-col items-center justify-center transition-all duration-300 hover:scale-105">
              <div className="h-16 md:h-20 w-48 md:w-56 relative flex items-center justify-center">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/en/e/eb/Temasek_Polytechnic_logo.svg" 
                  alt="Temasek Polytechnic" 
                  className="max-h-full max-w-full object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 dark:invert-0"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-black/10 dark:bg-white/10 group-hover:bg-[#E31837] flex items-center justify-center transition-colors">
                      <span className="font-black text-gray-900 dark:text-white text-sm group-hover:text-white">TP</span>
                    </div>
                    <div className="flex flex-col items-start leading-none uppercase tracking-tight">
                      <span className="text-xl font-bold text-gray-800 dark:text-white/80 group-hover:text-black dark:group-hover:text-white transition-colors">Temasek</span>
                      <span className="text-[10px] text-gray-500 dark:text-white/50 tracking-widest font-mono mt-1">Polytechnic</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
