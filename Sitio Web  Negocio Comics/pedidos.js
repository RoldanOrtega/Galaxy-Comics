// ===== FUNCIONALIDAD ESPECÍFICA PARA PEDIDOS PERSONALIZADOS =====

document.addEventListener('DOMContentLoaded', function() {
  // Configurar formulario de pedido personalizado
  const formularioPedido = document.getElementById('formularioPedido');
  
  if (formularioPedido) {
    formularioPedido.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Verificar si el usuario está logueado
      if (!requerirLogin("Debes iniciar sesión para realizar un pedido personalizado.")) {
        return;
      }
      
      // Obtener datos del formulario
      const tipoComic = document.getElementById('tipoComic').value;
      const personaje = document.getElementById('personaje').value;
      const estilo = document.getElementById('estilo').value;
      const formato = document.getElementById('formato').value;
      const cantidad = document.getElementById('cantidad').value;
      const descripcion = document.getElementById('descripcion').value;
      const fechaEntrega = document.getElementById('fechaEntrega').value;
      const precio = calcularPrecio(tipoComic, formato, cantidad);
      
      // Obtener usuario actual
      const usuario = obtenerUsuarioActual();
      
      // Crear objeto de pedido
      const pedido = {
        id: Date.now(),
        usuario: usuario.usuario,
        tipoComic: tipoComic,
        personaje: personaje,
        estilo: estilo,
        formato: formato,
        cantidad: parseInt(cantidad),
        descripcion: descripcion,
        fechaEntrega: fechaEntrega,
        precio: precio,
        fechaPedido: new Date().toISOString(),
        estado: "pendiente"
      };
      
      // Guardar pedido en localStorage
      guardarPedido(pedido);
      
      // Mostrar confirmación
      mostrarConfirmacionPedido(pedido);
      
      // Limpiar formulario
      formularioPedido.reset();
    });
  }
  
  // Configurar selector de personaje
  const selectorPersonaje = document.getElementById('personaje');
  if (selectorPersonaje) {
    cargarPersonajes();
  }
  
  // Calcular precio automáticamente
  const inputsPrecio = ['tipoComic', 'formato', 'cantidad'];
  inputsPrecio.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('change', actualizarPrecio);
    }
  });
});

// Cargar lista de personajes
function cargarPersonajes() {
  const personajes = [
    "Spider-Man", "Batman", "Superman", "Wonder Woman", "Iron Man", 
    "Hulk", "Thor", "Flash", "Wolverine", "Capitan América",
    "Aquaman", "Black Widow", "Doctor Strange", "Deadpool", "Harley Quinn",
    "Otro (especificar en descripción)"
  ];
  
  const selector = document.getElementById('personaje');
  personajes.forEach(personaje => {
    const option = document.createElement('option');
    option.value = personaje;
    option.textContent = personaje;
    selector.appendChild(option);
  });
}

// Calcular precio del pedido
function calcularPrecio(tipoComic, formato, cantidad) {
  let precioBase = 0;
  
  // Precio según tipo
  switch(tipoComic) {
    case 'portada':
      precioBase = 50;
      break;
    case 'historieta':
      precioBase = 100;
      break;
    case 'novela':
      precioBase = 150;
      break;
    default:
      precioBase = 100;
  }
  
  // Multiplicador por formato
  switch(formato) {
    case 'digital':
      precioBase *= 0.8;
      break;
    case 'fisico':
      precioBase *= 1.2;
      break;
    case 'premium':
      precioBase *= 2;
      break;
  }
  
  // Total por cantidad
  const total = precioBase * parseInt(cantidad || 1);
  return Math.round(total);
}

// Actualizar precio mostrado
function actualizarPrecio() {
  const tipoComic = document.getElementById('tipoComic').value;
  const formato = document.getElementById('formato').value;
  const cantidad = document.getElementById('cantidad').value;
  
  const precio = calcularPrecio(tipoComic, formato, cantidad);
  
  const precioElemento = document.getElementById('precioTotal');
  if (precioElemento) {
    precioElemento.textContent = `$${precio}`;
  }
}

// Guardar pedido en localStorage
function guardarPedido(pedido) {
  // Obtener pedidos del usuario
  const usuario = obtenerUsuarioActual();
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  
  // Encontrar usuario y agregar pedido
  const usuarioIndex = usuarios.findIndex(u => u.usuario === usuario.usuario);
  if (usuarioIndex !== -1) {
    if (!usuarios[usuarioIndex].pedidos) {
      usuarios[usuarioIndex].pedidos = [];
    }
    usuarios[usuarioIndex].pedidos.push(pedido);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
  }
  
  // También guardar en lista general de pedidos
  let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  pedidos.push(pedido);
  localStorage.setItem("pedidos", JSON.stringify(pedidos));
}

// Mostrar confirmación de pedido
function mostrarConfirmacionPedido(pedido) {
  const mensaje = `
    ✅ ¡Pedido realizado exitosamente!
    
    📋 Detalles de tu pedido:
    • ID: #${pedido.id}
    • Personaje: ${pedido.personaje}
    • Tipo: ${getTipoNombre(pedido.tipoComic)}
    • Formato: ${getFormatoNombre(pedido.formato)}
    • Cantidad: ${pedido.cantidad}
    • Precio total: $${pedido.precio}
    • Fecha estimada de entrega: ${pedido.fechaEntrega}
    
    📧 Te contactaremos pronto para confirmar los detalles.
    Puedes ver el estado de tu pedido en tu perfil.
  `;
  
  alert(mensaje);
}

// Funciones auxiliares para nombres
function getTipoNombre(tipo) {
  const tipos = {
    'portada': 'Portada Personalizada',
    'historieta': 'Historieta Corta',
    'novela': 'Novela Gráfica'
  };
  return tipos[tipo] || tipo;
}

function getFormatoNombre(formato) {
  const formatos = {
    'digital': 'Digital (PDF)',
    'fisico': 'Físico Estándar',
    'premium': 'Físico Premium'
  };
  return formatos[formato] || formato;
}