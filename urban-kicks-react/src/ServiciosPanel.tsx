import { useState } from "react";
import { useAuth } from "react-oidc-context";
import { apiFetch } from "./api";

function ServiciosPanel() {
  const auth = useAuth();

  const [resultado, setResultado] = useState("");
  const [cargando, setCargando] = useState(false);

  const token = auth.user?.access_token;

  async function cargarReporte() {
    if (!token) return;

    try {
      setCargando(true);

      const response = await apiFetch(
        "/api/reports/summary",
        token,
      );

      const data = await response.json();

      setResultado(
        JSON.stringify(data, null, 2),
      );
    } catch (error) {
      setResultado(
        error instanceof Error
          ? error.message
          : "Error al cargar reporte",
      );
    } finally {
      setCargando(false);
    }
  }

  async function cargarAuditoria() {
    if (!token) return;

    try {
      setCargando(true);

      const response = await apiFetch(
        "/api/audit",
        token,
      );

      const text = await response.text();

      setResultado(
        text || "No hay registros de auditoria",
      );
    } catch (error) {
      setResultado(
        error instanceof Error
          ? error.message
          : "Error al cargar auditoria",
      );
    } finally {
      setCargando(false);
    }
  }

  async function enviarNotificacion() {
    if (!token) return;

    try {
      setCargando(true);

      const response = await apiFetch(
        "/api/notifications",
        token,
        {
          method: "POST",
          body: JSON.stringify({
            message: "Prueba desde React Urban Kicks",
          }),
        },
      );

      const data = await response.json();

      setResultado(
        JSON.stringify(data, null, 2),
      );
    } catch (error) {
      setResultado(
        error instanceof Error
          ? error.message
          : "Error al enviar notificacion",
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <section>
      <h2>Servicios</h2>

      <div>
        <button
          onClick={cargarReporte}
          disabled={cargando}
        >
          Ver reporte
        </button>

        <button
          onClick={cargarAuditoria}
          disabled={cargando}
        >
          Ver auditoria
        </button>

        <button
          onClick={enviarNotificacion}
          disabled={cargando}
        >
          Enviar notificacion
        </button>
      </div>

      {resultado && (
        <pre>{resultado}</pre>
      )}
    </section>
  );
}

export default ServiciosPanel;