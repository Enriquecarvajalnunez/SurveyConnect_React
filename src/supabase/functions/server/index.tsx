import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Initialize sample data if needed
async function initializeData() {
  const empresas = await kv.get('empresas');
  if (!empresas) {
    // Create sample companies
    await kv.set('empresas', JSON.stringify([
      {
        empresaID: 1,
        nombre: 'TechCorp Solutions',
        nit: '900123456-7',
        fechaRegistro: '2024-01-15T10:00:00',
      },
      {
        empresaID: 2,
        nombre: 'Innovatech Group',
        nit: '900234567-8',
        fechaRegistro: '2024-03-20T14:30:00',
      },
      {
        empresaID: 3,
        nombre: 'Global Services S.A.',
        nit: '900345678-9',
        fechaRegistro: '2024-06-10T09:15:00',
      },
    ]));

    // Create sample users
    await kv.set('usuarios', JSON.stringify([
      {
        usuarioID: 1,
        empresaID: 1,
        email: 'admin@empresa.com',
        passwordHash: 'demo123',
        nombre: 'Carlos',
        apellido: 'Rodríguez',
        rol: 'Admin',
        estado: 'Activo',
        fechaCreacion: '2024-01-15T10:00:00',
      },
      {
        usuarioID: 2,
        empresaID: 1,
        email: 'creador@empresa.com',
        passwordHash: 'demo123',
        nombre: 'María',
        apellido: 'González',
        rol: 'Creador',
        estado: 'Activo',
        fechaCreacion: '2024-01-16T10:00:00',
      },
      {
        usuarioID: 3,
        empresaID: 1,
        email: 'analista@empresa.com',
        passwordHash: 'demo123',
        nombre: 'Juan',
        apellido: 'Martínez',
        rol: 'Analista',
        estado: 'Activo',
        fechaCreacion: '2024-01-17T10:00:00',
      },
    ]));

    // Create sample question types
    await kv.set('tipos_pregunta', JSON.stringify([
      { tipoPreguntaID: 1, nombreTipo: 'Texto Corto' },
      { tipoPreguntaID: 2, nombreTipo: 'Párrafo' },
      { tipoPreguntaID: 3, nombreTipo: 'Opción Multiple' },
      { tipoPreguntaID: 4, nombreTipo: 'Casillas de Verificación' },
      { tipoPreguntaID: 5, nombreTipo: 'Escala Lineal' },
      { tipoPreguntaID: 6, nombreTipo: 'Fecha' },
    ]));

    // Initialize counters
    await kv.set('counter:empresa', '3');
    await kv.set('counter:usuario', '3');
    await kv.set('counter:encuesta', '0');
    await kv.set('counter:pregunta', '0');
    await kv.set('counter:opcion', '0');
    await kv.set('counter:encuesta_respondida', '0');
    await kv.set('counter:respuesta_usuario', '0');
  }
}

// Initialize data on startup
await initializeData();

// ============= EMPRESAS =============

app.get('/make-server-b22bc260/empresas', async (c) => {
  try {
    const empresasJson = await kv.get('empresas');
    const empresas = empresasJson ? JSON.parse(empresasJson) : [];
    return c.json({ success: true, data: empresas });
  } catch (error) {
    console.log('Error getting empresas:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post('/make-server-b22bc260/empresas', async (c) => {
  try {
    const body = await c.req.json();
    const { nombre, nit } = body;

    if (!nombre || !nit) {
      return c.json({ success: false, error: 'Nombre y NIT son requeridos' }, 400);
    }

    const empresasJson = await kv.get('empresas');
    const empresas = empresasJson ? JSON.parse(empresasJson) : [];

    // Check if NIT already exists
    if (empresas.some((e: any) => e.nit === nit)) {
      return c.json({ success: false, error: 'El NIT ya existe' }, 400);
    }

    const counterStr = await kv.get('counter:empresa');
    const counter = counterStr ? parseInt(counterStr) : 0;
    const newID = counter + 1;

    const newEmpresa = {
      empresaID: newID,
      nombre,
      nit,
      fechaRegistro: new Date().toISOString(),
    };

    empresas.push(newEmpresa);
    await kv.set('empresas', JSON.stringify(empresas));
    await kv.set('counter:empresa', String(newID));

    return c.json({ success: true, data: newEmpresa });
  } catch (error) {
    console.log('Error creating empresa:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put('/make-server-b22bc260/empresas/:id', async (c) => {
  try {
    const empresaID = parseInt(c.req.param('id'));
    const body = await c.req.json();
    const { nombre, nit } = body;

    const empresasJson = await kv.get('empresas');
    const empresas = empresasJson ? JSON.parse(empresasJson) : [];

    const index = empresas.findIndex((e: any) => e.empresaID === empresaID);
    if (index === -1) {
      return c.json({ success: false, error: 'Empresa no encontrada' }, 404);
    }

    // Check if NIT already exists (excluding current empresa)
    if (empresas.some((e: any) => e.nit === nit && e.empresaID !== empresaID)) {
      return c.json({ success: false, error: 'El NIT ya existe' }, 400);
    }

    empresas[index] = { ...empresas[index], nombre, nit };
    await kv.set('empresas', JSON.stringify(empresas));

    return c.json({ success: true, data: empresas[index] });
  } catch (error) {
    console.log('Error updating empresa:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete('/make-server-b22bc260/empresas/:id', async (c) => {
  try {
    const empresaID = parseInt(c.req.param('id'));

    // Check if empresa has users
    const usuariosJson = await kv.get('usuarios');
    const usuarios = usuariosJson ? JSON.parse(usuariosJson) : [];
    const hasUsers = usuarios.some((u: any) => u.empresaID === empresaID);

    if (hasUsers) {
      return c.json({ success: false, error: 'No se puede eliminar una empresa con usuarios asociados' }, 400);
    }

    const empresasJson = await kv.get('empresas');
    const empresas = empresasJson ? JSON.parse(empresasJson) : [];

    const filtered = empresas.filter((e: any) => e.empresaID !== empresaID);
    await kv.set('empresas', JSON.stringify(filtered));

    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting empresa:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============= USUARIOS =============

app.post('/make-server-b22bc260/auth/login', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    const usuariosJson = await kv.get('usuarios');
    const usuarios = usuariosJson ? JSON.parse(usuariosJson) : [];

    const user = usuarios.find((u: any) => u.email === email && u.passwordHash === password);

    if (!user) {
      return c.json({ success: false, error: 'Credenciales inválidas' }, 401);
    }

    if (user.estado !== 'Activo') {
      return c.json({ success: false, error: 'Usuario inactivo' }, 403);
    }

    // Get empresa name
    const empresasJson = await kv.get('empresas');
    const empresas = empresasJson ? JSON.parse(empresasJson) : [];
    const empresa = empresas.find((e: any) => e.empresaID === user.empresaID);

    const userData = {
      usuarioID: user.usuarioID,
      empresaID: user.empresaID,
      empresaNombre: empresa?.nombre,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      rol: user.rol,
      estado: user.estado,
    };

    return c.json({ success: true, data: userData });
  } catch (error) {
    console.log('Error during login:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.get('/make-server-b22bc260/usuarios', async (c) => {
  try {
    const usuariosJson = await kv.get('usuarios');
    const usuarios = usuariosJson ? JSON.parse(usuariosJson) : [];

    const empresasJson = await kv.get('empresas');
    const empresas = empresasJson ? JSON.parse(empresasJson) : [];

    // Add empresa name to each user
    const usuariosWithEmpresa = usuarios.map((u: any) => {
      const empresa = empresas.find((e: any) => e.empresaID === u.empresaID);
      return {
        usuarioID: u.usuarioID,
        empresaID: u.empresaID,
        empresaNombre: empresa?.nombre,
        email: u.email,
        nombre: u.nombre,
        apellido: u.apellido,
        rol: u.rol,
        estado: u.estado,
      };
    });

    return c.json({ success: true, data: usuariosWithEmpresa });
  } catch (error) {
    console.log('Error getting usuarios:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post('/make-server-b22bc260/usuarios', async (c) => {
  try {
    const body = await c.req.json();
    const { empresaID, email, nombre, apellido, rol, estado } = body;

    if (!empresaID || !email || !nombre || !apellido || !rol || !estado) {
      return c.json({ success: false, error: 'Todos los campos son requeridos' }, 400);
    }

    const usuariosJson = await kv.get('usuarios');
    const usuarios = usuariosJson ? JSON.parse(usuariosJson) : [];

    // Check if email already exists
    if (usuarios.some((u: any) => u.email === email)) {
      return c.json({ success: false, error: 'El email ya existe' }, 400);
    }

    const counterStr = await kv.get('counter:usuario');
    const counter = counterStr ? parseInt(counterStr) : 0;
    const newID = counter + 1;

    const newUsuario = {
      usuarioID: newID,
      empresaID,
      email,
      passwordHash: 'demo123', // Default password
      nombre,
      apellido,
      rol,
      estado,
      fechaCreacion: new Date().toISOString(),
    };

    usuarios.push(newUsuario);
    await kv.set('usuarios', JSON.stringify(usuarios));
    await kv.set('counter:usuario', String(newID));

    // Get empresa name
    const empresasJson = await kv.get('empresas');
    const empresas = empresasJson ? JSON.parse(empresasJson) : [];
    const empresa = empresas.find((e: any) => e.empresaID === empresaID);

    const userData = {
      usuarioID: newUsuario.usuarioID,
      empresaID: newUsuario.empresaID,
      empresaNombre: empresa?.nombre,
      email: newUsuario.email,
      nombre: newUsuario.nombre,
      apellido: newUsuario.apellido,
      rol: newUsuario.rol,
      estado: newUsuario.estado,
    };

    return c.json({ success: true, data: userData });
  } catch (error) {
    console.log('Error creating usuario:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put('/make-server-b22bc260/usuarios/:id', async (c) => {
  try {
    const usuarioID = parseInt(c.req.param('id'));
    const body = await c.req.json();
    const { empresaID, email, nombre, apellido, rol, estado } = body;

    const usuariosJson = await kv.get('usuarios');
    const usuarios = usuariosJson ? JSON.parse(usuariosJson) : [];

    const index = usuarios.findIndex((u: any) => u.usuarioID === usuarioID);
    if (index === -1) {
      return c.json({ success: false, error: 'Usuario no encontrado' }, 404);
    }

    // Check if email already exists (excluding current user)
    if (usuarios.some((u: any) => u.email === email && u.usuarioID !== usuarioID)) {
      return c.json({ success: false, error: 'El email ya existe' }, 400);
    }

    usuarios[index] = { 
      ...usuarios[index], 
      empresaID, 
      email, 
      nombre, 
      apellido, 
      rol, 
      estado 
    };
    await kv.set('usuarios', JSON.stringify(usuarios));

    // Get empresa name
    const empresasJson = await kv.get('empresas');
    const empresas = empresasJson ? JSON.parse(empresasJson) : [];
    const empresa = empresas.find((e: any) => e.empresaID === empresaID);

    const userData = {
      usuarioID: usuarios[index].usuarioID,
      empresaID: usuarios[index].empresaID,
      empresaNombre: empresa?.nombre,
      email: usuarios[index].email,
      nombre: usuarios[index].nombre,
      apellido: usuarios[index].apellido,
      rol: usuarios[index].rol,
      estado: usuarios[index].estado,
    };

    return c.json({ success: true, data: userData });
  } catch (error) {
    console.log('Error updating usuario:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============= ENCUESTAS =============

app.get('/make-server-b22bc260/encuestas', async (c) => {
  try {
    const encuestasWithData = await kv.getByPrefix('encuesta:');
    const encuestas = encuestasWithData.map((item: any) => JSON.parse(item.value));
    return c.json({ success: true, data: encuestas });
  } catch (error) {
    console.log('Error getting encuestas:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post('/make-server-b22bc260/encuestas', async (c) => {
  try {
    const body = await c.req.json();
    const { 
      empresaID, 
      usuarioCreadorID, 
      titulo, 
      descripcion, 
      fechaInicioVigencia, 
      fechaFinVigencia, 
      estado, 
      preguntas 
    } = body;

    if (!empresaID || !usuarioCreadorID || !titulo) {
      return c.json({ success: false, error: 'Campos requeridos faltantes' }, 400);
    }

    const counterStr = await kv.get('counter:encuesta');
    const counter = counterStr ? parseInt(counterStr) : 0;
    const newID = counter + 1;

    // Generate short link
    const enlaceCorto = `enc-${newID}`;

    const newEncuesta = {
      encuestaID: newID,
      empresaID,
      usuarioCreadorID,
      titulo,
      descripcion: descripcion || '',
      fechaCreacion: new Date().toISOString(),
      fechaInicioVigencia: fechaInicioVigencia || '',
      fechaFinVigencia: fechaFinVigencia || '',
      estado: estado || 'Borrador',
      enlaceLargo: `https://encuestas.empresa.com/${enlaceCorto}`,
      enlaceCorto,
      preguntas: preguntas || [],
    };

    await kv.set(`encuesta:${newID}`, JSON.stringify(newEncuesta));
    await kv.set('counter:encuesta', String(newID));

    return c.json({ success: true, data: newEncuesta });
  } catch (error) {
    console.log('Error creating encuesta:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put('/make-server-b22bc260/encuestas/:id', async (c) => {
  try {
    const encuestaID = parseInt(c.req.param('id'));
    const body = await c.req.json();

    const encuestaJson = await kv.get(`encuesta:${encuestaID}`);
    if (!encuestaJson) {
      return c.json({ success: false, error: 'Encuesta no encontrada' }, 404);
    }

    const encuesta = JSON.parse(encuestaJson);
    const updatedEncuesta = { ...encuesta, ...body };

    await kv.set(`encuesta:${encuestaID}`, JSON.stringify(updatedEncuesta));

    return c.json({ success: true, data: updatedEncuesta });
  } catch (error) {
    console.log('Error updating encuesta:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.get('/make-server-b22bc260/encuestas/:id', async (c) => {
  try {
    const encuestaID = parseInt(c.req.param('id'));
    const encuestaJson = await kv.get(`encuesta:${encuestaID}`);
    
    if (!encuestaJson) {
      return c.json({ success: false, error: 'Encuesta no encontrada' }, 404);
    }

    const encuesta = JSON.parse(encuestaJson);
    return c.json({ success: true, data: encuesta });
  } catch (error) {
    console.log('Error getting encuesta:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============= RESPUESTAS =============

app.post('/make-server-b22bc260/respuestas', async (c) => {
  try {
    const body = await c.req.json();
    const { encuestaID, identificadorUsuario, respuestas } = body;

    if (!encuestaID || !respuestas) {
      return c.json({ success: false, error: 'Datos requeridos faltantes' }, 400);
    }

    const counterStr = await kv.get('counter:encuesta_respondida');
    const counter = counterStr ? parseInt(counterStr) : 0;
    const newID = counter + 1;

    const encuestaRespondida = {
      encuestaRespondidaID: newID,
      encuestaID,
      fechaRespuesta: new Date().toISOString(),
      identificadorUsuario: identificadorUsuario || null,
      respuestas,
    };

    await kv.set(`encuesta_respondida:${newID}`, JSON.stringify(encuestaRespondida));
    await kv.set('counter:encuesta_respondida', String(newID));

    return c.json({ success: true, data: encuestaRespondida });
  } catch (error) {
    console.log('Error saving respuestas:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.get('/make-server-b22bc260/respuestas/encuesta/:id', async (c) => {
  try {
    const encuestaID = parseInt(c.req.param('id'));
    const respuestasWithData = await kv.getByPrefix('encuesta_respondida:');
    const allRespuestas = respuestasWithData.map((item: any) => JSON.parse(item.value));
    const respuestas = allRespuestas.filter((r: any) => r.encuestaID === encuestaID);

    return c.json({ success: true, data: respuestas });
  } catch (error) {
    console.log('Error getting respuestas:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);
