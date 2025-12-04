import historyIcon from '../icons/historyIcon.png';
import technologyIcon from '../icons/technologyIcon.png';
import svtIcon from '../icons/svtIcon.png';

export const usePagesAssistantAI = () => {
  const levelsData = [
    {
      value: '5ème',
      subjects: [
        {
          value: 'Histoire',
          image: historyIcon,
          sequences: [
            "Byzance et l'Europe carolingienne",
            "L'Islam : débuts, expansion, sociétés",
            'La Méditerranée : un carrefour de civilisations',
            "L'ordre seigneurial : la formation et la domination des campagnes",
            "L'émergence d'une nouvelle société urbaine",
            "L'affirmation de l'État monarchique en France",
            "Le rôle de l'Église dans la société",
            'Le monde au temps de Charles Quint et Soliman le Magnifique',
            'Humanisme, Réformes et conflits religieux',
            'Du Prince de la Renaissance au roi absolu',
          ],
        },
        {
          value: 'SVT',
          image: svtIcon,
          sequences: [
            "Météorologie et climats : comprendre le temps qu'il fait",
            "L'eau sur Terre : un cycle et une ressource",
            'Paysages, géologie locale et action humaine',
            'Les besoins des êtres vivants : nutrition et relations',
            'Le peuplement des milieux au cours des saisons',
            'Les microbes et notre corps',
            'Devenir des aliments : la digestion',
            "L'approvisionnement des organes : respiration et circulation",
            'Le fonctionnement des organes : le besoin en énergie',
          ],
        },
        {
          value: 'Technologie',
          image: technologyIcon,
          sequences: [
            "De l'analyse du besoin aux fonctions de l'objet",
            'Imaginer et représenter des solutions techniques en équipe',
            "Anatomie d'un objet simple : comment ça marche ?",
            "L'évolution des objets et leur impact sur nos vies",
            'Identifier et choisir les matériaux',
            "Analyser la structure et les mécanismes d'un objet",
            'Atelier de Fabrication : des outils et des règles pour créer',
            'Communiquer une idée : la représentation technique',
            'Concevoir en 3D sur ordinateur (Initiation CAO)',
            'Maîtriser son environnement numérique (ENT)',
            'Premiers pas de Citoyen Numérique : se présenter et échanger en ligne',
            "Donner des ordres à l'ordinateur : l'algorithme et les blocs",
          ],
        },
      ],
    },
    {
      value: '4ème',
      subjects: [
        {
          value: 'Histoire',
          image: historyIcon,
          sequences: [
            'Bourgeoisies marchandes, négoces internationaux et traite négrière',
            "L'Europe des Lumières",
            "La Révolution française et l'Empire",
            "L'Europe de la 'Révolution industrielle'",
            'Conquêtes et sociétés coloniales',
            'Une difficile conquête : voter de 1815 à 1870',
            'La Troisième République',
            'Conditions féminines dans une société en mutation',
          ],
        },
        {
          value: 'SVT',
          image: svtIcon,
          sequences: [
            "L'activité interne du globe : volcans et séismes",
            'La tectonique des plaques : une planète en mouvement',
            'La reproduction des êtres vivants',
            'Parentés et classification des êtres vivants',
            "La transmission de la vie chez l'Homme",
            'Maîtrise de la reproduction et sexualité',
            'Le système nerveux : perception et communication',
            'Le système nerveux : la commande du mouvement',
            'Perturbations du système nerveux',
          ],
        },
        {
          value: 'Technologie',
          image: technologyIcon,
          sequences: [
            'Le Cahier des Charges Fonctionnel (CdCF)',
            "Ergonomie et Design : l'expérience utilisateur (UX)",
            'Les Tendances du Design : pourquoi les objets ont ce look ?',
            "Analyse de système : Chaîne d'information et d'énergie",
            "Gestion de l'Énergie : comment alimenter nos objets ?",
            'Impact environnemental et Analyse du Cycle de Vie (ACV)',
            "Modélisation 3D d'un mécanisme assemblé (CAO)",
            'La simulation numérique : tester avant de construire',
            'Algorithmique : variables, conditions et boucles',
            'Enquête sur nos Données Numériques : collecte, tri et analyse',
            'Piloter un système : Capteurs, actionneurs et microcontrôleur',
            'Architecture et fonctionnement des réseaux informatiques',
          ],
        },
      ],
    },
    {
      value: '3ème',
      subjects: [
        {
          value: 'Histoire',
          image: historyIcon,
          sequences: [
            'Civils et militaires dans la Première Guerre mondiale',
            'Démocraties fragilisées et expériences totalitaires',
            "La Seconde Guerre mondiale, une guerre d'anéantissement",
            'Indépendances et construction de nouveaux États',
            'Un monde bipolaire au temps de la guerre froide',
            'Affirmation et mise en œuvre du projet européen',
            'Enjeux et conflits dans le monde après 1989',
            'La IVe République, une république nouvelle',
            'La Ve République',
            'Femmes et hommes dans la société des années 1950 aux années 1980',
          ],
        },
        {
          value: 'SVT',
          image: svtIcon,
          sequences: [
            'Les écosystèmes et la responsabilité humaine',
            'Exploitation des ressources et grands enjeux',
            "L'information génétique : support et transmission",
            "La transmission de l'information génétique",
            'Mutations, diversité et évolution',
            "Les défenses de l'organisme : l'immunité",
            'Aider le système immunitaire : vaccination et antibiothérapie',
            'Le dialogue nerveux : neurones et synapses',
            'Le cerveau, un organe fragile et plastique',
          ],
        },
        {
          value: 'Technologie',
          image: technologyIcon,
          sequences: [
            'Conduire une démarche de projet en équipe',
            'Innover : Veille technologique et propriété intellectuelle',
            'Analyse de systèmes complexes et mécatroniques',
            'Du prototype à la série : Procédés de fabrication',
            "Éco-conception et modèle économique : le vrai coût d'un produit",
            'Optimisation et fabrication par impression 3D (FDM)',
            'La Simulation Comportementale : prédire pour mieux concevoir',
            'Du bloc au texte : Initiation à la programmation en Python',
            'Architecture des Services en Ligne : comment fonctionne une app ?',
            "Projet : Prototyper une solution avec l'Intelligence Artificielle",
            'Cybersécurité : se protéger et protéger ses données',
            "Préparer et présenter son projet pour l'oral du DNB",
          ],
        },
      ],
    },
    {
      value: 'Seconde',
      subjects: [
        {
          value: 'SNT',
          image: technologyIcon,
          sequences: [
            'Le numérique : citoyenneté, bases et programmation',
            'Internet : les fondations du réseau mondial',
            'Le Web : naviguer et construire la toile',
            'Les réseaux sociaux : entre liens et dérives',
            "Les données structurées : organiser et interroger l'information",
            'Géolocalisation : le monde en données',
            'Objets Connectés : le numérique dans le réel',
            "La photographie numérique : l'image algorithmique",
            'Projet : mon premier objet numérique',
          ],
        },
        {
          value: 'SVT',
          image: svtIcon,
          sequences: [
            "L'organisation fonctionnelle du vivant",
            "Biodiversité, résultat et étape de l'évolution",
            'Géosciences et dynamique des paysages',
            'Agrosystèmes et développement durable',
            'Procréation et sexualité humaine',
            'Microorganismes et santé',
          ],
        },
      ],
    },
    {
      value: 'Première',
      subjects: [
        {
          value: 'SNT',
          image: technologyIcon,
          sequences: [
            "Histoire de l'informatique",
            'Représentation des données : types et valeurs de base',
            'Représentation des données : types construits',
            'Traitement de données en tables',
            "Interactions entre l'homme et la machine sur le Web",
            "Architectures matérielles et systèmes d'exploitation",
            'Langages et programmation',
            'Algorithmique',
          ],
        },

        {
          value: 'SVT',
          image: svtIcon,
          sequences: [
            'Transmission, variation et expression du patrimoine génétique',
            'La dynamique interne de la Terre',
            'Écosystèmes et services environnementaux',
            'Variation génétique et santé',
            'Le fonctionnement du système immunitaire humain',
          ],
        },
      ],
    },
    {
      value: 'Terminale',
      subjects: [
        {
          value: 'SVT',
          image: svtIcon,
          sequences: [
            'Génétique et évolution',
            'À la recherche du passé géologique de notre planète',
            'De la plante sauvage à la plante domestiquée',
            "Les climats de la Terre : comprendre le passé pour agir aujourd'hui et demain",
            'Corps humain et santé : Comportements, mouvement et système nerveux',
            "Produire le mouvement : contraction musculaire et apport d'énergie",
            "Comportements et stress : vers une vision intégrée de l'organisme",
          ],
        },
      ],
    },
  ];

  return {
    levelsData,
  };
};
