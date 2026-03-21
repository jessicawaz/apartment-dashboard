import { supabase } from "./supabase";

export function computeScores(apartments) {
  // Compute composite score: price 40%, commute 35%, garage 12.5%, balcony 12.5%
  const prices1bd = apartments.filter((a) => a.price1bd).map((a) => a.price1bd);
  const prices2bd = apartments.filter((a) => a.price2bd).map((a) => a.price2bd);
  const commutes = apartments
    .filter((a) => a.commute != null)
    .map((a) => a.commute);
  const minP1bd = Math.min(...prices1bd),
    maxP1bd = Math.max(...prices1bd);
  const minP2bd = Math.min(...prices2bd),
    maxP2bd = Math.max(...prices2bd);
  const minC = Math.min(...commutes),
    maxC = Math.max(...commutes);

  return apartments.map((a) => {
    const price1bdScore =
      a.price1bd != null && maxP1bd !== minP1bd
        ? 1 - (a.price1bd - minP1bd) / (maxP1bd - minP1bd)
        : null;

    const price2bdScore =
      a.price2bd != null && maxP2bd !== minP2bd
        ? 1 - (a.price2bd - minP2bd) / (maxP2bd - minP2bd)
        : null;

    const priceScore =
      price1bdScore != null && price2bdScore != null
        ? (price1bdScore + price2bdScore) / 2
        : (price1bdScore ?? price2bdScore ?? 0);
    const commuteScore =
      a.commute != null ? 1 - (a.commute - minC) / (maxC - minC) : 0;
    const garageScore = a.garage === true ? 1 : a.garage === null ? 0.5 : 0;
    const balconyScore = a.balcony === true ? 1 : 0;
    const score =
      priceScore * 0.4 +
      price2bdScore * 0.4 +
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
