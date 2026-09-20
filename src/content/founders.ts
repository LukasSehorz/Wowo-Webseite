// CV data for both founders (copy deck 1.10 and 2.5).

import { typesetContent } from "@/lib/format";

export type TimelineEntry = { period: string; text: string };

export type Founder = {
  id: string;
  name: string;
  initials: string;
  role: string;
  tone: "navy" | "olive";
  /** path below /public once the real portrait exists */
  image: string | null;
  bio: string;
  qualifications: string[];
  timeline: TimelineEntry[];
};

export const founders: Founder[] = typesetContent([
  {
    id: "sebastian-rauscher",
    name: "Sebastian Rauscher",
    initials: "SR",
    role: "Physiotherapeut, Gründer",
    tone: "navy",
    image: null,
    bio: "Sebastian Rauscher ist seit 2012 Physiotherapeut und seit 2018 in Manueller Therapie zertifiziert. Von 2018 bis 2024 unterrichtete er im Lehrteam der FAMP. Seit 2024 führt er seine eigene Privatpraxis für Physiotherapie.",
    qualifications: ["Physiotherapeut", "Manuelle Therapie", "Manuelle Lymphdrainage", "Lehrteam FAMP 2018 bis 2024"],
    timeline: [
      { period: "2009 bis 2012", text: "Ausbildung zum Physiotherapeuten, VPT Berufsfachschule Bad Birnbach" },
      { period: "2012", text: "Zertifizierung Manuelle Lymphdrainage" },
      { period: "2012 bis 2014", text: "Zentrum für Reha und Physiotherapie Ebersberg" },
      { period: "2014 bis 2021", text: "Praxis für Physiotherapie Stephan Franz" },
      { period: "2016 bis 2018", text: "Zertifizierung Manuelle Therapie" },
      { period: "2018", text: "Gründung der ersten GbR für funktionelle Schuheinlagen" },
      {
        period: "2018 bis 2024",
        text: "Lehrteam Manuelle Therapie und Lehrteam Funktionelle Schuheinlagen der FAMP",
      },
      { period: "2024", text: "Gründung der eigenen Privatpraxis für Physiotherapie" },
      { period: "2026", text: "Fortführung der GbR mit Wolfgang Brandmaier" },
    ],
  },
  {
    id: "wolfgang-brandmaier",
    name: "Wolfgang Brandmaier",
    initials: "WB",
    role: "Physiotherapeut und Heilpraktiker",
    tone: "olive",
    image: null,
    bio: "Wolfgang Brandmaier ist seit 2020 Physiotherapeut und betreut seit 2021 den Regionalligisten TSV Buchbach. Er absolvierte die Fortbildung in Manueller Therapie an der International Academy of Orthopedic Medicine und die Ausbildung zum Heilpraktiker. 2024 und 2025 arbeitete er im betrieblichen Gesundheitsmanagement.",
    qualifications: [
      "Physiotherapeut",
      "Heilpraktiker",
      "Manuelle Therapie (IAOM)",
      "Krankengymnastik am Gerät",
      "Manuelle Lymphdrainage",
    ],
    timeline: [
      { period: "2017 bis 2020", text: "Ausbildung zum Physiotherapeuten, Ludwig Fresenius Schulen München" },
      { period: "2020", text: "Zertifizierung Manuelle Lymphdrainage" },
      {
        period: "2020 bis 2024",
        text: "Fortbildung Manuelle Therapie, International Academy of Orthopedic Medicine",
      },
      { period: "2020 bis 2024", text: "Gsund Praxis für Physiotherapie, Buchbach" },
      { period: "Seit 2021", text: "Physiotherapeut beim Regionalligisten TSV Buchbach" },
      { period: "2023", text: "Fortbildung Krankengymnastik am Gerät" },
      { period: "2023 bis 2025", text: "Ausbildung zum Heilpraktiker, Zentrum für Naturheilkunde München" },
      { period: "2024 bis 2025", text: "Phy-4-You, Betriebliches Gesundheitsmanagement" },
      { period: "2026", text: "Gründung der Heilpraktikerpraxis TheraSano" },
      { period: "2026", text: "Einstieg in die Brandmaier & Rauscher GbR" },
    ],
  },
]);
