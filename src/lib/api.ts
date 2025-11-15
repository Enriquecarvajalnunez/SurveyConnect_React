import { supabase } from "../utils/supabaseClient";
import type { Company } from "../App";

// ============= AUTH (LOGIN REAL) =============

export async function login(email: string, password: string) {
  // Buscar usuario por email
  const { data, error } = await supabase
    .from("usuario")
    .select(`
      usuarioid,
      empresaid,
      email,
      passwordhash,
      nombre,
      apellido,
      rol,
      estado,
      fechacreacion
    `)
    .eq("email", email)
    .single();

  if (error) throw new Error("Usuario no encontrado");

  // ⚠️ Comparación temporal SIN hash — luego la reemplazamos
  if (data.passwordhash !== password) {
    throw new Error("Contraseña incorrecta");
  }

  // Mapeamos a la estructura que React espera
  return {
    usuarioID: data.usuarioid,
    empresaID: data.empresaid,
    email: data.email,
    nombre: data.nombre,
    apellido: data.apellido,
    rol: data.rol,
    estado: data.estado,
    fechaCreacion: data.fechacreacion,
  };
}


// ============= EMPRESAS =============

// GET ALL
export async function getEmpresas(): Promise<Company[]> {
  const { data, error } = await supabase
    .from("empresa")
    .select(`
      empresaid,
      nombre,
      nit,
      fecharegistro
    `)
    .order("empresaid");

  if (error) throw error;

  // convertimos nombres de columnas a formato usado en React
  return data.map(e => ({
    empresaID: e.empresaid,
    nombre: e.nombre,
    nit: e.nit,
    fechaRegistro: e.fecharegistro
  }));
}

// CREATE
export async function createEmpresa(nombre: string, nit: string): Promise<Company> {
  const { data, error } = await supabase
    .from("empresa")
    .insert([{ nombre, nit }])
    .select(`
      empresaid,
      nombre,
      nit,
      fecharegistro
    `)
    .single();

  if (error) throw error;

  return {
    empresaID: data.empresaid,
    nombre: data.nombre,
    nit: data.nit,
    fechaRegistro: data.fecharegistro
  };
}

// UPDATE
export async function updateEmpresa(empresaID: number, nombre: string, nit: string): Promise<Company> {
  const { data, error } = await supabase
    .from("empresa")
    .update({ nombre, nit })
    .eq("empresaid", empresaID)
    .select(`
      empresaid,
      nombre,
      nit,
      fecharegistro
    `)
    .single();

  if (error) throw error;

  return {
    empresaID: data.empresaid,
    nombre: data.nombre,
    nit: data.nit,
    fechaRegistro: data.fecharegistro
  };
}

// DELETE
export async function deleteEmpresa(empresaID: number): Promise<void> {
  const { error } = await supabase
    .from("empresa")
    .delete()
    .eq("empresaid", empresaID);

  if (error) throw error;
}


// ============= USUARIOS =============
export async function getUsuarios() {
  const { data, error } = await supabase
    .from("usuario")
    .select(`
      usuarioid,
      empresaid,
      email,
      nombre,
      apellido,
      rol,
      estado,
      fechacreacion
    `)
    .order("usuarioid");

  if (error) throw error;

  return data.map(u => ({
    usuarioID: u.usuarioid,
    empresaID: u.empresaid,
    email: u.email,
    nombre: u.nombre,
    apellido: u.apellido,
    rol: u.rol,
    estado: u.estado,
    fechaCreacion: u.fechacreacion,
  }));
}

export async function createUsuario(
  empresaID: number,
  email: string,
  nombre: string,
  apellido: string,
  rol: 'Admin' | 'Creador' | 'Analista',
  estado: 'Activo' | 'Inactivo'
): Promise<User> {
  const response = await fetch(`${API_URL}/usuarios`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ empresaID, email, nombre, apellido, rol, estado }),
  });

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Error al crear usuario');
  }

  return result.data;
}

export async function updateUsuario(
  usuarioID: number,
  empresaID: number,
  email: string,
  nombre: string,
  apellido: string,
  rol: 'Admin' | 'Creador' | 'Analista',
  estado: 'Activo' | 'Inactivo'
): Promise<User> {
  const response = await fetch(`${API_URL}/usuarios/${usuarioID}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ empresaID, email, nombre, apellido, rol, estado }),
  });

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Error al actualizar usuario');
  }

  return result.data;
}

// ============= ENCUESTAS =============

export async function getEncuestas() {
  const { data, error } = await supabase
    .from("encuesta")
    .select(`
      encuestaid,
      empresaid,
      usuariocreadorid,
      titulo,
      descripcion,
      fechacreacion,
      fechainiciovigencia,
      fechafinvigencia,
      estado,
      enlacelargo,
      enlacecorto
    `)
    .order("encuestaid");

  if (error) throw error;

  return data.map(e => ({
    encuestaID: e.encuestaid,
    empresaID: e.empresaid,
    usuarioCreadorID: e.usuariocreadorid,
    titulo: e.titulo,
    descripcion: e.descripcion,
    fechaCreacion: e.fechacreacion,
    fechaInicioVigencia: e.fechainiciovigencia,
    fechaFinVigencia: e.fechafinvigencia,
    estado: e.estado,
    enlaceLargo: e.enlacelargo,
    enlaceCorto: e.enlacecorto,
  }));
}


export async function getEncuesta(encuestaID: number) {
  // 1. Obtener encuesta
  const { data: encuesta, error: e1 } = await supabase
    .from("encuesta")
    .select(`
      encuestaid,
      empresaid,
      usuariocreadorid,
      titulo,
      descripcion,
      fechacreacion,
      fechainiciovigencia,
      fechafinvigencia,
      estado,
      enlacelargo,
      enlacecorto
    `)
    .eq("encuestaid", encuestaID)
    .single();

  if (e1) throw e1;

  //Obtener Tipopreguntas
  const { data: Tipopreguntas, error: e4} = await supabase
    .from("TipoPregunta")
    .select(`
      tipopreguntaid,
      nombretipo
    `)    
    .order("nombretipo");

  if (e4) throw e4;

  const tiposFormateados = Tipopreguntas.map((row: any) => ({
    tipoPreguntaID: row.tipopreguntaid,
    nombreTipo: row.nombretipo
  }));

  // 2. Obtener preguntas
  const { data: preguntas, error: e2 } = await supabase
    .from("pregunta")
    .select(`
      preguntaid,
      tipopreguntaid,
      textopregunta,
      orden,
      esobligatoria
    `)
    .eq("encuestaid", encuestaID)
    .order("orden");

  if (e2) throw e2;

  // 3. Obtener opciones por pregunta
  const preguntaIDs = preguntas.map(p => p.preguntaid);

  const { data: opciones, error: e3 } = await supabase
    .from("opcionrespuesta")
    .select(`
      opcionid,
      preguntaid,
      textoopcion,
      valor,
      orden
    `)
    .in("preguntaid", preguntaIDs);

  if (e3) throw e3;

  // 4. Armar estructura anidada
  const preguntasConOpciones = preguntas.map(p => ({
    preguntaID: p.preguntaid,
    encuestaID,
    tipoPreguntaID: p.tipopreguntaid,
    textoPregunta: p.textopregunta,
    orden: p.orden,
    esObligatoria: p.esobligatoria,
    opciones: opciones.filter(o => o.preguntaid === p.preguntaid).map(o => ({
      opcionID: o.opcionid,
      preguntaID: o.preguntaid,
      textoOpcion: o.textoopcion,
      valor: o.valor,
      orden: o.orden
    }))
  }));

  return {
    encuestaID: encuesta.encuestaid,
    empresaID: encuesta.empresaid,
    usuarioCreadorID: encuesta.usuariocreadorid,
    titulo: encuesta.titulo,
    descripcion: encuesta.descripcion,
    fechaCreacion: encuesta.fechacreacion,
    fechaInicioVigencia: encuesta.fechainiciovigencia,
    fechaFinVigencia: encuesta.fechafinvigencia,
    estado: encuesta.estado,
    enlaceLargo: encuesta.enlacelargo,
    enlaceCorto: encuesta.enlacecorto,
    preguntas: preguntasConOpciones,
    Tipopreguntas: tiposFormateados
  };
}

export async function createEncuesta(encuesta: any) {
  // 1. Insertar encuesta
  const { data: enc, error: e1 } = await supabase
    .from("encuesta")
    .insert([{
      empresaid: encuesta.empresaID,
      usuariocreadorid: encuesta.usuarioCreadorID,
      titulo: encuesta.titulo,
      descripcion: encuesta.descripcion,
      fechainiciovigencia: encuesta.fechaInicioVigencia,
      fechafinvigencia: encuesta.fechaFinVigencia,
      estado: encuesta.estado,
      enlacelargo: encuesta.enlaceLargo,
      enlacecorto: encuesta.enlaceCorto
    }])
    .select("encuestaid")
    .single();

  if (e1) throw e1;

  const encuestaID = enc.encuestaid;

  // 2. Insertar preguntas
  for (const p of encuesta.preguntas) {
    const { data: preg, error: e2 } = await supabase
      .from("pregunta")
      .insert([{
        encuestaid: encuestaID,
        tipopreguntaid: p.tipoPreguntaID,
        textopregunta: p.textoPregunta,
        orden: p.orden,
        esobligatoria: p.esObligatoria,
      }])
      .select("preguntaid")
      .single();

    if (e2) throw e2;

    const preguntaID = preg.preguntaid;

    // 3. Insertar opciones
    if (p.opciones?.length) {
      const opcionesInsert = p.opciones.map(o => ({
        preguntaid: preguntaID,
        textoopcion: o.textoOpcion,
        valor: o.valor,
        orden: o.orden
      }));

      const { error: e3 } = await supabase
        .from("opcionrespuesta")
        .insert(opcionesInsert);

      if (e3) throw e3;
    }
  }

  return encuestaID;
}

export async function submitRespuestas(encuestaRespondidaID: number, respuestas: any[]) {
  const inserts = respuestas.map(r => ({
    encuestarespondidaid: encuestaRespondidaID,
    preguntaid: r.preguntaID,
    opcionid: r.opcionID ?? null,
    textorespuesta: r.textoRespuesta ?? null,
  }));

  const { error } = await supabase
    .from("respuestausuario")
    .insert(inserts);

  if (error) throw error;
}


export async function createPregunta(preguntaData: any) {
  const { data, error } = await supabase
    .from("pregunta")
    .insert([preguntaData])
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function createOpcionRespuesta(opcionData: any) {
  const { data, error } = await supabase
    .from("opcionrespuesta")
    .insert([opcionData])
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

//obtener preguntas

export async function getTiposPregunta() {
  const { data, error } = await supabase
    .from("tipopregunta")
    .select(`
      tipopreguntaid,
      nombretipo
    `)
    .order("tipopreguntaid", { ascending: true });

  if (error) throw error;

  return data.map((row: any) => ({
    tipoPreguntaID: row.tipopreguntaid,
    nombreTipo: row.nombretipo,
  }));
}