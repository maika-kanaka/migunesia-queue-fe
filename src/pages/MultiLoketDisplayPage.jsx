import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { apiGet, apiPost } from "../api";
import { Box, Typography, Grid, Paper, Button } from "@mui/material";
import { printThermalTicket } from "../utils/print";
import speakQueue from "../utils/speak";
import Swal from "sweetalert2";

export default function MultiLoketDisplayPage() {
  const { eventId } = useParams();
  const [eventInfo, setEventInfo] = useState(null);
  const [lokets, setLokets] = useState([]);
  const [loadingLoketId, setLoadingLoketId] = useState(null);

  // Simpan state sebelumnya per loket: { [loket_id]: { number, repeatAt } }
  const prevStateRef = useRef({});

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
        const newRepeatAt = l.last_repeat_at || null; // << datang dari backend
        const prevEntry = prev[l.loket_id] || {
          number: null,
          repeatAt: null,
        };

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
  }, [eventId]);

  useEffect(() => {
    loadState();
    const interval = setInterval(loadState, 2000);
    return () => clearInterval(interval);
  }, [loadState]);

  const handleTakeTicket = async (loketId, loketCode) => {
    if (!eventId) return;
    setLoadingLoketId(loketId);
    try {
      const data = await apiPost(
        `/events/${eventId}/lokets/${loketId}/tickets`,
        {}
      );
      const { number, loket_name } = data;
      const label = `${loketCode}${number}`;

      printThermalTicket({
        eventLabel: "",
        loketLabel: loket_name,
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
  };

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
                    onClick={() => handleTakeTicket(l.loket_id, l.loket_code)}
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
