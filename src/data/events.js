// Datos simulados — reemplazar por llamadas a ms-cartelera cuando exista backend.
export const events = [
  {
    id: "e01",
    slug: "cine-bajo-las-estrellas-vol-4",
    title: "Cine bajo las estrellas — Vol. 4",
    category: "Función especial",
    venue: "Terraza Cineteca Norte",
    city: "Santiago",
    description:
      "Proyección al aire libre de clásicos restaurados en 35mm, con conversatorio posterior junto a la programadora invitada.",
    duration: 140,
    dateLabel: "Viernes 4 de septiembre",
    poster: "https://picsum.photos/seed/estrellas-poster/700/1000",
    backdrop: "https://picsum.photos/seed/estrellas-backdrop/1800/1000",
  },
  {
    id: "e02",
    slug: "encuentro-de-cortometrajes-sur",
    title: "Encuentro de Cortometrajes del Sur",
    category: "Festival",
    venue: "Sala Insular",
    city: "Valdivia",
    description:
      "Selección de doce cortometrajes latinoamericanos premiados en festivales internacionales, exhibidos en dos jornadas.",
    duration: 180,
    dateLabel: "Sábado 12 de septiembre",
    poster: "https://picsum.photos/seed/cortos-poster/700/1000",
    backdrop: "https://picsum.photos/seed/cortos-backdrop/1800/1000",
  },
  {
    id: "e03",
    slug: "concierto-bandas-sonoras-en-vivo",
    title: "Bandas sonoras en vivo: John Williams",
    category: "Concierto",
    venue: "Teatro Metropolitano",
    city: "Santiago",
    description:
      "Orquesta sinfónica local interpreta en vivo las partituras más memorables del compositor, sincronizadas con proyección en pantalla gigante.",
    duration: 150,
    dateLabel: "Jueves 17 de septiembre",
    poster: "https://picsum.photos/seed/bso-poster/700/1000",
    backdrop: "https://picsum.photos/seed/bso-backdrop/1800/1000",
  },
  {
    id: "e04",
    slug: "conversatorio-cine-y-restauracion",
    title: "Conversatorio: cine y restauración digital",
    category: "Charla",
    venue: "Sala Insular",
    city: "Valdivia",
    description:
      "Un equipo de archivistas y restauradores conversa sobre el rescate de negativos perdidos del cine chileno de los años 60.",
    duration: 90,
    dateLabel: "Martes 22 de septiembre",
    poster: "https://picsum.photos/seed/conversatorio-poster/700/1000",
    backdrop: "https://picsum.photos/seed/conversatorio-backdrop/1800/1000",
  },
];

export const getEventBySlug = (slug) => events.find((e) => e.slug === slug);
export const getEventById = (id) => events.find((e) => e.id === id);
