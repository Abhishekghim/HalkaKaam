export interface NepalMunicipality {
  name: string;
  ne: string;
  lat: number;
  lng: number;
  district: string;
  province: string;
}

export interface NepalDistrict {
  name: string;
  ne: string;
  province: string;
  popularMunicipalities: NepalMunicipality[];
}

export interface NepalProvince {
  id: number;
  name: string;
  ne: string;
  districts: string[];
}

export const NEPAL_PROVINCES: NepalProvince[] = [
  {
    id: 1,
    name: 'Koshi Province',
    ne: 'कोशी प्रदेश',
    districts: ['Morang', 'Sunsari', 'Jhapa', 'Ilam', 'Udayapur', 'Dhankuta'],
  },
  {
    id: 2,
    name: 'Madhesh Province',
    ne: 'मधेश प्रदेश',
    districts: ['Parsa', 'Dhanusha', 'Bara', 'Siraha', 'Saptari', 'Rautahat'],
  },
  {
    id: 3,
    name: 'Bagmati Province',
    ne: 'बागमती प्रदेश',
    districts: ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Kavrepalanchok', 'Chitwan', 'Makwanpur'],
  },
  {
    id: 4,
    name: 'Gandaki Province',
    ne: 'गण्डकी प्रदेश',
    districts: ['Kaski', 'Tanahun', 'Syngja', 'Gorkha', 'Nawalpur', 'Baglung'],
  },
  {
    id: 5,
    name: 'Lumbini Province',
    ne: 'लुम्बिनी प्रदेश',
    districts: ['Rupandehi', 'Dang', 'Banke', 'Kapilvastu', 'Palpa', 'Bardiya'],
  },
  {
    id: 6,
    name: 'Karnali Province',
    ne: 'कर्णाली प्रदेश',
    districts: ['Surkhet', 'Dailekh', 'Jumla', 'Salyan'],
  },
  {
    id: 7,
    name: 'Sudurpashchim Province',
    ne: 'सुदूरपश्चिम प्रदेश',
    districts: ['Kailali', 'Kanchanpur', 'Doti', 'Dadeldhura'],
  },
];

export const POPULAR_LOCATIONS: NepalMunicipality[] = [
  { name: 'Kathmandu (काठमाडौं)', ne: 'काठमाडौं', district: 'Kathmandu', province: 'Bagmati', lat: 27.7172, lng: 85.3240 },
  { name: 'Kirtipur (कीर्तिपुर)', ne: 'कीर्तिपुर', district: 'Kathmandu', province: 'Bagmati', lat: 27.6789, lng: 85.2774 },
  { name: 'New Baneshwor (नयाँ बानेश्वर)', ne: 'नयाँ बानेश्वर', district: 'Kathmandu', province: 'Bagmati', lat: 27.6915, lng: 85.3420 },
  { name: 'Balkhu (बल्खु)', ne: 'बल्खु', district: 'Kathmandu', province: 'Bagmati', lat: 27.6855, lng: 85.2980 },
  { name: 'Patan / Lalitpur (पाटन)', ne: 'पाटन / ललितपुर', district: 'Lalitpur', province: 'Bagmati', lat: 27.6731, lng: 85.3250 },
  { name: 'Bhaktapur (भक्तपुर)', ne: 'भक्तपुर', district: 'Bhaktapur', province: 'Bagmati', lat: 27.6710, lng: 85.4298 },
  { name: 'Pokhara (पोखरा)', ne: 'पोखरा', district: 'Kaski', province: 'Gandaki', lat: 28.2096, lng: 83.9856 },
  { name: 'Lakeside Pokhara (लेकसाइड)', ne: 'लेकसाइड पोखरा', district: 'Kaski', province: 'Gandaki', lat: 28.2120, lng: 83.9570 },
  { name: 'Bharatpur / Chitwan (भरतपुर)', ne: 'भरतपुर, चितवन', district: 'Chitwan', province: 'Bagmati', lat: 27.6833, lng: 84.4333 },
  { name: 'Butwal (बुटवल)', ne: 'बुटवल', district: 'Rupandehi', province: 'Lumbini', lat: 27.7006, lng: 83.4484 },
  { name: 'Biratnagar (विराटनगर)', ne: 'विराटनगर', district: 'Morang', province: 'Koshi', lat: 26.4525, lng: 87.2718 },
  { name: 'Dharan (धरान)', ne: 'धरान', district: 'Sunsari', province: 'Koshi', lat: 26.8124, lng: 87.2835 },
  { name: 'Nepalgunj (नेपालगन्ज)', ne: 'नेपालगन्ज', district: 'Banke', province: 'Lumbini', lat: 28.0500, lng: 81.6167 },
  { name: 'Dhangadhi (धनगढी)', ne: 'धनगढी', district: 'Kailali', province: 'Sudurpashchim', lat: 28.6852, lng: 80.5954 },
];

