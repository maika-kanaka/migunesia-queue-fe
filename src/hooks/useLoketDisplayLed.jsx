import { useCallback, useEffect, useRef, useState } from "react";
import { apiGet } from "../api";
import speakQueue from "../utils/speak";

export default function useLoketDisplayLed({ eventId, loketId }) {
  const [eventInfo, setEventInfo] = useState(null);
  const [loket, setLoket] = useState(null);
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
          `/events/${eventId}/sound-config?role=loket_display_led`
        );
        setVoiceEnabled(config.enabled);
      } catch (err) {
        console.error(err);
      }
    };
    loadConfig();
  }, [eventId]);

  const loadInfo = useCallback(async () => {
    if (!eventId || !loketId) return;
    try {
      const [eventData, data] = await Promise.all([
        apiGet(`/events/${eventId}`),
        apiGet(`/lokets/${loketId}/info`),
      ]);

      setEventInfo(eventData);

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
  }, [eventId, loketId, voiceEnabled]);

  useEffect(() => {
    if (!loketId) return;
    // Defer the initial load to avoid calling setState synchronously within the effect
    const initial = setTimeout(() => {
      loadInfo();
    }, 0);
    const interval = setInterval(loadInfo, 2000);
    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [loadInfo, loketId]);

  return {
    eventInfo,
    loket,
  };
}
