export type HoursRow = {
  days: string;
  time: string;
};

export type Listing = {
  id: string;
  rank?: number;
  city?: string | null;
  sponsor?: boolean;
  name: string;
  slug: string;
  blurb: string;
  address: string;
  phone: string;
  hours: HoursRow[];
  amenities: string[];
  photoStyle: "carriage" | "flush" | "contemporary" | "wood" | "glass";
  photoTint: string;
  photoUrl?: string | null;
  /** Vertical focal point for thin header crop (0–100, default 50). */
  photoPositionY?: number;
  website?: string | null;
  mapsUrl?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  sample?: boolean;
  serviceArea?: string[];
  dfwWide?: boolean;
  lat: number;
  lng: number;
  serviceNotes: string;
  /** Hide reviews with stars < N on the Reviews tab (storage untouched). */
  reviewSuppressBelow?: number;
};

export type CityStat = {
  label: string;
  value: string;
  note?: string;
};

export type CityPage = {
  slug: string;
  name: string;
  shortName: string;
  county: string;
  path: string;
  h1: string;
  title: string;
  description: string;
  kicker: string;
  intro: string[];
  stats: CityStat[];
  sections: { id: string; title: string; paragraphs: string[] }[];
  neighborhoods: { name: string; note: string }[];
  toc: { id: string; label: string }[];
  listings: Listing[];
  lat: number;
  lng: number;
  mapLabel: string;
  related: string[];
};

export type HubData = {
  path: string;
  h1: string;
  title: string;
  description: string;
  intro: string[];
  stats: CityStat[];
  sections: { id: string; title: string; paragraphs: string[] }[];
  toc: { id: string; label: string }[];
  listings: Listing[];
  lat: number;
  lng: number;
  mapLabel: string;
};
