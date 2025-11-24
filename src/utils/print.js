export function printThermalTicket({
  eventLabel, // contoh: "Event: Grand Opening Mall"
  loketLabel, // contoh: "Loket A"
  loketDescription, // contoh: "Deskripsi loket"
  ticketLabel, // contoh: "A023"
  footerNote, // contoh: "Silakan tunggu panggilan di layar"
  paperSize = "58mm", // atau "80mm"
}) {
  const now = new Date();
  const dateStr = now.toLocaleDateString();
  const timeStr = now.toLocaleTimeString();

  const w = window.open("", "_blank", "width=300,height=600");
  w.document.write(`
    <html>
      <head>
        <title>Ticket</title>
        <style>
          @page {
            size: ${paperSize} auto;
            margin: 0;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            text-align: center;
            margin: 0;
            padding: 0;
          }
          .ticket {
            width: 100%;
            padding: 6px 4px 10px 4px;
          }
          .brand {
            font-size: 11px;
            font-weight: 600;
            margin-bottom: 2px;
          }
          .event {
            font-size: 11px;
            margin-bottom: 4px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .divider {
            border-top: 1px dashed #000;
            margin: 4px 0;
          }
          .loket {
            font-size: 12px;
            font-weight: 600;
            margin-top: 2px;
          }
          .label {
            font-size: 10px;
            margin-top: 4px;
          }
          .loket-description {
            white-space: pre-line;
            font-size: 8px;
          }
          .number {
            font-size: 40px;
            font-weight: 700;
            margin: 6px 0;
          }
          .datetime {
            font-size: 9px;
            margin-top: 4px;
          }
          .note {
            font-size: 9px;
            margin-top: 6px;
          }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="event">${eventLabel || ""}</div>

          <div class="divider"></div>

          <div class="loket">${loketLabel || ""}</div>
          <div class="loket-description">${loketDescription || ""}</div>
          <div class="label">NOMOR ANTRIAN</div>
          <div class="number">${ticketLabel}</div>

          <div class="divider"></div>

          <div class="datetime">${dateStr} &nbsp; ${timeStr}</div>
          <div class="note">${footerNote || ""}</div>
        </div>
        <script>
          window.print();
          setTimeout(() => window.close(), 100);
        </script>
      </body>
    </html>
  `);
  w.document.close();
}
