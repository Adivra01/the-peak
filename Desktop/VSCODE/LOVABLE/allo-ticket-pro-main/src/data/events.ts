import { Event } from '@/types/event';
import event1Image from '@/assets/event-1.jpg';
import event2Image from '@/assets/event-2.jpg';
import event3Image from '@/assets/event-3.jpg';
import heroImage from '@/assets/hero-festival.jpg';

export const mockEvents: Event[] = [
  {
    id: 'TECH-SUMMIT-2026',
    name: 'Tech Summit Africa 2026',
    description: 'Le plus grand sommet technologique d\'Afrique de l\'Ouest ! Conférences, ateliers, networking et découverte des dernières innovations. Rencontrez les leaders de la tech africaine.',
    date: '2026-09-15',
    time: '09:00',
    location: 'Centre de Conférences, Dakar',
    image: heroImage,
    gallery: [heroImage, event1Image, event2Image],
    ticketTypes: [
      {
        id: 'standard',
        name: 'Standard',
        price: 5000,
        fees: 0, description: 'Accès aux conférences et ateliers',
        available: 500
      },
      {
        id: 'vip',
        name: 'VIP',
        price: 15000,
        fees: 0, description: 'Accès VIP + Networking privé + Déjeuner inclus',
        available: 100
      }
    ],
    organizer: 'TechHub Sénégal',
    category: 'Conférence'
  },
  {
    id: 'WEDDING-EXPO-2026',
    name: 'Salon du Mariage 2026',
    description: 'Découvrez les dernières tendances mariage ! Robes, traiteurs, décorateurs, photographes... Tout pour organiser le plus beau jour de votre vie.',
    date: '2026-07-20',
    time: '10:00',
    location: 'King Fahd Palace, Dakar',
    image: event1Image,
    gallery: [event1Image],
    ticketTypes: [
      {
        id: 'standard',
        name: 'Entrée Simple',
        price: 2000,
        fees: 0, description: 'Accès au salon',
        available: 1000
      },
      {
        id: 'couple',
        name: 'Pass Couple',
        price: 3500,
        fees: 0, description: 'Entrée pour 2 + Guide personnalisé',
        available: 300
      }
    ],
    organizer: 'Events & Co',
    category: 'Salon'
  },
  {
    id: 'FOOD-FESTIVAL-2026',
    name: 'Festival Gastronomique',
    description: 'Un voyage culinaire à travers l\'Afrique ! Dégustations, cours de cuisine, compétitions de chefs et découvertes gustatives pour tous les palais.',
    date: '2026-08-05',
    time: '11:00',
    location: 'Place de la Nation, Dakar',
    image: event2Image,
    gallery: [event2Image],
    ticketTypes: [
      {
        id: 'gourmand',
        name: 'Pass Gourmand',
        price: 4000,
        fees: 0, description: 'Accès + 5 dégustations incluses',
        available: 400
      },
      {
        id: 'chef',
        name: 'Pass Chef',
        price: 12000,
        fees: 0, description: 'Cours de cuisine + Dégustations illimitées',
        available: 80
      }
    ],
    organizer: 'Taste Africa',
    category: 'Gastronomie'
  },
  {
    id: 'SPORT-MARATHON-2026',
    name: 'Marathon de Dakar',
    description: 'Rejoignez des milliers de coureurs pour le plus grand marathon du Sénégal ! Parcours 10km, semi-marathon et marathon complet.',
    date: '2026-11-12',
    time: '06:00',
    location: 'Corniche Ouest, Dakar',
    image: event3Image,
    gallery: [event3Image],
    ticketTypes: [
      {
        id: '10km',
        name: 'Parcours 10km',
        price: 3000,
        fees: 0, description: 'Inscription + T-shirt + Médaille',
        available: 2000
      },
      {
        id: 'marathon',
        name: 'Marathon 42km',
        price: 8000,
        fees: 0, description: 'Inscription complète + Kit coureur premium',
        available: 500
      }
    ],
    organizer: 'Dakar Sports',
    category: 'Sport'
  },
  {
    id: 'ART-EXHIBITION-2026',
    name: 'Biennale Art Contemporain',
    description: 'Exposition d\'art contemporain africain avec plus de 100 artistes du continent. Vernissages, performances et ventes d\'œuvres.',
    date: '2026-06-01',
    time: '10:00',
    location: 'Village des Arts, Dakar',
    image: heroImage,
    gallery: [heroImage, event1Image],
    ticketTypes: [
      {
        id: 'journee',
        name: 'Pass Journée',
        price: 1500,
        fees: 0, description: 'Accès à toutes les expositions',
        available: 1000
      },
      {
        id: 'saison',
        name: 'Pass Saison',
        price: 5000,
        fees: 0, description: 'Accès illimité pendant 3 mois',
        available: 200
      }
    ],
    organizer: 'Dak\'Art',
    category: 'Art & Culture'
  },
  {
    id: 'KIDS-FEST-2026',
    name: 'Festival des Enfants',
    description: 'Une journée magique pour les petits ! Spectacles, ateliers créatifs, jeux gonflables, maquillage et surprises.',
    date: '2026-04-15',
    time: '09:00',
    location: 'Parc de Hann, Dakar',
    image: event2Image,
    gallery: [event2Image],
    ticketTypes: [
      {
        id: 'enfant',
        name: 'Enfant (3-12 ans)',
        price: 2500,
        fees: 0, description: 'Accès complet + Goûter',
        available: 500
      },
      {
        id: 'famille',
        name: 'Pack Famille',
        price: 8000,
        fees: 0, description: '2 adultes + 3 enfants',
        available: 150
      }
    ],
    organizer: 'Kids Paradise',
    category: 'Famille'
  }
];

export const getEventById = (id: string): Event | undefined => {
  return mockEvents.find(event => event.id === id);
};

export const categories = [
  { name: 'Tous', value: 'all', icon: '🎯' },
  { name: 'Conférence', value: 'Conférence', icon: '🎤' },
  { name: 'Salon', value: 'Salon', icon: '💒' },
  { name: 'Gastronomie', value: 'Gastronomie', icon: '🍽️' },
  { name: 'Sport', value: 'Sport', icon: '🏃' },
  { name: 'Art & Culture', value: 'Art & Culture', icon: '🎨' },
  { name: 'Famille', value: 'Famille', icon: '👨‍👩‍👧‍👦' },
];
