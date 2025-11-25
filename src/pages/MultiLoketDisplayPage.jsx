import { useParams } from "react-router-dom";
import { Box, Typography, Grid, Paper, Button } from "@mui/material";
import useMultiLoketDisplay from "../hooks/useMultiLoketDisplay";
import BGImage from "../../public/images/background-multi-display.jpeg";

export default function MultiLoketDisplayPage() {
  const { eventId } = useParams();
  const { eventInfo, lokets, loadingLoketId, handleTakeTicket } =
    useMultiLoketDisplay(eventId);

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        backgroundImage: `url(${BGImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        color: "white",
        display: "flex",
        flexDirection: "column",
        p: "2vmin",
        boxSizing: "border-box",
      }}
    >
      {/* Header Event */}
      <Box
        sx={{
          mt: "100px",
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

      {/* Grid Loket */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          pb: "2vmin",
          mt: "50px",
        }}
      >
        <Box
          container
          spacing={3}
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: "20px",
            justifyContent: "center",
            alignContent: "flex-start",
            alignItems: "stretch", // semua kolom di row punya tinggi sama
          }}
        >
          {lokets.map((l) => {
            const currentLabel = l.current_number
              ? `${l.loket_code}${l.current_number}`
              : "-";

            // Hitung antrian selanjutnya
            let nextLabel = "-";
            if (l.queue_length > 0 && l.last_ticket_number) {
              const nextNum = l.last_ticket_number - l.queue_length + 1;
              if (nextNum > 0) {
                nextLabel = `${l.loket_code}${nextNum}`;
              }
            }

            return (
              <Box
                key={l.loket_id}
                sx={{
                  width: "250px",
                  display: "flex",
                }}
              >
                <Paper
                  elevation={6}
                  sx={{
                    width: "100%", // 🔑 isi penuh lebar kolom
                    minHeight: 260,
                    boxSizing: "border-box",

                    // 🧊 Glass / kaca style (sama dengan MultiLoketDisplayLedPage)
                    bgcolor: "rgba(0, 20, 60, 0.60)",
                    borderRadius: 4,
                    border: "1px solid rgba(255,255,255,0.25)",
                    boxShadow:
                      "0 18px 45px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.02)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",

                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    p: "1.8vmin",
                    textAlign: "center",
                    color: "#FFFFFF",
                  }}
                >
                  {/* Nama Loket */}
                  <Typography
                    sx={{
                      fontSize: "3vmin",
                      fontWeight: 700,
                      mb: "0.3vmin",
                      textShadow: "0 0 8px rgba(0,0,0,0.9)",
                    }}
                  >
                    {l.loket_name}
                  </Typography>

                  {/* Deskripsi Loket */}
                  {l.loket_description && (
                    <Typography
                      sx={{
                        fontSize: "1.7vmin",
                        fontWeight: 500,
                        mb: "0.5vmin",
                        whiteSpace: "pre-line",
                        opacity: 0.9,
                        textShadow: "0 0 6px rgba(0,0,0,0.8)",
                      }}
                    >
                      {l.loket_description}
                    </Typography>
                  )}

                  <Typography
                    sx={{
                      fontSize: "1.7vmin",
                      opacity: 0.8,
                      mb: "0.8vmin",
                    }}
                  >
                    Kode Loket: <strong>{l.loket_code}</strong>
                  </Typography>

                  {/* Sedang dipanggil */}
                  <Typography
                    sx={{
                      fontSize: "1.8vmin",
                      opacity: 0.85,
                    }}
                  >
                    Sedang dipanggil
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 900,
                      lineHeight: 1,
                      fontSize: "8vmin",
                      mb: "1vmin",
                      color: "#FFD700", // gold
                      textShadow:
                        "0 0 18px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.85)",
                    }}
                  >
                    {currentLabel}
                  </Typography>

                  {/* Antrian selanjutnya */}
                  <Typography
                    sx={{
                      fontSize: "1.9vmin",
                      opacity: 0.95,
                      mb: "0.7vmin",
                    }}
                  >
                    Antrian selanjutnya:{" "}
                    <strong style={{ fontWeight: 700 }}>{nextLabel}</strong>
                  </Typography>

                  {/* Menunggu & tiket terakhir */}
                  <Typography
                    sx={{
                      fontSize: "1.8vmin",
                    }}
                  >
                    Menunggu: <strong>{l.queue_length}</strong>
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "1.6vmin",
                      mt: "0.3vmin",
                      opacity: 0.8,
                    }}
                  >
                    Tiket terakhir: <strong>{l.last_ticket_number}</strong>
                  </Typography>

                  {/* Tombol Ambil Nomor */}
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() =>
                      handleTakeTicket(l.loket_id, l.loket_code, l.loket_name)
                    }
                    disabled={loadingLoketId === l.loket_id}
                    sx={{
                      mt: "1.5vmin",
                      fontSize: "2vmin",
                      fontWeight: 600,
                      textTransform: "none",
                      borderRadius: "999px",
                      px: "4vmin",
                      py: "1vmin",
                      boxShadow: 6,
                    }}
                  >
                    {loadingLoketId === l.loket_id
                      ? "Memproses..."
                      : "Ambil Nomor"}
                  </Button>
                </Paper>
              </Box>
            );
          })}

          {lokets.length === 0 && (
            <Box>
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "3vmin",
                    opacity: 0.85,
                    textShadow: "0 0 10px rgba(0,0,0,0.8)",
                  }}
                >
                  Belum ada loket untuk event ini.
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
