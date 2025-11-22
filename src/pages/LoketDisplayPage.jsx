import { useParams } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import useLoketDisplay from "../hooks/useLoketDisplay";

export default function LoketDisplayPage() {
  const { eventId, loketId } = useParams();

  const { loket, taking, handleTakeTicket } = useLoketDisplay({
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
