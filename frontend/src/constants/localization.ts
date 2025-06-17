// frontend/src/constants/localization.ts

export interface Language {
  code: string;
  name: string;
}

export const supportedLanguages: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'it', name: 'Italian' },
  { code: 'fr', name: 'French' },
  { code: 'nl', name: 'Dutch' },
  { code: 'sv', name: 'Swedish' },
  { code: 'ro', name: 'Romanian' },
  { code: 'pl', name: 'Polish' },
  { code: 'cs', name: 'Czech' },
];

// Diccionario de traducciones pre-definidas, ahora completo con todos los idiomas.
export const predefinedTranslations: Record<string, Record<string, Record<string, string>>> = {
  
  'working_principle': {
    'Common rail': { 
      'de': 'Common rail', 'pt': 'Common rail', 'it': 'Common rail', 'fr': 'Common rail', 'nl': 'Common rail', 'sv': 'Common rail', 'ro': 'Common rail', 'pl': 'Common rail', 'cs': 'Common rail'
    },
    'Spark Ignition, 4-stroke': { 
      'de': 'Fremdzündung, 4-Takt', 'pt': 'Ignição por centelha, 4 tempos', 'it': 'Accensione a scintilla, 4 tempi', 'fr': 'Allumage par étincelle, 4 temps', 'nl': 'Vonkontsteking, 4-takt', 'sv': 'Tändning med gnista, 4-takt', 'ro': 'Aprindere prin scânteie, 4 timpi', 'pl': 'Iskra zapłonowa, 4-suwowy', 'cs': 'Zapalování jiskrou, 4-taktní'
    }, 
  },

  'direct_injection': {
    'Yes': { 'de': 'Ja', 'pt': 'Sim', 'it': 'Si', 'fr': 'Oui', 'nl': 'Ja', 'sv': 'Ja', 'ro': 'Da', 'pl': 'Tak', 'cs': 'Ano' },
    'No': { 'de': 'Nein', 'pt': 'Não', 'it': 'No', 'fr': 'Non', 'nl': 'Nee', 'sv': 'Nej', 'ro': 'Nu', 'pl': 'Nie', 'cs': 'Ne' },
  },

  'pure_electric': {
    'Yes': { 'de': 'Ja', 'pt': 'Sim', 'it': 'Si', 'fr': 'Oui', 'nl': 'Ja', 'sv': 'Ja', 'ro': 'Da', 'pl': 'Tak', 'cs': 'Ano' },
    'No': { 'de': 'Nein', 'pt': 'Não', 'it': 'No', 'fr': 'Non', 'nl': 'Nee', 'sv': 'Nej', 'ro': 'Nu', 'pl': 'Nie', 'cs': 'Ne' },
  },

  'hybrid': {
    'Yes': { 'de': 'Ja', 'pt': 'Sim', 'it': 'Si', 'fr': 'Oui', 'nl': 'Ja', 'sv': 'Ja', 'ro': 'Da', 'pl': 'Tak', 'cs': 'Ano' },
    'No': { 'de': 'Nein', 'pt': 'Não', 'it': 'No', 'fr': 'Non', 'nl': 'Nee', 'sv': 'Nej', 'ro': 'Nu', 'pl': 'Nie', 'cs': 'Ne' },
  },


  'cylinders': {
    '3, in line': { 'de': '3, in Reihe', 'pt': '3, em linha', 'it': '3, in linea', 'fr': '3, en ligne', 'nl': '3, in lijn', 'sv': '3, i rad', 'ro': '3, în linie', 'pl': '3, w rzędzie', 'cs': '3, v řadě' },
    '4, in line': { 'de': '4, in Reihe', 'pt': '4, em linha', 'it': '4, in linea', 'fr': '4, en ligne', 'nl': '4, in lijn', 'sv': '4, i rad', 'ro': '4, în linie', 'pl': '4, w rzędzie', 'cs': '4, v řadě' },
    '5, in line': { 'de': '5, in Reihe', 'pt': '5, em linha', 'it': '5, in linea', 'fr': '5, en ligne', 'nl': '5, in lijn', 'sv': '5, i rad', 'ro': '5, în linie', 'pl': '5, w rzędzie', 'cs': '5, v řadě' },
    '6, in line': { 'de': '6, in Reihe', 'pt': '6, em linha', 'it': '6, in linea', 'fr': '6, en ligne', 'nl': '6, in lijn', 'sv': '6, i rad', 'ro': '6, în linie', 'pl': '6, w rzędzie', 'cs': '6, v řadě' },
    '6, in V': { 'de': '6, in V', 'pt': '6, em V', 'it': '6, a V', 'fr': '6, en V', 'nl': '6, in V', 'sv': '6, i V', 'ro': '6, în V', 'pl': '6, w układzie V', 'cs': '6, ve V' },
    '8, in V': { 'de': '8, in V', 'pt': '8, em V', 'it': '8, a V', 'fr': '8, en V', 'nl': '8, in V', 'sv': '8, i V', 'ro': '8, în V', 'pl': '8, w układzie V', 'cs': '8, ve V' },
    '12, in W': { 'de': '12, in W', 'pt': '12, em W', 'it': '12, a W', 'fr': '12, en W', 'nl': '12, in W', 'sv': '12, i W', 'ro': '12, în W', 'pl': '12, w układzie W', 'cs': '12, ve W' },
    '16, in W': { 'de': '16, in W', 'pt': '16, em W', 'it': '16, a W', 'fr': '16, en W', 'nl': '16, in W', 'sv': '16, i W', 'ro': '16, în W', 'pl': '16, w układzie W', 'cs': '16, ve W' },
  },


  'fuel': {
    'Diesel': { 'de': 'Diesel', 'pt': 'Diesel', 'it': 'Diesel', 'fr': 'Diesel', 'nl': 'Diesel', 'sv': 'Diesel', 'ro': 'Diesel', 'pl': 'Diesel', 'cs': 'Diesel' },
    'Petrol': { 'de': 'Benzin', 'pt': 'Gasolina', 'it': 'Benzina', 'fr': 'Essence', 'nl': 'Benzine', 'sv': 'Bensin', 'ro': 'Benzină', 'pl': 'Benzyna', 'cs': 'Benzín' },
    'Electric': { 'de': 'Elektrisch', 'pt': 'Elétrico', 'it': 'Elettrico', 'fr': 'Électrique', 'nl': 'Elektrisch', 'sv': 'Elektrisk', 'ro': 'Electric', 'pl': 'Elektryczny', 'cs': 'Elektrický' },
  },

  'clutch_type': {
    'Single plate dry': { 'de': 'Einzelne Platte trocknen', 'pt': 'Disco seco único', 'it': 'Piatto singolo asciutto', 'fr': 'Assiette simple sèche', 'nl': 'Enkele plaat droog', 'sv': 'Enkel torr koppling', 'ro': 'Plăcuță simplă uscată', 'pl': 'Płyta pojedyncza na sucho', 'cs': 'Jednoduchá suchá spojka' },
    'Dual clutch': { 'de': 'Doppelkupplung', 'pt': 'Dupla embraiagem', 'it': 'Dual clutch', 'fr': 'Double embrayage', 'nl': 'Dubbele koppeling', 'sv': 'Dubbelkoppling', 'ro': 'Ambreiaj dublu', 'pl': 'Podwójne sprzęgło', 'cs': 'Dvojspojka' },
    'Continuously Variable': { 'de': 'Stufenlos einstellbar', 'pt': 'Continuamente variável', 'it': 'Continuamente variabile', 'fr': 'Variable en continu', 'nl': 'Continu variabel', 'sv': 'Kontinuerligt Variabel', 'ro': 'Variabil continuu', 'pl': 'Zmienna ciągła', 'cs': 'Plynule variabilní' },
  },

  'gearbox_type': {
    'Manual': { 'de': 'Handbuch', 'pt': 'Manual', 'it': 'Manuale', 'fr': 'Manuel', 'nl': 'Handmatig', 'sv': 'Manuell', 'ro': 'Manual', 'pl': 'Podręcznik', 'cs': 'Manuál' },
    'Automatic': { 'de': 'Automatisch', 'pt': 'Automático', 'it': 'Automatico', 'fr': 'Automatique', 'nl': 'Automaat', 'sv': 'Automatisk', 'ro': 'Automată', 'pl': 'Automatyczny', 'cs': 'Automatická' },
  },

  'steering_assistance': {
    'Electric Steering': { 'de': 'Elektrische Lenkung', 'pt': 'Direção elétrica', 'it': 'Sterzo elettrico', 'fr': 'Direction électrique', 'nl': 'Elektrische besturing', 'sv': 'Elektrisk styrning', 'ro': 'Direcție electrică', 'pl': 'Elektryczne sterowanie', 'cs': 'Elektrické řízení' },
    'Hydraulic steering': { 'de': 'Hydraulische Lenkung', 'pt': 'Direção hidráulica', 'it': 'Sterzo idraulico', 'fr': 'Direction hydraulique', 'nl': 'Hydraulische besturing', 'sv': 'Hydraulisk styrning', 'ro': 'Direcție hidraulică', 'pl': 'Sterowanie hydrauliczne', 'cs': 'Hydraulické řízení' },
  },
  
  'braking_system_1': {
    'Independent Type McPherson': { 'de': 'Unabhängiger Typ McPherson', 'pt': 'Tipo independente McPherson', 'it': 'Tipo indipendente McPherson', 'fr': 'Indépendant McPherson', 'nl': 'Onafhankelijk type McPherson', 'sv': 'Oberoende typ McPherson', 'ro': 'Tip independent McPherson', 'pl': 'Niezależne zawieszenie typu McPherson', 'cs': 'Nezávislý typ McPherson' },
    'Semi independent multilink': { 'de': 'Halbunabhängiger Multilink', 'pt': 'Multilink semi independente', 'it': 'Multilink semi-indipendente', 'fr': 'Multilink semi-indépendant', 'nl': 'Semi-onafhankelijke multilink', 'sv': 'Halvoberoende multilänk', 'ro': 'Multilink semi-independent', 'pl': 'Półzależne zawieszenie wielowahaczowe', 'cs': 'Polo nezávislý multilink' },
  },

  'braking_system_2': {
    'Ventilated discs': { 'de': 'Belüftete Scheiben', 'pt': 'Discos ventilados', 'it': 'Dischi ventilati', 'fr': 'Disques ventilés', 'nl': 'Geventileerde schijf', 'sv': 'Ventilerade skivor', 'ro': 'Discuri ventilate', 'pl': 'Tarczowe wentylowane', 'cs': 'Větrané kotouče' },
    'Disc': { 'de': 'Scheiben', 'pt': 'Discos', 'it': 'Disco', 'fr': 'Disques', 'nl': 'Schijven', 'sv': 'Skivor', 'ro': 'Discuri', 'pl': 'Tarcza', 'cs': 'Kotouč' },
  },

};