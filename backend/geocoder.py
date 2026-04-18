import joblib, pandas as pd, numpy as np, re
from typing import Dict

def normalize(s: str) -> str:
    if s is None: return ""
    s = s.strip().lower()
    s = re.sub(r"[^a-z0-9\s,.\-/()|]+", " ", s)
    s = re.sub(r"\s+", " ", s)
    return s

class GeoCoder:
    def __init__(self, vec_path="artifacts/tfidf.pkl", nn_path="artifacts/nn.pkl", index_path="artifacts/index.parquet"):
        self.vec = joblib.load(vec_path)
        self.nn  = joblib.load(nn_path)
        self.idx = pd.read_parquet(index_path)
        self._prepare_index()

    def _prepare_index(self) -> None:
        # Precompute normalized keys so we can fallback without ML artifacts.
        for col in ["City", "State", "Country"]:
            if col not in self.idx.columns:
                self.idx[col] = ""
        self.idx["_city_n"] = self.idx["City"].fillna("").map(normalize)
        self.idx["_state_n"] = self.idx["State"].fillna("").map(normalize)
        self.idx["_country_n"] = self.idx["Country"].fillna("").map(normalize)

    def _predict_fallback(self, city: str, state: str, country: str) -> Dict:
        city_n = normalize(city)
        state_n = normalize(state)
        country_n = normalize(country)

        candidates = self.idx
        if country_n:
            filtered = candidates[candidates["_country_n"] == country_n]
            if not filtered.empty:
                candidates = filtered
        if state_n:
            filtered = candidates[candidates["_state_n"] == state_n]
            if not filtered.empty:
                candidates = filtered
        if city_n:
            filtered = candidates[candidates["_city_n"] == city_n]
            if not filtered.empty:
                candidates = filtered

        if candidates.empty:
            candidates = self.idx

        first = candidates.iloc[0]
        return {
            "lat": float(first["Latitude"]),
            "lon": float(first["Longitude"]),
            "confidence": 0.25,
            "match_city": first["City"],
            "match_state": first["State"],
            "match_country": first["Country"],
        }

    def predict_one(self, city: str, state: str, country: str, k=5) -> Dict:
        try:
            q = normalize(f"{city}|{state}|{country}")
            v = self.vec.transform([q])
            dists, inds = self.nn.kneighbors(v, n_neighbors=k)
            rows = self.idx.iloc[inds[0]][["City","State","Country","Latitude","Longitude"]].reset_index(drop=True)
            weights = 1 - dists[0]  # cosine similarity
            # distance-weighted lat/lon
            lat = float(np.average(rows["Latitude"], weights=weights))
            lon = float(np.average(rows["Longitude"], weights=weights))
            best = rows.iloc[0].to_dict()
            confidence = float(weights[0])
            return {
                "lat": lat, "lon": lon, "confidence": confidence,
                "match_city": best["City"], "match_state": best["State"], "match_country": best["Country"]
            }
        except Exception:
            return self._predict_fallback(city, state, country)
