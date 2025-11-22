import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiGet, apiPost } from "../api";
import { Box, Typography, Button } from "@mui/material";
import { printThermalTicket } from "../utils/print";
import speakQueue from "../utils/speak";

export default function LoketDisplayPage() {
  const { eventId, loketId } = useParams();
  const [loket, setLoket] = useState(null);
  const [taking, setTaking] = useState(false);
  const [prevNumber, setPrevNumber] = useState(null);
  const [prevRepeatAt, setPrevRepeatAt] = useState(null);

  useEffect(() => {
    if (!loketId) return;
    let cancelled = false;

    const load = async () => {
      try {
        const data = await apiGet(`/lokets/${loketId}/info`);
        if (cancelled) return;

        const currentNumber = data.current_number || 0;
        const repeatAt = data.last_repeat_at || null;

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

        setPrevNumber(currentNumber);
        setPrevRepeatAt(repeatAt);
        setLoket(data);
      } catch (err) {
        if (!cancelled) console.error(err);
      }
    };

    load();
    const interval = setInterval(load, 2000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [loketId, prevNumber, prevRepeatAt]);

  const handleTakeTicket = async () => {
    if (!eventId || !loketId) return;
    setTaking(true);
    try {
      const data = await apiPost(
        `/events/${eventId}/lokets/${loketId}/tickets`,
        {}
      );
      const { number, loket_code, loket_name } = data;
      const label = `${loket_code}${number}`;

      printThermalTicket({
        eventLabel: "",
        loketLabel: loket_name,
        ticketLabel: label,
        footerNote: "Silakan tunggu panggilan di layar",
        paperSize: "58mm", // ganti ke "80mm" kalau pakai kertas 80mm
      });
    } finally {
      setTaking(false);
    }
  };

  if (!loket) {
    return (
      <Box
        sx={{
          height: "100vh",
          bgcolor: "black",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography sx={{ fontSize: "6vmin", fontWeight: "bold" }}>
          Memuat...
        </Typography>
      </Box>
    );
  }

  const currentLabel = loket.current_number
    ? `${loket.loket_code}${loket.current_number}`
    : "-";

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        bgcolor: "black",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        p: "2vmin",
        overflow: "hidden",
      }}
    >
      {/* Nama Loket */}
      <Typography
        sx={{
          fontSize: "6vmin",
          fontWeight: "600",
          mb: "1vmin",
        }}
      >
        {loket.loket_name}
      </Typography>

      {/* Nomor besar */}
      <Typography
        sx={{
          fontWeight: "bold",
          lineHeight: 1,
          fontSize: "12vmin", // ✅ HUGE & auto-scale portrait/landscape
        }}
      >
        {currentLabel}
      </Typography>

      {/* Waiting */}
      <Typography
        sx={{
          mt: "4vmin",
          fontSize: "4vmin",
        }}
      >
        Menunggu: {loket.queue_length}
      </Typography>

      {/* Tombol Ambil Nomor */}
      <Button
        variant="contained"
        color="secondary"
        onClick={handleTakeTicket}
        disabled={taking}
        sx={{
          mt: "6vmin",
          fontWeight: "bold",
          borderRadius: "999px",
          textTransform: "none",
          fontSize: "4vmin",
          px: "8vmin",
          py: "2vmin",
          boxShadow: 6,
        }}
      >
        {taking ? "Memproses..." : "AMBIL NOMOR"}
      </Button>
    </Box>
  );
}
