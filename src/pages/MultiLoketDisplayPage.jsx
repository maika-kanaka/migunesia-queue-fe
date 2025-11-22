import { useParams } from "react-router-dom";
import { Box, Typography, Grid, Paper, Button } from "@mui/material";
import useMultiLoketDisplay from "../hooks/useMultiLoketDisplay";

export default function MultiLoketDisplayPage() {
  const { eventId } = useParams();
  const { eventInfo, lokets, loadingLoketId, handleTakeTicket } =
    useMultiLoketDisplay(eventId);

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        bgcolor: "black",
        color: "white",
        display: "flex",
        flexDirection: "column",
        p: "2vmin",
        boxSizing: "border-box",
      }}
    >
      {/* Header Event */}
      <Box sx={{ mb: "2vmin", textAlign: "center" }}>
        <Typography
          sx={{
            fontSize: "4vmin",
            fontWeight: 600,
            mb: "0.5vmin",
          }}
        >
          {eventInfo ? eventInfo.name : `Event #${eventId}`}
        </Typography>
        <Typography
          sx={{
            fontSize: "2.5vmin",
            opacity: 0.7,
          }}
        >
          Display Semua Loket
        </Typography>
      </Box>

      {/* Grid Loket */}
      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <Grid
          container
          spacing={2}
          sx={{
            height: "100%",
          }}
        >
          {lokets.map((l) => {
            const currentLabel = l.current_number
              ? `${l.loket_code}${l.current_number}`
              : "-";

            return (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={l.loket_id}
                sx={{ height: { xs: "auto", md: "50%" } }}
              >
                <Paper
                  elevation={4}
                  sx={{
                    height: "100%",
                    bgcolor: "rgba(255,255,255,0.04)",
                    color: "#fff",
                    borderRadius: 3,
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    p: "1.5vmin",
                    textAlign: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "3vmin",
                      fontWeight: 600,
                      mb: "0.5vmin",
                    }}
                  >
                    {l.loket_name}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "2vmin",
                      opacity: 0.7,
                      mb: "1.5vmin",
                    }}
                  >
                    Loket {l.loket_code}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: "1.8vmin",
                      opacity: 0.8,
                    }}
                  >
                    Sedang dipanggil
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      lineHeight: 1,
                      fontSize: "8vmin",
                      mb: "1.5vmin",
                    }}
                  >
                    {currentLabel}
                  </Typography>

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
                      mt: "0.5vmin",
                      opacity: 0.7,
                    }}
                  >
                    Tiket terakhir: {l.last_ticket_number}
                  </Typography>

                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() =>
                      handleTakeTicket(l.loket_id, l.loket_code, l.loket_name)
                    }
                    disabled={loadingLoketId === l.loket_id}
                    sx={{
                      mt: "1.5vmin",
                      fontSize: "1.8vmin",
                      fontWeight: 600,
                      textTransform: "none",
                      borderRadius: "999px",
                      px: "3vmin",
                      py: "0.8vmin",
                    }}
                  >
                    {loadingLoketId === l.loket_id
                      ? "Memproses..."
                      : "Ambil Nomor"}
                  </Button>
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
                    opacity: 0.7,
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
