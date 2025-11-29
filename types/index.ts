import { Context } from 'telegraf';

// User types
export interface User {
  telegramId: number;
  username: string;
  createdAt: string;
  docId?: string;
}

export interface UserData {
  telegramId: number;
  username: string;
  createdAt: string;
}

// User state types
export type WeatherState = 'today' | 'forecast' | 'manual_input';

export interface UserState {
  weatherState?: WeatherState;
  previousWeatherState?: WeatherState;
  horoscopeMenu?: boolean;
  removeUserState?: boolean;
}

// Texts types
export interface Texts {
  start_message: string;
  buttons: {
    new_year: string;
    weather: string;
    weather_3days: string;
    cocktail: string;
    remove_user: string;
    test_broadcast: string;
    list_recipients: string;
    rates: string;
    link_wallet: string;
    horoscope: string;
    back_to_main: string;
  };
  messages: {
    new_year_time: string;
    cocktail_generating: string;
    cocktail_error: string;
    weather_prompt: string;
    weather_result: string;
    weather_error: string;
    weather_3days_prompt: string;
    weather_3days_result: string;
    weather_3days_error: string;
    no_permission: string;
    already_in_list: string;
    added_to_list: string;
    remove_manual_prompt: string;
    remove_manual_success: string;
    remove_manual_error: string;
    test_broadcast_success: string;
    test_broadcast_error: string;
    test_broadcast_message: string;
    recipients_list_header: string;
    empty_recipients: string;
    rates_generating: string;
    rates_error: string;
    rates_result: string;
    horoscope_prompt: string;
    horoscope_error: string;
  };
  zodiac_buttons: {
    aries: string;
    taurus: string;
    gemini: string;
    cancer: string;
    leo: string;
    virgo: string;
    libra: string;
    scorpio: string;
    sagittarius: string;
    capricorn: string;
    aquarius: string;
    pisces: string;
  };
}

// API Response types
export interface WeatherResponse {
  name: string;
  main: {
    temp: number;
    feels_like: number;
  };
  weather: Array<{
    description: string;
  }>;
}

export interface WeatherForecastResponse {
  city: {
    name: string;
  };
  list: Array<{
    dt: number;
    main: {
      temp: number;
      feels_like: number;
    };
    weather: Array<{
      description: string;
    }>;
  }>;
}


export interface CurrencyRate {
  cc: string;
  rate: number;
}

export interface CryptoResponse {
  bitcoin?: { usd: number };
  ethereum?: { usd: number };
  solana?: { usd: number };
  'the-open-network'?: { usd: number };
  dogecoin?: { usd: number };
}

export interface HoroscopeResponse {
  data: {
    date: string;
    horoscope_data: string;
  };
  status: number;
  success: boolean;
}

// Zodiac sign type
export type ZodiacSign =
  | 'aries'
  | 'taurus'
  | 'gemini'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'scorpio'
  | 'sagittarius'
  | 'capricorn'
  | 'aquarius'
  | 'pisces';

// Context type
export type BotContext = Context;

