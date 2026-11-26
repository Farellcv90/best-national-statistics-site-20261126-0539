// data.js — every figure for the Republic of Meridia, 2024.
// This file is the site's single source of truth. All figures carry their
// source and year where they are shown. Meridia is a fictional country, so
// these figures are the national statistical office's own published series,
// not any real country's statistics.

export const COUNTRY = {
  name: 'Republic of Meridia',
  shortName: 'Meridia',
  capital: 'Alderport',
  currency: 'merid',
  currencySymbol: 'M$',
  provinces: 9,
  year: 2024,
};

export const HEADLINE = {
  population: { value: 18.42, unit: 'million', change: '+0.9% y/y', year: 2024 },
  density: { value: 41.2, unit: 'people per km²', year: 2024 },
  urban: { value: 68.4, unit: '% of population', year: 2024 },
  medianAge: { value: 34.1, unit: 'years', year: 2024 },
  lifeExpectancy: { value: 78.9, women: 81.2, men: 76.6, unit: 'years', year: 2024 },
  fertility: { value: 1.82, unit: 'children per woman', year: 2024 },
  gdp: { value: 412.6, unit: 'M$ billion', year: 2024 },
  gdpPerCapita: { value: 22400, unit: 'M$', year: 2024 },
  gdpGrowth: { value: 3.1, previous: 2.4, unit: '% real growth', year: 2024 },
  unemployment: { value: 5.2, unit: '%', year: 2024 },
  employment: { value: 12.41, unit: 'million people', year: 2024 },
  participation: { value: 66.8, unit: '%', year: 2024 },
  medianWage: { value: 2940, unit: 'M$ per month', year: 2024 },
  cpi: { value: 2.6, unit: '% y/y', year: 2024 },
  exports: { value: 168.3, unit: 'M$ billion', year: 2024 },
  imports: { value: 154.7, unit: 'M$ billion', year: 2024 },
  tradeBalance: { value: 13.6, unit: 'M$ billion surplus', year: 2024 },
};

// Annual series, 2015–2024. Charts and tables read from these arrays.
export const YEARS = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];

export const SERIES = {
  gdpGrowth: {
    label: 'Real GDP growth',
    unit: '%',
    values: [2.1, 2.6, 3.0, 2.8, 2.2, -3.4, 4.6, 3.8, 2.4, 3.1],
    source: 'National Accounts 2024, Statistics Meridia',
  },
  cpi: {
    label: 'CPI inflation',
    unit: '%',
    values: [1.8, 2.2, 2.5, 2.9, 2.4, 1.1, 2.8, 4.9, 3.6, 2.6],
    source: 'Consumer Price Index 2024, Statistics Meridia',
  },
  unemployment: {
    label: 'Unemployment rate',
    unit: '%',
    values: [6.8, 6.4, 6.1, 5.8, 5.5, 7.9, 6.9, 6.0, 5.6, 5.2],
    source: 'Labour Force Survey 2024, Statistics Meridia',
  },
  population: {
    label: 'Population',
    unit: 'million',
    values: [16.94, 17.09, 17.25, 17.42, 17.58, 17.71, 17.88, 18.06, 18.25, 18.42],
    source: 'Population Estimates 2024, Statistics Meridia',
  },
  exports: {
    label: 'Exports of goods and services',
    unit: 'M$ billion',
    values: [121.4, 126.8, 134.2, 141.7, 138.9, 122.6, 148.3, 161.9, 159.4, 168.3],
    source: 'International Trade 2024, Statistics Meridia',
  },
  imports: {
    label: 'Imports of goods and services',
    unit: 'M$ billion',
    values: [118.2, 121.5, 128.8, 136.4, 133.1, 119.8, 141.2, 153.6, 149.8, 154.7],
    source: 'International Trade 2024, Statistics Meridia',
  },
};

// Trade balance, derived as exports minus imports (M$ billion).
export const TRADE_BALANCE = SERIES.exports.values.map((v, i) =>
  Math.round((v - SERIES.imports.values[i]) * 10) / 10,
);

// GDP by sector, share of GDP, 2024.
export const SECTORS = [
  { name: 'Services', share: 61.2, colour: '#0e6b5c' },
  { name: 'Industry', share: 27.8, colour: '#e8a317' },
  { name: 'Agriculture', share: 11.0, colour: '#7a8a7f' },
];

// Employment by sector, 2024 (million people). Sums to 12.41m.
export const EMPLOYMENT_SECTORS = [
  { name: 'Services', value: 8.42 },
  { name: 'Industry', value: 2.96 },
  { name: 'Agriculture', value: 1.03 },
];

// Median monthly wage by sector, 2024 (M$). National median is M$2,940.
export const WAGES = [
  { sector: 'Services', wage: 3120, change: '+3.4%' },
  { sector: 'Industry', wage: 2860, change: '+2.9%' },
  { sector: 'Agriculture', wage: 1940, change: '+2.1%' },
  { sector: 'All sectors (median)', wage: 2940, change: '+3.1%' },
];

// CPI by category, annual change 2024 (%), with basket weights (%).
export const CPI_CATEGORIES = [
  { name: 'Food and non-alcoholic drinks', change: 3.4, weight: 24.1 },
  { name: 'Housing, water and energy', change: 2.1, weight: 27.8 },
  { name: 'Transport', change: 1.9, weight: 12.4 },
  { name: 'Health', change: 2.8, weight: 6.3 },
  { name: 'Education', change: 1.6, weight: 4.9 },
  { name: 'Energy', change: -0.8, weight: 8.2 },
  { name: 'Other goods and services', change: 2.3, weight: 16.3 },
];

// Provinces, 2024: population (million), GDP per capita (M$), unemployment (%).
export const PROVINCES = [
  { name: 'Alderport', population: 3.86, gdpPerCapita: 31200, unemployment: 4.6 },
  { name: 'Northgate', population: 2.41, gdpPerCapita: 19800, unemployment: 5.9 },
  { name: 'Kellwick', population: 2.18, gdpPerCapita: 21400, unemployment: 5.1 },
  { name: 'Southerly', population: 1.94, gdpPerCapita: 18600, unemployment: 6.2 },
  { name: 'Eastmere', population: 1.87, gdpPerCapita: 24700, unemployment: 4.9 },
  { name: 'Highmoor', population: 1.62, gdpPerCapita: 17300, unemployment: 6.8 },
  { name: 'Westford', population: 1.58, gdpPerCapita: 20900, unemployment: 5.4 },
  { name: 'Lakeshire', population: 1.51, gdpPerCapita: 16800, unemployment: 7.1 },
  { name: 'Fenwick', population: 1.45, gdpPerCapita: 15400, unemployment: 7.4 },
];

// Population pyramid bands, 2024 (thousands, women | men).
export const PYRAMID = [
  { band: '0–4', women: 512, men: 528 },
  { band: '5–9', women: 548, men: 566 },
  { band: '10–14', women: 571, men: 589 },
  { band: '15–19', women: 604, men: 622 },
  { band: '20–24', women: 658, men: 671 },
  { band: '25–29', women: 701, men: 712 },
  { band: '30–34', women: 689, men: 694 },
  { band: '35–39', women: 661, men: 658 },
  { band: '40–44', women: 628, men: 619 },
  { band: '45–49', women: 596, men: 582 },
  { band: '50–54', women: 562, men: 544 },
  { band: '55–59', women: 521, men: 498 },
  { band: '60–64', women: 468, men: 439 },
  { band: '65–69', women: 402, men: 368 },
  { band: '70–74', women: 318, men: 281 },
  { band: '75–79', women: 221, men: 186 },
  { band: '80+', women: 168, men: 132 },
];

// Age structure derived from the pyramid bands above (thousands, 2024).
export const AGE_GROUPS = [
  { group: '0–14', women: 1631, men: 1683 },
  { group: '15–64', women: 6088, men: 6039 },
  { group: '65+', women: 1109, men: 967 },
];

// Health: hospital beds and doctors per 1,000 people, 2015–2024.
export const HEALTH_TREND = {
  beds: [4.6, 4.6, 4.5, 4.5, 4.4, 4.4, 4.3, 4.3, 4.2, 4.2],
  doctors: [2.4, 2.5, 2.6, 2.6, 2.7, 2.8, 2.9, 2.9, 3.0, 3.1],
};
export const HEALTH = {
  beds: 4.2,
  doctors: 3.1,
  infantMortality: 4.8,
};
export const CAUSES_OF_DEATH = [
  { cause: 'Cardiovascular diseases', share: 31.2 },
  { cause: 'Cancer', share: 24.8 },
  { cause: 'Respiratory diseases', share: 9.6 },
  { cause: 'Diabetes', share: 4.2 },
  { cause: 'Accidents and injuries', share: 3.8 },
  { cause: 'All other causes', share: 26.4 },
];

// Education, 2024.
export const EDUCATION = {
  literacy: 98.7,
  tertiaryEnrolment: 54.3,
  schools: 6214,
  pupils: 2.86,
};
export const TERTIARY_TREND = [44.1, 45.3, 46.8, 48.0, 49.2, 50.1, 51.4, 52.6, 53.5, 54.3];
export const LITERACY_BY_AGE = [
  { age: '15–24', rate: 99.6 },
  { age: '25–34', rate: 99.4 },
  { age: '35–44', rate: 99.1 },
  { age: '45–54', rate: 98.8 },
  { age: '55–64', rate: 98.2 },
  { age: '65+', rate: 96.9 },
];
export const SCHOOLS = [
  { level: 'Primary', schools: 3842, pupils: 1.52 },
  { level: 'Secondary', schools: 1964, pupils: 1.08 },
  { level: 'Tertiary', schools: 408, pupils: 0.26 },
];

// Environment, 2024.
export const ENVIRONMENT = {
  co2PerCapita: 6.1,
  renewables: 38.2,
  forest: 44.1,
};

// Export partners, share of total exports, 2024.
export const TRADE_PARTNERS = [
  { partner: 'Alderland', share: 18.2 },
  { partner: 'Kestrel Union', share: 14.6 },
  { partner: 'Northgate Pact', share: 11.3 },
  { partner: 'Southmere Isles', share: 8.7 },
  { partner: 'Port Vellin', share: 7.4 },
  { partner: 'Cairn States', share: 6.1 },
  { partner: 'Other partners', share: 33.7 },
];

// Release calendar. Dates after the build date are scheduled, never published.
export const RELEASES = [
  { title: 'GDP, third quarter 2026', date: '28 Nov 2026', status: 'Scheduled' },
  { title: 'Consumer prices, November 2026', date: '11 Dec 2026', status: 'Scheduled' },
  { title: 'Consumer prices, January 2027', date: '12 Feb 2027', status: 'Scheduled' },
  { title: 'Labour force, fourth quarter 2026', date: '19 Feb 2027', status: 'Scheduled' },
  { title: 'GDP, fourth quarter 2026', date: '26 Feb 2027', status: 'Scheduled' },
  { title: 'Population estimates 2026', date: '11 Mar 2027', status: 'Scheduled' },
  { title: 'Labour force, third quarter 2026', date: '20 Nov 2026', status: 'Published' },
  { title: 'Consumer prices, October 2026', date: '12 Nov 2026', status: 'Published' },
  { title: 'GDP, second quarter 2026', date: '28 Aug 2026', status: 'Published' },
];

// Economy indicator table, 2024.
export const ECONOMY_INDICATORS = [
  { indicator: 'Gross domestic product', value: 'M$412.6bn', note: 'Current prices' },
  { indicator: 'GDP per capita', value: 'M$22,400', note: 'Current prices' },
  { indicator: 'Real GDP growth', value: '+3.1%', note: '2023: +2.4%' },
  { indicator: 'Gross national income', value: 'M$408.9bn', note: 'Current prices' },
  { indicator: 'Gross fixed capital formation', value: '24.6% of GDP', note: 'Investment' },
  { indicator: 'Gross national savings', value: '22.1% of GDP', note: 'Share of GDP' },
  { indicator: 'General government balance', value: '−1.8% of GDP', note: 'Deficit' },
  { indicator: 'General government debt', value: '46.3% of GDP', note: 'End of 2024' },
];

// Navigation: every page of the site, reached by a link.
export const NAV = [
  { route: '#/', label: 'Dashboard' },
  { route: '#/population', label: 'Population' },
  { route: '#/economy', label: 'Economy' },
  { route: '#/labour', label: 'Labour' },
  { route: '#/prices', label: 'Prices' },
  { route: '#/trade', label: 'Trade' },
  { route: '#/health', label: 'Health' },
  { route: '#/education', label: 'Education' },
  { route: '#/regions', label: 'Regions' },
  { route: '#/releases', label: 'Releases' },
  { route: '#/methods', label: 'Methods' },
  { route: '#/explorer', label: 'Data explorer' },
];
