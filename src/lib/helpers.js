import { supabase } from "./supabase";

export function computeScores(apartments) {
  // Compute composite score: price 40%, commute 35%, garage 12.5%, balcony 12.5%
  const prices = apartments.map((a) => a.price1bd);
  const commutes = apartments
    .filter((a) => a.commute != null)
    .map((a) => a.commute);
  const minP = Math.min(...prices),
    maxP = Math.max(...prices);
  const minC = Math.min(...commutes),
    maxC = Math.max(...commutes);

  return apartments.map((a) => {
    const priceScore = 1 - (a.price1bd - minP) / (maxP - minP);
    const commuteScore =
      a.commute != null ? 1 - (a.commute - minC) / (maxC - minC) : 0;
    const garageScore = a.garage === true ? 1 : a.garage === null ? 0.5 : 0;
    const balconyScore = a.balcony === true ? 1 : 0;
    const score =
      priceScore * 0.4 +
      commuteScore * 0.35 +
      garageScore * 0.125 +
      balconyScore * 0.125;
    const tier = score >= 0.67 ? "top" : score >= 0.33 ? "mid" : "low";
    return {
      ...a,
      priceScore,
      commuteScore,
      garageScore,
      balconyScore,
      score,
      tier,
    };
  });
}

export function computeStats(apartments) {
  const prices = apartments.map((a) => a.price2bd).filter((p) => p != null);
  const commutes = apartments
    .filter((a) => a.commute != null)
    .map((a) => a.commute);
  return {
    count: apartments.length,
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    minCommute: Math.min(...commutes),
    maxCommute: Math.max(...commutes),
  };
}

export async function addUserRatings(apartments) {
  const { data, error } = await supabase
    .from("user_ratings")
    .select("*")
    .in(
      "apartment_id",
      apartments.map((apt) => apt.apartment_id),
    );

  if (error) {
    return apartments;
  }

  return apartments.map((apt) => ({
    ...apt,
    ratings: data.filter((r) => r.apartment_id === apt.apartment_id),
  }));
}
