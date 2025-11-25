import { useCallback, useEffect, useRef, useState } from "react";
import { apiGet, apiPost } from "../api";
import { printThermalTicket } from "../utils/print";
import speakQueue from "../utils/speak";

export default function useLoketDisplay({ eventId, loketId }) {
  const [loket, setLoket] = useState(null);
  const [taking, setTaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Simpan state sebelumnya: { number, repeatAt }
  const prevRef = useRef({
    number: null,
    repeatAt: null,
  });

  useEffect(() => {
    if (!eventId) return;
    const loadConfig = async () => {
      try {
        const config = await apiGet(
          `/events/${eventId}/sound-config?role=loket_display`
        );
        setVoiceEnabled(config.enabled);
      } catch (err) {
        console.error(err);
      }
    };
    loadConfig();
  }, [eventId]);

  const loadInfo = useCallback(async () => {
    if (!loketId) return;
    try {
      const data = await apiGet(`/lokets/${loketId}/info`);

      const currentNumber = data.current_number || 0;
      const repeatAt = data.last_repeat_at || null;

      const { number: prevNumber, repeatAt: prevRepeatAt } = prevRef.current;

      // hanya bicara kalau voiceEnabled = true
      if (voiceEnabled) {
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
      }

      prevRef.current = {
        number: currentNumber,
        repeatAt,
      };

      setLoket(data);
    } catch (err) {
      console.error(err);
    }
  }, [loketId, voiceEnabled]);

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
      const { number, loket_code, loket_name, loket_description, event_name } =
        data;
      const label = `${loket_code}${number}`;

      printThermalTicket({
        eventLabel: event_name,
        loketLabel: loket_name,
        loketDescription: loket_description || "",
        ticketLabel: label,
        footerNote: "Silakan tunggu panggilan di layar",
        paperSize: "65mm", // ganti ke "80mm" kalau pakai kertas 80mm
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
