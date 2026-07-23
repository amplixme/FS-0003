require('dotenv').config();

const bcrypt = require('bcrypt');
const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();
const demoPassword = 'Demo1234!';

const users = [
  {
    email: 'admin@demo.dev',
    name: 'Lucia Romero',
    bio: 'Editora del blog y desarrolladora full-stack con interes en productos digitales.',
    avatarUrl: 'https://i.pravatar.cc/300?img=47',
    role: 'ADMIN',
  },
  {
    email: 'marcos@demo.dev',
    name: 'Marcos Vega',
    bio: 'Desarrollador backend especializado en APIs, bases de datos y arquitectura.',
    avatarUrl: 'https://i.pravatar.cc/300?img=12',
    role: 'USER',
  },
  {
    email: 'sofia@demo.dev',
    name: 'Sofia Castillo',
    bio: 'Frontend engineer. Escribe sobre accesibilidad y experiencia de usuario.',
    avatarUrl: 'https://i.pravatar.cc/300?img=32',
    role: 'USER',
  },
  {
    email: 'diego@demo.dev',
    name: 'Diego Navarro',
    bio: 'Ingeniero DevOps enfocado en automatizacion y plataformas confiables.',
    avatarUrl: 'https://i.pravatar.cc/300?img=68',
    role: 'USER',
  },
];

const categories = [
  { name: 'Tecnologia', slug: 'tecnologia' },
  { name: 'Desarrollo', slug: 'desarrollo' },
  { name: 'Carrera', slug: 'carrera' },
  { name: 'DevOps', slug: 'devops' },
  { name: 'Producto', slug: 'producto' },
];

const posts = [
  {
    title: 'Como elegir una arquitectura sin sobredimensionar el proyecto',
    content: 'La mejor arquitectura no es la mas sofisticada, sino la que el equipo puede operar y cambiar con confianza. Antes de dividir un sistema en servicios, conviene medir los limites reales: volumen, equipos involucrados y frecuencia de despliegue. Un monolito bien organizado suele ser una decision responsable cuando el producto aun esta encontrando su mercado.',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    author: 'marcos@demo.dev',
    categories: ['desarrollo', 'tecnologia'],
  },
  {
    title: 'Una semana trabajando con pruebas de contrato en APIs',
    content: 'Las pruebas de contrato cambiaron la conversacion entre frontend y backend. En lugar de detectar una respuesta incompatible al final del sprint, acordamos ejemplos concretos desde el primer dia. El resultado fue menos retrabajo y una documentacion que se mantiene cerca del codigo.',
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    author: 'marcos@demo.dev',
    categories: ['desarrollo', 'producto'],
  },
  {
    title: 'Accesibilidad: el detalle que mejora todo el producto',
    content: 'Agregar foco visible, etiquetas claras y mensajes de error comprensibles no beneficia solo a quienes usan lectores de pantalla. Tambien reduce dudas, hace mas rapidas las tareas frecuentes y evita abandonos. La accesibilidad funciona mejor cuando se incorpora a los componentes base y no como una auditoria tardia.',
    coverImage: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=80',
    author: 'sofia@demo.dev',
    categories: ['desarrollo', 'producto'],
  },
  {
    title: 'Mi primer ano como desarrollador: lo que habria hecho distinto',
    content: 'Durante mi primer ano quise aprender todas las herramientas a la vez y termine practicando poco en profundidad. Lo que mas impacto tuvo fue pedir revisiones de codigo, leer incidencias reales y escribir pequenas notas de lo que entendia. La carrera avanza mas por ciclos de practica y feedback que por acumular cursos.',
    coverImage: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80',
    author: 'sofia@demo.dev',
    categories: ['carrera', 'desarrollo'],
  },
  {
    title: 'De reuniones largas a decisiones que quedan escritas',
    content: 'Una decision de producto no deberia desaparecer cuando termina la videollamada. Empezamos a registrar contexto, alternativas descartadas y metricas esperadas en documentos breves. Cuando aparece una duda semanas despues, el equipo puede entender el por que sin reconstruir la conversacion desde cero.',
    coverImage: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80',
    author: 'admin@demo.dev',
    categories: ['producto', 'carrera'],
  },
  {
    title: 'Que medir antes de decir que una aplicacion es lenta',
    content: 'Decir que la aplicacion esta lenta no alcanza para priorizar una mejora. Hay que separar tiempo de carga, respuesta del servidor, interaccion y percepcion del usuario. Con trazas simples y metricas de percentiles encontramos que la consulta mas cara afectaba a una minoria, mientras que una imagen pesada afectaba a casi todos.',
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    author: 'diego@demo.dev',
    categories: ['tecnologia', 'devops'],
  },
  {
    title: 'Despliegues pequenos: una practica que reduce el estres',
    content: 'Un despliegue pequeno es mas facil de revisar, observar y revertir. En nuestro equipo agrupamos cambios por comportamiento visible y usamos banderas para activar partes sensibles. Esto no elimina los errores, pero acota su impacto y permite aprender de ellos sin detener todo el trabajo.',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    author: 'diego@demo.dev',
    categories: ['devops', 'desarrollo'],
  },
  {
    title: 'El habito de leer codigo ajeno con una pregunta concreta',
    content: 'Leer un repositorio completo puede resultar abrumador. Funciona mejor llegar con una pregunta: como valida este servicio, donde se transforma esta respuesta o que pasa si falla esta llamada. Esa busqueda guiada convierte el codigo existente en una fuente de aprendizaje util y evita navegar sin rumbo.',
    coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    author: 'marcos@demo.dev',
    categories: ['carrera', 'desarrollo'],
  },
  {
    title: 'Por que una buena interfaz empieza por el contenido',
    content: 'Antes de elegir colores o animaciones, una interfaz debe responder que informacion necesita una persona para completar su tarea. Cuando los textos son reales, aparecen los titulos demasiado largos, los estados vacios y las decisiones que faltan. El contenido no rellena el diseno: le da estructura.',
    coverImage: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1200&q=80',
    author: 'sofia@demo.dev',
    categories: ['producto', 'tecnologia'],
  },
  {
    title: 'Documentar incidentes sin buscar culpables',
    content: 'Una retrospectiva util explica las condiciones que hicieron posible un incidente, no solo la accion final que lo desencadeno. Registramos linea de tiempo, senales que ignoramos y mejoras concretas para la siguiente vez. Ese enfoque genera sistemas mas resistentes y equipos que reportan problemas antes.',
    coverImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
    author: 'diego@demo.dev',
    categories: ['devops', 'carrera'],
  },
  {
    title: 'Aprender una tecnologia nueva sin abandonar los fundamentos',
    content: 'Cada nueva herramienta promete resolver problemas conocidos de una forma mas comoda. Vale la pena probarla, pero tambien entender que principios conserva: datos, concurrencia, seguridad y observabilidad. Los fundamentos permiten evaluar una novedad con criterio y no solo repetir su documentacion.',
    coverImage: 'https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=1200&q=80',
    author: 'admin@demo.dev',
    categories: ['tecnologia', 'carrera'],
  },
  {
    title: 'El backlog no es una lista de deseos',
    content: 'Un backlog saludable muestra problemas priorizados, no una coleccion infinita de ideas. Cada item necesita contexto suficiente para decidir si merece investigacion, desarrollo o descarte. Revisarlo con frecuencia permite que el equipo invierta energia en lo que hoy mueve una metrica o resuelve una friccion concreta.',
    coverImage: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80',
    author: 'admin@demo.dev',
    categories: ['producto', 'carrera'],
  },
  {
    title: 'Variables de entorno: pequenas decisiones, grandes consecuencias',
    content: 'Una configuracion predecible evita que un cambio correcto falle solo en produccion. Centralizar las variables, validarlas al iniciar y documentar ejemplos seguros reduce sorpresas. Tambien ayuda a distinguir los secretos de la configuracion que puede viajar con el repositorio.',
    coverImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    author: 'diego@demo.dev',
    categories: ['devops', 'tecnologia'],
  },
  {
    title: 'Como preparar una entrevista tecnica sin memorizar respuestas',
    content: 'Las entrevistas tecnicas mejoran cuando puedes explicar decisiones reales que tomaste: que problema habia, que alternativas evaluaste y que aprendiste despues. Preparar dos o tres historias propias vale mas que intentar adivinar todas las preguntas. La claridad al razonar suele ser mas relevante que una respuesta perfecta.',
    coverImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
    author: 'sofia@demo.dev',
    categories: ['carrera', 'tecnologia'],
  },
  {
    title: 'La deuda tecnica que si conviene pagar primero',
    content: 'No toda deuda tecnica necesita una iniciativa separada. Priorizamos la que retrasa cambios frecuentes, genera incidentes o vuelve inseguro el trabajo cotidiano. Pagarla cerca de la funcionalidad afectada mantiene el contexto fresco y hace visible el beneficio para negocio, no solo para el codigo.',
    coverImage: 'https://images.unsplash.com/photo-1516321310764-8d6c2f1b5b1d?auto=format&fit=crop&w=1200&q=80',
    author: 'marcos@demo.dev',
    categories: ['desarrollo', 'producto'],
  },
];

const comments = [
  ['Como elegir una arquitectura sin sobredimensionar el proyecto', 'sofia@demo.dev', 'Me gusto que pongas la capacidad de operacion del equipo al centro de la decision.'],
  ['Como elegir una arquitectura sin sobredimensionar el proyecto', 'diego@demo.dev', 'He visto equipos sufrir mas por la complejidad de despliegue que por el trafico real.'],
  ['Una semana trabajando con pruebas de contrato en APIs', 'admin@demo.dev', 'Los ejemplos compartidos tambien hacen mucho mas agil la revision de producto.'],
  ['Una semana trabajando con pruebas de contrato en APIs', 'sofia@demo.dev', 'Para frontend es una diferencia enorme saber que el contrato se valida automaticamente.'],
  ['Accesibilidad: el detalle que mejora todo el producto', 'marcos@demo.dev', 'El punto sobre errores claros aplica a cualquier formulario, incluso los internos.'],
  ['Accesibilidad: el detalle que mejora todo el producto', 'admin@demo.dev', 'Incluirlo en los componentes base es la parte que mas se suele olvidar.'],
  ['Mi primer ano como desarrollador: lo que habria hecho distinto', 'diego@demo.dev', 'Las notas de aprendizaje parecen simples, pero ayudan mucho a detectar progreso.'],
  ['Mi primer ano como desarrollador: lo que habria hecho distinto', 'marcos@demo.dev', 'Las revisiones de codigo fueron mi mejor escuela tambien.'],
  ['De reuniones largas a decisiones que quedan escritas', 'sofia@demo.dev', 'Un registro corto evita que las personas nuevas repitan preguntas ya resueltas.'],
  ['De reuniones largas a decisiones que quedan escritas', 'diego@demo.dev', 'Tambien facilita revisar si la metrica elegida realmente mejoro.'],
  ['Que medir antes de decir que una aplicacion es lenta', 'marcos@demo.dev', 'Los percentiles cambiaron como priorizamos optimizaciones en mi equipo.'],
  ['Que medir antes de decir que una aplicacion es lenta', 'admin@demo.dev', 'Medir la percepcion del usuario evita optimizar detalles invisibles.'],
  ['Despliegues pequenos: una practica que reduce el estres', 'marcos@demo.dev', 'Las banderas de funcionalidad nos permitieron reducir mucho el riesgo.'],
  ['Despliegues pequenos: una practica que reduce el estres', 'sofia@demo.dev', 'Es una buena forma de hacer las revisiones mas cuidadosas.'],
  ['El habito de leer codigo ajeno con una pregunta concreta', 'admin@demo.dev', 'Excelente consejo para quienes llegan a un proyecto grande.'],
  ['El habito de leer codigo ajeno con una pregunta concreta', 'diego@demo.dev', 'Buscar el recorrido de un dato suele revelar la arquitectura rapidamente.'],
  ['Por que una buena interfaz empieza por el contenido', 'marcos@demo.dev', 'Los textos reales descubren muchos casos que no aparecen en los wireframes.'],
  ['Por que una buena interfaz empieza por el contenido', 'admin@demo.dev', 'Esta idea mejora mucho las conversaciones entre diseno y producto.'],
  ['Documentar incidentes sin buscar culpables', 'marcos@demo.dev', 'La linea de tiempo ayuda a convertir un incidente en mejoras concretas.'],
  ['Documentar incidentes sin buscar culpables', 'sofia@demo.dev', 'Un entorno sin culpas hace que la gente comparta senales antes.'],
  ['Aprender una tecnologia nueva sin abandonar los fundamentos', 'diego@demo.dev', 'Entender los compromisos importa mas que seguir una tendencia.'],
  ['Aprender una tecnologia nueva sin abandonar los fundamentos', 'marcos@demo.dev', 'Los fundamentos hacen que cambiar de stack sea menos intimidante.'],
  ['El backlog no es una lista de deseos', 'sofia@demo.dev', 'La revision frecuente evita que las ideas antiguas parezcan compromisos.'],
  ['El backlog no es una lista de deseos', 'diego@demo.dev', 'Me sirve pensar en cada item como una hipotesis por validar.'],
  ['Variables de entorno: pequenas decisiones, grandes consecuencias', 'admin@demo.dev', 'Validarlas al arranque ahorra mucho tiempo durante los despliegues.'],
  ['Variables de entorno: pequenas decisiones, grandes consecuencias', 'marcos@demo.dev', 'Separar secretos de configuracion publica es una practica basica y valiosa.'],
  ['Como preparar una entrevista tecnica sin memorizar respuestas', 'admin@demo.dev', 'Las historias propias tambien transmiten mejor la forma de colaborar.'],
  ['Como preparar una entrevista tecnica sin memorizar respuestas', 'diego@demo.dev', 'Explicar los limites de una decision demuestra mucha madurez tecnica.'],
  ['La deuda tecnica que si conviene pagar primero', 'sofia@demo.dev', 'Relacionarla con una friccion de usuario ayuda a priorizarla mejor.'],
  ['La deuda tecnica que si conviene pagar primero', 'diego@demo.dev', 'Resolverla cerca del cambio evita que el costo siga creciendo.'],
];

async function main() {
  const password = await bcrypt.hash(demoPassword, 10);
  const postTitles = posts.map(({ title }) => title);

  await prisma.$transaction(async (tx) => {
    await tx.post.deleteMany({ where: { title: { in: postTitles } } });

    const userRecords = {};
    for (const user of users) {
      const data = { ...user, password };
      userRecords[user.email] = await tx.user.upsert({
        where: { email: user.email },
        update: data,
        create: data,
      });
    }

    const categoryRecords = {};
    for (const category of categories) {
      categoryRecords[category.slug] = await tx.category.upsert({
        where: { slug: category.slug },
        update: { name: category.name },
        create: category,
      });
    }

    const postRecords = {};
    for (const post of posts) {
      postRecords[post.title] = await tx.post.create({
        data: {
          title: post.title,
          content: post.content,
          coverImage: post.coverImage,
          published: true,
          authorId: userRecords[post.author].id,
          categories: { connect: post.categories.map((slug) => ({ id: categoryRecords[slug].id })) },
        },
      });
    }

    await tx.comment.createMany({
      data: comments.map(([postTitle, authorEmail, content]) => ({
        content,
        postId: postRecords[postTitle].id,
        authorId: userRecords[authorEmail].id,
      })),
    });
  });

  console.log(`Seed completado: ${users.length} usuarios, ${categories.length} categorias, ${posts.length} posts y ${comments.length} comentarios.`);
  console.log(`Credenciales demo: admin@demo.dev / ${demoPassword}`);
}

main()
  .catch((error) => {
    console.error('El seed fallo:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
