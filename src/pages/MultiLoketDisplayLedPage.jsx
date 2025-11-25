import { useParams } from "react-router-dom";
import { Box, Typography, Grid, Paper } from "@mui/material";
import useMultiLoketDisplayLed from "../hooks/useMultiLoketDisplayLed";

export default function MultiLoketDisplayLedPage() {
  const { eventId } = useParams();
  const { eventInfo, lokets } = useMultiLoketDisplayLed(eventId);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        backgroundImage: 'url("/images/background-multi-led.png")',
        backgroundSize: "cover",
        // backgroundPosition: "center",
        objectFit: "cover",
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
          mb: "2vmin",
          textAlign: "center",
          textShadow: "0 0 12px rgba(0,0,0,0.8)",
        }}
      >
        <Typography
          sx={{
            fontSize: "4vmin",
            fontWeight: 700,
            letterSpacing: "0.06em",
            marginTop: "80px",
            whiteSpace: "pre-line",
          }}
        >
          {eventInfo ? eventInfo.name : `Event #${eventId}`}
        </Typography>
      </Box>

      {/* Grid Loket */}
      <Box sx={{ flex: 1, marginTop: "50px" }}>
        <Grid
          container
          spacing={3}
          sx={{
            height: "100%",
            justifyContent: "center",
            alignContent: "space-evenly",
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

            const holdLabel =
              l.hold_numbers && l.hold_numbers.length > 0
                ? l.hold_numbers
                    .slice()
                    .sort((a, b) => a - b)
                    .map((num) => `${l.loket_code}${num}`)
                    .join(", ")
                : "-";

            return (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={l.loket_id}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Paper
                  elevation={6}
                  sx={{
                    width: { xs: "90vw", sm: "80%", md: "260px" },
                    minHeight: { xs: "auto", md: "260px" },
                    // 🧊 Glass / kaca effect
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
                      mb: "1vmin",
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
                      color: "#FFD700", // Gold
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

                  {/* Antrian Ditunda */}
                  <Typography
                    sx={{
                      fontSize: "1.7vmin",
                      mb: "0.7vmin",
                    }}
                  >
                    Antrian Ditunda:{" "}
                    <strong style={{ fontWeight: 600 }}>{holdLabel}</strong>
                  </Typography>

                  {/* Menunggu & tiket terakhir */}
                  <Typography
                    sx={{
                      fontSize: "1.7vmin",
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
                </Paper>
              </Grid>
            );
          })}

          {lokets.length === 0 && (
            <Grid item xs={12}>
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
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
}
