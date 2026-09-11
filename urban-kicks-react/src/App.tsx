import { useState } from "react";
import { useAuth } from "react-oidc-context";
import { apiFetch } from "./api";
import "./App.css";

interface Product {
  id: number;
  name: string;
  brand?: string;
  size?: number;
  price: number;
  stock: number;
}

interface Order {
  id: number;
  status: string;
  product?: string;
  quantity?: number;
}

function App() {
  const auth = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productError, setProductError] = useState("");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderMessage, setOrderMessage] = useState("");

  if (auth.isLoading) {
    return <h2>Cargando...</h2>;
  }

  if (auth.error) {
    return (
      <div className="container">
        <h2>Error al iniciar sesión</h2>
        <p>{auth.error.message}</p>

        <button
          className="btn"
          onClick={() => auth.signinRedirect()}
        >
          Intentar nuevamente
        </button>
      </div>
    );
  }

  const roles =
    (auth.user?.profile["cognito:groups"] as string[]) || [];

  const email = auth.user?.profile.email;
  const token = auth.user?.access_token;

  // =========================
  // CATÁLOGO
  // =========================
  const cargarProductos = async () => {
    try {
      setLoadingProducts(true);
      setProductError("");

      if (!token) {
        setProductError("No hay token de acceso.");
        return;
      }

      const response = await apiFetch(
        "/api/catalog/products",
        token,
      );

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
      setProductError("No se pudieron cargar los productos.");
    } finally {
      setLoadingProducts(false);
    }
  };

  // =========================
  // VER PEDIDOS
  // =========================
  const cargarPedidos = async () => {
    try {
      setLoadingOrders(true);
      setOrderError("");

      if (!token) {
        setOrderError("No hay token de acceso.");
        return;
      }

      const response = await apiFetch(
        "/api/orders",
        token,
      );

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
      setOrderError("No se pudieron cargar los pedidos.");
    } finally {
      setLoadingOrders(false);
    }
  };

  // =========================
  // CREAR PEDIDO
  // =========================
  const crearPedido = async () => {
    try {
      setOrderError("");
      setOrderMessage("");

      if (!token) {
        setOrderError("No hay token de acceso.");
        return;
      }

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

      const data = await response.json();

      setOrderMessage(
        `Pedido #${data.id} creado correctamente.`,
      );

      await cargarPedidos();
    } catch (error) {
      console.error(error);
      setOrderError("No se pudo crear el pedido.");
    }
  };

  // =========================
  // ACTUALIZAR ESTADO
  // =========================
  const marcarComoPagado = async (id: number) => {
    try {
      setOrderError("");
      setOrderMessage("");

      if (!token) {
        setOrderError("No hay token de acceso.");
        return;
      }

      const response = await apiFetch(
        `/api/orders/${id}/status`,
        token,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: "PAID",
          }),
        },
      );

      const data = await response.json();

      setOrderMessage(
        `Pedido #${data.id} actualizado a ${data.status}.`,
      );

      await cargarPedidos();
    } catch (error) {
      console.error(error);
      setOrderError(
        "No se pudo actualizar el estado del pedido.",
      );
    }
  };

  return (
    <div>
      <header className="top">
        <div className="nav">
          <a href="/" className="brand">
            URBAN-KICKS
          </a>

          <nav>
            <a href="#catalogo">Zapatillas</a>

            {auth.isAuthenticated && (
              <a href="#pedidos">Mis pedidos</a>
            )}

            {auth.isAuthenticated &&
              (roles.includes("admin") ||
                roles.includes("colaborador")) && (
                <a href="#gestion">
                  Gestión
                </a>
              )}
          </nav>

          <div>
            {auth.isAuthenticated ? (
              <button
                className="btn secondary"
                onClick={() => auth.removeUser()}
              >
                Salir
              </button>
            ) : (
              <button
                className="btn"
                onClick={() => auth.signinRedirect()}
              >
                Ingresar
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <h1>URBAN-KICKS</h1>

          <p>Tu tienda de zapatillas.</p>

          {!auth.isAuthenticated && (
            <button
              className="btn"
              onClick={() => auth.signinRedirect()}
            >
              Ingresar con Cognito
            </button>
          )}

          {auth.isAuthenticated && (
            <div>
              <h3>
                Bienvenida a Urban Kicks 👟
              </h3>

              <p>
                Usuario:{" "}
                <strong>{email}</strong>
              </p>

              <p>
                Rol(es):{" "}
                <strong>
                  {roles.length > 0
                    ? roles.join(", ")
                    : "Sin rol"}
                </strong>
              </p>
            </div>
          )}
        </section>

        <section
          id="catalogo"
          className="card"
        >
          <h2>Catálogo</h2>

          {!auth.isAuthenticated ? (
            <p>
              Debes iniciar sesión para ver los productos.
            </p>
          ) : (
            <>
              <button
                className="btn"
                onClick={cargarProductos}
                disabled={loadingProducts}
              >
                {loadingProducts
                  ? "Cargando..."
                  : "Ver productos"}
              </button>

              {productError && (
                <p>{productError}</p>
              )}

              <div className="grid">
                {products.map((product) => (
                  <article
                    key={product.id}
                    className="product-card"
                  >
                    <h3>{product.name}</h3>

                    {product.brand && (
                      <p>
                        Marca: {product.brand}
                      </p>
                    )}

                    {product.size && (
                      <p>
                        Talla: {product.size}
                      </p>
                    )}

                    <p>
                      Precio: $
                      {product.price.toLocaleString(
                        "es-CL",
                      )}
                    </p>

                    <p>
                      Stock: {product.stock}
                    </p>
                  </article>
                ))}
              </div>

              {products.length === 0 &&
                !loadingProducts && (
                  <p>
                    Presiona "Ver productos"
                    para cargar el catálogo.
                  </p>
                )}
            </>
          )}
        </section>

        {auth.isAuthenticated && (
          <section
            id="pedidos"
            className="card"
          >
            <h2>Mis pedidos</h2>

            <div>
              <button
                className="btn"
                onClick={crearPedido}
              >
                Crear pedido
              </button>

              <button
                className="btn"
                onClick={cargarPedidos}
                disabled={loadingOrders}
              >
                {loadingOrders
                  ? "Cargando..."
                  : "Ver pedidos"}
              </button>
            </div>

            {orderMessage && (
              <p>{orderMessage}</p>
            )}

            {orderError && (
              <p>{orderError}</p>
            )}

            <div className="grid">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className="product-card"
                >
                  <h3>
                    Pedido #{order.id}
                  </h3>

                  {order.product && (
                    <p>
                      Producto: {order.product}
                    </p>
                  )}

                  {order.quantity && (
                    <p>
                      Cantidad: {order.quantity}
                    </p>
                  )}

                  <p>
                    Estado: <strong>{order.status}</strong>
                  </p>

                  {order.status !== "PAID" && (
                    <button
                      className="btn"
                      onClick={() =>
                        marcarComoPagado(order.id)
                      }
                    >
                      Marcar como pagado
                    </button>
                  )}
                </article>
              ))}
            </div>

            {orders.length === 0 &&
              !loadingOrders && (
                <p>
                  No hay pedidos cargados todavía.
                </p>
              )}
          </section>
        )}

        {auth.isAuthenticated &&
          (roles.includes("admin") ||
            roles.includes("colaborador")) && (
            <section
              id="gestion"
              className="card"
            >
              <h2>Gestión</h2>

              <p>
                Panel disponible para administradores
                y colaboradores.
              </p>
            </section>
          )}
      </main>
    </div>
  );
}

export default App;