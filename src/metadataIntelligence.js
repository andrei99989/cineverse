const COUNTRY_LANGUAGE_RULES = [
  {
    id: "marvel-usa-superhero",
    terms: ["marvel", "avengers", "răzbunătorii", "hulk", "x-men", "spider-man", "iron man", "captain america", "thor", "black panther"],
    category: "Filme",
    genre: "Superhero",
    country: "Statele Unite",
    language: "Engleză",
    contentType: "movie",
    confidence: 0.88
  },
  {
    id: "jumanji-usa-adventure",
    terms: ["jumanji"],
    category: "Filme",
    genre: "Aventură",
    country: "Statele Unite",
    language: "Engleză",
    contentType: "movie",
    confidence: 0.86
  },
  {
    id: "power-rangers-usa-superhero",
    terms: ["power rangers", "mighty morphin"],
    category: "Filme",
    genre: "Superhero",
    country: "Statele Unite",
    language: "Engleză",
    contentType: "movie",
    confidence: 0.84
  },
  {
    id: "robin-hood-uk-adventure",
    terms: ["robin hood", "nottingham", "sherwood"],
    category: "Filme",
    genre: "Aventură",
    country: "Regatul Unit",
    language: "Engleză",
    contentType: "movie",
    confidence: 0.82
  },
  {
    id: "middle-earth-nz-fantasy",
    terms: ["hobbit", "hobbitul", "lord of the rings", "stăpânul inelelor", "middle-earth"],
    category: "Filme",
    genre: "Fantasy",
    country: "Noua Zeelandă",
    language: "Engleză",
    contentType: "movie",
    confidence: 0.82
  },
  {
    id: "avatar-usa-scifi",
    terms: ["avatar", "pandora", "na'vi", "na’vi", "james cameron"],
    category: "Filme",
    genre: "Sci-Fi",
    country: "Statele Unite",
    language: "Engleză",
    contentType: "movie",
    confidence: 0.86
  },
  {
    id: "zorro-latin-adventure",
    terms: ["zorro", "don diego", "california spanish", "spanish california"],
    category: "Filme",
    genre: "Aventură",
    country: "Mexic",
    language: "Spaniolă",
    contentType: "movie",
    confidence: 0.76
  },

  {
    id: "latin-music-mexico",
    terms: ["corridos", "banda", "norteño", "regional mexicano", "peso pluma", "natanael cano", "grupo firme", "musica mexicana", "música mexicana"],
    category: "Muzică",
    genre: "Regional Mexican",
    country: "Mexic",
    language: "Spaniolă",
    contentType: "music",
    confidence: 0.88
  },
  {
    id: "latin-music-puerto-rico",
    terms: ["reggaeton", "bad bunny", "daddy yankee", "anuel", "rauw alejandro", "ozuna", "puerto rico"],
    category: "Muzică",
    genre: "Reggaeton",
    country: "Puerto Rico",
    language: "Spaniolă",
    contentType: "music",
    confidence: 0.86
  },
  {
    id: "usa-sports-nba-nfl",
    terms: ["nba", "nfl", "super bowl", "los angeles lakers", "golden state warriors", "dallas cowboys", "miami heat", "chicago bulls"],
    category: "Sport",
    genre: "Sport SUA",
    country: "Statele Unite",
    language: "Engleză",
    contentType: "sport",
    confidence: 0.88
  },
  {
    id: "uk-football",
    terms: ["premier league", "manchester united", "manchester city", "liverpool", "chelsea", "arsenal", "tottenham"],
    category: "Sport",
    genre: "Fotbal",
    country: "Regatul Unit",
    language: "Engleză",
    contentType: "sport",
    confidence: 0.88
  },
  {
    id: "france-football-entertainment",
    terms: ["ligue 1", "psg", "paris saint-germain", "marseille", "lyon", "france tv", "tf1"],
    category: "Sport",
    genre: "Fotbal",
    country: "Franța",
    language: "Franceză",
    contentType: "sport",
    confidence: 0.84
  },

  {
    id: "anime-japan",
    terms: ["anime", "dragon ball", "naruto", "one piece", "demon slayer", "jujutsu", "pokemon", "pokémon", "bleach", "attack on titan", "sailor moon", "studio ghibli"],
    category: "Anime-uri Filme",
    genre: "Anime",
    country: "Japonia",
    language: "Japoneză",
    contentType: "anime",
    confidence: 0.92
  },
  {
    id: "bollywood-india",
    terms: ["bollywood", "hindi", "india", "t-series", "zee cinema", "yrf", "shah rukh khan", "salman khan", "aamir khan"],
    category: "Filme",
    genre: "Bollywood",
    country: "India",
    language: "Hindi",
    contentType: "movie",
    confidence: 0.86
  },
  {
    id: "korea-kdrama-kpop",
    terms: ["k-drama", "kdrama", "k-pop", "kpop", "seoul", "bts", "blackpink", "korean drama", "coreean"],
    category: "Seriale",
    genre: "K-Drama",
    country: "Coreea de Sud",
    language: "Coreeană",
    contentType: "series",
    confidence: 0.84
  },
  {
    id: "mexico-spanish-entertainment",
    terms: ["méxico", "mexico", "mexican", "televisa", "azteca", "univision", "liga mx", "telenovela", "regional mexicano"],
    category: "Entertainment",
    genre: "Latin",
    country: "Mexic",
    language: "Spaniolă",
    contentType: "entertainment",
    confidence: 0.82
  },
  {
    id: "spain-sport",
    terms: ["la liga", "real madrid", "barcelona", "atletico madrid", "sevilla", "valencia", "copa del rey", "laliga"],
    category: "Sport",
    genre: "Fotbal",
    country: "Spania",
    language: "Spaniolă",
    contentType: "sport",
    confidence: 0.9
  },
  {
    id: "turkey-series",
    terms: ["turkish series", "dizi", "istanbul", "turcia", "turkish drama", "kanal d"],
    category: "Seriale",
    genre: "Dramă",
    country: "Turcia",
    language: "Turcă",
    contentType: "series",
    confidence: 0.8
  },
  {
    id: "romania-local",
    terms: ["românia", "romania", "romanian", "română", "pro tv", "antena 1", "kanal d romania"],
    category: "Entertainment",
    genre: "General",
    country: "România",
    language: "Română",
    contentType: "entertainment",
    confidence: 0.82
  }
];

export function isMissingMetadataValue(value) {
  const v = String(value || "").trim().toLowerCase();
  return !v || v === "all" || v === "unknown" || v === "nespecificat" || v === "necunoscut";
}

export function detectMetadataIntelligence(input = {}) {
  const text = [
    input.title,
    input.movieTitle,
    input.category,
    input.genre,
    input.sourceType,
    input.url,
    input.notes,
    input.description,
    input.originalTitle
  ].filter(Boolean).join(" ").toLowerCase();

  const matched = COUNTRY_LANGUAGE_RULES.find((rule) =>
    rule.terms.some((term) => text.includes(term.toLowerCase()))
  );

  if (matched) {
    return {
      category: matched.category,
      genre: matched.genre,
      country: matched.country,
      language: matched.language,
      contentType: matched.contentType,
      metadataRule: matched.id,
      metadataConfidence: matched.confidence,
      metadataStatus: "smart-detected"
    };
  }

  return {
    category: "Filme",
    genre: "General",
    country: "Statele Unite",
    language: "Engleză",
    contentType: "movie",
    metadataRule: "fallback-default",
    metadataConfidence: 0.45,
    metadataStatus: "fallback"
  };
}

export function completeMetadataWithIntelligence(metadata = {}, input = {}) {
  const detected = detectMetadataIntelligence({ ...input, ...metadata });
  const quality = isMissingMetadataValue(metadata.videoQuality || metadata.quality)
    ? "HD"
    : (metadata.videoQuality || metadata.quality);

  const isFallbackRule = !metadata.metadataRule || metadata.metadataRule === "fallback-default";
  const strongDetection = detected.metadataRule !== "fallback-default" && Number(detected.metadataConfidence || 0) >= 0.75;

  const weakCategory = isMissingMetadataValue(metadata.category) || (isFallbackRule && ["filme", "movies"].includes(String(metadata.category || "").toLowerCase()) && strongDetection);
  const weakGenre = isMissingMetadataValue(metadata.genre) || (isFallbackRule && ["general"].includes(String(metadata.genre || "").toLowerCase()) && strongDetection);
  const weakCountry = isMissingMetadataValue(metadata.country) || (isFallbackRule && ["statele unite", "usa", "united states"].includes(String(metadata.country || "").toLowerCase()) && strongDetection);
  const weakLanguage = isMissingMetadataValue(metadata.language) || (isFallbackRule && ["engleză", "engleza", "english"].includes(String(metadata.language || "").toLowerCase()) && strongDetection);

  return {
    ...metadata,
    category: weakCategory ? detected.category : metadata.category,
    genre: weakGenre ? detected.genre : metadata.genre,
    country: weakCountry ? detected.country : metadata.country,
    language: weakLanguage ? detected.language : metadata.language,
    videoQuality: quality,
    quality,
    contentType: strongDetection ? detected.contentType : (metadata.contentType || detected.contentType),
    metadataRule: strongDetection ? detected.metadataRule : (metadata.metadataRule || detected.metadataRule),
    metadataConfidence: strongDetection ? detected.metadataConfidence : (metadata.metadataConfidence || detected.metadataConfidence),
    metadataStatus: strongDetection ? detected.metadataStatus : (metadata.metadataStatus || detected.metadataStatus),
    tags: Array.isArray(metadata.tags) && metadata.tags.length
      ? metadata.tags
      : [detected.contentType, detected.genre, detected.country, quality].filter(Boolean)
  };
}
