import type { FC } from 'react';

export interface Timings {
  Imsak: string;
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface HijriDate {
  date: string;
  day: string;
  weekday: {
      en: string;
      ar: string;
  };
  month: {
      number: number;
      en: string;
      ar: string;
  };
  year: string;
  designation: {
      abbreviated: string;
      expanded: string;
  };
}

export interface PrayerData {
  timings: Timings;
  date: {
    readable: string;
    hijri: HijriDate;
  }
}

export interface Prayer {
    name: string;
    time: string;
    icon: FC<{ className?: string }>;
    description?: string;
}

// FIX: Add and export the Haiku interface to resolve missing type error.
export interface Haiku {
  title: string;
  haiku: [string, string, string];
}
