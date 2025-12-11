// archivo: historialPedidos.js

// Sistema de Historial de Pedidos Mejorado
document.addEventListener('DOMContentLoaded', function() {
  // Verificar que el usuario esté logueado
  const usuarioActual = obtenerUsuarioActual();
  if (!usuarioActual) {
    window.location.href = "login.html";
    return;
  }
  
  // Inicializar la página
  inicializarHistorialPedidos();
  
  // Configurar eventos
  configurarEventosHistorial();
});

// Función para obtener usuario actual
function obtenerUsuarioActual() {
  const usuarioStr = localStorage.getItem("usuarioActual");
  return usuarioStr ? JSON.parse(usuarioStr) : null;
}

// Inicializar historial de pedidos
function inicializarHistorialPedidos() {
  const usuarioActual = obtenerUsuarioActual();
  
  if (!usuarioActual) {
    console.error("Usuario no autenticado");
    return;
  }
  
  // SINCRONIZAR PEDIDOS: Asegurar que los pedidos globales estén en el usuario
  sincronizarPedidosUsuario(usuarioActual);
  
  // Cargar pedidos del usuario
  cargarPedidosUsuario();
  
  // Actualizar estadísticas
  actualizarEstadisticas();
}

// Sincronizar pedidos del usuario con la base de datos global
function sincronizarPedidosUsuario(usuarioActual) {
  console.log("Sincronizando pedidos para:", usuarioActual.usuario);
  
  // Obtener pedidos globales
  const pedidosGlobales = JSON.parse(localStorage.getItem("pedidosGlobales")) || [];
  
  // Filtrar pedidos de este usuario
  const pedidosUsuarioGlobal = pedidosGlobales.filter(pedido => 
    pedido.usuario === usuarioActual.usuario
  );
  
  // Obtener usuarios
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  const usuarioIndex = usuarios.findIndex(u => u.usuario === usuarioActual.usuario);
  
  if (usuarioIndex === -1) {
    console.error("Usuario no encontrado en la base de datos");
    return;
  }
  
  // Inicializar array de pedidos si no existe
  if (!usuarios[usuarioIndex].pedidos) {
    usuarios[usuarioIndex].pedidos = [];
  }
  
  // Agregar pedidos que no existan en el usuario
  let pedidosAgregados = 0;
  pedidosUsuarioGlobal.forEach(pedidoGlobal => {
    const existe = usuarios[usuarioIndex].pedidos.some(p => p.id === pedidoGlobal.id);
    if (!existe) {
      usuarios[usuarioIndex].pedidos.push(pedidoGlobal);
      pedidosAgregados++;
      console.log("Pedido sincronizado:", pedidoGlobal.id);
    }
  });
  
  // Guardar cambios
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  
  // Actualizar usuario actual
  localStorage.setItem("usuarioActual", JSON.stringify(usuarios[usuarioIndex]));
  
  if (pedidosAgregados > 0) {
    console.log(`Sincronizados ${pedidosAgregados} pedidos nuevos`);
  }
}

// Cargar pedidos del usuario
function cargarPedidosUsuario(filtro = 'todos') {
  const usuarioActual = obtenerUsuarioActual();
  if (!usuarioActual || !usuarioActual.pedidos) {
    mostrarMensajeSinPedidos();
    return;
  }
  
  // Ordenar pedidos por fecha (más reciente primero)
  const pedidosOrdenados = [...usuarioActual.pedidos].sort((a, b) => 
    new Date(b.fechaPedido) - new Date(a.fechaPedido)
  );
  
  // Aplicar filtro
  let pedidosFiltrados = pedidosOrdenados;
  if (filtro !== 'todos') {
    if (filtro === 'personalizados') {
      pedidosFiltrados = pedidosOrdenados.filter(p => p.tipo === 'personalizado' || p.personaje);
    } else {
      pedidosFiltrados = pedidosOrdenados.filter(p => p.estado === filtro);
    }
  }
  
  // Actualizar contador
  actualizarContadorPedidos(pedidosFiltrados.length);
  
  // Mostrar pedidos
  mostrarPedidos(pedidosFiltrados);
  
  // Mostrar/ocultar mensaje de no pedidos
  const pedidoVacio = document.getElementById('pedidoVacio');
  if (pedidoVacio) {
    pedidoVacio.style.display = pedidosFiltrados.length === 0 ? 'block' : 'none';
  }
  
  // Actualizar botones de filtro activos
  actualizarFiltrosActivos(filtro);
}

// Mostrar pedidos en la lista
function mostrarPedidos(pedidos) {
  const listaContainer = document.getElementById('listaPedidos');
  if (!listaContainer) return;
  
  // Limpiar lista (excepto el mensaje de vacío)
  const pedidoVacio = document.getElementById('pedidoVacio');
  listaContainer.innerHTML = '';
  if (pedidoVacio) {
    listaContainer.appendChild(pedidoVacio);
  }
  
  if (pedidos.length === 0) {
    mostrarMensajeFiltroVacio();
    return;
  }
  
  // Crear elementos para cada pedido
  pedidos.forEach(pedido => {
    const pedidoElemento = crearElementoPedido(pedido);
    listaContainer.appendChild(pedidoElemento);
  });
}

// Crear elemento HTML para un pedido
function crearElementoPedido(pedido) {
  const esPersonalizado = pedido.tipo === 'personalizado' || pedido.personaje;
  
  // Determinar icono y color según estado
  const estadoInfo = obtenerInfoEstado(pedido.estado);
  
  // Formatear fecha
  const fechaFormateada = new Date(pedido.fechaPedido).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Crear elemento
  const div = document.createElement('div');
  div.className = 'pedido-item';
  div.dataset.id = pedido.id;
  
  let contenidoHTML = '';
  
  if (esPersonalizado) {
    // PEDIDO PERSONALIZADO
    contenidoHTML = `
      <div class="pedido-header">
        <div class="pedido-info-basica">
          <h4>Pedido Personalizado #${pedido.id}</h4>
          <p class="pedido-fecha">
            <i class="fas fa-calendar-alt"></i> ${fechaFormateada}
          </p>
        </div>
        <div class="pedido-estado" style="background: ${estadoInfo.color};">
          <i class="${estadoInfo.icono}"></i> ${estadoInfo.texto}
        </div>
      </div>
      
      <div class="pedido-detalles">
        <div class="detalle-item">
          <i class="fas fa-user"></i>
          <span>Personaje: ${pedido.personaje || 'No especificado'}</span>
        </div>
        <div class="detalle-item">
          <i class="fas fa-paint-brush"></i>
          <span>Estilo: ${pedido.estilo || 'No especificado'}</span>
        </div>
        <div class="detalle-item">
          <i class="fas fa-print"></i>
          <span>Formato: ${pedido.formato || 'No especificado'}</span>
        </div>
        <div class="detalle-item">
          <i class="fas fa-truck"></i>
          <span>Entrega estimada: ${pedido.fechaEntrega ? new Date(pedido.fechaEntrega).toLocaleDateString() : 'Por confirmar'}</span>
        </div>
      </div>
      
      ${pedido.descripcion ? `
        <div style="margin: 15px 0; padding: 10px 15px; background: #f8f9fa; border-radius: 8px; border-left: 3px solid #ff3b3b;">
          <p style="margin: 0; font-size: 14px; color: #666;"><strong>Descripción:</strong> ${pedido.descripcion.substring(0, 150)}${pedido.descripcion.length > 150 ? '...' : ''}</p>
        </div>
      ` : ''}
      
      <div class="pedido-footer">
        <div class="pedido-total">
          <span class="total-label">Total:</span>
          <span class="total-valor">$${pedido.precio || 0}</span>
        </div>
        <div class="pedido-acciones">
          <button class="btn-ver-detalle" onclick="verDetallePedido(${pedido.id})">
            <i class="fas fa-eye"></i> Ver Detalles
          </button>
          ${pedido.numeroSeguimiento ? `
            <button class="btn-seguimiento" onclick="verSeguimientoPedido(${pedido.id})">
              <i class="fas fa-shipping-fast"></i> Seguimiento
            </button>
          ` : ''}
        </div>
      </div>
      
      <div class="pedido-personalizados-nota">
        <i class="fas fa-info-circle"></i> Este es un pedido personalizado. Te contactaremos pronto para confirmar detalles.
      </div>
    `;
  } else {
    // PEDIDO NORMAL
    const cantidadProductos = pedido.items ? pedido.items.reduce((total, item) => total + item.cantidad, 0) : 0;
    
    contenidoHTML = `
      <div class="pedido-header">
        <div class="pedido-info-basica">
          <h4>Pedido #${pedido.id}</h4>
          <p class="pedido-fecha">
            <i class="fas fa-calendar-alt"></i> ${fechaFormateada}
          </p>
        </div>
        <div class="pedido-estado" style="background: ${estadoInfo.color};">
          <i class="${estadoInfo.icono}"></i> ${estadoInfo.texto}
        </div>
      </div>
      
      <div class="pedido-detalles">
        <div class="detalle-item">
          <i class="fas fa-box"></i>
          <span>Productos: ${cantidadProductos}</span>
        </div>
        <div class="detalle-item">
          <i class="fas fa-credit-card"></i>
          <span>Método: ${pedido.metodoPago || 'No especificado'}</span>
        </div>
        <div class="detalle-item">
          <i class="fas fa-receipt"></i>
          <span>Transacción: ${pedido.numeroTransaccion || 'No disponible'}</span>
        </div>
        ${pedido.numeroSeguimiento ? `
          <div class="detalle-item">
            <i class="fas fa-barcode"></i>
            <span>Seguimiento: ${pedido.numeroSeguimiento}</span>
          </div>
        ` : ''}
      </div>
      
      ${pedido.items && pedido.items.length > 0 ? `
        <div style="margin: 15px 0;">
          <p style="margin: 0 0 8px 0; font-weight: 600; color: #333;">Productos incluidos:</p>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${pedido.items.slice(0, 3).map(item => `
              <span style="background: #e9ecef; padding: 4px 10px; border-radius: 15px; font-size: 12px; color: #666;">
                ${item.titulo} (x${item.cantidad})
              </span>
            `).join('')}
            ${pedido.items.length > 3 ? `
              <span style="background: #e9ecef; padding: 4px 10px; border-radius: 15px; font-size: 12px; color: #666;">
                +${pedido.items.length - 3} más
              </span>
            ` : ''}
          </div>
        </div>
      ` : ''}
      
      <div class="pedido-footer">
        <div class="pedido-total">
          <span class="total-label">Total:</span>
          <span class="total-valor">$${pedido.total || pedido.precio || 0}</span>
        </div>
        <div class="pedido-acciones">
          <button class="btn-ver-detalle" onclick="verDetallePedido(${pedido.id})">
            <i class="fas fa-eye"></i> Ver Detalles
          </button>
          ${pedido.numeroSeguimiento ? `
            <button class="btn-seguimiento" onclick="verSeguimientoPedido(${pedido.id})">
              <i class="fas fa-shipping-fast"></i> Seguimiento
            </button>
          ` : ''}
          ${pedido.estado === 'pendiente_pago' ? `
            <button class="btn-pagar-ahora" onclick="pagarPedido(${pedido.id})">
              <i class="fas fa-money-bill-wave"></i> Pagar Ahora
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }
  
  div.innerHTML = contenidoHTML;
  return div;
}

// Obtener información del estado
function obtenerInfoEstado(estado) {
  const estados = {
    'en_carrito': { texto: 'En Carrito', icono: 'fas fa-shopping-cart', color: '#ff9800' },
    'pendiente': { texto: 'Pendiente', icono: 'fas fa-clock', color: '#2196F3' },
    'pendiente_pago': { texto: 'Pago Pendiente', icono: 'fas fa-money-bill-wave', color: '#FFC107' },
    'procesando': { texto: 'Procesando', icono: 'fas fa-cog', color: '#9C27B0' },
    'enviado': { texto: 'Enviado', icono: 'fas fa-shipping-fast', color: '#00bcd4' },
    'completado': { texto: 'Completado', icono: 'fas fa-check-circle', color: '#4CAF50' },
    'entregado': { texto: 'Entregado', icono: 'fas fa-box-open', color: '#4CAF50' },
    'cancelado': { texto: 'Cancelado', icono: 'fas fa-times-circle', color: '#ff3b3b' }
  };
  
  return estados[estado] || { texto: estado, icono: 'fas fa-question-circle', color: '#666' };
}

// Actualizar estadísticas
function actualizarEstadisticas() {
  const usuarioActual = obtenerUsuarioActual();
  if (!usuarioActual || !usuarioActual.pedidos) return;
  
  const pedidos = usuarioActual.pedidos;
  
  const total = pedidos.length;
  const completados = pedidos.filter(p => p.estado === 'completado' || p.estado === 'entregado').length;
  const pendientes = pedidos.filter(p => p.estado === 'pendiente' || p.estado === 'pendiente_pago' || p.estado === 'procesando').length;
  const totalGastado = pedidos
    .filter(p => p.estado === 'completado' || p.estado === 'entregado')
    .reduce((sum, p) => sum + (p.precio || p.total || 0), 0);
  
  // Actualizar elementos DOM
  const elementos = {
    'totalPedidos': total,
    'pedidosCompletados': completados,
    'pedidosPendientes': pendientes,
    'totalGastado': `$${totalGastado}`
  };
  
  Object.keys(elementos).forEach(id => {
    const elemento = document.getElementById(id);
    if (elemento) {
      elemento.textContent = elementos[id];
    }
  });
}

// Actualizar contador de pedidos
function actualizarContadorPedidos(cantidad) {
  const pagInfo = document.getElementById('pagInfo');
  if (pagInfo) {
    pagInfo.textContent = `Mostrando ${cantidad} pedido${cantidad !== 1 ? 's' : ''}`;
  }
}

// Mostrar mensaje cuando no hay pedidos
function mostrarMensajeSinPedidos() {
  const listaContainer = document.getElementById('listaPedidos');
  if (!listaContainer) return;
  
  const mensajeHTML = `
    <div class="pedido-vacio">
      <i class="fas fa-box-open fa-3x"></i>
      <h3>No tienes pedidos aún</h3>
      <p>Realiza tu primera compra para ver tu historial aquí</p>
      <a href="Comics.html" class="btn-explorar">
        <i class="fas fa-rocket"></i> Explorar Cómics
      </a>
    </div>
  `;
  
  listaContainer.innerHTML = mensajeHTML;
}

// Mostrar mensaje cuando el filtro no devuelve resultados
function mostrarMensajeFiltroVacio() {
  const listaContainer = document.getElementById('listaPedidos');
  if (!listaContainer) return;
  
  const mensajeHTML = `
    <div class="pedido-vacio-filtro">
      <i class="fas fa-filter fa-3x"></i>
      <h3>No hay pedidos con ese filtro</h3>
      <p>Prueba con otro filtro o revisa todos tus pedidos</p>
    </div>
  `;
  
  listaContainer.insertAdjacentHTML('beforeend', mensajeHTML);
}

// Actualizar filtros activos
function actualizarFiltrosActivos(filtroActivo) {
  document.querySelectorAll('.filtro-btn').forEach(btn => {
    const filtro = btn.dataset.filtro;
    if (filtro === filtroActivo) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// Configurar eventos
function configurarEventosHistorial() {
  // Filtros
  document.querySelectorAll('.filtro-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const filtro = this.dataset.filtro;
      cargarPedidosUsuario(filtro);
    });
  });
  
  // Botón cerrar modal
  const cerrarModal = document.getElementById('cerrarModalDetalle');
  if (cerrarModal) {
    cerrarModal.addEventListener('click', function() {
      document.getElementById('modalDetallePedido').style.display = 'none';
    });
  }
  
  // Cerrar modal al hacer clic fuera
  const modal = document.getElementById('modalDetallePedido');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        this.style.display = 'none';
      }
    });
  }
}

// Ver detalles de un pedido
function verDetallePedido(pedidoId) {
  const usuarioActual = obtenerUsuarioActual();
  const pedido = usuarioActual.pedidos?.find(p => p.id === pedidoId);
  
  if (!pedido) {
    // Buscar en pedidos globales si no está en el usuario
    const pedidosGlobales = JSON.parse(localStorage.getItem("pedidosGlobales")) || [];
    const pedidoGlobal = pedidosGlobales.find(p => p.id === pedidoId && p.usuario === usuarioActual.usuario);
    
    if (!pedidoGlobal) {
      mostrarNotificacion("Pedido no encontrado", "error");
      return;
    }
    
    mostrarDetallesPedido(pedidoGlobal);
  } else {
    mostrarDetallesPedido(pedido);
  }
}

// Mostrar detalles del pedido en modal
function mostrarDetallesPedido(pedido) {
  const modalBody = document.getElementById('modalDetalleBody');
  if (!modalBody) return;
  
  const esPersonalizado = pedido.tipo === 'personalizado' || pedido.personaje;
  const estadoInfo = obtenerInfoEstado(pedido.estado);
  
  let detallesHTML = '';
  
  if (esPersonalizado) {
    detallesHTML = crearHTMLDetallesPersonalizado(pedido, estadoInfo);
  } else {
    detallesHTML = crearHTMLDetallesNormal(pedido, estadoInfo);
  }
  
  modalBody.innerHTML = detallesHTML;
  document.getElementById('modalDetallePedido').style.display = 'flex';
}

// Crear HTML para detalles de pedido personalizado
function crearHTMLDetallesPersonalizado(pedido, estadoInfo) {
  return `
    <div class="detalle-pedido">
      <div class="detalle-header">
        <div class="detalle-titulo">
          <h4>Pedido Personalizado #${pedido.id}</h4>
          <div class="detalle-fecha">${new Date(pedido.fechaPedido).toLocaleDateString()}</div>
        </div>
        <div class="detalle-estado estado-${pedido.estado}" style="background: ${estadoInfo.color}; color: white;">
          <i class="${estadoInfo.icono}"></i> ${estadoInfo.texto}
        </div>
      </div>
      
      <div class="detalle-info-grid">
        <div class="info-item">
          <h5><i class="fas fa-user"></i> Información del Pedido</h5>
          <p><strong>Personaje:</strong> ${pedido.personaje || 'No especificado'}</p>
          <p><strong>Estilo:</strong> ${pedido.estilo || 'No especificado'}</p>
          <p><strong>Formato:</strong> ${pedido.formato || 'No especificado'}</p>
          <p><strong>Cantidad:</strong> ${pedido.cantidad || 1}</p>
        </div>
        
        <div class="info-item">
          <h5><i class="fas fa-money-bill-wave"></i> Información de Pago</h5>
          <p><strong>Precio:</strong> $${pedido.precio || 0}</p>
          <p><strong>Método de pago:</strong> ${pedido.metodoPago || 'No especificado'}</p>
          <p><strong>Fecha entrega:</strong> ${pedido.fechaEntrega ? new Date(pedido.fechaEntrega).toLocaleDateString() : 'Por confirmar'}</p>
          ${pedido.numeroSeguimiento ? `<p><strong>Seguimiento:</strong> <span class="seguimiento-numero">${pedido.numeroSeguimiento}</span></p>` : ''}
        </div>
      </div>
      
      <div class="detalle-personalizados">
        <h5><i class="fas fa-edit"></i> Descripción de la Idea</h5>
        <div class="personalizados-lista">
          <div class="personalizado-item">
            <div class="personalizado-info">
              <p style="line-height: 1.6; color: #333; white-space: pre-wrap;">${pedido.descripcion || 'No hay descripción disponible.'}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="detalle-acciones">
        ${pedido.estado === 'pendiente_pago' ? `
          <button class="btn-pagar" onclick="pagarPedido(${pedido.id})">
            <i class="fas fa-money-bill-wave"></i> Pagar Ahora
          </button>
        ` : ''}
        <button class="btn-contactar" onclick="contactarSoporte(${pedido.id})">
          <i class="fas fa-headset"></i> Contactar Soporte
        </button>
      </div>
    </div>
  `;
}

// Crear HTML para detalles de pedido normal
function crearHTMLDetallesNormal(pedido, estadoInfo) {
  const itemsHTML = pedido.items && pedido.items.length > 0 ? 
    pedido.items.map(item => `
      <div class="producto-item">
        <div class="producto-info">
          <h6>${item.titulo || 'Producto'}</h6>
          <div class="producto-detalle">
            <span>Cantidad: ${item.cantidad || 1}</span>
            <span>Precio unitario: $${item.precio || 0}</span>
          </div>
        </div>
        <div class="producto-precio">$${(item.precio || 0) * (item.cantidad || 1)}</div>
      </div>
    `).join('') : '<p>No hay productos en este pedido</p>';
  
  return `
    <div class="detalle-pedido">
      <div class="detalle-header">
        <div class="detalle-titulo">
          <h4>Pedido #${pedido.id}</h4>
          <div class="detalle-fecha">${new Date(pedido.fechaPedido).toLocaleDateString()}</div>
        </div>
        <div class="detalle-estado estado-${pedido.estado}" style="background: ${estadoInfo.color}; color: white;">
          <i class="${estadoInfo.icono}"></i> ${estadoInfo.texto}
        </div>
      </div>
      
      <div class="detalle-info-grid">
        <div class="info-item">
          <h5><i class="fas fa-money-bill-wave"></i> Información de Pago</h5>
          <p><strong>Total:</strong> $${pedido.total || pedido.precio || 0}</p>
          <p><strong>Método de pago:</strong> ${pedido.metodoPago || 'No especificado'}</p>
          ${pedido.numeroSeguimiento ? `<p><strong>Seguimiento:</strong> <span class="seguimiento-numero">${pedido.numeroSeguimiento}</span></p>` : ''}
          ${pedido.numeroTransaccion ? `<p><strong>Transacción:</strong> ${pedido.numeroTransaccion}</p>` : ''}
        </div>
        
        <div class="info-item">
          <h5><i class="fas fa-info-circle"></i> Información del Pedido</h5>
          <p><strong>Productos:</strong> ${pedido.items ? pedido.items.length : 0}</p>
          <p><strong>Fecha del pedido:</strong> ${new Date(pedido.fechaPedido).toLocaleDateString()}</p>
        </div>
      </div>
      
      <div class="detalle-productos">
        <h5><i class="fas fa-box"></i> Productos del Pedido</h5>
        <div class="productos-lista">
          ${itemsHTML}
        </div>
      </div>
      
      <div class="detalle-resumen">
        <h5><i class="fas fa-calculator"></i> Resumen del Pedido</h5>
        <div class="resumen-grid">
          <div class="resumen-item">
            <span>Subtotal:</span>
            <span>$${pedido.total || pedido.precio || 0}</span>
          </div>
          <div class="resumen-item total">
            <span>TOTAL:</span>
            <span>$${pedido.total || pedido.precio || 0}</span>
          </div>
        </div>
      </div>
      
      <div class="detalle-acciones">
        ${pedido.estado === 'pendiente_pago' ? `
          <button class="btn-pagar" onclick="pagarPedido(${pedido.id})">
            <i class="fas fa-money-bill-wave"></i> Pagar Ahora
          </button>
        ` : ''}
        ${pedido.numeroSeguimiento ? `
          <button class="btn-imprimir" onclick="imprimirPedido(${pedido.id})">
            <i class="fas fa-print"></i> Imprimir
          </button>
        ` : ''}
        <button class="btn-contactar" onclick="contactarSoporte(${pedido.id})">
          <i class="fas fa-headset"></i> Contactar Soporte
        </button>
      </div>
    </div>
  `;
}

// Ver seguimiento de un pedido
function verSeguimientoPedido(pedidoId) {
  const usuarioActual = obtenerUsuarioActual();
  const pedido = usuarioActual.pedidos?.find(p => p.id === pedidoId);
  
  if (!pedido || !pedido.numeroSeguimiento) {
    mostrarNotificacion("Este pedido no tiene número de seguimiento", "error");
    return;
  }
  
  const modalBody = document.getElementById('modalDetalleBody');
  if (!modalBody) return;
  
  modalBody.innerHTML = crearHTMLSeguimiento(pedido);
  document.getElementById('modalDetallePedido').style.display = 'flex';
}

// Crear HTML para seguimiento
function crearHTMLSeguimiento(pedido) {
  return `
    <div class="seguimiento-pedido">
      <div class="seguimiento-header">
        <h4><i class="fas fa-shipping-fast"></i> Seguimiento del Pedido</h4>
        <p class="seguimiento-numero">Número de pedido: #${pedido.id}</p>
        <div class="codigo-seguimiento">${pedido.numeroSeguimiento}</div>
      </div>
      
      <div class="seguimiento-info">
        <div class="seguimiento-timeline">
          <h5><i class="fas fa-history"></i> Historial del Envío</h5>
          <div class="timeline">
            <div class="timeline-item completado">
              <div class="timeline-icon">
                <i class="fas fa-shopping-cart"></i>
              </div>
              <div class="timeline-content">
                <h6>Pedido Realizado</h6>
                <p>${new Date(pedido.fechaPedido).toLocaleDateString()}</p>
              </div>
              <div class="timeline-line"></div>
            </div>
            
            <div class="timeline-item completado">
              <div class="timeline-icon">
                <i class="fas fa-cog"></i>
              </div>
              <div class="timeline-content">
                <h6>Procesando</h6>
                <p>Preparando tu pedido</p>
              </div>
              <div class="timeline-line"></div>
            </div>
            
            <div class="timeline-item actual">
              <div class="timeline-icon">
                <i class="fas fa-box"></i>
              </div>
              <div class="timeline-content">
                <h6>En preparación</h6>
                <p>Tu pedido está siendo preparado para el envío</p>
              </div>
              <div class="timeline-line"></div>
            </div>
            
            <div class="timeline-item">
              <div class="timeline-icon">
                <i class="fas fa-shipping-fast"></i>
              </div>
              <div class="timeline-content">
                <h6>En camino</h6>
                <p>Tu pedido será enviado pronto</p>
              </div>
              <div class="timeline-line"></div>
            </div>
            
            <div class="timeline-item">
              <div class="timeline-icon">
                <i class="fas fa-home"></i>
              </div>
              <div class="timeline-content">
                <h6>Entregado</h6>
                <p>¡Tu pedido ha llegado!</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="seguimiento-estimado">
          <h5><i class="fas fa-calendar-check"></i> Entrega Estimada</h5>
          <p>Tu pedido llegará aproximadamente en:</p>
          <p class="fecha-estimada">
            <i class="fas fa-clock"></i> 
            ${pedido.fechaEntrega ? 
              new Date(pedido.fechaEntrega).toLocaleDateString() : 
              '5-7 días hábiles'
            }
          </p>
        </div>
      </div>
      
      <div class="seguimiento-acciones">
        <button class="btn-rastrear" onclick="rastrearEnvio('${pedido.numeroSeguimiento}')">
          <i class="fas fa-search"></i> Rastrear Envío
        </button>
        <button class="btn-notificar" onclick="activarNotificaciones(${pedido.id})">
          <i class="fas fa-bell"></i> Activar Notificaciones
        </button>
      </div>
      
      <div class="seguimiento-ayuda">
        <p><i class="fas fa-info-circle"></i> Si tienes problemas con el seguimiento, contacta a soporte.</p>
        <p>Teléfono: +34 900 123 456 | Email: soporte@galaxycomics.com</p>
      </div>
    </div>
  `;
}

// Funciones auxiliares
function pagarPedido(pedidoId) {
  mostrarNotificacion("Redirigiendo al proceso de pago...", "info");
  // Aquí iría la lógica para re-procesar el pago
  setTimeout(() => {
    mostrarNotificacion("Función de pago en desarrollo", "warning");
  }, 1000);
}

function contactarSoporte(pedidoId) {
  window.location.href = `mailto:soporte@galaxycomics.com?subject=Soporte Pedido #${pedidoId}`;
}

function rastrearEnvio(codigo) {
  window.open(`https://tracking.example.com/?code=${codigo}`, '_blank');
}

function activarNotificaciones(pedidoId) {
  mostrarNotificacion("Notificaciones activadas para este pedido", "success");
}

function imprimirPedido(pedidoId) {
  window.print();
}

// Función para mostrar notificaciones
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
  }, 3000);
}