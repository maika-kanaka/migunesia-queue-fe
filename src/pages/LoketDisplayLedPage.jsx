import { useParams } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import useLoketDisplayLed from "../hooks/useLoketDisplayLed";

export default function LoketDisplayLedPage() {
  const { eventId, loketId } = useParams();

  const { loket } = useLoketDisplayLed({
    eventId,
    loketId,
  });

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

  // Hitung antrian selanjutnya
  let nextLabel = "-";
  if (loket.queue_length > 0 && loket.last_ticket_number) {
    const nextNum = loket.last_ticket_number - loket.queue_length + 1;
    if (nextNum > 0) {
      nextLabel = `${loket.loket_code}${nextNum}`;
    }
  }

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
          fontSize: "12vmin",
        }}
      >
        {currentLabel}
      </Typography>

      {/* Antrian selanjutnya */}
      <Typography
        sx={{
          fontSize: "4vmin",
          opacity: 0.9,
          mb: "1.5vmin",
        }}
      >
        Antrian selanjutnya: <strong>{nextLabel}</strong>
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
    </Box>
  );
}
