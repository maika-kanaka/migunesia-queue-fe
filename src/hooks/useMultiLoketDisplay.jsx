import { useCallback, useEffect, useRef, useState } from "react";
import { apiGet, apiPost } from "../api";
import { printThermalTicket } from "../utils/print";
import speakQueue from "../utils/speak";
import Swal from "sweetalert2";

export default function useMultiLoketDisplay(eventId) {
  const [eventInfo, setEventInfo] = useState(null);
  const [lokets, setLokets] = useState([]);
  const [loadingLoketId, setLoadingLoketId] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Simpan state sebelumnya per loket: { [loket_id]: { number, repeatAt } }
  const prevStateRef = useRef({});

  // load config sumber suara untuk multi display
  useEffect(() => {
    if (!eventId) return;
    const loadConfig = async () => {
      try {
        const config = await apiGet(
          `/events/${eventId}/sound-config?role=multi_display`
        );
        setVoiceEnabled(config.enabled);
      } catch (err) {
        console.error(err);
        // kalau API error, biarin default (true) atau set false sesuai keinginan
      }
    };
    loadConfig();
  }, [eventId]);

  const loadState = useCallback(async () => {
    if (!eventId) return;
    try {
      const [eventData, stateData] = await Promise.all([
        apiGet(`/events/${eventId}`),
        apiGet(`/events/${eventId}/state`),
      ]);
      setEventInfo(eventData);

      const prev = prevStateRef.current || {};
      const nextPrev = {};

      stateData.forEach((l) => {
        const newNum = l.current_number || 0;
        const newRepeatAt = l.last_repeat_at || null;
        const prevEntry = prev[l.loket_id] || {
          number: null,
          repeatAt: null,
        };

        // hanya bicara kalau voiceEnabled = true
        if (voiceEnabled) {
          // NEXT: jika current_number berubah (bukan pertama kali) → suara
          if (
            prevEntry.number !== null &&
            newNum !== prevEntry.number &&
            newNum > 0
          ) {
            speakQueue(l.loket_code, newNum, l.loket_name);
          }

          // REPEAT: jika last_repeat_at berubah (bukan pertama kali) → suara ulang
          if (
            prevEntry.repeatAt !== null &&
            newRepeatAt &&
            newRepeatAt !== prevEntry.repeatAt &&
            newNum > 0
          ) {
            speakQueue(l.loket_code, newNum, l.loket_name);
          }
        }

        nextPrev[l.loket_id] = {
          number: newNum,
          repeatAt: newRepeatAt,
        };
      });

      prevStateRef.current = nextPrev;
      setLokets(stateData);
    } catch (err) {
      console.error(err);
    }
  }, [eventId, voiceEnabled]);

  useEffect(() => {
    loadState();
    const interval = setInterval(loadState, 2000);
    return () => clearInterval(interval);
  }, [loadState]);

  const handleTakeTicket = useCallback(
    async (loketId, loketCode, loketName) => {
      if (!eventId) return;
      setLoadingLoketId(loketId);
      try {
        const data = await apiPost(
          `/events/${eventId}/lokets/${loketId}/tickets`,
          {}
        );
        const { number, loket_name, loket_description, event_name } = data;
        const label = `${loketCode}${number}`;
        const printedLoketName =
          loket_name || loketName || `Loket ${loketCode}`;

        printThermalTicket({
          eventLabel: event_name,
          loketLabel: printedLoketName,
          loketDescription: loket_description || "",
          ticketLabel: label,
          footerNote: "Silakan tunggu panggilan di layar",
          paperSize: "58mm", // ganti ke "80mm" kalau pakai kertas 80mm
        });
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Gagal mengambil nomor antrian",
        });
      } finally {
        setLoadingLoketId(null);
      }
    },
    [eventId]
  );

  return {
    eventInfo,
    lokets,
    loadingLoketId,
    handleTakeTicket,
  };
}
