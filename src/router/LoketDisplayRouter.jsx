import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiGet } from "../api";

import LoketDisplayPage from "../pages/LoketDisplayPage";
// import layout lain kalau ada

export default function LoketDisplayRouter() {
  const { eventId } = useParams();
  const [eventInfo, setEventInfo] = useState(null);

  useEffect(() => {
    apiGet(`/events/${eventId}`).then(setEventInfo).catch(console.error);
  }, [eventId]);

  if (!eventInfo) return null;

  switch (eventInfo.id) {
    // Tinggal tambah case saja jika eventnya mau custom display
    default:
      return <LoketDisplayPage />;
  }
}
