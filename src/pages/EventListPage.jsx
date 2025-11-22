import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { apiGet, apiPost, apiPut, apiDelete } from "../api";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Swal from "sweetalert2";

export default function EventListPage() {
  const [events, setEvents] = useState([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  // search
  const [searchTerm, setSearchTerm] = useState("");

  // edit event
  const [editOpen, setEditOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");

  // delete event
  const [deleteOpen, setDeleteOpen] = useState(false);

  const loadEvents = async () => {
    try {
      const data = await apiGet("/events");
      setEvents(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name || !code) return;
    setLoading(true);
    try {
      await apiPost("/events", { name, code });
      setName("");
      setCode("");
      loadEvents();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err.data?.detail || "Gagal membuat event",
      });
    } finally {
      setLoading(false);
    }
  };

  // ---- Edit event handlers ----
  const handleOpenEdit = (ev) => {
    setSelectedEvent(ev);
    setEditName(ev.name);
    setEditCode(ev.code);
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setSelectedEvent(null);
  };

  const handleSaveEdit = async () => {
    if (!selectedEvent) return;
    try {
      await apiPut(`/events/${selectedEvent.id}`, {
        name: editName,
        code: editCode,
      });
      handleCloseEdit();
      loadEvents();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err.data?.detail || "Gagal mengupdate event",
      });
    }
  };

  // ---- Delete event handlers ----
  const handleOpenDelete = (ev) => {
    setSelectedEvent(ev);
    setDeleteOpen(true);
  };

  const handleCloseDelete = () => {
    setDeleteOpen(false);
    setSelectedEvent(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedEvent) return;
    try {
      await apiDelete(`/events/${selectedEvent.id}`);
      handleCloseDelete();
      loadEvents();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err.data?.detail || "Gagal menghapus event",
      });
    }
  };

  // Filter events berdasarkan search
  const filteredEvents = events.filter((ev) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      ev.name.toLowerCase().includes(q) || ev.code.toLowerCase().includes(q)
    );
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Daftar Event
      </Typography>

      {/* Form buat event baru */}
      <Box
        component="form"
        onSubmit={handleCreate}
        sx={{
          mb: 4,
          p: 2,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Buat Event Baru
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <TextField
              label="Nama Event"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="Kode Event"
              fullWidth
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={4} display="flex" alignItems="center">
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Buat Event"}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Search */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <TextField
          size="small"
          label="Cari event (nama/kode)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>

      {/* List event */}
      <Typography variant="h6" gutterBottom>
        Event Aktif
      </Typography>
      {events.length === 0 ? (
        <Typography color="text.secondary">
          Belum ada event. Silakan buat event baru.
        </Typography>
      ) : filteredEvents.length === 0 ? (
        <Typography color="text.secondary">
          Tidak ada event yang cocok dengan pencarian.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {filteredEvents.map((ev) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={ev.id}>
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
                    <Box>
                      <Typography variant="h6">{ev.name}</Typography>
                      <Typography color="text.secondary">
                        Kode: {ev.code}
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenEdit(ev)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleOpenDelete(ev)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Stack>
                </CardContent>
                <CardActions>
                  <Button
                    component={RouterLink}
                    to={`/event/${ev.id}/board`}
                    size="small"
                    variant="contained"
                    fullWidth
                  >
                    Buka Board
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog Edit Event */}
      <Dialog open={editOpen} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Event</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nama Event"
              fullWidth
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <TextField
              label="Kode Event"
              fullWidth
              value={editCode}
              onChange={(e) => setEditCode(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Batal</Button>
          <Button variant="contained" onClick={handleSaveEdit}>
            Simpan
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Delete Event */}
      <Dialog
        open={deleteOpen}
        onClose={handleCloseDelete}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Hapus Event</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Yakin ingin menghapus event <strong>{selectedEvent?.name}</strong>?
            Semua loket dan antrian di event ini juga akan ikut terhapus (jika
            diizinkan).
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Batal</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
          >
            Hapus
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
