import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiGet, apiPost } from "../api";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Divider,
  Chip,
} from "@mui/material";
import Swal from "sweetalert2";
import speakQueue from "../utils/speak";

export default function LoketAdminPage() {
  const { eventId, loketId } = useParams();
  const [loketInfo, setLoketInfo] = useState(null);
  const [info, setInfo] = useState(null);
  const [loadingNext, setLoadingNext] = useState(false);
  const [loadingRepeat, setLoadingRepeat] = useState(false);
  const [loadingHold, setLoadingHold] = useState(false);
  const [loadingCallHoldNumber, setLoadingCallHoldNumber] = useState(null);

  // 🔊 kontrol berdasarkan sound_source
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const loadInfo = useCallback(async () => {
    try {
      const data = await apiGet(`/lokets/${loketId}/info`);
      // penting: pastikan API /lokets/{id}/info mengirim event_id
      setLoketInfo(data);
    } catch (err) {
      console.error(err);
    }
  }, [loketId]);

  useEffect(() => {
    // load pertama
    loadInfo();

    // polling tiap 2 detik
    const interval = setInterval(() => {
      loadInfo();
    }, 2000);

    // bersihkan interval saat unmount / loketId berubah
    return () => clearInterval(interval);
  }, [loadInfo]);

  // 🔊 load konfigurasi sumber suara dari backend (sound_sources)
  useEffect(() => {
    const loadSoundConfig = async () => {
      try {
        if (!eventId) return;

        const cfg = await apiGet(
          `/events/${eventId}/sound-config?role=loket_admin`
        );

        setVoiceEnabled(!!cfg.enabled);
      } catch (err) {
        console.error("Failed to load sound config for loket_admin", err);
        // kalau gagal load config, bisa dibiarkan false (tidak bersuara)
        // atau fallback ke true, tergantung kebijakan:
        // setVoiceEnabled(false);
      }
    };

    loadSoundConfig();
  }, [eventId]);

  const handleNext = async () => {
    setLoadingNext(true);
    try {
      const data = await apiPost(`/lokets/${loketId}/next`, {});
      if (!data.called_number) {
        Swal.fire({
          icon: "info",
          title: "Info",
          text: "Antrian kosong",
        });
      } else {
        // suara di admin (NEXT) hanya jika diizinkan oleh sound_source
        if (voiceEnabled) {
          speakQueue(
            data.loket_code,
            data.called_number,
            data.loket_name || loketInfo?.loket_name
          );
        }
      }
      setInfo(data);
      await loadInfo();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Gagal memanggil antrian",
      });
    } finally {
      setLoadingNext(false);
    }
  };

  const handleRepeat = async () => {
    if (!loketInfo || !loketInfo.current_number) {
      Swal.fire({
        icon: "info",
        title: "Info",
        text: "Belum ada nomor yang dipanggil.",
      });
      return;
    }
    setLoadingRepeat(true);
    try {
      await apiPost(`/lokets/${loketId}/repeat`, {});
      // suara di admin (ULANG) hanya jika diizinkan
      if (voiceEnabled) {
        speakQueue(
          loketInfo.loket_code,
          loketInfo.current_number,
          loketInfo.loket_name
        );
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Gagal mengirim ulang panggilan",
      });
    } finally {
      setLoadingRepeat(false);
    }
  };

  const handleHold = async () => {
    if (!loketInfo || !loketInfo.current_number) {
      Swal.fire({
        icon: "info",
        title: "Info",
        text: "Tidak ada nomor aktif untuk di-hold.",
      });
      return;
    }

    setLoadingHold(true);
    try {
      await apiPost(`/lokets/${loketId}/hold`, {});
      await loadInfo();
      Swal.fire({
        icon: "success",
        title: "Ditahan",
        text: "Nomor antrian berhasil dimasukkan ke daftar hold.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Gagal menahan nomor antrian",
      });
    } finally {
      setLoadingHold(false);
    }
  };

  const handleCallHold = async (number) => {
    if (!loketInfo?.loket_code) return;

    const label = `${loketInfo.loket_code}${number}`;

    const confirm = await Swal.fire({
      icon: "question",
      title: "Panggil nomor HOLD?",
      text: `Panggil kembali nomor ${label}?`,
      showCancelButton: true,
      confirmButtonText: "Ya, panggil",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    setLoadingCallHoldNumber(number);
    try {
      const data = await apiPost(`/lokets/${loketId}/hold/${number}/call`, {});
      setInfo(data);
      await loadInfo();

      // 🔊 suara di admin (panggil nomor HOLD) kalau diizinkan
      if (voiceEnabled && data.called_number && data.loket_code) {
        speakQueue(
          data.loket_code,
          data.called_number,
          data.loket_name || loketInfo?.loket_name
        );
      }

      Swal.fire({
        icon: "success",
        title: "Dipanggil",
        text: `Nomor ${label} sudah dipanggil kembali.`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Gagal memanggil nomor HOLD",
      });
    } finally {
      setLoadingCallHoldNumber(null);
    }
  };

  const title =
    loketInfo?.loket_name && loketInfo?.loket_code
      ? `Admin ${loketInfo.loket_name}`
      : `Admin Loket ${loketId}`;

  const lastCalledLabel =
    info?.called_number && info?.loket_code
      ? `${info.loket_code}${info.called_number}`
      : loketInfo?.current_number && loketInfo?.loket_code
      ? `${loketInfo.loket_code}${loketInfo.current_number}`
      : "-";

  const holdNumbers = loketInfo?.hold_numbers || [];

  return (
    <Box
      sx={{
        maxWidth: 800,
        mx: "auto",
        mt: { xs: 3, md: 6 },
        px: { xs: 2, md: 0 },
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: 600, textAlign: "center" }}
      >
        {title}
      </Typography>

      {loketInfo && (
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mb: 1 }}
        >
          Antrian menunggu: <strong>{loketInfo.queue_length}</strong>
        </Typography>
      )}

      {/* Info kecil apakah suara admin aktif */}
      <Typography
        variant="caption"
        color="text.secondary"
        align="center"
        display="block"
        sx={{ mb: 2 }}
      >
        Suara di halaman admin:{" "}
        <strong>{voiceEnabled ? "AKTIF" : "NONAKTIF"}</strong> <br />
        (diatur dari pengaturan sumber suara event)
      </Typography>

      <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
        <CardContent>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Nomor terakhir dipanggil
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: "2.5rem", md: "3rem" },
                  fontWeight: "bold",
                  lineHeight: 1.1,
                  mt: 1,
                }}
              >
                {lastCalledLabel}
              </Typography>

              {/* Daftar nomor yang di-hold */}
              <Box sx={{ mt: 3 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Nomor dalam HOLD
                </Typography>
                {holdNumbers.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Tidak ada nomor yang di-hold.
                  </Typography>
                ) : (
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {holdNumbers.map((num) => {
                      const label = loketInfo?.loket_code
                        ? `${loketInfo.loket_code}${num}`
                        : num;
                      return (
                        <Chip
                          key={num}
                          label={label}
                          color="warning"
                          variant="outlined"
                          clickable
                          onClick={() => handleCallHold(num)}
                          disabled={loadingCallHoldNumber === num}
                          sx={{ fontWeight: 500 }}
                        />
                      );
                    })}
                  </Stack>
                )}
              </Box>
            </Box>

            <Divider
              orientation="vertical"
              flexItem
              sx={{ display: { xs: "none", md: "block" } }}
            />

            <Stack
              direction="column"
              spacing={2}
              sx={{ flex: 1, mt: { xs: 2, md: 0 } }}
            >
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleNext}
                disabled={loadingNext}
                sx={{
                  minHeight: 56,
                  fontSize: { xs: "1rem", md: "1.05rem" },
                  fontWeight: 600,
                }}
              >
                {loadingNext ? "Memanggil..." : "NEXT ANTRIAN"}
              </Button>

              <Button
                variant="outlined"
                color="warning"
                size="large"
                onClick={handleHold}
                disabled={loadingHold || !loketInfo?.current_number}
                sx={{
                  minHeight: 52,
                  fontSize: { xs: "0.95rem", md: "1rem" },
                  fontWeight: 500,
                }}
              >
                {loadingHold ? "Menahan..." : "TAHAN (HOLD)"}
              </Button>

              <Button
                variant="outlined"
                color="secondary"
                size="large"
                onClick={handleRepeat}
                disabled={loadingRepeat || !loketInfo?.current_number}
                sx={{
                  minHeight: 52,
                  fontSize: { xs: "0.95rem", md: "1rem" },
                  fontWeight: 500,
                }}
              >
                {loadingRepeat ? "Mengirim ulang..." : "ULANG PANGGILAN"}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
