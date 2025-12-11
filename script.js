// ===== FUNCIONES COMPARTIDAS PARA TODAS LAS PÁGINAS =====

// Cargar funciones adicionales del usuario
const cargarFuncionesUsuario = () => {
  const script = document.createElement('script');
  script.src = 'funcionesUsuario.js';
  script.defer = true;
  document.head.appendChild(script);
};

// Verificar estado de sesión y actualizar icono
function verificarSesion() {
  const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));
  const iconoUsuario = document.getElementById("iconoUsuario");
  const usuarioLink = document.getElementById("usuarioLink");
  const nombreUsuarioHeader = document.getElementById("nombreUsuarioHeader");

  if (iconoUsuario) {
    if (usuarioActual) {
      // Cambiar imagen a "perfil.png" (icono de usuario logueado)
      iconoUsuario.src = "img/perfil.png";
      iconoUsuario.alt = `Perfil de ${usuarioActual.nombre || usuarioActual.usuario}`;
      iconoUsuario.style.cursor = "pointer";
      iconoUsuario.title = `Ver perfil de ${usuarioActual.nombre || usuarioActual.usuario}`;
      
      // Mostrar nombre del usuario en el header si existe el elemento
      if (nombreUsuarioHeader) {
        nombreUsuarioHeader.textContent = `👤 ${usuarioActual.nombre || usuarioActual.usuario}`;
        nombreUsuarioHeader.style.display = "inline-block";
        
        // Hacer que el nombre también sea clickeable para abrir el perfil
        nombreUsuarioHeader.style.cursor = "pointer";
        nombreUsuarioHeader.addEventListener("click", function(e) {
          e.preventDefault();
          mostrarPerfil(usuarioActual);
        });
        
        // Agregar efecto hover al nombre
        nombreUsuarioHeader.addEventListener("mouseenter", function() {
          this.style.background = "rgba(255, 59, 59, 1)";
          this.style.transform = "scale(1.05)";
          this.style.transition = "all 0.3s ease";
        });
        
        nombreUsuarioHeader.addEventListener("mouseleave", function() {
          this.style.background = "rgba(255, 59, 59, 0.8)";
          this.style.transform = "scale(1)";
        });
      }
    } else {
      // Cambiar imagen a "btn-login.png" (icono de login)
      iconoUsuario.src = "img/btn-login.png";
      iconoUsuario.alt = "Iniciar sesión";
      iconoUsuario.title = "Iniciar sesión o registrarse";
      iconoUsuario.style.cursor = "pointer";
      
      // Ocultar nombre del usuario en el header si existe el elemento
      if (nombreUsuarioHeader) {
        nombreUsuarioHeader.style.display = "none";
        nombreUsuarioHeader.textContent = "";
      }
    }
  }

  // Configurar evento para el icono de usuario
  if (usuarioLink) {
    usuarioLink.addEventListener("click", (e) => {
      e.preventDefault();
      const usuario = JSON.parse(localStorage.getItem("usuarioActual"));

      if (!usuario) {
        window.location.href = "login.html";
      } else {
        mostrarPerfil(usuario);
      }
    });
  }

  // Configurar botón cerrar sesión
  const cerrarSesionBtn = document.getElementById("cerrarSesion");
  if (cerrarSesionBtn) {
    cerrarSesionBtn.addEventListener("click", cerrarSesion);
  }

  // Configurar cerrar perfil al hacer clic fuera
  const perfilBox = document.getElementById("perfilBox");
  if (perfilBox) {
    perfilBox.addEventListener("click", (e) => {
      if (e.target === perfilBox) {
        perfilBox.style.display = "none";
      }
    });
  }
}

// Mostrar perfil del usuario
function mostrarPerfil(usuario) {
  const perfilBox = document.getElementById("perfilBox");
  if (perfilBox) {
    perfilBox.style.display = "flex";
    
    // Obtener elementos del perfil
    const perfilTitulo = document.querySelector(".perfil-contenido h2");
    const perfilUsuario = document.getElementById("perfilUsuario");
    const perfilFecha = document.getElementById("perfilFecha");
    const perfilCorreo = document.getElementById("perfilCorreo");
    const perfilNombre = document.getElementById("perfilNombre");
    const perfilPedidos = document.getElementById("perfilPedidos");
    const perfilCarrito = document.getElementById("perfilCarrito");
    
    // Actualizar título con nombre del usuario
    if (perfilTitulo) {
      perfilTitulo.textContent = `👤 ${usuario.nombre || usuario.usuario}`;
    }
    
    // Actualizar información del usuario
    if (perfilUsuario) perfilUsuario.textContent = usuario.usuario;
    if (perfilNombre && usuario.nombre) perfilNombre.textContent = usuario.nombre;
    if (perfilFecha) perfilFecha.textContent = formatearFecha(usuario.fechaNacimiento);
    if (perfilCorreo) perfilCorreo.textContent = usuario.correo;
    
    // Mostrar número de pedidos si está disponible
    if (perfilPedidos) {
      if (usuario.pedidos && Array.isArray(usuario.pedidos)) {
        perfilPedidos.textContent = usuario.pedidos.length;
      } else {
        perfilPedidos.textContent = "0";
      }
    }
    
    // Mostrar items en carrito si está disponible
    if (perfilCarrito) {
      if (usuario.carrito && Array.isArray(usuario.carrito)) {
        const totalItems = usuario.carrito.reduce((total, item) => total + item.cantidad, 0);
        perfilCarrito.textContent = totalItems;
      } else {
        perfilCarrito.textContent = "0";
      }
    }
  }
}

// Función para formatear fecha
function formatearFecha(fechaString) {
  if (!fechaString) return "No especificada";
  
  try {
    const fecha = new Date(fechaString);
    if (isNaN(fecha.getTime())) {
      return fechaString;
    }
    
    // Formato: DD/MM/YYYY
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const año = fecha.getFullYear();
    
    return `${dia}/${mes}/${año}`;
  } catch (error) {
    return fechaString;
  }
}

// Cerrar sesión
function cerrarSesion() {
  localStorage.removeItem("usuarioActual");
  
  const perfilBox = document.getElementById("perfilBox");
  if (perfilBox) perfilBox.style.display = "none";
  
  // Ocultar el nombre en el header
  const nombreUsuarioHeader = document.getElementById("nombreUsuarioHeader");
  if (nombreUsuarioHeader) {
    nombreUsuarioHeader.style.display = "none";
    nombreUsuarioHeader.textContent = "";
  }
  
  // Mostrar notificación
  if (typeof mostrarNotificacion === 'function') {
    mostrarNotificacion("Sesión cerrada correctamente", "info");
  }
  
  // Redirigir a index después de 1 segundo
  setTimeout(() => {
    window.location.href = "index.html";
  }, 1000);
}

// Verificar si el usuario está logueado
function usuarioLogueado() {
  return localStorage.getItem("usuarioActual") !== null;
}

// Redirigir a login si no está logueado
function requerirLogin(mensaje = "Debes iniciar sesión para acceder a esta función.") {
  if (!usuarioLogueado()) {
    if (mensaje && typeof mostrarNotificacion === 'function') {
      mostrarNotificacion(mensaje, "warning");
    } else if (mensaje) {
      alert(mensaje);
    }
    localStorage.setItem("redirectAfterLogin", window.location.pathname.split("/").pop());
    window.location.href = "login.html";
    return false;
  }
  return true;
}

// Obtener usuario actual
function obtenerUsuarioActual() {
  const usuarioStr = localStorage.getItem("usuarioActual");
  if (usuarioStr) {
    try {
      return JSON.parse(usuarioStr);
    } catch (e) {
      console.error("Error al parsear usuario actual:", e);
      return null;
    }
  }
  return null;
}

// ===== FUNCIONALIDAD PARA BOTONES DE CÓMICS =====
function configurarBotonesComics() {
  // Botones "Ver detalles"
  document.querySelectorAll('.btn-detalles').forEach(button => {
    button.addEventListener('click', function() {
      const comicTitle = this.closest('.comic').querySelector('h3').textContent;
      if (typeof mostrarNotificacion === 'function') {
        mostrarNotificacion(`📖 Detalles de: ${comicTitle}`, "info");
      } else {
        alert(`📖 Detalles de: ${comicTitle}\n\nPróximamente disponible más información sobre este cómic.`);
      }
    });
  });

  // Botones "Agregar al carrito"
  document.querySelectorAll('.btn-carrito, .btn-comic').forEach(button => {
    button.addEventListener('click', function() {
      if (!requerirLogin("Debes iniciar sesión para agregar productos al carrito.")) return;
      
      const itemTitle = this.closest('.comic').querySelector('h3').textContent;
      
      // Obtener o crear carrito
      let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
      carrito.push({
        nombre: itemTitle,
        fecha: new Date().toISOString()
      });
      localStorage.setItem("carrito", JSON.stringify(carrito));
      
      if (typeof mostrarNotificacion === 'function') {
        mostrarNotificacion(`✅ ¡${itemTitle} agregado al carrito!`, "success");
      } else {
        alert(`✅ ¡${itemTitle} agregado al carrito!`);
      }
    });
  });
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  verificarSesion();
  configurarBotonesComics();
  cargarFuncionesUsuario();
});

// ===== FUNCIONALIDAD DE CARRITO SIMPLIFICADA =====
function agregarAlCarrito(productoNombre) {
  if (!requerirLogin("Debes iniciar sesión para agregar productos al carrito.")) return;
  
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  carrito.push({
    nombre: productoNombre,
    fecha: new Date().toISOString(),
    precio: 15
  });
  
  localStorage.setItem("carrito", JSON.stringify(carrito));
  mostrarNotificacion(`${productoNombre} agregado al carrito`);
}

// Función de notificación fallback
if (typeof mostrarNotificacion !== 'function') {
  function mostrarNotificacion(mensaje, tipo = "info") {
    const notificacion = document.createElement('div');
    const colores = {
      success: "#4CAF50",
      error: "#ff3b3b",
      warning: "#ff9800",
      info: "#2196F3"
    };
    
    notificacion.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colores[tipo] || colores.info};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: 'Poppins', sans-serif;
      animation: slideIn 0.3s ease;
    `;
    
    notificacion.textContent = `✅ ${mensaje}`;
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
      notificacion.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notificacion.remove(), 300);
    }, 3000);
  }
}

// Agregar animaciones CSS si no existen
if (!document.querySelector('#animations-style')) {
  const estiloNotificacion = document.createElement('style');
  estiloNotificacion.id = 'animations-style';
  estiloNotificacion.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
    
    .perfil-box {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    
    .perfil-contenido {
      background: white;
      padding: 30px;
      border-radius: 15px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      max-width: 400px;
      width: 90%;
      font-family: 'Poppins', sans-serif;
    }
    
    .perfil-contenido h2 {
      color: #ff3b3b;
      margin-top: 0;
      font-family: 'Bangers', cursive;
      font-size: 28px;
    }
    
    .perfil-contenido p {
      margin: 10px 0;
      font-size: 16px;
    }
    
    .perfil-contenido strong {
      color: #333;
    }
    
    .perfil-contenido button {
      background: #ff3b3b;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-family: 'Poppins', sans-serif;
      font-weight: bold;
      cursor: pointer;
      margin-top: 20px;
      width: 100%;
      transition: background 0.3s;
    }
    
    .perfil-contenido button:hover {
      background: #ff6b6b;
    }
  `;
  document.head.appendChild(estiloNotificacion);
}