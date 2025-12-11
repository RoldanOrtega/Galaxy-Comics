// ===== SISTEMA COMPLETO DE PROCESAMIENTO DE PAGO =====

document.addEventListener('DOMContentLoaded', function() {
    inicializarSistemaPago();
});

function inicializarSistemaPago() {
    const btnPagar = document.getElementById('btnPagar');
    if (btnPagar) {
        btnPagar.addEventListener('click', function(e) {
            e.preventDefault();
            if (!requerirLogin()) return;
            
            mostrarModalPago();
        });
    }
}

function mostrarModalPago() {
    const usuarioActual = obtenerUsuarioActual();
    if (!usuarioActual || !usuarioActual.carrito || usuarioActual.carrito.length === 0) {
        mostrarNotificacion("El carrito está vacío", "error");
        return;
    }

    // Calcular total
    const subtotal = calcularSubtotal();
    const envio = subtotal > 50 ? 0 : 4.99;
    const total = subtotal + envio;

    // Crear modal de pago
    const modalHTML = `
        <div id="modalPago" class="modal-pago">
            <div class="modal-contenido">
                <div class="modal-header">
                    <h3><i class="fas fa-credit-card"></i> Procesar Pago</h3>
                    <button id="cerrarModalPago">&times;</button>
                </div>

                <div class="modal-body">
                    <!-- Resumen de compra -->
                    <div class="resumen-compra-modal">
                        <h4><i class="fas fa-receipt"></i> Resumen de Compra</h4>
                        <div class="resumen-grid">
                            <div>
                                <p class="resumen-label">Subtotal:</p>
                                <p class="resumen-valor">$${subtotal.toFixed(2)}</p>
                            </div>
                            <div>
                                <p class="resumen-label">Envío:</p>
                                <p class="resumen-valor">${envio === 0 ? 'Gratis' : `$${envio.toFixed(2)}`}</p>
                            </div>
                        </div>
                        <div class="total-box">
                            <p>Total a pagar:</p>
                            <p class="total-valor">$${total.toFixed(2)}</p>
                        </div>
                    </div>

                    <!-- Formulario de pago -->
                    <div id="formularioPagoContainer">
                        <div class="metodo-pago-container">
                            <label class="metodo-pago-label">
                                <i class="fas fa-user"></i> Método de Pago
                            </label>
                            <div class="metodos-pago-grid">
                                <label class="metodo-pago-option" data-metodo="tarjeta">
                                    <input type="radio" name="metodoPago" value="tarjeta" checked>
                                    <div class="metodo-icon">
                                        <i class="fas fa-credit-card"></i>
                                    </div>
                                    <span class="metodo-texto">Tarjeta</span>
                                </label>
                                <label class="metodo-pago-option" data-metodo="paypal">
                                    <input type="radio" name="metodoPago" value="paypal">
                                    <div class="metodo-icon">
                                        <i class="fab fa-paypal"></i>
                                    </div>
                                    <span class="metodo-texto">PayPal</span>
                                </label>
                                <label class="metodo-pago-option" data-metodo="efectivo">
                                    <input type="radio" name="metodoPago" value="efectivo">
                                    <div class="metodo-icon">
                                        <i class="fas fa-money-bill-wave"></i>
                                    </div>
                                    <span class="metodo-texto">Efectivo</span>
                                </label>
                            </div>
                        </div>

                        <!-- Sección de tarjeta (visible por defecto) -->
                        <div id="seccionTarjeta" class="seccion-metodo seccion-activa">
                            <div class="form-group">
                                <label><i class="fas fa-credit-card"></i> Número de Tarjeta</label>
                                <input type="text" id="numeroTarjeta" placeholder="1234 5678 9012 3456" 
                                       maxlength="19" class="input-tarjeta">
                                <small class="input-hint">Puede ser cualquier número de 16 dígitos</small>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label><i class="fas fa-calendar"></i> Fecha Exp.</label>
                                    <input type="text" id="fechaExpiracion" placeholder="MM/AA" 
                                           maxlength="5" class="input-tarjeta">
                                </div>
                                <div class="form-group">
                                    <label><i class="fas fa-lock"></i> CVV</label>
                                    <input type="text" id="cvvTarjeta" placeholder="123" 
                                           maxlength="3" class="input-tarjeta">
                                </div>
                            </div>

                            <div class="form-group">
                                <label><i class="fas fa-user"></i> Nombre en Tarjeta</label>
                                <input type="text" id="nombreTarjeta" placeholder="Como aparece en la tarjeta" 
                                       class="input-tarjeta">
                            </div>
                        </div>

                        <!-- Sección PayPal (oculta por defecto) -->
                        <div id="seccionPayPal" class="seccion-metodo" style="display: none;">
                            <div class="paypal-info">
                                <div class="paypal-icon">
                                    <i class="fab fa-paypal fa-3x"></i>
                                </div>
                                <p>Serás redirigido a PayPal para completar el pago de manera segura.</p>
                                <p class="paypal-details">
                                    <strong>Ventajas de PayPal:</strong>
                                </p>
                                <ul class="paypal-benefits">
                                    <li><i class="fas fa-shield-alt"></i> Pago 100% seguro</li>
                                    <li><i class="fas fa-bolt"></i> Proceso rápido</li>
                                    <li><i class="fas fa-undo"></i> Reembolsos fáciles</li>
                                    <li><i class="fas fa-globe"></i> Aceptado internacionalmente</li>
                                </ul>
                                <div class="paypal-email">
                                    <label><i class="fas fa-envelope"></i> Email de PayPal</label>
                                    <input type="email" id="paypalEmail" placeholder="tu@email.com" 
                                           class="input-tarjeta">
                                </div>
                            </div>
                        </div>

                        <!-- Sección Efectivo (oculta por defecto) -->
                        <div id="seccionEfectivo" class="seccion-metodo" style="display: none;">
                            <div class="efectivo-info">
                                <div class="efectivo-icon">
                                    <i class="fas fa-store fa-3x"></i>
                                </div>
                                <h5>Pago en Efectivo</h5>
                                <p>Puedes pagar en cualquiera de nuestras tiendas físicas:</p>
                                
                                <div class="tiendas-list">
                                    <div class="tienda-item">
                                        <h6><i class="fas fa-map-marker-alt"></i> Galaxy Comics Central</h6>
                                        <p>Calle del Cómic 123, Ciudad Capital</p>
                                        <p><strong>Horario:</strong> 10:00 - 20:00 (Lunes a Sábado)</p>
                                    </div>
                                    <div class="tienda-item">
                                        <h6><i class="fas fa-map-marker-alt"></i> Galaxy Comics Norte</h6>
                                        <p>Avenida Superhéroes 456, Zona Norte</p>
                                        <p><strong>Horario:</strong> 11:00 - 19:00 (Martes a Domingo)</p>
                                    </div>
                                </div>
                                
                                <div class="instrucciones-efectivo">
                                    <h6><i class="fas fa-info-circle"></i> Instrucciones:</h6>
                                    <ol>
                                        <li>Guarda tu número de pedido: <strong id="pedidoPreview">GC-${Date.now().toString().substr(-6)}</strong></li>
                                        <li>Acude a cualquiera de nuestras tiendas</li>
                                        <li>Muestra el número de pedido al personal</li>
                                        <li>Realiza el pago en efectivo</li>
                                        <li>Recibirás tu pedido en 3-5 días hábiles</li>
                                    </ol>
                                </div>
                            </div>
                        </div>

                        <!-- Información de envío (siempre visible) -->
                        <div class="info-envio">
                            <h4><i class="fas fa-shipping-fast"></i> Información de Envío</h4>
                            
                            <div class="form-group">
                                <label><i class="fas fa-map-marker-alt"></i> Dirección</label>
                                <input type="text" id="direccionEnvio" 
                                       value="${usuarioActual.direccion || ''}" 
                                       placeholder="Calle, número, piso" 
                                       class="input-tarjeta" required>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label><i class="fas fa-city"></i> Ciudad</label>
                                    <input type="text" id="ciudadEnvio" 
                                           value="${usuarioActual.ciudad || ''}" 
                                           placeholder="Ciudad" 
                                           class="input-tarjeta" required>
                                </div>
                                <div class="form-group">
                                    <label><i class="fas fa-mail-bulk"></i> Código Postal</label>
                                    <input type="text" id="codigoPostal" 
                                           placeholder="CP" 
                                           class="input-tarjeta" required>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label><i class="fas fa-phone"></i> Teléfono de Contacto</label>
                                <input type="tel" id="telefonoContacto" 
                                       value="${usuarioActual.telefono || ''}" 
                                       placeholder="+34 123 456 789" 
                                       class="input-tarjeta" required>
                            </div>
                        </div>

                        <!-- Términos y condiciones -->
                        <div class="terminos-container">
                            <label class="terminos-label">
                                <input type="checkbox" id="aceptarTerminos" required>
                                <span>
                                    Acepto los <a href="#" class="terminos-link">términos y condiciones</a> 
                                    y la <a href="#" class="terminos-link">política de privacidad</a>
                                </span>
                            </label>
                        </div>

                        <!-- Botón según método de pago -->
                        <button type="button" id="confirmarPagoTarjetaBtn" class="btn-confirmar-pago tarjeta">
                            <i class="fas fa-lock"></i> Confirmar Pago con Tarjeta - $${total.toFixed(2)}
                        </button>
                        
                        <button type="button" id="procederPayPalBtn" class="btn-confirmar-pago paypal" style="display: none;">
                            <i class="fab fa-paypal"></i> Proceder a PayPal - $${total.toFixed(2)}
                        </button>
                        
                        <button type="button" id="confirmarEfectivoBtn" class="btn-confirmar-pago efectivo" style="display: none;">
                            <i class="fas fa-check"></i> Confirmar Pedido para Pago en Efectivo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Agregar modal al body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Configurar eventos del modal
    configurarModalPago();
}

function configurarModalPago() {
    const modal = document.getElementById('modalPago');
    const cerrarBtn = document.getElementById('cerrarModalPago');
    const btnTarjeta = document.getElementById('confirmarPagoTarjetaBtn');
    const btnPayPal = document.getElementById('procederPayPalBtn');
    const btnEfectivo = document.getElementById('confirmarEfectivoBtn');
    
    // Cerrar modal
    if (cerrarBtn) {
        cerrarBtn.addEventListener('click', function() {
            if (modal) modal.remove();
        });
    }
    
    // Cerrar al hacer clic fuera
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    // Formatear número de tarjeta
    const numeroTarjetaInput = document.getElementById('numeroTarjeta');
    if (numeroTarjetaInput) {
        numeroTarjetaInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            let formatted = '';
            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) formatted += ' ';
                formatted += value[i];
            }
            e.target.value = formatted.substring(0, 19);
        });
    }
    
    // Formatear fecha de expiración
    const fechaExpiracionInput = document.getElementById('fechaExpiracion');
    if (fechaExpiracionInput) {
        fechaExpiracionInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/[^0-9]/gi, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value.substring(0, 5);
        });
    }
    
    // Solo números para CVV y CP
    const cvvInput = document.getElementById('cvvTarjeta');
    const cpInput = document.getElementById('codigoPostal');
    
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/[^0-9]/gi, '');
        });
    }
    
    if (cpInput) {
        cpInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/[^0-9]/gi, '');
        });
    }
    
    // Cambiar método de pago
    document.querySelectorAll('input[name="metodoPago"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const metodo = this.value;
            
            // Actualizar botones activos
            document.querySelectorAll('.metodo-pago-option').forEach(label => {
                label.classList.remove('active');
            });
            this.closest('.metodo-pago-option').classList.add('active');
            
            // Mostrar/ocultar secciones
            document.querySelectorAll('.seccion-metodo').forEach(seccion => {
                seccion.style.display = 'none';
                seccion.classList.remove('seccion-activa');
            });
            
            const seccionId = `seccion${metodo.charAt(0).toUpperCase() + metodo.slice(1)}`;
            const seccion = document.getElementById(seccionId);
            if (seccion) {
                seccion.style.display = 'block';
                seccion.classList.add('seccion-activa');
            }
            
            // Mostrar/ocultar botones correspondientes
            if (btnTarjeta) btnTarjeta.style.display = metodo === 'tarjeta' ? 'block' : 'none';
            if (btnPayPal) btnPayPal.style.display = metodo === 'paypal' ? 'block' : 'none';
            if (btnEfectivo) btnEfectivo.style.display = metodo === 'efectivo' ? 'block' : 'none';
        });
        
        // Marcar el primero como activo
        if (radio.checked) {
            radio.closest('.metodo-pago-option').classList.add('active');
        }
    });
    
    // Configurar botón Tarjeta
    if (btnTarjeta) {
        btnTarjeta.addEventListener('click', function() {
            procesarPagoTarjeta();
        });
    }
    
    // Configurar botón PayPal
    if (btnPayPal) {
        btnPayPal.addEventListener('click', function() {
            procesarPagoPayPal();
        });
    }
    
    // Configurar botón Efectivo
    if (btnEfectivo) {
        btnEfectivo.addEventListener('click', function() {
            procesarPagoEfectivo();
        });
    }
}

function procesarPagoTarjeta() {
    const aceptarTerminos = document.getElementById('aceptarTerminos');
    const modal = document.getElementById('modalPago');
    
    // Validar términos y condiciones
    if (!aceptarTerminos || !aceptarTerminos.checked) {
        mostrarNotificacion("Debes aceptar los términos y condiciones", "error");
        return;
    }
    
    // Validar datos mínimos (pero no reales)
    const numeroTarjetaInput = document.getElementById('numeroTarjeta');
    const fechaExpiracionInput = document.getElementById('fechaExpiracion');
    const cvvInput = document.getElementById('cvvTarjeta');
    const nombreTarjetaInput = document.getElementById('nombreTarjeta');
    
    if (!numeroTarjetaInput || !fechaExpiracionInput || !cvvInput || !nombreTarjetaInput) {
        mostrarNotificacion("Error en el formulario de pago", "error");
        return;
    }
    
    const numeroTarjeta = numeroTarjetaInput.value.replace(/\s+/g, '');
    const fechaExpiracion = fechaExpiracionInput.value;
    const cvv = cvvInput.value;
    const nombreTarjeta = nombreTarjetaInput.value;
    
    // Validación básica (no real)
    if (numeroTarjeta.length < 16) {
        mostrarNotificacion("Ingresa un número de tarjeta válido (16 dígitos)", "error");
        return;
    }
    
    if (!/^\d{2}\/\d{2}$/.test(fechaExpiracion)) {
        mostrarNotificacion("Formato de fecha inválido (MM/AA)", "error");
        return;
    }
    
    if (cvv.length !== 3) {
        mostrarNotificacion("CVV debe tener 3 dígitos", "error");
        return;
    }
    
    if (!nombreTarjeta.trim()) {
        mostrarNotificacion("Ingresa el nombre como aparece en la tarjeta", "error");
        return;
    }
    
    // Validar dirección
    if (!validarDireccion()) return;
    
    // Deshabilitar botón y mostrar carga
    const confirmarBtn = document.getElementById('confirmarPagoTarjetaBtn');
    if (confirmarBtn) {
        confirmarBtn.disabled = true;
        confirmarBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando pago...';
    }
    
    // Simular procesamiento (2 segundos)
    setTimeout(() => {
        const datosPago = {
            metodo: 'tarjeta',
            numeroTarjeta: numeroTarjeta,
            fechaExpiracion: fechaExpiracion,
            nombreTarjeta: nombreTarjeta,
            ultimosDigitos: numeroTarjeta.substr(-4)
        };
        
        completarPago(datosPago);
        if (modal) modal.remove();
    }, 2000);
}

function procesarPagoPayPal() {
    const aceptarTerminos = document.getElementById('aceptarTerminos');
    const paypalEmail = document.getElementById('paypalEmail');
    
    if (!aceptarTerminos || !aceptarTerminos.checked) {
        mostrarNotificacion("Debes aceptar los términos y condiciones", "error");
        return;
    }
    
    if (!paypalEmail || !paypalEmail.value || !paypalEmail.value.includes('@')) {
        mostrarNotificacion("Ingresa un email de PayPal válido", "error");
        return;
    }
    
    if (!validarDireccion()) return;
    
    // Deshabilitar botón y mostrar carga
    const btnPayPal = document.getElementById('procederPayPalBtn');
    if (btnPayPal) {
        btnPayPal.disabled = true;
        btnPayPal.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Redirigiendo...';
    }
    
    // Guardar datos
    const datosPago = {
        metodo: 'paypal',
        paypalEmail: paypalEmail.value
    };
    
    // Mostrar pantalla de redirección a PayPal después de 1 segundo
    setTimeout(() => {
        mostrarRedireccionPayPal(datosPago);
    }, 1000);
}

function mostrarRedireccionPayPal(datosPago) {
    const modal = document.getElementById('modalPago');
    const total = calcularSubtotal() + (calcularSubtotal() > 50 ? 0 : 4.99);
    
    const redireccionHTML = `
        <div id="redireccionPayPal" class="modal-pago">
            <div class="modal-contenido">
                <div class="modal-header">
                    <h3><i class="fab fa-paypal"></i> Redirigiendo a PayPal</h3>
                </div>
                <div class="modal-body" style="text-align: center; padding: 40px;">
                    <div class="paypal-redireccion">
                        <div class="paypal-loader">
                            <i class="fab fa-paypal fa-4x" style="color: #003087; margin-bottom: 20px;"></i>
                            <div class="spinner-paypal"></div>
                        </div>
                        <h4 style="color: #003087; margin-bottom: 20px;">Procesando pago a través de PayPal</h4>
                        <p style="color: #666; margin-bottom: 15px;">
                            <strong>Importe:</strong> $${total.toFixed(2)}
                        </p>
                        <p style="color: #666; margin-bottom: 30px;">
                            <strong>Email:</strong> ${datosPago.paypalEmail}
                        </p>
                        <p style="color: #999; font-size: 14px;">
                            <i class="fas fa-shield-alt"></i> Tu pago está siendo procesado de manera segura
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    if (modal) modal.remove();
    document.body.insertAdjacentHTML('beforeend', redireccionHTML);
    
    // Simular redirección a PayPal (3 segundos)
    setTimeout(() => {
        const redireccionModal = document.getElementById('redireccionPayPal');
        if (redireccionModal) redireccionModal.remove();
        completarPago(datosPago);
    }, 3000);
}

function procesarPagoEfectivo() {
    const aceptarTerminos = document.getElementById('aceptarTerminos');
    
    if (!aceptarTerminos || !aceptarTerminos.checked) {
        mostrarNotificacion("Debes aceptar los términos y condiciones", "error");
        return;
    }
    
    if (!validarDireccion()) return;
    
    const datosPago = {
        metodo: 'efectivo',
        tiendaSeleccionada: 'Galaxy Comics Central'
    };
    
    mostrarConfirmacionEfectivo(datosPago);
}

function mostrarConfirmacionEfectivo(datosPago) {
    const modal = document.getElementById('modalPago');
    const pedidoId = `GC-${Date.now().toString().substr(-6)}`;
    
    const confirmacionHTML = `
        <div id="confirmacionEfectivo" class="modal-pago">
            <div class="modal-contenido">
                <div class="modal-header">
                    <h3><i class="fas fa-money-bill-wave"></i> Pedido para Pago en Efectivo</h3>
                </div>
                <div class="modal-body">
                    <div class="efectivo-confirmacion">
                        <div class="success-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <h4 style="color: #4CAF50; text-align: center; margin-bottom: 20px;">
                            ¡Pedido Reservado!
                        </h4>
                        
                        <div class="pedido-info">
                            <div class="info-item">
                                <span class="info-label">Número de Pedido:</span>
                                <span class="info-value">${pedidoId}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Total a Pagar:</span>
                                <span class="info-value">$${(calcularSubtotal() + (calcularSubtotal() > 50 ? 0 : 4.99)).toFixed(2)}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Tienda:</span>
                                <span class="info-value">${datosPago.tiendaSeleccionada}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Válido hasta:</span>
                                <span class="info-value">${new Date(Date.now() + 7*24*60*60*1000).toLocaleDateString()}</span>
                            </div>
                        </div>
                        
                        <div class="instrucciones-box">
                            <h5><i class="fas fa-list-ol"></i> Instrucciones:</h5>
                            <ol>
                                <li>Anota o toma captura del número de pedido</li>
                                <li>Acude a <strong>${datosPago.tiendaSeleccionada}</strong></li>
                                <li>Muestra el número de pedido al personal</li>
                                <li>Realiza el pago en efectivo</li>
                                <li>Recibirás tu pedido en 3-5 días hábiles</li>
                            </ol>
                        </div>
                        
                        <div class="acciones-efectivo">
                            <button id="imprimirPedido" class="btn-accion">
                                <i class="fas fa-print"></i> Imprimir Comprobante
                            </button>
                            <button id="enviarEmail" class="btn-accion">
                                <i class="fas fa-envelope"></i> Enviar por Email
                            </button>
                            <button id="finalizarEfectivo" class="btn-accion principal">
                                <i class="fas fa-check"></i> Finalizar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    if (modal) modal.remove();
    document.body.insertAdjacentHTML('beforeend', confirmacionHTML);
    
    // Configurar eventos
    const finalizarBtn = document.getElementById('finalizarEfectivo');
    const imprimirBtn = document.getElementById('imprimirPedido');
    const enviarEmailBtn = document.getElementById('enviarEmail');
    
    if (finalizarBtn) {
        finalizarBtn.addEventListener('click', function() {
            completarPago(datosPago);
            const confirmacionModal = document.getElementById('confirmacionEfectivo');
            if (confirmacionModal) confirmacionModal.remove();
        });
    }
    
    if (imprimirBtn) {
        imprimirBtn.addEventListener('click', function() {
            window.print();
        });
    }
    
    if (enviarEmailBtn) {
        enviarEmailBtn.addEventListener('click', function() {
            mostrarNotificacion("Comprobante enviado a tu email", "success");
        });
    }
}

function validarDireccion() {
    // Obtener elementos del DOM de forma segura
    const direccionElement = document.getElementById('direccionEnvio');
    const ciudadElement = document.getElementById('ciudadEnvio');
    const codigoPostalElement = document.getElementById('codigoPostal');
    const telefonoElement = document.getElementById('telefonoContacto');
    
    // Verificar que los elementos existen
    if (!direccionElement) {
        console.error("Elemento 'direccionEnvio' no encontrado");
        mostrarNotificacion("Error en el formulario de envío", "error");
        return false;
    }
    
    if (!ciudadElement) {
        console.error("Elemento 'ciudadEnvio' no encontrado");
        mostrarNotificacion("Error en el formulario de envío", "error");
        return false;
    }
    
    if (!codigoPostalElement) {
        console.error("Elemento 'codigoPostal' no encontrado");
        mostrarNotificacion("Error en el formulario de envío", "error");
        return false;
    }
    
    if (!telefonoElement) {
        console.error("Elemento 'telefonoContacto' no encontrado");
        mostrarNotificacion("Error en el formulario de envío", "error");
        return false;
    }
    
    const direccion = direccionElement.value.trim();
    const ciudad = ciudadElement.value.trim();
    const codigoPostal = codigoPostalElement.value.trim();
    const telefono = telefonoElement.value.trim();
    
    if (!direccion) {
        mostrarNotificacion("Ingresa la dirección de envío", "error");
        return false;
    }
    
    if (!ciudad) {
        mostrarNotificacion("Ingresa la ciudad", "error");
        return false;
    }
    
    if (!codigoPostal || codigoPostal.length < 4) {
        mostrarNotificacion("Código postal inválido (mínimo 4 dígitos)", "error");
        return false;
    }
    
    if (!telefono) {
        mostrarNotificacion("Ingresa un teléfono de contacto", "error");
        return false;
    }
    
    return true;
}

function completarPago(datosPago) {
    const usuarioActual = obtenerUsuarioActual();
    if (!usuarioActual || !usuarioActual.carrito || usuarioActual.carrito.length === 0) {
        mostrarNotificacion("Error: Carrito vacío", "error");
        return;
    }
    
    // Calcular totales
    const subtotal = calcularSubtotal();
    const envio = subtotal > 50 ? 0 : 4.99;
    const total = subtotal + envio;
    
    // Obtener datos del formulario de manera segura
    let direccion = '';
    let ciudad = '';
    let codigoPostal = '';
    let telefono = '';
    
    // Intentar obtener datos del modal actual o del DOM
    const direccionElement = document.getElementById('direccionEnvio');
    const ciudadElement = document.getElementById('ciudadEnvio');
    const codigoPostalElement = document.getElementById('codigoPostal');
    const telefonoElement = document.getElementById('telefonoContacto');
    
    if (direccionElement) direccion = direccionElement.value;
    if (ciudadElement) ciudad = ciudadElement.value;
    if (codigoPostalElement) codigoPostal = codigoPostalElement.value;
    if (telefonoElement) telefono = telefonoElement.value;
    
    // Si no se encontraron en el DOM actual, usar valores por defecto
    if (!direccion) direccion = usuarioActual.direccion || 'Dirección no especificada';
    if (!ciudad) ciudad = usuarioActual.ciudad || 'Ciudad no especificada';
    if (!codigoPostal) codigoPostal = '0000';
    if (!telefono) telefono = usuarioActual.telefono || 'No especificado';
    
    // Separar pedidos personalizados
    const pedidosPersonalizados = usuarioActual.carrito.filter(item => 
        item.tipo === 'pedido_personalizado' || item.productoId > 1000000
    );
    const productosNormales = usuarioActual.carrito.filter(item => 
        item.tipo !== 'pedido_personalizado' && item.productoId <= 1000000
    );
    
    // Crear pedido con todos los datos
    const pedidoId = Date.now();
    const pedido = {
        id: pedidoId,
        usuario: usuarioActual.usuario,
        items: productosNormales,
        pedidosPersonalizados: pedidosPersonalizados,
        total: total,
        subtotal: subtotal,
        envio: envio,
        fechaPedido: new Date().toISOString(),
        estado: datosPago.metodo === 'efectivo' ? 'pendiente_pago' : 'completado',
        metodoPago: datosPago.metodo,
        datosPago: datosPago,
        direccionEnvio: direccion,
        ciudadEnvio: ciudad,
        codigoPostal: codigoPostal,
        telefonoContacto: telefono,
        numeroSeguimiento: `GC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };
    
    // Guardar dirección en el perfil del usuario si se proporcionó
    if (direccion && ciudad && telefono) {
        guardarDireccionUsuario(direccion, ciudad, telefono);
    }
    
    // Guardar pedido en localStorage
    guardarPedido(pedido, pedidosPersonalizados);
    
    // Actualizar usuario (limpiar carrito)
    actualizarUsuarioDespuesPago(usuarioActual.usuario, pedido);
    
    // Mostrar confirmación
    mostrarConfirmacionPago(pedido, pedidosPersonalizados, datosPago.metodo);
    
    // Enviar notificación
    agregarNotificacion({
        usuario: usuarioActual.usuario,
        tipo: "compra_exitosa",
        mensaje: `¡Pedido #${pedido.id} procesado! Método: ${datosPago.metodo}`,
        fecha: new Date().toISOString(),
        leida: false,
        pedidoId: pedido.id
    });
    
    // Actualizar contadores
    actualizarContadorCarrito();
}

function guardarDireccionUsuario(direccion, ciudad, telefono) {
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const usuarioActual = obtenerUsuarioActual();
    if (!usuarioActual) return;
    
    const usuarioIndex = usuarios.findIndex(u => u.usuario === usuarioActual.usuario);
    
    if (usuarioIndex > -1) {
        usuarios[usuarioIndex].direccion = direccion;
        usuarios[usuarioIndex].ciudad = ciudad;
        usuarios[usuarioIndex].telefono = telefono;
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
        
        // Actualizar usuario actual
        usuarioActual.direccion = direccion;
        usuarioActual.ciudad = ciudad;
        usuarioActual.telefono = telefono;
        localStorage.setItem("usuarioActual", JSON.stringify(usuarioActual));
    }
}

function guardarPedido(pedido, pedidosPersonalizados) {
    // Actualizar pedidos personalizados
    if (pedidosPersonalizados.length > 0) {
        const pedidosGlobales = JSON.parse(localStorage.getItem("pedidosGlobales")) || [];
        pedidosPersonalizados.forEach(pedidoPersonalizado => {
            const pedidoIndex = pedidosGlobales.findIndex(p => p.id === pedidoPersonalizado.productoId);
            if (pedidoIndex > -1) {
                pedidosGlobales[pedidoIndex].estado = "pagado";
                pedidosGlobales[pedidoIndex].pedidoPrincipalId = pedido.id;
                pedidosGlobales[pedidoIndex].fechaPago = new Date().toISOString();
            }
        });
        localStorage.setItem("pedidosGlobales", JSON.stringify(pedidosGlobales));
    }
    
    // Guardar pedido en historial global
    const todosPedidos = JSON.parse(localStorage.getItem("todosPedidos")) || [];
    todosPedidos.push(pedido);
    localStorage.setItem("todosPedidos", JSON.stringify(todosPedidos));
}

function actualizarUsuarioDespuesPago(usuario, pedido) {
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const usuarioIndex = usuarios.findIndex(u => u.usuario === usuario);
    
    if (usuarioIndex > -1) {
        // Agregar pedido al historial
        if (!usuarios[usuarioIndex].pedidos) {
            usuarios[usuarioIndex].pedidos = [];
        }
        usuarios[usuarioIndex].pedidos.push(pedido);
        
        // Limpiar carrito
        usuarios[usuarioIndex].carrito = [];
        
        // Guardar cambios
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
        localStorage.setItem("usuarioActual", JSON.stringify(usuarios[usuarioIndex]));
    }
}

function mostrarConfirmacionPago(pedido, pedidosPersonalizados, metodoPago) {
    const carritoContenido = document.getElementById('carritoContenido');
    const carritoVacio = document.getElementById('carritoVacio');
    const resumenCompra = document.getElementById('resumenCompra');
    
    if (!carritoContenido) return;
    
    carritoContenido.innerHTML = '';
    if (carritoVacio) carritoVacio.style.display = 'none';
    if (resumenCompra) resumenCompra.style.display = 'none';
    
    const total = pedido.total;
    
    let confirmacionHTML = `
        <div style="text-align: center; padding: 40px 20px;">
            <div style="background: #4CAF50; color: white; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 40px;">
                <i class="fas fa-check"></i>
            </div>
            <h3 style="color: #4CAF50; margin-bottom: 20px; font-family: 'Bangers', cursive; font-size: 32px;">
                ¡${metodoPago === 'efectivo' ? 'Pedido Reservado' : 'Pago Completado'} Exitosamente!
            </h3>
            <p style="color: #666; margin-bottom: 10px; font-size: 18px;">
                Tu pedido <strong>#${pedido.id}</strong> ha sido ${metodoPago === 'efectivo' ? 'reservado' : 'procesado'}.
            </p>
            <p style="color: #666; margin-bottom: 10px;">
                ${metodoPago === 'efectivo' ? 'Total a pagar:' : 'Total pagado:'} 
                <strong style="color: #ff3b3b; font-size: 24px;">$${total.toFixed(2)}</strong>
            </p>
            <p style="color: #666; margin-bottom: 30px;">
                Número de seguimiento: <strong>${pedido.numeroSeguimiento}</strong>
            </p>
            
            <div style="background: #f8f9fa; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: left;">
                <h4 style="margin-top: 0; color: #1a1a2e; font-family: 'Poppins', sans-serif;">
                    <i class="fas fa-info-circle"></i> Detalles del Pedido
                </h4>
                <p style="color: #666; margin: 5px 0;">
                    <strong>Fecha:</strong> ${new Date(pedido.fechaPedido).toLocaleDateString()}
                </p>
                <p style="color: #666; margin: 5px 0;">
                    <strong>Método de pago:</strong> ${metodoPago.charAt(0).toUpperCase() + metodoPago.slice(1)}
                </p>
                <p style="color: #666; margin: 5px 0;">
                    <strong>Envío a:</strong> ${pedido.direccionEnvio}, ${pedido.ciudadEnvio}
                </p>
                <p style="color: #666; margin: 5px 0;">
                    <strong>Estado:</strong> 
                    <span style="color: ${metodoPago === 'efectivo' ? '#ff9800' : '#4CAF50'}; font-weight: bold;">
                        ${metodoPago === 'efectivo' ? 'Pendiente de pago' : 'En preparación'}
                    </span>
                </p>
                <p style="color: #666; margin: 5px 0;">
                    <strong>Tiempo estimado:</strong> 3-5 días hábiles
                </p>
            </div>
    `;
    
    // Información de pedidos personalizados
    if (pedidosPersonalizados.length > 0) {
        confirmacionHTML += `
            <div style="background: #fff8e1; border: 2px solid #ff9800; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: left;">
                <h4 style="color: #ff9800; margin-top: 0; margin-bottom: 15px; font-family: 'Poppins', sans-serif;">
                    <i class="fas fa-paint-brush"></i> Tus Pedidos Personalizados
                </h4>
                <p style="color: #666; font-size: 14px; margin-bottom: 15px;">
                    Hemos recibido ${pedidosPersonalizados.length} pedido(s) personalizado(s). 
                    Te contactaremos en 24-48 horas para coordinar los detalles creativos.
                </p>
                <div style="background: white; border-radius: 8px; padding: 15px;">
                    ${pedidosPersonalizados.map(p => `
                        <div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
                            <p style="margin: 0 0 5px 0; color: #333; font-weight: bold;">
                                ${p.titulo || 'Pedido Personalizado'}
                            </p>
                            <p style="margin: 0; color: #666; font-size: 13px;">
                                Personaje: ${p.detalles?.personaje || 'Personalizado'} | 
                                Estilo: ${p.detalles?.estilo || 'Estándar'}
                            </p>
                            <p style="margin: 5px 0 0 0; color: #ff9800; font-weight: bold;">
                                $${p.precio.toFixed(2)}
                            </p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Instrucciones especiales para efectivo
    if (metodoPago === 'efectivo') {
        confirmacionHTML += `
            <div style="background: #e8f5e9; border: 2px solid #4CAF50; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: left;">
                <h5 style="color: #2e7d32; margin-top: 0; margin-bottom: 15px; font-family: 'Poppins', sans-serif;">
                    <i class="fas fa-exclamation-circle"></i> Instrucciones para pago en efectivo
                </h5>
                <ol style="color: #2e7d32; padding-left: 20px; margin: 0;">
                    <li>Guarda el número de pedido: <strong>#${pedido.id}</strong></li>
                    <li>Acude a <strong>Galaxy Comics Central</strong></li>
                    <li>Muestra el número de pedido al personal</li>
                    <li>Realiza el pago en efectivo</li>
                    <li>Una vez pagado, tu pedido será procesado</li>
                </ol>
                <p style="color: #2e7d32; margin-top: 15px; font-size: 14px;">
                    <i class="fas fa-clock"></i> <strong>Válido hasta:</strong> ${new Date(Date.now() + 7*24*60*60*1000).toLocaleDateString()}
                </p>
            </div>
        `;
    }
    
    confirmacionHTML += `
            <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; margin-top: 30px;">
                <button onclick="window.location.href='index.html'" style="
                    padding: 12px 25px;
                    background: #2196F3;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-family: 'Poppins', sans-serif;
                    font-weight: 600;
                    transition: all 0.3s ease;
                ">
                    <i class="fas fa-home"></i> Ir al Inicio
                </button>
                
                <button onclick="window.location.href='Comics.html'" style="
                    padding: 12px 25px;
                    background: #ff3b3b;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-family: 'Poppins', sans-serif;
                    font-weight: 600;
                    transition: all 0.3s ease;
                ">
                    <i class="fas fa-shopping-cart"></i> Seguir Comprando
                </button>
                
                <button onclick="window.location.href='Pedidos.html'" style="
                    padding: 12px 25px;
                    background: #ff9800;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-family: 'Poppins', sans-serif;
                    font-weight: 600;
                    transition: all 0.3s ease;
                ">
                    <i class="fas fa-paint-brush"></i> Nuevo Pedido Personalizado
                </button>
            </div>
            
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
                <i class="fas fa-envelope"></i> Recibirás un correo de confirmación en breve.
            </p>
        </div>
    `;
    
    carritoContenido.innerHTML = confirmacionHTML;
}

// ===== FUNCIONES AUXILIARES =====

function calcularSubtotal() {
    const usuarioActual = obtenerUsuarioActual();
    if (!usuarioActual || !usuarioActual.carrito) return 0;
    
    return usuarioActual.carrito.reduce((total, item) => {
        return total + (item.precio * item.cantidad);
    }, 0);
}

function obtenerUsuarioActual() {
    const usuarioStr = localStorage.getItem("usuarioActual");
    return usuarioStr ? JSON.parse(usuarioStr) : null;
}

function requerirLogin(mensaje = "Debes iniciar sesión para realizar esta acción.") {
    if (!obtenerUsuarioActual()) {
        if (mensaje) mostrarNotificacion(mensaje, "error");
        localStorage.setItem("redirectAfterLogin", window.location.pathname.split("/").pop());
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);
        return false;
    }
    return true;
}

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

function agregarNotificacion(notificacion) {
    const notificaciones = JSON.parse(localStorage.getItem("notificaciones")) || [];
    notificacion.id = Date.now();
    notificaciones.push(notificacion);
    localStorage.setItem("notificaciones", JSON.stringify(notificaciones));
}

function actualizarContadorCarrito() {
    const usuarioActual = obtenerUsuarioActual();
    let totalItems = 0;
    
    if (usuarioActual && usuarioActual.carrito) {
        totalItems = usuarioActual.carrito.reduce((total, item) => total + item.cantidad, 0);
    }
    
    document.querySelectorAll('.carrito-contador').forEach(elemento => {
        elemento.textContent = totalItems;
        elemento.style.display = totalItems > 0 ? 'inline-block' : 'none';
    });
    
    return totalItems;
}

// Agregar estilos de animación si no existen
if (!document.querySelector('#animaciones-pago')) {
    const estiloAnimaciones = document.createElement('style');
    estiloAnimaciones.id = 'animaciones-pago';
    estiloAnimaciones.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideUp {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .spinner-paypal {
            width: 50px;
            height: 50px;
            border: 5px solid #f3f3f3;
            border-top: 5px solid #003087;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }
    `;
    document.head.appendChild(estiloAnimaciones);
}