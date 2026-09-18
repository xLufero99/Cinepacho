import './style.css';

const API_URL = 'https://www.cinepacho3.com/api';

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const usuario = {
        cedula: document.getElementById('cedula').value,
        nombre: document.getElementById('nombre').value,
        apellido: document.getElementById('apellido').value,
        email: document.getElementById('email').value,
        telefono: document.getElementById('telefono').value,
        direccion: document.getElementById('direccion').value,
        contrasena: document.getElementById('contrasena').value,
        rol: 'CLIENTE'
    };

    const msgDiv = document.getElementById('message');

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(usuario)
        });

        const data = await response.json();
        
        if (response.ok) {
            msgDiv.innerHTML = `<div class="success">✅ ¡Usuario ${data.nombre} registrado con éxito!</div>`;
            document.getElementById('registerForm').reset();
        } else {
            const errorMsg = data.message || (data.errors?.join(', ')) || 'Error al registrar';
            msgDiv.innerHTML = `<div class="error">❌ ${errorMsg}</div>`;
        }
    } catch (error) {
        msgDiv.innerHTML = `<div class="error">❌ Error de conexión: ${error.message}</div>`;
    }
});