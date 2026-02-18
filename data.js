const REGIONS = [
    { id: 'auvergne-rhone-alpes', name: 'Auvergne–Rhône-Alpes', cities: ['Lyon', 'Grenoble', 'Clermont-Ferrand'] },
    { id: 'bourgogne-franche-comte', name: 'Bourgogne–Franche-Comté', cities: ['Dijon', 'Besançon'] },
    { id: 'bretagne', name: 'Bretagne', cities: ['Rennes'] },
    { id: 'centre-val-de-loire', name: 'Centre–Val de Loire', cities: ['Orléans', 'Tours'] },
    { id: 'corse', name: 'Corse', cities: ['Ajaccio', 'Bastia'] },
    { id: 'grand-est', name: 'Grand Est', cities: ['Reims', 'Nancy', 'Metz', 'Strasbourg'] },
    { id: 'guadeloupe', name: 'Guadeloupe', cities: ['Basse-Terre'] },
    { id: 'guyane', name: 'Guyane', cities: ['Cayenne'] },
    { id: 'hauts-de-france', name: 'Hauts-de-France', cities: ['Lille', 'Amiens'] },
    { id: 'ile-de-france', name: 'Île-de-France', cities: ['Paris', 'Versailles', 'Créteil'] },
    { id: 'martinique', name: 'Martinique', cities: ['Fort-de-France'] },
    { id: 'mayotte', name: 'Mayotte', cities: ['Mamoudzou'] },
    { id: 'normandie', name: 'Normandie', cities: ['Caen'] },
    { id: 'nouvelle-aquitaine', name: 'Nouvelle-Aquitaine', cities: ['Bordeaux', 'Poitiers', 'Limoges'] },
    { id: 'occitanie', name: 'Occitanie', cities: ['Toulouse', 'Montpellier'] },
    { id: 'pays-de-la-loire', name: 'Pays de la Loire', cities: ['Nantes'] },
    { id: 'paca', name: "Provence-Alpes-Côte d'Azur", cities: ['Aix-Marseille', 'Nice'] },
    { id: 'reunion', name: 'La Réunion', cities: ['Saint-Denis'] }
];

const INITIAL_NEWS = [
    {
        id: 1,
        title: "L'établissement X accueille l'établissement Y à Mayotte",
        date: "2025-06-25",
        regionId: "mayotte",
        content: "Un séjour inoubliable pour les élèves qui ont pu découvrir le lagon et la culture locale.",
        image: "https://placehold.co/600x400?text=Mayotte+Exchange"
    },
    {
        id: 2,
        title: "Échange linguistique à Lyon",
        date: "2024-12-10",
        regionId: "auvergne-rhone-alpes",
        content: "Les correspondants lituaniens sont arrivés ce matin à la gare de Lyon Part-Dieu.",
        image: "https://placehold.co/600x400?text=Lyon+Visit"
    }
];
