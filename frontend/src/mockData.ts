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
      name: 'Copacabana Palace',
      price_per_night: 800,
      total_price: 2400,
      distance: '50m da praia',
      attractions: [
        'Praia de Copacabana',
        'Forte de Copacabana',
        'Avenida Atlântica',
      ],
      currency: 'BRL',
      booking_url: 'https://www.copacabanapalace.com.br',
    },
    {
      name: 'Ipanema Beach Hotel',
      price_per_night: 600,
      total_price: 1800,
      distance: '100m da praia',
      attractions: [
        'Praia de Ipanema',
        'Lagoa Rodrigo de Freitas',
        'Bairro de Ipanema',
      ],
      currency: 'BRL',
      booking_url: 'https://www.ipanemabeachhotel.com.br',
    },
  ],
  tips: [
    'Visite o Cristo Redentor',
    'Ande de bondinho no Pão de Açúcar',
    'Conheça a praia de Copacabana',
    'Prove a feijoada tradicional',
  ],
}
