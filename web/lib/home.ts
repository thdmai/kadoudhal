export type ContentCollection = "coran" | "hadith" | "fiqh";

export const collectionMeta: Record<
  ContentCollection,
  { title: string; titleAr: string; unit: string }
> = {
  coran: { title: "Coran", titleAr: "القرآن", unit: "Sourate" },
  hadith: { title: "Hadith", titleAr: "الحديث", unit: "Bâb" },
  fiqh: { title: "Fiqh", titleAr: "الفقه", unit: "Chapitre" },
};

export type HomeBlock = {
  slug: string;
  title: string;
  titleAr: string;
  excerpt: string;
  image: string;
  imageAlt: string;
};

export function isContentCollection(slug: string): slug is ContentCollection {
  return slug in collectionMeta;
}

export const homeBlocks: HomeBlock[] = [
  {
    slug: "coran",
    title: "Coran",
    titleAr: "القرآن",
    excerpt:
      "Traduction et récitation, sourate par sourate. Écoute, lecture et téléchargement.",
    image: "/images/coran.jpg",
    imageAlt: "Coran ouvert, pages enluminées et chapelet",
  },
  {
    slug: "hadith",
    title: "Hadith",
    titleAr: "الحديث",
    excerpt:
      "Recueils classés par bâb. Chaque piste se lit, s’écoute et se télécharge.",
    image: "/images/hadith.jpg",
    imageAlt: "Recueils de hadith (Sahih al-Bukhari, Muslim et autres) sur une étagère",
  },
  {
    slug: "fiqh",
    title: "Fiqh",
    titleAr: "الفقه",
    excerpt:
      "Kitabs de jurisprudence, chapitre par chapitre, avec le texte et l’audio.",
    image: "/images/fiqh.jpg",
    imageAlt: "Manuscrit de fiqh Multaqa al-Abhur, texte et gloses en marge",
  },
];
