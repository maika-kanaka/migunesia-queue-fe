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
} from "@mui/material";
import Swal from "sweetalert2";

export default function LoketAdminPage() {
  const { loketId } = useParams();
  const [loketInfo, setLoketInfo] = useState(null);
  const [info, setInfo] = useState(null);
  const [loadingNext, setLoadingNext] = useState(false);
  const [loadingRepeat, setLoadingRepeat] = useState(false);

  const loadInfo = useCallback(async () => {
    try {
      const data = await apiGet(`/lokets/${loketId}/info`);
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
      }
      setInfo(data);
      await loadInfo();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNext(false);
    }
  };

  const handleRepeat = async () => {
    if (!loketInfo || !loketInfo.current_number) {
      Swal.fire({
        icon: "info",
        title: "info",
        text: "Belum ada nomor yang dipanggil.",
      });
      return;
    }
    setLoadingRepeat(true);
    try {
      await apiPost(`/lokets/${loketId}/repeat`, {});
      // tidak perlu suara di sini, display yang akan berbicara
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
          sx={{ mb: 3 }}
        >
          Antrian menunggu: <strong>{loketInfo.queue_length}</strong>
        </Typography>
      )}

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

      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        mt={2}
        textAlign="center"
      >
        Suara panggilan akan keluar di layar display loket yang terhubung.
      </Typography>
    </Box>
  );
}
