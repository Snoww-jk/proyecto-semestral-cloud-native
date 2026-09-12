import { useState } from "react";
import { useAuth } from "react-oidc-context";
import { apiFetch } from "./api";
import { cognitoLogoutUrl } from "./authConfig";
import RoleGuard from "./RoleGuard";
import ServiciosPanel from "./ServiciosPanel";
import "./App.css";

interface Product {
  id: number;
  name: string;
  brand?: string;
  size?: number;
  price?: number;
  stock?: number;
}

interface Order {
  id: number;
  product?: string;
  quantity?: number;
  status?: string;
}

function App() {
  const auth = useAuth();

  const [productos, setProductos] = useState<Product[]>([]);
  const [pedidos, setPedidos] = useState<Order[]>([]);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const roles =
    (auth.user?.profile["cognito:groups"] as string[]) || [];

  const email =
    auth.user?.profile.email?.toString() || "Sin correo";

  const token = auth.user?.access_token;

  const cerrarSesion = async () => {
    await auth.removeUser();
    window.location.href = cognitoLogoutUrl;
  };

  const cargarProductos = async () => {
    if (!token) {
      setMensaje("No hay token de acceso.");
      return;
    }

    try {
      setCargando(true);
      setMensaje("");

      const response = await apiFetch(
        "/api/catalog/products",
        token,
      );

      const data = await response.json();

      setProductos(data);
      setMensaje("Catalogo cargado correctamente.");
    } catch (error) {
      console.error(error);

      setMensaje(
        error instanceof Error
          ? error.message
          : "Error al cargar el catalogo.",
      );
    } finally {
      setCargando(false);
    }
  };

  const cargarPedidos = async () => {
    if (!token) {
      setMensaje("No hay token de acceso.");
      return;
    }

    try {
      setCargando(true);
      setMensaje("");

      const response = await apiFetch(
        "/api/orders",
        token,
      );

      const data = await response.json();

      setPedidos(data);
      setMensaje("Pedidos cargados correctamente.");
    } catch (error) {
      console.error(error);

      setMensaje(
        error instanceof Error
          ? error.message
          : "Error al cargar los pedidos.",
      );
    } finally {
      setCargando(false);
    }
  };

  const crearPedido = async () => {
    if (!token) {
      setMensaje("No hay token de acceso.");
      return;
    }

    try {
      setCargando(true);
      setMensaje("");

      const response = await apiFetch(
        "/api/orders",
        token,
        {
          method: "POST",
          body: JSON.stringify({
            product: "Air Runner",
            quantity: 1,
          }),
        },
      );

      const nuevoPedido = await response.json();

      setMensaje(
        `Pedido #${nuevoPedido.id} creado correctamente.`,
      );

      await cargarPedidos();
    } catch (error) {
      console.error(error);

      setMensaje(
        error instanceof Error
          ? error.message
          : "Error al crear el pedido.",
      );
    } finally {
      setCargando(false);
    }
  };

  const marcarComoPagado = async (id: number) => {
    if (!token) {
      setMensaje("No hay token de acceso.");
      return;
    }

    try {
      setCargando(true);
      setMensaje("");

      await apiFetch(
        `/api/orders/${id}/status`,
        token,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: "PAID",
          }),
        },
      );

      setMensaje(
        `Pedido #${id} actualizado a PAID.`,
      );

      await cargarPedidos();
    } catch (error) {
      console.error(error);

      setMensaje(
        error instanceof Error
          ? error.message
          : "Error al actualizar el pedido.",
      );
    } finally {
      setCargando(false);
    }
  };

  if (auth.isLoading) {
    return (
      <main className="app">
        <section className="panel">
          <h1>Urban Kicks</h1>
          <p>Cargando autenticacion...</p>
        </section>
      </main>
    );
  }

  if (auth.error) {
    return (
      <main className="app">
        <section className="panel">
          <h1>Urban Kicks</h1>

          <p>
            Error de autenticacion:
            {" "}
            {auth.error.message}
          </p>

          <button
            onClick={() => auth.signinRedirect()}
          >
            Intentar nuevamente
          </button>
        </section>
      </main>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <main className="app">
        <section className="panel login-panel">
          <h1>Urban Kicks</h1>

          <p>
            Inicia sesion para acceder a la tienda.
          </p>

          <button
            onClick={() => auth.signinRedirect()}
          >
            Ingresar con Cognito
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <h1>Urban Kicks</h1>
          <p>Tienda de zapatillas</p>
        </div>

        <div className="user-info">
          <span>{email}</span>

          <button onClick={cerrarSesion}>
            Salir
          </button>
        </div>
      </header>

      <nav className="navbar">
        <a href="#inicio">
          Inicio
        </a>

        <a href="#catalogo">
          Catalogo
        </a>

        <a href="#pedidos">
          Pedidos
        </a>

        {(roles.includes("admin") ||
          roles.includes("colaborador")) && (
          <a href="#gestion">
            Gestion
          </a>
        )}
      </nav>

      <section
        id="inicio"
        className="panel hero"
      >
        <div>
          <p className="tag">
            URBAN KICKS
          </p>

          <h2>
            Bienvenido a Urban Kicks
          </h2>

          <p>
            Usuario autenticado correctamente
            mediante Amazon Cognito.
          </p>

          <p>
            <strong>Correo:</strong>
            {" "}
            {email}
          </p>

          <p>
            <strong>Roles:</strong>
            {" "}
            {roles.length > 0
              ? roles.join(", ")
              : "Sin roles"}
          </p>
        </div>
      </section>

      {mensaje && (
        <section className="mensaje">
          {mensaje}
        </section>
      )}

      <section
        id="catalogo"
        className="panel"
      >
        <div className="section-header">
          <div>
            <p className="tag">
              PRODUCTOS
            </p>

            <h2>Catalogo</h2>
          </div>

          <button
            onClick={cargarProductos}
            disabled={cargando}
          >
            {cargando
              ? "Cargando..."
              : "Cargar catalogo"}
          </button>
        </div>

        {productos.length === 0 ? (
          <p>
            Presiona "Cargar catalogo" para
            consultar los productos.
          </p>
        ) : (
          <div className="cards">
            {productos.map((producto) => (
              <article
                className="card"
                key={producto.id}
              >
                <h3>{producto.name}</h3>

                {producto.brand && (
                  <p>
                    <strong>Marca:</strong>
                    {" "}
                    {producto.brand}
                  </p>
                )}

                {producto.size !== undefined && (
                  <p>
                    <strong>Talla:</strong>
                    {" "}
                    {producto.size}
                  </p>
                )}

                {producto.price !== undefined && (
                  <p>
                    <strong>Precio:</strong>
                    {" "}
                    $
                    {producto.price.toLocaleString(
                      "es-CL",
                    )}
                  </p>
                )}

                {producto.stock !== undefined && (
                  <p>
                    <strong>Stock:</strong>
                    {" "}
                    {producto.stock}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <RoleGuard>
        <section
          id="pedidos"
          className="panel"
        >
          <div className="section-header">
            <div>
              <p className="tag">
                PEDIDOS
              </p>

              <h2>Mis pedidos</h2>
            </div>

            <div>
              <button
                onClick={cargarPedidos}
                disabled={cargando}
              >
                Ver pedidos
              </button>

              <button
                onClick={crearPedido}
                disabled={cargando}
              >
                Crear pedido
              </button>
            </div>
          </div>

          {pedidos.length === 0 ? (
            <p>
              No hay pedidos para mostrar.
            </p>
          ) : (
            <div className="cards">
              {pedidos.map((pedido) => (
                <article
                  className="card"
                  key={pedido.id}
                >
                  <h3>
                    Pedido #{pedido.id}
                  </h3>

                  {pedido.product && (
                    <p>
                      <strong>Producto:</strong>
                      {" "}
                      {pedido.product}
                    </p>
                  )}

                  {pedido.quantity !== undefined && (
                    <p>
                      <strong>Cantidad:</strong>
                      {" "}
                      {pedido.quantity}
                    </p>
                  )}

                  <p>
                    <strong>Estado:</strong>
                    {" "}
                    {pedido.status || "CREATED"}
                  </p>

                  {pedido.status !== "PAID" && (
                    <button
                      onClick={() =>
                        marcarComoPagado(
                          pedido.id,
                        )
                      }
                      disabled={cargando}
                    >
                      Marcar como pagado
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </RoleGuard>

      <RoleGuard
        allowedRoles={[
          "admin",
          "colaborador",
        ]}
      >
        <section
          id="gestion"
          className="panel"
        >
          <p className="tag">
            ADMINISTRACION
          </p>

          <h2>Gestion</h2>

          <p>
            Esta seccion esta disponible
            solamente para administradores
            y colaboradores.
          </p>

          <ServiciosPanel />
        </section>
      </RoleGuard>

      <footer>
        <p>
          Urban Kicks - Cloud Native
        </p>
      </footer>
    </main>
  );
}

export default App;