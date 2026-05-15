import React from "react";
import axios from "axios";

interface BackendRow {
  City: string;
  State: string;
  Country: string;
  Employees?: number;
  Branches?: number;
  latitude: number;
  longitude: number;
  confidence: number;
  match_city: string;
  match_state: string;
  match_country: string;
}

interface BackendResponse {
  count: number;
  rows: BackendRow[];
}

interface Point {
  name: string;
  lat: number;
  lng: number;
  employees?: number;
  branches?: number;
}

interface UploadPanelProps {
  onData: (points: Point[]) => void;
}

const UploadPanel: React.FC<UploadPanelProps> = ({ onData }) => {
  const [uploading, setUploading] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("📤 Uploading file:", file.name);
    setUploading(true);
    setMessage("Uploading and geocoding...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const res = await axios.post<BackendResponse>(
        `${apiUrl}/upload-excel`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log("✅ Backend response:", res.data);
      console.log("📊 Rows received:", res.data.rows.length);

      const parsedPoints: Point[] = res.data.rows.map((row) => ({
        name: row.City || row.match_city || "Unknown",
        lat: row.latitude,
        lng: row.longitude,
        employees: row.Employees,
        branches: row.Branches,
        country: row.Country || row.match_country || "Unknown"
      }));

      console.log("🗺️ Parsed points:", parsedPoints);
      setMessage(`✅ Successfully geocoded ${parsedPoints.length} locations!`);
      onData(parsedPoints);
    } catch (err) {
      console.error("❌ Upload error:", err);
      setMessage("❌ Upload failed! Check console for details.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-800 border border-slate-700 rounded-lg">
      <h3 className="text-xl font-semibold text-white mb-4">Upload Location Data</h3>
      <input 
        type="file" 
        accept=".xlsx,.xls,.csv" 
        onChange={handleFile}
        disabled={uploading}
        className="block w-full text-sm text-slate-300
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-600 file:text-white
          hover:file:bg-blue-700
          file:cursor-pointer cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {message && (
        <div className={`mt-3 p-3 rounded ${
          message.includes('✅') ? 'bg-green-900/30 text-green-300' : 
          message.includes('❌') ? 'bg-red-900/30 text-red-300' : 
          'bg-blue-900/30 text-blue-300'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default UploadPanel;
