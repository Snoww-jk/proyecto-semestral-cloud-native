import { useState } from "react";
import { useAuth } from "react-oidc-context";
import { apiFetch } from "./api";

function AdminTest() {
  const auth = useAuth();
  const [resultado, setResultado] = useState("");

  async function probarAdmin() {
    const accessToken = auth.user?.access_token;

    if (!accessToken) {
      setResultado("No hay token disponible");
      return;
    }

    try {
      const response = await apiFetch(
        "/api/admin/hello",
        accessToken,
      );

      const texto = await response.text();

      setResultado(
        `Acceso permitido: ${response.status} - ${texto}`,
      );
    } catch (error) {
      setResultado(
        error instanceof Error
          ? error.message
          : "Error al probar acceso",
      );
    }
  }

  return (
    <section>
      <h2>Prueba de seguridad</h2>

      <p>
        Prueba de acceso a una ruta exclusiva para
        administradores.
      </p>

      <button onClick={probarAdmin}>
        Probar acceso de administrador
      </button>

      {resultado && (
        <p>
          <strong>Resultado:</strong> {resultado}
        </p>
      )}
    </section>
  );
}

export default AdminTest;