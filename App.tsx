import React, { useState, useEffect } from 'react';
import { getPrayerTimes } from './services/geminiService';
import { Prayer, PrayerData, HijriDate } from './types';
import LoadingSpinner from './components/LoadingSpinner';
import Footer from './components/Footer';

// --- Icon Components ---

const ImsakIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

const FajrIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17h18M5 12h14M12 2v6" />
    </svg>
);

const SunriseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
);

const DhuhrIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.9 4.9 1.4 1.4" />
        <path d="m17.7 17.7 1.4 1.4" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m4.9 19.1 1.4-1.4" />
        <path d="m17.7 6.3 1.4-1.4" />
    </svg>
);

const AsrIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 18a6 6 0 0 0 6-6h0a6 6 0 0 0-12 0h0a6 6 0 0 0 6 6Z"/>
        <path d="M12 2v4"/>
        <path d="m4.9 4.9 2.8 2.8"/>
        <path d="M2 12h4"/>
        <path d="M22 12h-4"/>
        <path d="m16.3 7.7 2.8-2.8"/>
    </svg>
);


const MaghribIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 17a5 5 0 0 0-5 5h10a5 5 0 0 0-5-5z"/>
      <path d="M12 2v2"/>
      <path d="m4.93 4.93 1.41 1.41"/>
      <path d="M2 12h2"/>
      <path d="M20 12h2"/>
      <path d="m19.07 4.93-1.41 1.41"/>
    </svg>
);

const IshaIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
);

const Clock: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Asia/Jakarta'
    };

    return (
        <p className="text-xl font-medium text-green-200/90 tracking-wider">
            {`${time.toLocaleTimeString('en-GB', options)} WIB`}
        </p>
    );
};

const PrayerTimeList: React.FC<{ prayers: Prayer[] }> = ({ prayers }) => {
    const [nextPrayerIndex, setNextPrayerIndex] = useState(-1);
    const [expandedPrayer, setExpandedPrayer] = useState<string | null>(null);

    const handlePrayerClick = (prayerName: string) => {
        setExpandedPrayer(prev => prev === prayerName ? null : prayerName);
    };

    const handleKeyDown = (event: React.KeyboardEvent, prayerName: string) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handlePrayerClick(prayerName);
        }
    };

    useEffect(() => {
        const updateNextPrayer = () => {
            const now = new Date();
            const wibTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
            const currentTime = wibTime.getHours() * 60 + wibTime.getMinutes();

            let upcomingPrayerIndex = prayers.findIndex(p => {
                const [hours, minutes] = p.time.split(':').map(Number);
                const prayerTime = hours * 60 + minutes;
                return prayerTime > currentTime;
            });
            
            if (upcomingPrayerIndex === -1) {
                upcomingPrayerIndex = 0;
            }
            
            setNextPrayerIndex(upcomingPrayerIndex);
        };

        updateNextPrayer();
        const interval = setInterval(updateNextPrayer, 60000);

        return () => clearInterval(interval);
    }, [prayers]);

    return (
        <div className="space-y-4 w-full">
            {prayers.map((prayer, index) => {
                const isNext = index === nextPrayerIndex;
                const isExpanded = expandedPrayer === prayer.name;
                const Icon = prayer.icon;
                return (
                    <div 
                        key={prayer.name}
                        role="button"
                        tabIndex={0}
                        aria-expanded={isExpanded}
                        onClick={() => handlePrayerClick(prayer.name)}
                        onKeyDown={(e) => handleKeyDown(e, prayer.name)}
                        className={`rounded-lg transition-all duration-500 cursor-pointer overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-green-100 focus-visible:ring-green-600 ${isNext ? 'bg-green-200 scale-105 shadow-xl border-2 animate-pulse-border' : 'bg-green-100/50'}`}
                    >
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-4">
                                <Icon className={`h-6 w-6 ${isNext ? 'text-green-800' : 'text-green-700'}`} />
                                <p className={`text-lg ${isNext ? 'text-green-900 font-bold' : 'text-green-800 font-semibold'}`}>{prayer.name}</p>
                            </div>
                            <p className={`text-xl font-bold font-sans ${isNext ? 'text-green-950' : 'text-green-900'}`}>{prayer.time}</p>
                        </div>
                        <div
                            className={`transition-all duration-500 ease-in-out grid ${
                                isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                            }`}
                        >
                            <div className="overflow-hidden">
                                <div className={`mx-4 mb-4 pt-3 border-t ${isNext ? 'border-green-400' : 'border-green-200'}`}>
                                    <p className={`text-sm text-center ${isNext ? 'text-green-800' : 'text-green-700'}`}>{prayer.description}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    );
};


const App: React.FC = () => {
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cityInfo] = useState({ city: 'Semarang', country: 'Indonesia' });
  const [currentDay, setCurrentDay] = useState<string>('');

  useEffect(() => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', timeZone: 'Asia/Jakarta' };
    const dayName = new Intl.DateTimeFormat('id-ID', options).format(today);
    setCurrentDay(dayName);
    
    const fetchPrayerTimes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getPrayerTimes(cityInfo.city, cityInfo.country);
        setPrayerData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrayerTimes();
  }, [cityInfo]);
  
  const hijriMonthsID: { [key: string]: string } = {
    "Muḥarram": "Muharram",
    "Ṣafar": "Safar",
    "Rabīʿ al-awwal": "Rabi'ul Awal",
    "Rabīʿ al-thānī": "Rabi'ul Akhir",
    "Jumādá al-ūlá": "Jumadil Awal",
    "Jumādá al-thāniyah": "Jumadil Akhir",
    "Rajab": "Rajab",
    "Shaʿbān": "Sya'ban",
    "Ramaḍān": "Ramadhan",
    "Shawwāl": "Syawal",
    "Dhū al-Qaʿdah": "Dzulqa'dah",
    "Dhū al-Ḥijjah": "Dzulhijjah",
  };

  const formatIndonesianHijriDate = (hijri: HijriDate): string => {
    const monthInID = hijriMonthsID[hijri.month.en] || hijri.month.en;
    return `${hijri.day} ${monthInID} ${hijri.year} H`;
  };

  const prayerList: Prayer[] = prayerData ? [
      { name: 'Imsak', time: prayerData.timings.Imsak, icon: ImsakIcon, description: "The time to stop eating and drinking for fasting." },
      { name: 'Subuh', time: prayerData.timings.Fajr, icon: FajrIcon, description: "The dawn prayer, marking the beginning of the day's spiritual journey." },
      { name: 'Terbit', time: prayerData.timings.Sunrise, icon: SunriseIcon, description: "Sunrise. The time when the morning prayer (Subuh) period ends." },
      { name: 'Dzuhur', time: prayerData.timings.Dhuhr, icon: DhuhrIcon, description: "The midday prayer, a moment of pause and remembrance in the midst of daily activities." },
      { name: 'Ashar', time: prayerData.timings.Asr, icon: AsrIcon, description: "The afternoon prayer, a time for reflection as the day begins to wane." },
      { name: 'Maghrib', time: prayerData.timings.Maghrib, icon: MaghribIcon, description: "The sunset prayer, performed just after the sun has set." },
      { name: 'Isya', time: prayerData.timings.Isha, icon: IshaIcon, description: "The night prayer, the final prayer of the day, offering peace before rest." },
  ] : [];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-900 via-[#013220] to-gray-900 text-gray-800 flex flex-col">
      <header className="w-full max-w-lg mx-auto text-center text-green-100 pt-8 sm:pt-12 px-4">
        <h1 className="text-4xl sm:text-5xl font-bold">Jadwal Sholat</h1>
        <div className="mt-3">
          <p className="text-lg text-green-200/90">
            Semarang, Indonesia
            {prayerData && ` — ${currentDay}, ${prayerData.date.readable}`}
          </p>
          {prayerData && (
            <p className="text-base text-green-300/80 tracking-wide mt-1">
              {formatIndonesianHijriDate(prayerData.date.hijri)}
            </p>
          )}
        </div>
        <div className="mt-2">
            <Clock />
        </div>
      </header>
      
      <main className="w-full max-w-lg mx-auto flex flex-col items-center flex-grow p-4 sm:p-6 w-full">
          <div className="bg-green-50/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 w-full mt-4">
            {isLoading && <div className="flex justify-center items-center h-48"><LoadingSpinner /></div>}
            {error && <p className="text-red-600 bg-red-100 border border-red-400 rounded-lg p-4 text-center">{error}</p>}
            {prayerData && (
                <PrayerTimeList prayers={prayerList} />
            )}
          </div>
      </main>

      <Footer />
    </div>
  );
};

export default App;