import type { RoteiroData } from './types'

export const mockRoteiro: RoteiroData = {
  route: {
    origem: 'Rio Verde',
    destino: 'Rio de Janeiro',
    data: '15 de Dezembro de 2024',
    orcamento: 5000,
  },
  climate: {
    location: 'Rio de Janeiro',
    temperature: 28,
    feels_like: 32,
    conditions: 'Sol com algumas nuvens',
    summary: 'Tempo agradável para passear',
    recommendations: [
      'Usar protetor solar',
      'Levar uma garrafa de água',
      'Usar roupas leves',
    ],
  },
  budget: {
    total: 5000,
    used: 3500,
    remaining: 1500,
    status: 'within_budget',
  },
  flights: [
    {
      airline: 'GOL',
      price: 1200,
      currency: 'BRL',
      departure: '08:00',
      arrival: '10:30',
      duration: '2h30m',
      purchase_url: 'https://www.voegol.com.br',
    },
    {
      airline: 'LATAM',
      price: 1400,
      currency: 'BRL',
      departure: '12:00',
      arrival: '14:45',
      duration: '2h45m',
      purchase_url: 'https://www.latamairlines.com',
    },
  ],
  hotels: [
    {
      name: 'Hostel da Praia (Baixo Preço)',
      price_per_night: 150,
      total_price: 450,
      distance: '50m da praia de Copacabana',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400',
      attractions: [
        'Praia de Copacabana',
        'Mercado Municipal',
        'Feira Hippie de Ipanema',
      ],
      currency: 'BRL',
      booking_url: 'https://www.hostelworld.com',
    },
    {
      name: 'Hotel Ipanema Comfort (Médio Preço)',
      price_per_night: 450,
      total_price: 1350,
      distance: '200m da praia de Ipanema',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
      attractions: [
        'Praia de Ipanema',
        'Lagoa Rodrigo de Freitas',
        'Rua Garcia Dávila',
      ],
      currency: 'BRL',
      booking_url: 'https://www.booking.com',
    },
    {
      name: 'Copacabana Palace (Alto Preço)',
      price_per_night: 1200,
      total_price: 3600,
      distance: '10m da praia de Copacabana',
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
      attractions: [
        'Praia de Copacabana',
        'Forte de Copacabana',
        'Cristo Redentor',
      ],
      currency: 'BRL',
      booking_url: 'https://www.booking.com',
    },
  ],
  tips: [
    {
      category: 'restaurant',
      title: 'Restaurante do Zé',
      description: 'Restaurante tradicional de feijoada, um clássico carioca! Feijoada completa com couve-flor, farofa e laranja. Ambiente acolhedor e preços justos.',
    },
    {
      category: 'tourist_spot',
      title: 'Cristo Redentor',
      description: 'O cartão postal do Rio! Suba de trem ou de van e aproveite a vista panorâmica da cidade maravilhosa. Não esqueça de tirar fotos!',
    },
    {
      category: 'nature',
      title: 'Parque Nacional da Tijuca',
      description: 'Uma floresta tropical no meio da cidade! Faça trilhas, cachoeiras, e veja animais silvestres. Perfeito para relaxar da agitação urbana.',
    },
    {
      category: 'nightlife',
      title: 'Lapa',
      description: 'Bailes de forró e samba ao ar livre, barzinhos com música ao vivo e muita animação até o amanhecer. A alma noturna do Rio!',
    },
  ],
}
