// src/pages/BoardPage.jsx
import { useEffect, useState, useCallback } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { apiGet, apiPost, apiPut, apiDelete } from "../api";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { printThermalTicket } from "../utils/print";
import Swal from "sweetalert2";

export default function BoardPage() {
  const { eventId } = useParams();
  const [lokets, setLokets] = useState([]);
  const [newLoketName, setNewLoketName] = useState("");
  const [newLoketCode, setNewLoketCode] = useState("");
  const [creatingLoket, setCreatingLoket] = useState(false);

  // search loket
  const [searchLoket, setSearchLoket] = useState("");

  // edit loket dialog
  const [editOpen, setEditOpen] = useState(false);
  const [selectedLoket, setSelectedLoket] = useState(null);
  const [editLoketName, setEditLoketName] = useState("");
  const [editLoketCode, setEditLoketCode] = useState("");

  // delete loket dialog
  const [deleteOpen, setDeleteOpen] = useState(false);

  const loadState = useCallback(async () => {
    if (!eventId) return;
    try {
      const data = await apiGet(`/events/${eventId}/state`);
      setLokets(data);
    } catch (err) {
      console.error(err);
    }
  }, [eventId]);

  useEffect(() => {
    loadState();
    const interval = setInterval(loadState, 3000);
    return () => clearInterval(interval);
  }, [loadState]);

  const handleCreateLoket = async (e) => {
    e.preventDefault();
    if (!eventId || !newLoketName || !newLoketCode) return;
    setCreatingLoket(true);
    try {
      await apiPost(`/events/${eventId}/lokets`, {
        name: newLoketName,
        code: newLoketCode,
      });
      setNewLoketName("");
      setNewLoketCode("");
      loadState();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err?.data?.detail || "Gagal membuat loket",
      });
    } finally {
      setCreatingLoket(false);
    }
  };

  const handleTakeTicket = async (loketId, loketCode) => {
    if (!eventId) return;
    try {
      const data = await apiPost(
        `/events/${eventId}/lokets/${loketId}/tickets`
      );
      const { number, loket_name } = data;
      const label = `${loketCode}${number}`;

      Swal.fire({
        icon: "info",
        title: "Info",
        text: `Nomor antrian anda: ${label}`,
      });

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
    }
  };

  // ---- Reset loket ----
  const handleResetLoket = async (loket) => {
    if (!eventId) return;
    const ok = window.confirm(
      `Reset semua antrian di ${loket.loket_name} (${loket.loket_code})? Semua nomor akan dihapus dan kembali ke awal.`
    );
    if (!ok) return;

    try {
      await apiPost(`/events/${eventId}/lokets/${loket.loket_id}/reset`, {});
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Antrian loket berhasil direset.",
      });
      loadState();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err.data?.detail || "Gagal mereset antrian loket",
      });
    }
  };

  // ---- Edit loket handlers ----
  const handleOpenEditLoket = (loket) => {
    setSelectedLoket(loket);
    setEditLoketName(loket.loket_name);
    setEditLoketCode(loket.loket_code);
    setEditOpen(true);
  };

  const handleCloseEditLoket = () => {
    setEditOpen(false);
    setSelectedLoket(null);
  };

  const handleSaveEditLoket = async () => {
    if (!selectedLoket || !eventId) return;
    try {
      await apiPut(`/events/${eventId}/lokets/${selectedLoket.loket_id}`, {
        name: editLoketName,
        code: editLoketCode,
      });
      handleCloseEditLoket();
      loadState();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err.data?.detail || "Gagal mengupdate loket",
      });
    }
  };

  // ---- Delete loket handlers ----
  const handleOpenDeleteLoket = (loket) => {
    setSelectedLoket(loket);
    setDeleteOpen(true);
  };

  const handleCloseDeleteLoket = () => {
    setDeleteOpen(false);
    setSelectedLoket(null);
  };

  const handleConfirmDeleteLoket = async () => {
    if (!selectedLoket || !eventId) return;
    try {
      await apiDelete(`/events/${eventId}/lokets/${selectedLoket.loket_id}`);
      handleCloseDeleteLoket();
      loadState();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err.data?.detail || "Gagal menghapus loket",
      });
    }
  };

  // Filter loket
  const filteredLokets = lokets.filter((l) => {
    if (!searchLoket) return true;
    const q = searchLoket.toLowerCase();
    return (
      l.loket_name.toLowerCase().includes(q) ||
      l.loket_code.toLowerCase().includes(q)
    );
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Board Event #{eventId}
      </Typography>

      {/* Form tambah loket */}
      <Box
        component="form"
        onSubmit={handleCreateLoket}
        sx={{
          mb: 4,
          p: 2,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Tambah Loket
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <TextField
              label="Nama Loket (mis: Loket A)"
              fullWidth
              value={newLoketName}
              onChange={(e) => setNewLoketName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="Kode (mis: A)"
              fullWidth
              value={newLoketCode}
              onChange={(e) => setNewLoketCode(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={4} display="flex" alignItems="center">
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={creatingLoket}
            >
              {creatingLoket ? "Menyimpan..." : "Simpan Loket"}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Search loket */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <TextField
          size="small"
          label="Cari loket (nama/kode)"
          value={searchLoket}
          onChange={(e) => setSearchLoket(e.target.value)}
        />
      </Box>

      <Typography variant="h6" gutterBottom>
        Daftar Loket
      </Typography>

      {/* Link ke display semua loket */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
        }}
      >
        <Button
          component={RouterLink}
          to={`/event/${eventId}/display-all`}
          target="_blank"
          variant="outlined"
          size="small"
        >
          Buka Display Semua Loket
        </Button>
      </Box>

      <Grid container spacing={2}>
        {lokets.length === 0 ? (
          <Grid item xs={12}>
            <Typography color="text.secondary">
              Belum ada loket. Tambahkan loket terlebih dahulu.
            </Typography>
          </Grid>
        ) : filteredLokets.length === 0 ? (
          <Grid item xs={12}>
            <Typography color="text.secondary">
              Tidak ada loket yang cocok dengan pencarian.
            </Typography>
          </Grid>
        ) : (
          filteredLokets.map((l) => {
            const currentLabel = l.current_number
              ? `${l.loket_code}${l.current_number}`
              : "-";
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={l.loket_id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="h6">{l.loket_name}</Typography>
                        <Chip
                          label={l.loket_code}
                          color="primary"
                          size="small"
                        />
                      </Stack>
                      <Box>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenEditLoket(l)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDeleteLoket(l)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Stack>
                    <Box mt={2}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Sedang dipanggil:
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: "bold",
                          fontSize: { xs: "1.8rem", md: "2.2rem" },
                        }}
                      >
                        {currentLabel}
                      </Typography>
                    </Box>
                    <Box mt={1}>
                      <Typography variant="body2">
                        Antrian menunggu: <strong>{l.queue_length}</strong>
                      </Typography>
                      <Typography variant="body2">
                        Tiket terakhir: <strong>{l.last_ticket_number}</strong>
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ flexDirection: "column", gap: 1, p: 2 }}>
                    <Button
                      variant="contained"
                      color="secondary"
                      fullWidth
                      onClick={() => handleTakeTicket(l.loket_id, l.loket_code)}
                    >
                      Ambil Nomor
                    </Button>
                    <Button
                      component={RouterLink}
                      to={`/event/${eventId}/loket/${l.loket_id}/display`}
                      target="_blank"
                      variant="outlined"
                      fullWidth
                    >
                      Display Loket
                    </Button>
                    <Button
                      component={RouterLink}
                      to={`/loket/${l.loket_id}/admin`}
                      target="_blank"
                      variant="outlined"
                      fullWidth
                    >
                      Admin Loket
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      fullWidth
                      onClick={() => handleResetLoket(l)}
                    >
                      Reset Antrian
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })
        )}
      </Grid>

      <Typography variant="body2" color="text.secondary" mt={2}>
        Buka link Display di setiap TV untuk menampilkan antrian, dan link Admin
        di komputer petugas untuk memanggil NEXT. Gunakan tombol Reset untuk
        mengembalikan antrian ke awal saat testing.
      </Typography>

      {/* Dialog Edit Loket */}
      <Dialog
        open={editOpen}
        onClose={handleCloseEditLoket}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Loket</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nama Loket"
              fullWidth
              value={editLoketName}
              onChange={(e) => setEditLoketName(e.target.value)}
            />
            <TextField
              label="Kode Loket"
              fullWidth
              value={editLoketCode}
              onChange={(e) => setEditLoketCode(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditLoket}>Batal</Button>
          <Button variant="contained" onClick={handleSaveEditLoket}>
            Simpan
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Delete Loket */}
      <Dialog
        open={deleteOpen}
        onClose={handleCloseDeleteLoket}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Hapus Loket</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Yakin ingin menghapus <strong>{selectedLoket?.loket_name}</strong> (
            {selectedLoket?.loket_code})? Semua tiket antrian di loket ini akan
            dihapus. Jika hanya ingin mengosongkan antrian, gunakan tombol
            Reset.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteLoket}>Batal</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDeleteLoket}
          >
            Hapus
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
