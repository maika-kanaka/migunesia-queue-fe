import { useParams } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import useLoketDisplayLed from "../hooks/useLoketDisplayLed";
import BGImage from "../../public/images/background-multi-led.png";

export default function LoketDisplayLedPage() {
  const { eventId, loketId } = useParams();

  const { eventInfo, loket } = useLoketDisplayLed({
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
        minHeight: "100vh",
        width: "100vw",
        backgroundImage: `url(${BGImage})`,
        backgroundSize: "cover",
        // backgroundPosition: "center",
        objectFit: "cover",
        backgroundRepeat: "no-repeat",
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
      {/* Header Event */}
      <Box
        sx={{
          mt: "50px",
          px: "20px",
          mb: "2vmin",
          textAlign: "center",
          textShadow: "0 0 12px rgba(0,0,0,0.8)",
        }}
      >
        <Typography
          sx={{
            fontSize: "4vmin",
            fontWeight: 700,
            mb: "0.5vmin",
            whiteSpace: "pre-line",
            letterSpacing: "0.05em",
          }}
        >
          {eventInfo ? eventInfo.name : `Event #${eventId}`}
        </Typography>
      </Box>

      <Box
        sx={{
          mt: "20px",
          boxSizing: "border-box",
          p: "30px",
          bgcolor: "rgba(0, 20, 60, 0.60)",
          borderRadius: 4,
          border: "1px solid rgba(255,255,255,0.25)",
          boxShadow:
            "0 18px 45px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.02)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
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

        {/* Description Loket */}
        <Typography
          sx={{
            fontSize: "3vmin",
            fontWeight: "600",
            mb: "1vmin",
            whiteSpace: "pre-line",
          }}
        >
          {loket.loket_description}
        </Typography>

        {/* Nomor besar */}
        <Typography
          sx={{
            fontWeight: "bold",
            lineHeight: 1,
            fontSize: "12vmin",
            color: "#FFD700", // gold
            textShadow: "0 0 18px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.85)",
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
    </Box>
  );
}
