import { useState } from "react";
import { useAuth } from "react-oidc-context";
import "./App.css";

import { apiFetch } from "./api";
import { cognitoLogoutUrl } from "./authConfig";
import RoleGuard from "./RoleGuard";
import ServiciosPanel from "./ServiciosPanel";

interface Product {
  id: number;
  name: string;
  brand: string;
  size: number;
  price: number;
  stock: number;
}

interface Order {
  id: number;
  product: string;
  quantity: number;
  status: string;
}

function App() {
  const auth = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [loadingProducts, setLoadingProducts] =
    useState(false);

  const [loadingOrders, setLoadingOrders] =
    useState(false);

  const [message, setMessage] = useState("");
  const [orderMessage, setOrderMessage] = useState("");

  const accessToken = auth.user?.access_token;

  async function cargarProductos() {
    if (!accessToken) {
      setMessage("No hay token disponible");
      return;
    }

    try {
      setLoadingProducts(true);

      const response = await apiFetch(
        "/api/catalog/products",
        accessToken,
      );

      const data = await response.json();

      setProducts(data);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Error al cargar productos",
      );
    } finally {
      setLoadingProducts(false);
    }
  }

  async function cargarPedidos() {
    if (!accessToken) {
      setOrderMessage(
        "No hay token disponible",
      );
      return;
    }

    try {
      setLoadingOrders(true);

      const response = await apiFetch(
        "/api/orders",
        accessToken,
      );

      const data = await response.json();

      setOrders(data);
    } catch (error) {
      setOrderMessage(
        error instanceof Error
          ? error.message
          : "Error al cargar pedidos",
      );
    } finally {
      setLoadingOrders(false);
    }
  }

  async function crearPedido() {
    if (!accessToken) {
      setOrderMessage(
        "No hay token disponible",
      );
      return;
    }

    try {
      setOrderMessage("");

      const response = await apiFetch(
        "/api/orders",
        accessToken,
        {
          method: "POST",
          body: JSON.stringify({
            product: "Air Runner",
            quantity: 1,
          }),
        },
      );

      const data = await response.json();

      await cargarPedidos();

      setOrderMessage(
        `Pedido ${data.id} creado correctamente`,
      );
    } catch (error) {
      setOrderMessage(
        error instanceof Error
          ? error.message
          : "Error al crear pedido",
      );
    }
  }

  async function marcarComoPagado(
    id: number,
  ) {
    if (!accessToken) {
      setOrderMessage(
        "No hay token disponible",
      );
      return;
    }

    try {
      setOrderMessage("");

      await apiFetch(
        `/api/orders/${id}/status`,
        accessToken,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: "PAID",
          }),
        },
      );

      await cargarPedidos();

      setOrderMessage(
        `Pedido ${id} actualizado a PAID`,
      );
    } catch (error) {
      setOrderMessage(
        error instanceof Error
          ? error.message
          : "Error al actualizar pedido",
      );
    }
  }

  async function eliminarPedido(
    id: number,
  ) {
    if (!accessToken) {
      setOrderMessage(
        "No hay token disponible",
      );
      return;
    }

    try {
      setOrderMessage("");

      await apiFetch(
        `/api/orders/${id}`,
        accessToken,
        {
          method: "DELETE",
        },
      );

      await cargarPedidos();

      setOrderMessage(
        `Pedido ${id} eliminado correctamente`,
      );
    } catch (error) {
      setOrderMessage(
        error instanceof Error
          ? error.message
          : "Error al eliminar pedido",
      );
    }
  }

  function cerrarSesion() {
    auth.removeUser();

    window.location.href =
      cognitoLogoutUrl;
  }

  if (auth.isLoading) {
    return (
      <main>
        <h1>Urban Kicks</h1>
        <p>Cargando...</p>
      </main>
    );
  }

  if (auth.error) {
    return (
      <main>
        <h1>Urban Kicks</h1>

        <p>
          Error de autenticacion:{" "}
          {auth.error.message}
        </p>

        <button
          onClick={() => {
            auth.signinRedirect();
          }}
        >
          Intentar nuevamente
        </button>
      </main>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <main>
        <h1>Urban Kicks</h1>

        <p>Tienda de zapatillas</p>

        <button
          onClick={() => {
            auth.signinRedirect();
          }}
        >
          Iniciar sesion
        </button>
      </main>
    );
  }

  const roles =
    (auth.user?.profile[
      "cognito:groups"
    ] as string[]) || [];

  const email =
    auth.user?.profile.email?.toString() ||
    "Usuario";

  return (
    <main>
      <header>
        <h1>Urban Kicks</h1>

        <p>Bienvenida, {email}</p>

        <button onClick={cerrarSesion}>
          Salir
        </button>
      </header>

      <hr />

      <section>
        <h2>Sesion</h2>

        <p>
          <strong>Usuario:</strong>{" "}
          {email}
        </p>

        <p>
          <strong>Roles:</strong>{" "}
          {roles.length > 0
            ? roles.join(", ")
            : "Sin roles"}
        </p>
      </section>

      <hr />

      <section>
        <h2>Catalogo</h2>

        <button
          onClick={cargarProductos}
          disabled={loadingProducts}
        >
          {loadingProducts
            ? "Cargando..."
            : "Cargar productos"}
        </button>

        {products.length > 0 && (
          <div>
            {products.map(
              (product) => (
                <article
                  key={product.id}
                >
                  <h3>
                    {product.name}
                  </h3>

                  <p>
                    Marca:{" "}
                    {product.brand}
                  </p>

                  <p>
                    Talla:{" "}
                    {product.size}
                  </p>

                  <p>
                    Precio: $
                    {product.price.toLocaleString(
                      "es-CL",
                    )}
                  </p>

                  <p>
                    Stock:{" "}
                    {product.stock}
                  </p>
                </article>
              ),
            )}
          </div>
        )}
      </section>

      <hr />

      <section>
        <h2>Pedidos</h2>

        <div>
          <button
            onClick={cargarPedidos}
            disabled={loadingOrders}
          >
            {loadingOrders
              ? "Cargando..."
              : "Cargar pedidos"}
          </button>

          <button
            onClick={crearPedido}
          >
            Crear pedido
          </button>
        </div>

        {orderMessage && (
          <p>
            <strong>
              Resultado:
            </strong>{" "}
            {orderMessage}
          </p>
        )}

        {orders.length === 0 ? (
          <p>
            No hay pedidos cargados.
          </p>
        ) : (
          <div>
            {orders.map(
              (order) => (
                <article
                  key={order.id}
                >
                  <h3>
                    Pedido #{order.id}
                  </h3>

                  <p>
                    Producto:{" "}
                    {order.product}
                  </p>

                  <p>
                    Cantidad:{" "}
                    {order.quantity}
                  </p>

                  <p>
                    Estado:{" "}
                    {order.status}
                  </p>

                  {order.status !==
                    "PAID" && (
                    <button
                      onClick={() =>
                        marcarComoPagado(
                          order.id,
                        )
                      }
                    >
                      Marcar como pagado
                    </button>
                  )}

                  <button
                    onClick={() =>
                      eliminarPedido(
                        order.id,
                      )
                    }
                  >
                    Eliminar pedido
                  </button>
                </article>
              ),
            )}
          </div>
        )}
      </section>

      <RoleGuard
        allowedRoles={[
          "admin",
          "colaborador",
        ]}
      >
        <hr />

        <section>
          <h2>Gestion</h2>

          <p>
            Esta seccion solo esta
            disponible para usuarios
            autorizados.
          </p>

          <ServiciosPanel />
        </section>
      </RoleGuard>

      {message && (
        <>
          <hr />

          <p>
            <strong>
              Resultado:
            </strong>{" "}
            {message}
          </p>
        </>
      )}
    </main>
  );
}

export default App;