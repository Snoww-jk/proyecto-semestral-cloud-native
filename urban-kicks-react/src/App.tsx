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
  userId: string;
  status: string;
  total: number;
  createdAt: string;
  productId: number;
  quantity: number;
  price: number;
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
  const [orderMessage, setOrderMessage] =
    useState("");

  const [selectedProductId, setSelectedProductId] =
    useState<number | null>(null);

  const [quantity, setQuantity] = useState(1);

  const accessToken = auth.user?.access_token;

  async function cargarProductos() {
    if (!accessToken) {
      setMessage("No hay token disponible");
      return;
    }

    try {
      setLoadingProducts(true);
      setMessage("");

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
      setOrderMessage("");

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

  function seleccionarProducto(
    productId: number,
  ) {
    setSelectedProductId(productId);
    setQuantity(1);

    const product = products.find(
      (item) => item.id === productId,
    );

    if (product) {
      setOrderMessage(
        `${product.name} seleccionado`,
      );
    }
  }

  async function crearPedido() {
    if (!accessToken) {
      setOrderMessage(
        "No hay token disponible",
      );
      return;
    }

    if (selectedProductId === null) {
      setOrderMessage(
        "Primero selecciona un producto del catalogo",
      );
      return;
    }

    const selectedProduct = products.find(
      (product) =>
        product.id === selectedProductId,
    );

    if (!selectedProduct) {
      setOrderMessage(
        "No se encontro el producto seleccionado",
      );
      return;
    }

    if (quantity < 1) {
      setOrderMessage(
        "La cantidad debe ser mayor a 0",
      );
      return;
    }

    if (quantity > selectedProduct.stock) {
      setOrderMessage(
        "La cantidad supera el stock disponible",
      );
      return;
    }

    try {
      setOrderMessage("");

      const userId =
        auth.user?.profile.sub?.toString() ||
        auth.user?.profile.email?.toString() ||
        "usuario-demo";

      const response = await apiFetch(
        "/api/orders",
        accessToken,
        {
          method: "POST",
          body: JSON.stringify({
            userId,
            productId: selectedProduct.id,
            quantity,
            price: selectedProduct.price,
            status: "CREATED",
          }),
        },
      );

      const data = await response.json();

      await cargarPedidos();

      setOrderMessage(
        `Pedido ${data.id} creado correctamente`,
      );

      setSelectedProductId(null);
      setQuantity(1);
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

  function obtenerNombreProducto(
    productId: number,
  ) {
    const product = products.find(
      (item) => item.id === productId,
    );

    if (product) {
      return product.name;
    }

    return `Producto #${productId}`;
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

  const selectedProduct =
    products.find(
      (product) =>
        product.id === selectedProductId,
    ) || null;

  return (
    <main>
      <header>
        <h1>Urban Kicks</h1>

        <p>
          Bienvenida, {email}
        </p>

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

                  <button
                    onClick={() =>
                      seleccionarProducto(
                        product.id,
                      )
                    }
                    disabled={
                      product.stock <= 0
                    }
                  >
                    {selectedProductId ===
                    product.id
                      ? "Seleccionado"
                      : "Seleccionar"}
                  </button>
                </article>
              ),
            )}
          </div>
        )}
      </section>

      <hr />

      <section>
        <h2>Pedidos</h2>

        {selectedProduct && (
          <article>
            <h3>
              Nuevo pedido
            </h3>

            <p>
              Producto:{" "}
              {selectedProduct.name}
            </p>

            <p>
              Precio unitario: $
              {selectedProduct.price.toLocaleString(
                "es-CL",
              )}
            </p>

            <label>
              Cantidad:{" "}

              <input
                type="number"
                min="1"
                max={
                  selectedProduct.stock
                }
                value={quantity}
                onChange={(event) =>
                  setQuantity(
                    Number(
                      event.target.value,
                    ),
                  )
                }
              />
            </label>

            <p>
              Total: $
              {(
                selectedProduct.price *
                quantity
              ).toLocaleString(
                "es-CL",
              )}
            </p>

            <button
              onClick={crearPedido}
            >
              Crear pedido
            </button>
          </article>
        )}

        <div>
          <button
            onClick={cargarPedidos}
            disabled={loadingOrders}
          >
            {loadingOrders
              ? "Cargando..."
              : "Cargar pedidos"}
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
                    {obtenerNombreProducto(
                      order.productId,
                    )}
                  </p>

                  <p>
                    ID producto:{" "}
                    {order.productId}
                  </p>

                  <p>
                    Cantidad:{" "}
                    {order.quantity}
                  </p>

                  <p>
                    Precio unitario: $
                    {Number(
                      order.price,
                    ).toLocaleString(
                      "es-CL",
                    )}
                  </p>

                  <p>
                    Total: $
                    {Number(
                      order.total,
                    ).toLocaleString(
                      "es-CL",
                    )}
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