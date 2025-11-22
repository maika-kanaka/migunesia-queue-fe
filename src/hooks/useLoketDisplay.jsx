import { useCallback, useEffect, useRef, useState } from "react";
import { apiGet, apiPost } from "../api";
import { printThermalTicket } from "../utils/print";
import speakQueue from "../utils/speak";

export default function useLoketDisplay({ eventId, loketId }) {
  const [loket, setLoket] = useState(null);
  const [taking, setTaking] = useState(false);

  // Simpan state sebelumnya: { number, repeatAt }
  const prevRef = useRef({
    number: null,
    repeatAt: null,
  });

  const loadInfo = useCallback(async () => {
    if (!loketId) return;
    try {
      const data = await apiGet(`/lokets/${loketId}/info`);

      const currentNumber = data.current_number || 0;
      const repeatAt = data.last_repeat_at || null;

      const { number: prevNumber, repeatAt: prevRepeatAt } = prevRef.current;

      // NEXT: current_number berubah → bicara
      if (
        prevNumber !== null &&
        currentNumber !== prevNumber &&
        currentNumber > 0
      ) {
        speakQueue(data?.loket_code, currentNumber, data?.loket_name);
      }

      // REPEAT: last_repeat_at berubah → bicara ulang
      if (
        prevRepeatAt !== null &&
        repeatAt &&
        repeatAt !== prevRepeatAt &&
        currentNumber > 0
      ) {
        speakQueue(data?.loket_code, currentNumber, data?.loket_name);
      }

      prevRef.current = {
        number: currentNumber,
        repeatAt,
      };

      setLoket(data);
    } catch (err) {
      console.error(err);
    }
  }, [loketId]);

  useEffect(() => {
    if (!loketId) return;
    loadInfo();
    const interval = setInterval(loadInfo, 2000);
    return () => clearInterval(interval);
  }, [loadInfo, loketId]);

  const handleTakeTicket = useCallback(async () => {
    if (!eventId || !loketId) return;
    setTaking(true);
    try {
      const data = await apiPost(
        `/events/${eventId}/lokets/${loketId}/tickets`,
        {}
      );
      const { number, loket_code, loket_name, event_name } = data;
      const label = `${loket_code}${number}`;

      printThermalTicket({
        eventLabel: event_name,
        loketLabel: loket_name,
        ticketLabel: label,
        footerNote: "Silakan tunggu panggilan di layar",
        paperSize: "58mm", // ganti ke "80mm" kalau pakai kertas 80mm
      });
    } catch (err) {
      console.error(err);
    } finally {
      setTaking(false);
    }
  }, [eventId, loketId]);

  return {
    loket,
    taking,
    handleTakeTicket,
  };
}
