export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "date" | "number" | "textarea" | "select";
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface LegalTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  jurisdictionId?: string;
  formFields: FormField[];
  systemPrompt: string;
}

export const templates: LegalTemplate[] = [
  {
    id: "carta-notarial-deuda",
    title: "Carta Notarial por Deuda",
    description: "Genera una carta notarial exigiendo el pago de una deuda basada en el Código Civil Peruano.",
    category: "Notarial",
    formFields: [
      {
        name: "debtorName",
        label: "Nombre del Deudor",
        type: "text",
        required: true,
        placeholder: "Ej: Juan Pérez García",
      },
      {
        name: "debtorDocument",
        label: "DNI/RUC del Deudor",
        type: "text",
        required: true,
        placeholder: "Ej: 12345678",
      },
      {
        name: "debtorAddress",
        label: "Domicilio del Deudor",
        type: "textarea",
        required: true,
        placeholder: "Ej: Av. Principal 123, Distrito, Provincia, Región",
      },
      {
        name: "creditorName",
        label: "Nombre del Acreedor",
        type: "text",
        required: true,
        placeholder: "Ej: María López Rodríguez",
      },
      {
        name: "creditorDocument",
        label: "DNI/RUC del Acreedor",
        type: "text",
        required: true,
        placeholder: "Ej: 87654321",
      },
      {
        name: "debtAmount",
        label: "Monto de la Deuda (S/.)",
        type: "number",
        required: true,
        placeholder: "Ej: 5000.00",
      },
      {
        name: "debtCurrency",
        label: "Moneda",
        type: "select",
        required: true,
        options: ["Soles (S/.)", "Dólares (USD)", "Euros (EUR)"],
      },
      {
        name: "dueDate",
        label: "Fecha de Vencimiento Original",
        type: "date",
        required: true,
      },
      {
        name: "debtConcept",
        label: "Concepto de la Deuda",
        type: "textarea",
        required: true,
        placeholder: "Ej: Préstamo de dinero, venta de mercadería, servicios profesionales, etc.",
      },
      {
        name: "paymentTerms",
        label: "Plazo para Pagar",
        type: "select",
        required: true,
        options: ["5 días", "10 días", "15 días", "30 días"],
      },
      {
        name: "tone",
        label: "Tono del Documento",
        type: "select",
        required: true,
        options: ["Formal persuasivo", "Estricto (Pre-demanda)"],
      },
    ],
    systemPrompt: `Eres un abogado litigante experto en derecho civil peruano con más de 15 años de experiencia en cobros y deudas. Tu objetivo es redactar el cuerpo de una carta notarial exigiendo el pago de una deuda, siguiendo estrictamente la normativa peruana.

INSTRUCCIONES CRÍTICAS:
1. Utiliza un lenguaje jurídico formal y preciso, acorde a la práctica notarial peruana.
2. Cita obligatoriamente el artículo 1333 del Código Civil Peruano (constitución en mora).
3. Estructura el texto en párrafos claros y bien diferenciados.
4. NO incluyas saludos genéricos ni notas explicativas.
5. Devuelve ÚNICAMENTE el texto legal que irá en el cuerpo del documento, sin encabezados ni firmas.
6. El tono debe ser acorde a lo especificado (formal persuasivo o estricto).
7. Incluye referencias legales pertinentes al Código Civil Peruano.
8. Asegúrate de que el documento sea contundente pero profesional.

El documento debe ser apto para ser presentado ante un notario público en Perú.`,
  },

  {
    id: "poder-notarial",
    title: "Poder Notarial",
    description: "Crea un poder notarial para representación legal según la legislación peruana.",
    category: "Notarial",
    formFields: [
      {
        name: "mandanteName",
        label: "Nombre del Mandante",
        type: "text",
        required: true,
        placeholder: "Ej: Carlos Mendoza Flores",
      },
      {
        name: "mandanteDocument",
        label: "DNI del Mandante",
        type: "text",
        required: true,
        placeholder: "Ej: 12345678",
      },
      {
        name: "mandanteAddress",
        label: "Domicilio del Mandante",
        type: "textarea",
        required: true,
        placeholder: "Ej: Calle Principal 456, Lima, Perú",
      },
      {
        name: "mandatarioName",
        label: "Nombre del Apoderado",
        type: "text",
        required: true,
        placeholder: "Ej: Roberto Sánchez Díaz",
      },
      {
        name: "mandatarioDocument",
        label: "DNI del Apoderado",
        type: "text",
        required: true,
        placeholder: "Ej: 87654321",
      },
      {
        name: "powerScope",
        label: "Alcance del Poder",
        type: "textarea",
        required: true,
        placeholder: "Ej: Representar en juicio, gestionar trámites administrativos, celebrar contratos, etc.",
      },
      {
        name: "powerType",
        label: "Tipo de Poder",
        type: "select",
        required: true,
        options: ["General", "Especial", "Especial para litigar"],
      },
      {
        name: "duration",
        label: "Duración del Poder",
        type: "select",
        required: true,
        options: ["Indefinida", "1 año", "2 años", "3 años", "5 años"],
      },
    ],
    systemPrompt: `Eres un abogado especialista en derecho notarial peruano. Tu tarea es redactar el cuerpo de un poder notarial conforme a las normas del Código Civil Peruano y la Ley del Notariado.

INSTRUCCIONES:
1. Redacta en lenguaje jurídico formal y preciso.
2. Especifica claramente los poderes otorgados según el tipo indicado.
3. Incluye las cláusulas legales pertinentes.
4. NO incluyas encabezados, firmas ni datos notariales.
5. Devuelve ÚNICAMENTE el texto legal del cuerpo del poder.
6. Asegúrate de que sea válido ante notario público peruano.`,
  },

  {
    id: "contrato-prestamo",
    title: "Contrato de Préstamo de Dinero",
    description: "Genera un contrato de préstamo de dinero con términos claros y protección legal.",
    category: "Contratos",
    formFields: [
      {
        name: "prestamistaNombre",
        label: "Nombre del Prestamista",
        type: "text",
        required: true,
        placeholder: "Ej: Ana García López",
      },
      {
        name: "prestamistaDocument",
        label: "DNI del Prestamista",
        type: "text",
        required: true,
        placeholder: "Ej: 12345678",
      },
      {
        name: "prestatarioNombre",
        label: "Nombre del Prestatario",
        type: "text",
        required: true,
        placeholder: "Ej: Pedro Ruiz Martínez",
      },
      {
        name: "prestatarioDocument",
        label: "DNI del Prestatario",
        type: "text",
        required: true,
        placeholder: "Ej: 87654321",
      },
      {
        name: "montoTotal",
        label: "Monto Total del Préstamo (S/.)",
        type: "number",
        required: true,
        placeholder: "Ej: 10000.00",
      },
      {
        name: "tasaInteres",
        label: "Tasa de Interés Anual (%)",
        type: "number",
        required: true,
        placeholder: "Ej: 5.5",
      },
      {
        name: "plazoMeses",
        label: "Plazo en Meses",
        type: "number",
        required: true,
        placeholder: "Ej: 12",
      },
      {
        name: "fechaDesembolso",
        label: "Fecha de Desembolso",
        type: "date",
        required: true,
      },
      {
        name: "formaPago",
        label: "Forma de Pago",
        type: "select",
        required: true,
        options: ["Cuota única", "Cuotas mensuales", "Cuotas trimestrales"],
      },
      {
        name: "garantia",
        label: "¿Incluir Garantía?",
        type: "select",
        required: true,
        options: ["No", "Hipotecaria", "Prendaria", "Personal"],
      },
    ],
    systemPrompt: `Eres un abogado especialista en contratos mercantiles peruanos. Redacta el cuerpo de un contrato de préstamo de dinero conforme al Código Civil Peruano.

INSTRUCCIONES:
1. Lenguaje jurídico formal y claro.
2. Incluye cláusulas sobre obligaciones, intereses, plazo y consecuencias del incumplimiento.
3. Cita artículos relevantes del Código Civil Peruano.
4. NO incluyas encabezados, firmas ni datos notariales.
5. Devuelve ÚNICAMENTE el texto legal del contrato.
6. Asegúrate de que sea exigible legalmente en Perú.`,
  },

  {
    id: "demanda-civil",
    title: "Demanda Civil - Cobro de Deuda",
    description: "Redacta una demanda civil para cobro de deuda ante los juzgados peruanos.",
    category: "Demandas",
    formFields: [
      {
        name: "demandanteName",
        label: "Nombre del Demandante",
        type: "text",
        required: true,
        placeholder: "Ej: Luis Fernando Rodríguez",
      },
      {
        name: "demandanteDocument",
        label: "DNI del Demandante",
        type: "text",
        required: true,
        placeholder: "Ej: 12345678",
      },
      {
        name: "demandanteAddress",
        label: "Domicilio del Demandante",
        type: "textarea",
        required: true,
        placeholder: "Ej: Av. Paseo de la República 3000, Lima",
      },
      {
        name: "demandadoName",
        label: "Nombre del Demandado",
        type: "text",
        required: true,
        placeholder: "Ej: Jorge Quispe Mamani",
      },
      {
        name: "demandadoDocument",
        label: "DNI del Demandado",
        type: "text",
        required: true,
        placeholder: "Ej: 87654321",
      },
      {
        name: "demandadoAddress",
        label: "Domicilio del Demandado",
        type: "textarea",
        required: true,
        placeholder: "Ej: Calle Secundaria 789, Arequipa",
      },
      {
        name: "montoReclamado",
        label: "Monto Reclamado (S/.)",
        type: "number",
        required: true,
        placeholder: "Ej: 15000.00",
      },
      {
        name: "hechos",
        label: "Descripción de los Hechos",
        type: "textarea",
        required: true,
        placeholder: "Detalla los hechos que originan la deuda...",
      },
      {
        name: "fundamentos",
        label: "Fundamentos Jurídicos",
        type: "textarea",
        required: true,
        placeholder: "Ej: Incumplimiento de contrato, artículos del Código Civil...",
      },
      {
        name: "juzgado",
        label: "Juzgado Competente",
        type: "select",
        required: true,
        options: ["Juzgado Civil", "Juzgado Especializado Civil", "Juzgado de Paz Letrado"],
      },
    ],
    systemPrompt: `Eres un abogado litigante peruano experto en derecho civil. Redacta la parte expositiva y considerativa de una demanda civil para cobro de deuda.

INSTRUCCIONES:
1. Estructura formal de demanda peruana.
2. Sección de hechos clara y detallada.
3. Sección de fundamentos jurídicos con citas al Código Civil Peruano.
4. Lenguaje jurídico formal y persuasivo.
5. NO incluyas encabezados de demanda ni firma.
6. Devuelve ÚNICAMENTE el cuerpo de la demanda (hechos y fundamentos).
7. Asegúrate de que sea apta para presentación ante juzgado peruano.`,
  },

  {
    id: "contrato-compraventa",
    title: "Contrato de Compraventa",
    description: "Crea un contrato de compraventa de bienes muebles o inmuebles.",
    category: "Contratos",
    formFields: [
      {
        name: "vendedorName",
        label: "Nombre del Vendedor",
        type: "text",
        required: true,
        placeholder: "Ej: María Flores Soto",
      },
      {
        name: "vendedorDocument",
        label: "DNI del Vendedor",
        type: "text",
        required: true,
        placeholder: "Ej: 12345678",
      },
      {
        name: "compradorName",
        label: "Nombre del Comprador",
        type: "text",
        required: true,
        placeholder: "Ej: Juan Torres Gómez",
      },
      {
        name: "compradorDocument",
        label: "DNI del Comprador",
        type: "text",
        required: true,
        placeholder: "Ej: 87654321",
      },
      {
        name: "bienDescripcion",
        label: "Descripción del Bien",
        type: "textarea",
        required: true,
        placeholder: "Ej: Vehículo marca Toyota, modelo 2020, placa ABC-123...",
      },
      {
        name: "precioTotal",
        label: "Precio Total (S/.)",
        type: "number",
        required: true,
        placeholder: "Ej: 25000.00",
      },
      {
        name: "formaPago",
        label: "Forma de Pago",
        type: "select",
        required: true,
        options: ["Al contado", "Financiado", "Mixto"],
      },
      {
        name: "condicionBien",
        label: "Condición del Bien",
        type: "select",
        required: true,
        options: ["Nuevo", "Usado en buen estado", "Usado con detalles"],
      },
      {
        name: "garantiaVendedor",
        label: "¿Incluir Garantía del Vendedor?",
        type: "select",
        required: true,
        options: ["No", "Sí, 3 meses", "Sí, 6 meses", "Sí, 1 año"],
      },
    ],
    systemPrompt: `Eres un abogado especialista en derecho mercantil peruano. Redacta un contrato de compraventa conforme al Código Civil Peruano.

INSTRUCCIONES:
1. Cláusulas claras sobre objeto, precio y condiciones.
2. Derechos y obligaciones de vendedor y comprador.
3. Cláusulas sobre garantía y responsabilidad.
4. Lenguaje jurídico formal y accesible.
5. NO incluyas encabezados, firmas ni datos notariales.
6. Devuelve ÚNICAMENTE el texto legal del contrato.
7. Asegúrate de que sea válido y exigible en Perú.`,
  },

  {
    id: "acta-transaccion",
    title: "Acta de Transacción",
    description: "Redacta un acta de transacción para resolver conflictos entre partes.",
    category: "Notarial",
    formFields: [
      {
        name: "parte1Name",
        label: "Nombre de la Primera Parte",
        type: "text",
        required: true,
        placeholder: "Ej: Roberto Mendoza Ruiz",
      },
      {
        name: "parte1Document",
        label: "DNI de la Primera Parte",
        type: "text",
        required: true,
        placeholder: "Ej: 12345678",
      },
      {
        name: "parte2Name",
        label: "Nombre de la Segunda Parte",
        type: "text",
        required: true,
        placeholder: "Ej: Patricia Sánchez López",
      },
      {
        name: "parte2Document",
        label: "DNI de la Segunda Parte",
        type: "text",
        required: true,
        placeholder: "Ej: 87654321",
      },
      {
        name: "conflictoDescripcion",
        label: "Descripción del Conflicto",
        type: "textarea",
        required: true,
        placeholder: "Describe brevemente el conflicto a resolver...",
      },
      {
        name: "acuerdoTerminos",
        label: "Términos del Acuerdo",
        type: "textarea",
        required: true,
        placeholder: "Detalla los términos del acuerdo alcanzado...",
      },
      {
        name: "obligacionesParte1",
        label: "Obligaciones de la Primera Parte",
        type: "textarea",
        required: true,
        placeholder: "Ej: Pagar la cantidad de..., entregar el bien...",
      },
      {
        name: "obligacionesParte2",
        label: "Obligaciones de la Segunda Parte",
        type: "textarea",
        required: true,
        placeholder: "Ej: Recibir el pago, entregar documentación...",
      },
    ],
    systemPrompt: `Eres un abogado especialista en derecho civil peruano. Redacta el cuerpo de un acta de transacción conforme al Código Civil Peruano.

INSTRUCCIONES:
1. Estructura clara del acuerdo entre partes.
2. Especifica las obligaciones de cada parte.
3. Incluye cláusulas de renuncia de derechos.
4. Lenguaje formal y preciso.
5. Cita artículos relevantes del Código Civil (transacción).
6. NO incluyas encabezados, firmas ni datos notariales.
7. Devuelve ÚNICAMENTE el texto legal del acta.
8. Asegúrate de que sea válida ante notario público.`,
  },
  {
    id: "contrato-trabajo",
    title: "Contrato de Trabajo",
    description: "Prepara un borrador de contrato laboral con información del empleador, trabajador, cargo y condiciones pactadas en Perú.",
    category: "Laboral",
    jurisdictionId: "pe",
    formFields: [
      { name: "empleador", label: "Empleador o razón social", type: "text", required: true, placeholder: "Ej: Estudio Jurídico Andino S.A.C." },
      { name: "rucEmpleador", label: "RUC del empleador", type: "text", required: true, placeholder: "Ej: 20123456789" },
      { name: "trabajador", label: "Nombre completo del trabajador", type: "text", required: true, placeholder: "Ej: Ana Torres Quispe" },
      { name: "dniTrabajador", label: "DNI del trabajador", type: "text", required: true, placeholder: "Ej: 12345678" },
      { name: "cargo", label: "Cargo y funciones principales", type: "textarea", required: true, placeholder: "Describe el cargo y sus funciones..." },
      { name: "remuneracion", label: "Remuneración mensual (S/.)", type: "number", required: true, placeholder: "Ej: 3500" },
      { name: "jornada", label: "Jornada y horario", type: "textarea", required: true, placeholder: "Ej: lunes a viernes, de 9:00 a 18:00..." },
      { name: "duracion", label: "Duración del vínculo", type: "select", required: true, options: ["Indeterminado", "Plazo fijo", "Periodo de prueba"] },
      { name: "inicio", label: "Fecha de inicio", type: "date", required: true },
      { name: "beneficios", label: "Beneficios o condiciones adicionales", type: "textarea", required: false, placeholder: "Detalla beneficios o condiciones especiales..." },
    ],
    systemPrompt: `Eres un abogado especialista en derecho laboral peruano. Redacta un borrador ordenado de contrato de trabajo usando exclusivamente la información entregada y el marco laboral peruano aplicable.

INSTRUCCIONES:
1. Distingue con claridad empleador, trabajador, cargo, remuneración, jornada, duración y obligaciones.
2. No inventes artículos, beneficios, modalidades ni hechos que no estén en los datos.
3. Si falta una precisión normativa, utiliza una redacción prudente y marca el punto para revisión profesional.
4. Devuelve únicamente el cuerpo contractual, sin saludos, comentarios de IA ni firmas.
5. Indica expresamente que el borrador requiere revisión según el régimen laboral concreto aplicable.`,
  },
  {
    id: "acuerdo-confidencialidad",
    title: "Acuerdo de Confidencialidad",
    description: "Genera un acuerdo de confidencialidad para proteger información sensible entre partes en Perú.",
    category: "Contratos",
    jurisdictionId: "pe",
    formFields: [
      { name: "parteReveladora", label: "Parte que revela la información", type: "text", required: true, placeholder: "Nombre o razón social" },
      { name: "parteReceptora", label: "Parte receptora", type: "text", required: true, placeholder: "Nombre o razón social" },
      { name: "identificacionPartes", label: "DNI/RUC y domicilios", type: "textarea", required: true, placeholder: "Identificación y domicilio de ambas partes..." },
      { name: "informacionProtegida", label: "Información protegida", type: "textarea", required: true, placeholder: "Describe la información confidencial..." },
      { name: "finalidad", label: "Finalidad de la entrega", type: "textarea", required: true, placeholder: "Indica para qué se compartirá la información..." },
      { name: "vigencia", label: "Vigencia de la obligación", type: "select", required: true, options: ["Durante la relación", "Durante la relación y 1 año", "Durante la relación y 3 años", "Indefinida"] },
      { name: "excepciones", label: "Excepciones acordadas", type: "textarea", required: false, placeholder: "Información pública, exigida por autoridad, etc..." },
      { name: "consecuencias", label: "Consecuencias del incumplimiento", type: "textarea", required: true, placeholder: "Detalla las consecuencias que las partes desean pactar..." },
    ],
    systemPrompt: `Eres un abogado peruano especializado en contratos civiles y comerciales. Redacta un acuerdo de confidencialidad claro, equilibrado y adaptable al caso concreto, con terminología jurídica peruana.

INSTRUCCIONES:
1. Define información confidencial, finalidad, deberes de la parte receptora, excepciones, vigencia y consecuencias.
2. No inventes datos, artículos o sanciones. Usa solo la información proporcionada.
3. Devuelve únicamente el cuerpo del acuerdo, sin encabezados, firmas ni notas de IA.
4. Señala dentro del texto solo cuando sea indispensable que una cláusula requiere revisión profesional.`,
  },
  {
    id: "poder-especial-litigar",
    title: "Poder Especial para Litigar",
    description: "Prepara un borrador de poder especial para actuaciones judiciales y procesales en Perú.",
    category: "Notarial",
    jurisdictionId: "pe",
    formFields: [
      { name: "poderdante", label: "Nombre del poderdante", type: "text", required: true, placeholder: "Nombre completo o razón social" },
      { name: "poderdanteDocumento", label: "DNI/RUC del poderdante", type: "text", required: true, placeholder: "Número de documento" },
      { name: "poderdanteDomicilio", label: "Domicilio del poderdante", type: "textarea", required: true, placeholder: "Domicilio real o fiscal..." },
      { name: "apoderado", label: "Nombre del apoderado", type: "text", required: true, placeholder: "Nombre completo" },
      { name: "apoderadoDocumento", label: "DNI del apoderado", type: "text", required: true, placeholder: "Número de DNI" },
      { name: "proceso", label: "Proceso o asunto", type: "textarea", required: true, placeholder: "Describe el proceso, expediente si existe y materia..." },
      { name: "facultades", label: "Facultades específicas", type: "textarea", required: true, placeholder: "Detalla las facultades que se otorgan..." },
      { name: "vigenciaPoder", label: "Vigencia", type: "select", required: true, options: ["Hasta conclusión del asunto", "1 año", "2 años", "Indefinida"] },
    ],
    systemPrompt: `Eres un abogado especialista en derecho procesal y notarial peruano. Redacta un borrador de poder especial para litigar conforme a la información brindada y a la práctica jurídica peruana.

INSTRUCCIONES:
1. Identifica a poderdante y apoderado, el asunto y las facultades concretas.
2. No atribuyas facultades no solicitadas ni inventes artículos o datos de expediente.
3. Mantén lenguaje formal y claro; devuelve únicamente el cuerpo del poder.
4. El borrador debe quedar sujeto a revisión profesional y a la formalidad que corresponda ante notario.`,
  },
];

export function getTemplateById(id: string): LegalTemplate | undefined {
  return templates.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: string): LegalTemplate[] {
  return templates.filter((t) => t.category === category);
}

export function getAllCategories(): string[] {
  const categories = new Set(templates.map((t) => t.category));
  return Array.from(categories);
}

export function getTemplatesForJurisdiction(jurisdictionId = "pe"): LegalTemplate[] {
  if (jurisdictionId !== "pe") return [];
  return templates.filter((template) => !template.jurisdictionId || template.jurisdictionId === jurisdictionId);
}

export function getTemplateForJurisdiction(templateId: string, jurisdictionId = "pe"): LegalTemplate | undefined {
  return getTemplatesForJurisdiction(jurisdictionId).find((template) => template.id === templateId);
}
