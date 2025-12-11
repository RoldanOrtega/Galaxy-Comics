// ===== SISTEMA COMPLETO DE USUARIO =====

// Inicializar sistema de usuario
function inicializarSistemaUsuario() {
  // Verificar si es la primera vez que se carga
  if (!localStorage.getItem("sistemaInicializado")) {
    inicializarBaseDeDatos();
    localStorage.setItem("sistemaInicializado", "true");
  }
  
  // Verificar sesión automáticamente
  verificarSesionAutomatica();
  
  // Configurar protección de rutas
  configurarProteccionRutas();
  
  // Actualizar contador de carrito
  actualizarContadorCarrito();
}

// Inicializar base de datos
function inicializarBaseDeDatos() {
  // Base de datos inicial de productos
  if (!localStorage.getItem("productosDB")) {
    const productosDB = {
      comics: [
        { id: 1, titulo: "Superman: Hombre del mañana", precio: 15.99, stock: 10 },
        { id: 2, titulo: "Batman: Sombras de Gotham", precio: 14.99, stock: 8 },
        { id: 3, titulo: "Spider-Man: Multiverso", precio: 15.50, stock: 12 },
        { id: 4, titulo: "Wonder Woman: Destino divino", precio: 16.99, stock: 5 },
        { id: 5, titulo: "Flash: Línea de tiempo rota", precio: 15.25, stock: 7 }
      ],
      coleccionables: [
        { id: 101, titulo: "Figura Spider-Man Clásico", precio: 89.99, stock: 15 },
        { id: 102, titulo: "Casco Iron Man Mark 42", precio: 249.99, stock: 3 },
        { id: 103, titulo: "Batman Edición Especial", precio: 129.99, stock: 8 },
        { id: 104, titulo: "Guantelete del Infinito", precio: 399.99, stock: 2 },
        { id: 105, titulo: "Wonder Woman Diorama", precio: 179.99, stock: 5 }
      ]
    };
    localStorage.setItem("productosDB", JSON.stringify(productosDB));
  }
  
  // Inicializar sistema de pedidos si no existe
  if (!localStorage.getItem("pedidosGlobales")) {
    localStorage.setItem("pedidosGlobales", JSON.stringify([]));
  }
  
  // Inicializar sistema de notificaciones si no existe
  if (!localStorage.getItem("notificaciones")) {
    localStorage.setItem("notificaciones", JSON.stringify([]));
  }
  
  // Inicializar usuarios si no existen (CORRECCIÓN CRÍTICA)
  if (!localStorage.getItem("usuarios")) {
    const usuariosIniciales = [
      {
        usuario: "admin",
        nombre: "Administrador Galaxy Comics",
        fechaNacimiento: "1990-01-01",
        correo: "admin@galaxycomics.com",
        password: "admin123",
        fechaRegistro: new Date().toISOString(),
        pedidos: [],
        carrito: [],
        esAdmin: true,
        avatar: "img/avatar1.png",
        telefono: "+34 123 456 789",
        direccion: "Calle Cómic 123, Ciudad Geek",
        bio: "Administrador principal de Galaxy Comics. Amante de los cómics desde niño."
      }
    ];
    localStorage.setItem("usuarios", JSON.stringify(usuariosIniciales));
  }
}

// Verificar sesión automática
function verificarSesionAutomatica() {
  const usuarioActual = obtenerUsuarioActual();
  const paginaActual = window.location.pathname.split("/").pop();
  
  // Si no está logueado y está en una página protegida (excepto login)
  if (!usuarioActual && !["login.html", "index.html", ""].includes(paginaActual)) {
    // Guardar la página actual para redirigir después del login
    localStorage.setItem("redirectAfterLogin", paginaActual);
    window.location.href = "login.html";
  }
}

// Configurar protección de rutas
function configurarProteccionRutas() {
  const usuarioActual = obtenerUsuarioActual();
  const paginaActual = window.location.pathname.split("/").pop();
  
  // Páginas que requieren login
  const paginasProtegidas = ["carrito.html", "Pedidos.html", "perfil.html"];
  
  if (paginasProtegidas.includes(paginaActual) && !usuarioActual) {
    localStorage.setItem("redirectAfterLogin", paginaActual);
    window.location.href = "login.html";
    return false;
  }
  
  return true;
}

// ===== SISTEMA DE CARRITO MEJORADO =====

// Agregar producto al carrito
function agregarAlCarrito(productoId, tipo = "comic", cantidad = 1) {
  if (!requerirLogin("Debes iniciar sesión para agregar productos al carrito.")) {
    return false;
  }
  
  const usuarioActual = obtenerUsuarioActual();
  const productosDB = JSON.parse(localStorage.getItem("productosDB")) || {};
  let producto;
  
  // Buscar producto según el tipo
  if (tipo === "comic") {
    producto = productosDB.comics?.find(p => p.id === productoId);
  } else if (tipo === "coleccionable") {
    producto = productosDB.coleccionables?.find(p => p.id === productoId);
  }
  
  if (!producto) {
    mostrarNotificacion("Producto no encontrado", "error");
    return false;
  }
  
  if (producto.stock < cantidad) {
    mostrarNotificacion(`Stock insuficiente. Solo quedan ${producto.stock} unidades.`, "error");
    return false;
  }
  
  // Obtener carrito del usuario
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  const usuarioIndex = usuarios.findIndex(u => u.usuario === usuarioActual.usuario);
  
  if (usuarioIndex === -1) {
    mostrarNotificacion("Error al actualizar el carrito", "error");
    return false;
  }
  
  // Inicializar carrito si no existe
  if (!usuarios[usuarioIndex].carrito) {
    usuarios[usuarioIndex].carrito = [];
  }
  
  // Buscar si el producto ya está en el carrito
  const itemIndex = usuarios[usuarioIndex].carrito.findIndex(
    item => item.productoId === productoId && item.tipo === tipo
  );
  
  if (itemIndex > -1) {
    // Actualizar cantidad si ya existe
    usuarios[usuarioIndex].carrito[itemIndex].cantidad += cantidad;
  } else {
    // Agregar nuevo item
    usuarios[usuarioIndex].carrito.push({
      productoId: productoId,
      tipo: tipo,
      titulo: producto.titulo,
      precio: producto.precio,
      cantidad: cantidad,
      fechaAgregado: new Date().toISOString(),
      imagen: `img/${tipo}${productoId}.png`
    });
  }
  
  // Actualizar stock del producto
  producto.stock -= cantidad;
  localStorage.setItem("productosDB", JSON.stringify(productosDB));
  
  // Actualizar usuario en la base de datos
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  
  // Actualizar usuario actual en localStorage
  localStorage.setItem("usuarioActual", JSON.stringify(usuarios[usuarioIndex]));
  
  // Actualizar contador de carrito
  actualizarContadorCarrito();
  
  mostrarNotificacion(`${producto.titulo} agregado al carrito`, "success");
  return true;
}

// Actualizar contador de carrito en todas las páginas
function actualizarContadorCarrito() {
  const usuarioActual = obtenerUsuarioActual();
  let totalItems = 0;
  
  if (usuarioActual && usuarioActual.carrito) {
    totalItems = usuarioActual.carrito.reduce((total, item) => total + item.cantidad, 0);
  }
  
  // Actualizar en todos los elementos con clase "carrito-contador"
  document.querySelectorAll('.carrito-contador').forEach(elemento => {
    elemento.textContent = totalItems;
    elemento.style.display = totalItems > 0 ? 'inline-block' : 'none';
  });
  
  return totalItems;
}

// ===== SISTEMA DE PEDIDOS =====

// Crear pedido personalizado
function crearPedidoPersonalizado(datosPedido) {
  if (!requerirLogin()) return null;
  
  const usuarioActual = obtenerUsuarioActual();
  const pedido = {
    id: Date.now(),
    usuario: usuarioActual.usuario,
    ...datosPedido,
    fechaPedido: new Date().toISOString(),
    estado: "pendiente",
    numeroSeguimiento: generarNumeroSeguimiento()
  };
  
  // Agregar pedido a la base de datos global
  const pedidosGlobales = JSON.parse(localStorage.getItem("pedidosGlobales")) || [];
  pedidosGlobales.push(pedido);
  localStorage.setItem("pedidosGlobales", JSON.stringify(pedidosGlobales));
  
  // Agregar pedido al usuario
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  const usuarioIndex = usuarios.findIndex(u => u.usuario === usuarioActual.usuario);
  
  if (usuarioIndex > -1) {
    if (!usuarios[usuarioIndex].pedidos) {
      usuarios[usuarioIndex].pedidos = [];
    }
    usuarios[usuarioIndex].pedidos.push(pedido);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    
    // Actualizar usuario actual
    localStorage.setItem("usuarioActual", JSON.stringify(usuarios[usuarioIndex]));
  }
  
  // Enviar notificación
  agregarNotificacion({
    usuario: usuarioActual.usuario,
    tipo: "pedido_creado",
    mensaje: `Tu pedido personalizado #${pedido.id} ha sido creado exitosamente.`,
    fecha: new Date().toISOString(),
    leida: false
  });
  
  return pedido;
}

// Generar número de seguimiento único
function generarNumeroSeguimiento() {
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numeros = '0123456789';
  let resultado = 'GC-';
  
  for (let i = 0; i < 3; i++) {
    resultado += letras.charAt(Math.floor(Math.random() * letras.length));
  }
  resultado += '-';
  for (let i = 0; i < 6; i++) {
    resultado += numeros.charAt(Math.floor(Math.random() * numeros.length));
  }
  
  return resultado;
}

// ===== SISTEMA DE NOTIFICACIONES =====

// Agregar notificación
function agregarNotificacion(notificacion) {
  const notificaciones = JSON.parse(localStorage.getItem("notificaciones")) || [];
  notificacion.id = Date.now() + Math.random().toString(36).substr(2, 9);
  notificaciones.push(notificacion);
  localStorage.setItem("notificaciones", JSON.stringify(notificaciones));
}

// Obtener notificaciones del usuario
function obtenerNotificacionesUsuario() {
  const usuarioActual = obtenerUsuarioActual();
  if (!usuarioActual) return [];
  
  const notificaciones = JSON.parse(localStorage.getItem("notificaciones")) || [];
  return notificaciones.filter(n => n.usuario === usuarioActual.usuario);
}

// Marcar notificación como leída
function marcarNotificacionLeida(notificacionId) {
  const notificaciones = JSON.parse(localStorage.getItem("notificaciones")) || [];
  const notificacionIndex = notificaciones.findIndex(n => n.id === notificacionId);
  
  if (notificacionIndex > -1) {
    notificaciones[notificacionIndex].leida = true;
    localStorage.setItem("notificaciones", JSON.stringify(notificaciones));
    return true;
  }
  
  return false;
}

// ===== FUNCIONES DE PERFIL MEJORADAS =====

// Actualizar perfil de usuario
function actualizarPerfilUsuario(datosActualizados) {
  if (!requerirLogin()) return false;
  
  const usuarioActual = obtenerUsuarioActual();
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  const usuarioIndex = usuarios.findIndex(u => u.usuario === usuarioActual.usuario);
  
  if (usuarioIndex === -1) return false;
  
  // Actualizar datos permitidos
  const datosPermitidos = ['nombre', 'correo', 'fechaNacimiento', 'avatar'];
  datosPermitidos.forEach(key => {
    if (datosActualizados[key] !== undefined) {
      usuarios[usuarioIndex][key] = datosActualizados[key];
    }
  });
  
  // Guardar cambios
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  localStorage.setItem("usuarioActual", JSON.stringify(usuarios[usuarioIndex]));
  
  // Actualizar interfaz
  verificarSesion();
  
  return true;
}

// Cambiar contraseña
function cambiarContraseña(contraseñaActual, nuevaContraseña) {
  if (!requerirLogin()) return false;
  
  const usuarioActual = obtenerUsuarioActual();
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  const usuarioIndex = usuarios.findIndex(u => u.usuario === usuarioActual.usuario);
  
  if (usuarioIndex === -1) return false;
  
  // Verificar contraseña actual
  if (usuarios[usuarioIndex].password !== contraseñaActual) {
    mostrarNotificacion("La contraseña actual es incorrecta", "error");
    return false;
  }
  
  // Validar nueva contraseña
  if (nuevaContraseña.length < 6) {
    mostrarNotificacion("La nueva contraseña debe tener al menos 6 caracteres", "error");
    return false;
  }
  
  // Actualizar contraseña
  usuarios[usuarioIndex].password = nuevaContraseña;
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  
  // Actualizar usuario actual
  usuarioActual.password = nuevaContraseña;
  localStorage.setItem("usuarioActual", JSON.stringify(usuarioActual));
  
  mostrarNotificacion("Contraseña cambiada exitosamente", "success");
  return true;
}

// ===== FUNCIONES DE PAGO SIMULADO =====

// Procesar pago
function procesarPago(datosPago) {
  if (!requerirLogin()) return false;
  
  const usuarioActual = obtenerUsuarioActual();
  if (!usuarioActual.carrito || usuarioActual.carrito.length === 0) {
    mostrarNotificacion("El carrito está vacío", "error");
    return false;
  }
  
  // Simular procesamiento de pago
  const total = calcularTotalCarrito();
  const numeroTransaccion = `TRX-${Date.now()}`;
  
  // Crear pedido a partir del carrito
  const pedido = {
    id: Date.now(),
    usuario: usuarioActual.usuario,
    items: usuarioActual.carrito.map(item => ({
      productoId: item.productoId,
      tipo: item.tipo,
      titulo: item.titulo,
      precio: item.precio,
      cantidad: item.cantidad,
      imagen: item.imagen
    })),
    total: total,
    metodoPago: datosPago.metodo,
    fechaPedido: new Date().toISOString(),
    estado: "pendiente",
    numeroSeguimiento: generarNumeroSeguimiento(),
    numeroTransaccion: numeroTransaccion
  };
  
  // Agregar pedido a la base de datos global
  const pedidosGlobales = JSON.parse(localStorage.getItem("pedidosGlobales")) || [];
  pedidosGlobales.push(pedido);
  localStorage.setItem("pedidosGlobales", JSON.stringify(pedidosGlobales));
  
  // Agregar pedido al usuario
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  const usuarioIndex = usuarios.findIndex(u => u.usuario === usuarioActual.usuario);
  
  if (usuarioIndex > -1) {
    if (!usuarios[usuarioIndex].pedidos) {
      usuarios[usuarioIndex].pedidos = [];
    }
    usuarios[usuarioIndex].pedidos.push(pedido);
    
    // Limpiar carrito
    usuarios[usuarioIndex].carrito = [];
    
    // Guardar cambios en usuarios
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    
    // Actualizar usuario actual en localStorage
    localStorage.setItem("usuarioActual", JSON.stringify(usuarios[usuarioIndex]));
  }
  
  // Enviar notificación
  agregarNotificacion({
    usuario: usuarioActual.usuario,
    tipo: "compra_exitosa",
    mensaje: `¡Pago exitoso! Tu pedido #${pedido.id} ha sido procesado. Total: $${total}`,
    fecha: new Date().toISOString(),
    leida: false
  });
  
  // Actualizar contador de carrito
  actualizarContadorCarrito();
  
  return {
    exito: true,
    pedido: pedido,
    mensaje: "Pago procesado exitosamente"
  };
}

// Calcular total del carrito
function calcularTotalCarrito() {
  const usuarioActual = obtenerUsuarioActual();
  if (!usuarioActual.carrito || usuarioActual.carrito.length === 0) {
    return 0;
  }
  
  return usuarioActual.carrito.reduce((total, item) => {
    return total + (item.precio * item.cantidad);
  }, 0);
}

// ===== FUNCIONES DE MOSTRAR/OCULTAR =====

// Mostrar notificación personalizada
function mostrarNotificacion(mensaje, tipo = "info") {
  const notificacion = document.createElement('div');
  const iconos = {
    success: "fa-check-circle",
    error: "fa-exclamation-circle",
    warning: "fa-exclamation-triangle",
    info: "fa-info-circle"
  };
  
  notificacion.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${tipo === "success" ? "#4CAF50" : 
                 tipo === "error" ? "#ff3b3b" : 
                 tipo === "warning" ? "#ff9800" : "#2196F3"};
    color: white;
    padding: 15px 25px;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    z-index: 10000;
    font-family: 'Poppins', sans-serif;
    display: flex;
    align-items: center;
    gap: 15px;
    animation: slideIn 0.5s ease;
    max-width: 400px;
  `;
  
  notificacion.innerHTML = `
    <i class="fas ${iconos[tipo] || iconos.info}" style="font-size: 24px;"></i>
    <span>${mensaje}</span>
  `;
  
  document.body.appendChild(notificacion);
  
  setTimeout(() => {
    notificacion.style.animation = 'slideOut 0.5s ease';
    setTimeout(() => notificacion.remove(), 500);
  }, 4000);
}

// ===== INICIALIZACIÓN AL CARGAR LA PÁGINA =====

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  inicializarSistemaUsuario();
  
  // Configurar botones de carrito en todas las páginas
  configurarBotonesCarritoGlobales();
  
  // Actualizar contador de carrito
  actualizarContadorCarrito();
  
  // Mostrar botón de administración si es admin
  mostrarBotonAdmin();
});

// Configurar botones de carrito globales
function configurarBotonesCarritoGlobales() {
  // Botones con clase "btn-agregar-carrito"
  document.querySelectorAll('.btn-agregar-carrito').forEach(button => {
    button.addEventListener('click', function() {
      const productoId = parseInt(this.dataset.id);
      const tipo = this.dataset.tipo || "comic";
      const cantidad = parseInt(this.dataset.cantidad) || 1;
      
      agregarAlCarrito(productoId, tipo, cantidad);
    });
  });
}

// ===== MODIFICACIÓN: Agregar pedido personalizado al carrito =====

// Crear pedido personalizado y agregarlo al carrito
function crearPedidoPersonalizadoParaCarrito(datosPedido) {
  if (!requerirLogin()) return null;
  
  const usuarioActual = obtenerUsuarioActual();
  
  // Calcular precio según tipo y formato
  let precio = 100; // Precio base
  if (datosPedido.tipoComic === 'historieta') precio = 150;
  if (datosPedido.tipoComic === 'novela') precio = 200;
  
  if (datosPedido.formato === 'fisico') precio *= 1.2;
  if (datosPedido.formato === 'premium') precio *= 2;
  
  precio *= datosPedido.cantidad;
  
  // Crear ítem de pedido personalizado para el carrito
  const itemPedido = {
    productoId: Date.now(),
    tipo: "pedido_personalizado",
    titulo: `Pedido Personalizado: ${datosPedido.personaje}`,
    subtitulo: `${datosPedido.tipoComic} - ${datosPedido.estilo}`,
    precio: precio,
    cantidad: 1,
    fechaAgregado: new Date().toISOString(),
    imagen: "img/pedido-personalizado.png",
    detalles: {
      tipoComic: datosPedido.tipoComic,
      personaje: datosPedido.personaje,
      estilo: datosPedido.estilo,
      formato: datosPedido.formato,
      cantidad: datosPedido.cantidad,
      descripcion: datosPedido.descripcion,
      fechaEntrega: datosPedido.fechaEntrega
    }
  };
  
  // Agregar al carrito del usuario
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  const usuarioIndex = usuarios.findIndex(u => u.usuario === usuarioActual.usuario);
  
  if (usuarioIndex > -1) {
    if (!usuarios[usuarioIndex].carrito) {
      usuarios[usuarioIndex].carrito = [];
    }
    
    usuarios[usuarioIndex].carrito.push(itemPedido);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    
    // Actualizar usuario actual
    localStorage.setItem("usuarioActual", JSON.stringify(usuarios[usuarioIndex]));
  }
  
  // Actualizar contador de carrito
  actualizarContadorCarrito();
  
  // Crear registro del pedido
  const pedido = {
    id: itemPedido.productoId,
    usuario: usuarioActual.usuario,
    ...datosPedido,
    precio: precio,
    fechaPedido: new Date().toISOString(),
    estado: "en_carrito",
    numeroSeguimiento: generarNumeroSeguimiento()
  };
  
  // Agregar pedido a la base de datos global
  const pedidosGlobales = JSON.parse(localStorage.getItem("pedidosGlobales")) || [];
  pedidosGlobales.push(pedido);
  localStorage.setItem("pedidosGlobales", JSON.stringify(pedidosGlobales));
  
  // Agregar pedido al usuario (historial)
  if (usuarioIndex > -1) {
    if (!usuarios[usuarioIndex].pedidos) {
      usuarios[usuarioIndex].pedidos = [];
    }
    usuarios[usuarioIndex].pedidos.push(pedido);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
  }
  
  // Enviar notificación
  agregarNotificacion({
    usuario: usuarioActual.usuario,
    tipo: "pedido_creado",
    mensaje: `Tu pedido personalizado ha sido agregado al carrito. Total: $${precio}`,
    fecha: new Date().toISOString(),
    leida: false
  });
  
  return { itemPedido, pedido };
}

// ===== SISTEMA DE ADMINISTRACIÓN DE USUARIOS =====

// Mostrar botón de administración si es admin
function mostrarBotonAdmin() {
  const usuarioActual = obtenerUsuarioActual();
  const esAdmin = usuarioActual && usuarioActual.esAdmin === true;
  
  // Buscar o crear contenedor para botón de admin
  let adminButtonContainer = document.getElementById('adminButtonContainer');
  
  if (!adminButtonContainer && esAdmin) {
    adminButtonContainer = document.createElement('div');
    adminButtonContainer.id = 'adminButtonContainer';
    adminButtonContainer.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
    `;
    
    const adminButton = document.createElement('button');
    adminButton.id = 'adminPanelBtn';
    adminButton.innerHTML = '<i class="fas fa-users-cog"></i> Panel Admin';
    adminButton.style.cssText = `
      background: linear-gradient(135deg, #ff3b3b, #ff6b6b);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 50px;
      font-family: 'Poppins', sans-serif;
      font-weight: bold;
      font-size: 16px;
      cursor: pointer;
      box-shadow: 0 5px 15px rgba(255, 59, 59, 0.4);
      display: flex;
      align-items: center;
      gap: 10px;
      transition: all 0.3s ease;
    `;
    
    adminButton.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-3px)';
      this.style.boxShadow = '0 8px 20px rgba(255, 59, 59, 0.6)';
    });
    
    adminButton.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = '0 5px 15px rgba(255, 59, 59, 0.4)';
    });
    
    adminButton.addEventListener('click', mostrarPanelAdmin);
    
    adminButtonContainer.appendChild(adminButton);
    document.body.appendChild(adminButtonContainer);
  } else if (adminButtonContainer && !esAdmin) {
    adminButtonContainer.remove();
  }
}

// Mostrar panel de administración de usuarios
function mostrarPanelAdmin() {
  if (!requerirAdmin()) return;
  
  // Crear overlay
  const overlay = document.createElement('div');
  overlay.id = 'adminOverlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 10000;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: fadeIn 0.3s ease;
  `;
  
  // Crear panel
  const panel = document.createElement('div');
  panel.id = 'adminPanel';
  panel.style.cssText = `
    background: white;
    border-radius: 15px;
    width: 90%;
    max-width: 1200px;
    max-height: 90vh;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    animation: slideUp 0.4s ease;
    display: flex;
    flex-direction: column;
  `;
  
  // Cabecera del panel
  const header = document.createElement('div');
  header.style.cssText = `
    background: linear-gradient(135deg, #ff3b3b, #ff6b6b);
    color: white;
    padding: 20px 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;
  
  header.innerHTML = `
    <div>
      <h2 style="margin: 0; font-family: 'Bangers', cursive; font-size: 28px;">
        <i class="fas fa-users-cog"></i> Panel de Administración
      </h2>
      <p style="margin: 5px 0 0 0; opacity: 0.9; font-family: 'Poppins', sans-serif;">
        Gestión de usuarios registrados
      </p>
    </div>
    <button id="closeAdminPanel" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 20px; display: flex; align-items: center; justify-content: center;">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  // Cuerpo del panel
  const body = document.createElement('div');
  body.style.cssText = `
    padding: 20px;
    flex: 1;
    overflow-y: auto;
  `;
  
  // Cargar usuarios
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  
  // Crear tabla de usuarios
  let tablaHTML = `
    <div style="overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse; font-family: 'Poppins', sans-serif;">
        <thead>
          <tr style="background: #f5f5f5;">
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">ID</th>
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Usuario</th>
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Nombre</th>
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Correo</th>
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Registro</th>
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Pedidos</th>
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Admin</th>
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Acciones</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  usuarios.forEach((usuario, index) => {
    const fechaRegistro = usuario.fechaRegistro ? 
      new Date(usuario.fechaRegistro).toLocaleDateString('es-ES') : 
      'No registrada';
    
    const numPedidos = usuario.pedidos ? usuario.pedidos.length : 0;
    const esAdmin = usuario.esAdmin ? '<span style="color: #4CAF50; font-weight: bold;">Sí</span>' : 'No';
    
    tablaHTML += `
      <tr style="border-bottom: 1px solid #eee; transition: background 0.3s;" 
          onmouseover="this.style.background='#f9f9f9'" 
          onmouseout="this.style.background='transparent'">
        <td style="padding: 12px;">${index + 1}</td>
        <td style="padding: 12px; font-weight: bold;">${usuario.usuario}</td>
        <td style="padding: 12px;">${usuario.nombre || '-'}</td>
        <td style="padding: 12px;">${usuario.correo || '-'}</td>
        <td style="padding: 12px;">${fechaRegistro}</td>
        <td style="padding: 12px;">${numPedidos}</td>
        <td style="padding: 12px;">${esAdmin}</td>
        <td style="padding: 12px;">
          <button onclick="verDetallesUsuario('${usuario.usuario}')" 
                  style="background: #2196F3; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-right: 5px; font-size: 12px;">
            <i class="fas fa-eye"></i>
          </button>
          <button onclick="editarUsuario('${usuario.usuario}')" 
                  style="background: #FF9800; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-right: 5px; font-size: 12px;">
            <i class="fas fa-edit"></i>
          </button>
          <button onclick="eliminarUsuario('${usuario.usuario}')" 
                  style="background: #f44336; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;"
                  ${usuario.usuario === 'admin' ? 'disabled' : ''}>
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });
  
  tablaHTML += `
        </tbody>
      </table>
    </div>
    <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; font-family: 'Poppins', sans-serif;">
      <p style="margin: 0;"><strong>Total usuarios:</strong> ${usuarios.length}</p>
      <p style="margin: 5px 0 0 0;"><strong>Administradores:</strong> ${usuarios.filter(u => u.esAdmin).length}</p>
      <p style="margin: 5px 0 0 0;"><strong>Usuarios normales:</strong> ${usuarios.filter(u => !u.esAdmin).length}</p>
    </div>
  `;
  
  body.innerHTML = tablaHTML;
  
  // Ensamblar panel
  panel.appendChild(header);
  panel.appendChild(body);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);
  
  // Configurar cierre del panel
  document.getElementById('closeAdminPanel').addEventListener('click', function() {
    document.body.removeChild(overlay);
  });
  
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
    }
  });
  
  // Agregar animaciones
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideUp {
      from { transform: translateY(50px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    #adminPanel table tbody tr:hover {
      background-color: #f9f9f9;
    }
    
    #adminPanel button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;
  document.head.appendChild(style);
}

// Ver detalles del usuario
function verDetallesUsuario(usuarioNombre) {
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  const usuario = usuarios.find(u => u.usuario === usuarioNombre);
  
  if (!usuario) {
    mostrarNotificacion("Usuario no encontrado", "error");
    return;
  }
  
  let detalles = `
    <div style="background: white; padding: 30px; border-radius: 10px; max-width: 500px; margin: 20px auto;">
      <h3 style="color: #ff3b3b; margin-top: 0; font-family: 'Bangers', cursive;">
        <i class="fas fa-user"></i> ${usuario.nombre}
      </h3>
      <div style="display: flex; gap: 20px; margin-bottom: 20px;">
        <div style="flex: 1;">
          <p><strong>Usuario:</strong> ${usuario.usuario}</p>
          <p><strong>Correo:</strong> ${usuario.correo || 'No especificado'}</p>
          <p><strong>Fecha nacimiento:</strong> ${usuario.fechaNacimiento || 'No especificada'}</p>
          <p><strong>Fecha registro:</strong> ${new Date(usuario.fechaRegistro).toLocaleDateString()}</p>
          <p><strong>Administrador:</strong> ${usuario.esAdmin ? 'Sí' : 'No'}</p>
        </div>
        <div style="flex: 1;">
          <p><strong>Pedidos realizados:</strong> ${usuario.pedidos ? usuario.pedidos.length : 0}</p>
          <p><strong>En carrito:</strong> ${usuario.carrito ? usuario.carrito.length : 0}</p>
          <p><strong>Teléfono:</strong> ${usuario.telefono || 'No especificado'}</p>
          <p><strong>Dirección:</strong> ${usuario.direccion || 'No especificada'}</p>
        </div>
      </div>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-top: 20px;">
        <p style="margin: 0;"><strong>Biografía:</strong></p>
        <p style="margin: 10px 0 0 0;">${usuario.bio || 'Sin biografía disponible'}</p>
      </div>
    </div>
  `;
  
  mostrarModal(`Detalles de ${usuario.nombre}`, detalles);
}

// Editar usuario
function editarUsuario(usuarioNombre) {
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  const usuario = usuarios.find(u => u.usuario === usuarioNombre);
  const usuarioIndex = usuarios.findIndex(u => u.usuario === usuarioNombre);
  
  if (!usuario) {
    mostrarNotificacion("Usuario no encontrado", "error");
    return;
  }
  
  // Prevenir edición del admin principal
  if (usuarioNombre === 'admin') {
    mostrarNotificacion("No puedes editar el administrador principal", "warning");
    return;
  }
  
  let formulario = `
    <div style="max-width: 500px; margin: 0 auto;">
      <form id="editarUsuarioForm">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Nombre completo</label>
          <input type="text" id="editNombre" value="${usuario.nombre || ''}" 
                 style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Correo electrónico</label>
          <input type="email" id="editCorreo" value="${usuario.correo || ''}" 
                 style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Fecha de nacimiento</label>
          <input type="date" id="editFechaNacimiento" value="${usuario.fechaNacimiento || ''}" 
                 style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Teléfono</label>
          <input type="tel" id="editTelefono" value="${usuario.telefono || ''}" 
                 style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Dirección</label>
          <textarea id="editDireccion" 
                    style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; height: 80px;">${usuario.direccion || ''}</textarea>
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Biografía</label>
          <textarea id="editBio" 
                    style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; height: 100px;">${usuario.bio || ''}</textarea>
        </div>
        
        <div style="margin-bottom: 20px;">
          <label style="display: flex; align-items: center; gap: 10px;">
            <input type="checkbox" id="editEsAdmin" ${usuario.esAdmin ? 'checked' : ''}>
            <span>Es administrador</span>
          </label>
        </div>
        
        <div style="display: flex; gap: 10px;">
          <button type="button" onclick="guardarEdicionUsuario('${usuarioNombre}')" 
                  style="flex: 1; background: #4CAF50; color: white; border: none; padding: 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">
            <i class="fas fa-save"></i> Guardar cambios
          </button>
          <button type="button" onclick="cambiarContrasenaUsuario('${usuarioNombre}')" 
                  style="flex: 1; background: #2196F3; color: white; border: none; padding: 12px; border-radius: 4px; cursor: pointer;">
            <i class="fas fa-key"></i> Cambiar contraseña
          </button>
        </div>
      </form>
    </div>
  `;
  
  mostrarModal(`Editar usuario: ${usuarioNombre}`, formulario);
}

// Guardar edición de usuario
function guardarEdicionUsuario(usuarioNombre) {
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  const usuarioIndex = usuarios.findIndex(u => u.usuario === usuarioNombre);
  
  if (usuarioIndex === -1) {
    mostrarNotificacion("Usuario no encontrado", "error");
    return;
  }
  
  // Obtener valores del formulario
  const nombre = document.getElementById('editNombre').value;
  const correo = document.getElementById('editCorreo').value;
  const fechaNacimiento = document.getElementById('editFechaNacimiento').value;
  const telefono = document.getElementById('editTelefono').value;
  const direccion = document.getElementById('editDireccion').value;
  const bio = document.getElementById('editBio').value;
  const esAdmin = document.getElementById('editEsAdmin').checked;
  
  // Validar
  if (!nombre || !correo) {
    mostrarNotificacion("Nombre y correo son obligatorios", "error");
    return;
  }
  
  // Actualizar usuario
  usuarios[usuarioIndex].nombre = nombre;
  usuarios[usuarioIndex].correo = correo;
  usuarios[usuarioIndex].fechaNacimiento = fechaNacimiento;
  usuarios[usuarioIndex].telefono = telefono;
  usuarios[usuarioIndex].direccion = direccion;
  usuarios[usuarioIndex].bio = bio;
  usuarios[usuarioIndex].esAdmin = esAdmin;
  
  // Guardar cambios
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  
  // Actualizar usuario actual si es el mismo
  const usuarioActual = obtenerUsuarioActual();
  if (usuarioActual && usuarioActual.usuario === usuarioNombre) {
    localStorage.setItem("usuarioActual", JSON.stringify(usuarios[usuarioIndex]));
  }
  
  mostrarNotificacion(`Usuario ${usuarioNombre} actualizado correctamente`, "success");
  cerrarModal();
  
  // Actualizar panel si está abierto
  const overlay = document.getElementById('adminOverlay');
  if (overlay) {
    overlay.remove();
    setTimeout(() => mostrarPanelAdmin(), 300);
  }
}

// Cambiar contraseña de usuario
function cambiarContrasenaUsuario(usuarioNombre) {
  let formulario = `
    <div style="max-width: 400px; margin: 0 auto;">
      <form id="cambiarContrasenaForm">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Nueva contraseña</label>
          <input type="password" id="nuevaContrasena" 
                 style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;" 
                 minlength="6" placeholder="Mínimo 6 caracteres">
        </div>
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Confirmar contraseña</label>
          <input type="password" id="confirmarContrasena" 
                 style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;" 
                 minlength="6" placeholder="Repite la contraseña">
        </div>
        
        <button type="button" onclick="guardarNuevaContrasena('${usuarioNombre}')" 
                style="width: 100%; background: #4CAF50; color: white; border: none; padding: 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">
          <i class="fas fa-key"></i> Cambiar contraseña
        </button>
      </form>
    </div>
  `;
  
  mostrarModal(`Cambiar contraseña: ${usuarioNombre}`, formulario);
}

// Guardar nueva contraseña
function guardarNuevaContrasena(usuarioNombre) {
  const nuevaContrasena = document.getElementById('nuevaContrasena').value;
  const confirmarContrasena = document.getElementById('confirmarContrasena').value;
  
  if (!nuevaContrasena || nuevaContrasena.length < 6) {
    mostrarNotificacion("La contraseña debe tener al menos 6 caracteres", "error");
    return;
  }
  
  if (nuevaContrasena !== confirmarContrasena) {
    mostrarNotificacion("Las contraseñas no coinciden", "error");
    return;
  }
  
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  const usuarioIndex = usuarios.findIndex(u => u.usuario === usuarioNombre);
  
  if (usuarioIndex === -1) {
    mostrarNotificacion("Usuario no encontrado", "error");
    return;
  }
  
  // Actualizar contraseña
  usuarios[usuarioIndex].password = nuevaContrasena;
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  
  // Actualizar usuario actual si es el mismo
  const usuarioActual = obtenerUsuarioActual();
  if (usuarioActual && usuarioActual.usuario === usuarioNombre) {
    localStorage.setItem("usuarioActual", JSON.stringify(usuarios[usuarioIndex]));
  }
  
  mostrarNotificacion(`Contraseña de ${usuarioNombre} cambiada correctamente`, "success");
  cerrarModal();
}

// Eliminar usuario
function eliminarUsuario(usuarioNombre) {
  // Prevenir eliminación del admin principal
  if (usuarioNombre === 'admin') {
    mostrarNotificacion("No puedes eliminar el administrador principal", "warning");
    return;
  }
  
  // Confirmar eliminación
  if (!confirm(`¿Estás seguro de que quieres eliminar al usuario "${usuarioNombre}"?\nEsta acción no se puede deshacer.`)) {
    return;
  }
  
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  const usuarioIndex = usuarios.findIndex(u => u.usuario === usuarioNombre);
  
  if (usuarioIndex === -1) {
    mostrarNotificacion("Usuario no encontrado", "error");
    return;
  }
  
  // Eliminar usuario
  usuarios.splice(usuarioIndex, 1);
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  
  // Si el usuario eliminado es el que está logueado, cerrar sesión
  const usuarioActual = obtenerUsuarioActual();
  if (usuarioActual && usuarioActual.usuario === usuarioNombre) {
    localStorage.removeItem("usuarioActual");
    mostrarNotificacion("Tu cuenta ha sido eliminada", "info");
    setTimeout(() => window.location.reload(), 1500);
  } else {
    mostrarNotificacion(`Usuario ${usuarioNombre} eliminado correctamente`, "success");
  }
  
  // Actualizar panel si está abierto
  const overlay = document.getElementById('adminOverlay');
  if (overlay) {
    overlay.remove();
    setTimeout(() => mostrarPanelAdmin(), 300);
  }
}

// Mostrar modal genérico
function mostrarModal(titulo, contenido) {
  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'modalOverlay';
  modalOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    z-index: 10001;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: fadeIn 0.3s ease;
  `;
  
  const modal = document.createElement('div');
  modal.style.cssText = `
    background: white;
    border-radius: 10px;
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    animation: slideUp 0.4s ease;
  `;
  
  const header = document.createElement('div');
  header.style.cssText = `
    background: linear-gradient(135deg, #ff3b3b, #ff6b6b);
    color: white;
    padding: 15px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;
  
  header.innerHTML = `
    <h3 style="margin: 0; font-family: 'Bangers', cursive; font-size: 22px;">${titulo}</h3>
    <button onclick="cerrarModal()" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center;">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  const body = document.createElement('div');
  body.style.cssText = `
    padding: 20px;
    max-height: calc(90vh - 70px);
    overflow-y: auto;
  `;
  body.innerHTML = contenido;
  
  modal.appendChild(header);
  modal.appendChild(body);
  modalOverlay.appendChild(modal);
  document.body.appendChild(modalOverlay);
  
  // Cerrar al hacer clic fuera
  modalOverlay.addEventListener('click', function(e) {
    if (e.target === modalOverlay) {
      cerrarModal();
    }
  });
}

// Cerrar modal
function cerrarModal() {
  const modalOverlay = document.getElementById('modalOverlay');
  if (modalOverlay) {
    document.body.removeChild(modalOverlay);
  }
}

// Verificar si el usuario actual es administrador
function esAdministrador() {
  const usuarioActual = obtenerUsuarioActual();
  return usuarioActual && usuarioActual.esAdmin === true;
}

// Requerir permisos de administrador
function requerirAdmin() {
  if (!esAdministrador()) {
    mostrarNotificacion("Acceso denegado. Se requieren permisos de administrador.", "error");
    return false;
  }
  return true;
}      