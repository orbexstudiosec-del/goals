import { PrismaClient } from "@prisma/client";
import slugify from "slugify";

const prisma = new PrismaClient();

const toSlug = (s: string) => slugify(s, { lower: true, strict: true, locale: "es" });

const categories = [
  {
    name: "Ecuador",
    description: "Noticias, virales y curiosidades del país.",
    color: "#FFD100",
    order: 1,
  },
  {
    name: "Curiosidades",
    description: "Datos sorprendentes que probablemente no conocías.",
    color: "#f97316",
    order: 2,
  },
  {
    name: "Tecnología",
    description: "Lo último en gadgets, apps, IA y redes sociales.",
    color: "#3b82f6",
    order: 3,
  },
  {
    name: "Entretenimiento",
    description: "Farándula, series, películas y virales del momento.",
    color: "#ec4899",
    order: 4,
  },
  {
    name: "Mundo",
    description: "Lo que está pasando en el resto del planeta.",
    color: "#10b981",
    order: 5,
  },
  {
    name: "Deportes",
    description: "Fútbol, LigaPro y todo lo deportivo.",
    color: "#ef4444",
    order: 6,
  },
];

type ArticleSeed = {
  title: string;
  excerpt: string;
  category: string;
  cover: string;
  tags: string[];
  body: string;
  featured?: boolean;
};

const articles: ArticleSeed[] = [
  {
    title: "10 lugares de Ecuador que parecen de otro planeta y casi nadie conoce",
    excerpt:
      "Desde lagunas volcánicas hasta selvas con animales únicos: un recorrido por los rincones más sorprendentes del país.",
    category: "Ecuador",
    cover:
      "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&w=1200&q=80",
    tags: ["turismo", "ecuador", "naturaleza", "viajes"],
    featured: true,
    body: `<p>Ecuador es uno de los países más biodiversos del planeta, y aun así muchos rincones siguen casi en secreto. Aquí te dejamos 10 lugares que parecen sacados de otro mundo.</p>
<h2>1. Laguna del Quilotoa</h2>
<p>Un cráter volcánico inundado a 3.914 m de altura. El color verde turquesa del agua cambia con la luz del día.</p>
<h2>2. Reserva Cuyabeno</h2>
<p>En plena Amazonía, conviven delfines rosados, anacondas y más de 580 especies de aves.</p>
<h2>3. El Cajas</h2>
<p>Más de 200 lagunas glaciares a pocos minutos de Cuenca. Senderismo en medio de la nada.</p>
<h2>4. Mompiche</h2>
<p>Playa surfista y tranquila en Esmeraldas, perfecta para desconectarse.</p>
<h2>5. Bosque Nublado de Mindo</h2>
<p>Mariposas, colibríes y tarabitas sobre cascadas.</p>
<h2>6. Isla de la Plata</h2>
<p>La "Galápagos chica" sin el costo de Galápagos. Piqueros de patas azules incluidos.</p>
<h2>7. Las Termas de Papallacta</h2>
<p>Aguas termales rodeadas de páramo. Ideal después de un día de trekking.</p>
<h2>8. Salinas de Bolívar</h2>
<p>Un pueblo en los Andes que produce uno de los mejores quesos del país.</p>
<h2>9. Ingapirca</h2>
<p>El sitio arqueológico inca más grande del Ecuador.</p>
<h2>10. Refugio del Cotopaxi</h2>
<p>Subir hasta los 4.864 m y ver el cráter del volcán activo más alto del mundo.</p>
<p>¿Cuál visitarías primero? Comenta y comparte con tus amigos.</p>`,
  },
  {
    title: "El truco de WhatsApp que casi nadie usa para enviar mensajes sin guardar el contacto",
    excerpt:
      "Funciona en Android y iPhone, no necesitas instalar nada y es totalmente legal. Te lo explicamos paso a paso.",
    category: "Tecnología",
    cover:
      "https://images.unsplash.com/photo-1611926653458-09294b3142bf?auto=format&fit=crop&w=1200&q=80",
    tags: ["whatsapp", "trucos", "android", "iphone"],
    body: `<p>¿Cuántas veces guardaste un número solo para enviar un mensaje y luego lo olvidaste en tu agenda? Existe una forma oficial de WhatsApp para no hacerlo.</p>
<h2>Cómo funciona</h2>
<p>WhatsApp permite abrir un chat directo usando un enlace que contiene el número con código de país.</p>
<ol>
<li>Abre el navegador de tu teléfono.</li>
<li>Escribe: <code>https://wa.me/593XXXXXXXXX</code> reemplazando las X por el número (sin el cero inicial).</li>
<li>Te abrirá WhatsApp con la conversación lista.</li>
</ol>
<h2>¿Sirve para grupos?</h2>
<p>No directamente, pero sí puedes generar un enlace de invitación a un grupo desde la configuración del mismo.</p>
<h2>¿Es seguro?</h2>
<p>Sí, es una funcionalidad oficial de WhatsApp documentada en su web.</p>
<blockquote>Tip: agrega <code>?text=Hola</code> al final del enlace para que el mensaje aparezca escrito automáticamente.</blockquote>`,
  },
  {
    title: "20 datos curiosos sobre el cuerpo humano que te volarán la cabeza",
    excerpt:
      "Tu estómago se regenera cada pocos días, parpadeas el equivalente a 1 mes al año… y eso es solo el comienzo.",
    category: "Curiosidades",
    cover:
      "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=1200&q=80",
    tags: ["ciencia", "cuerpo-humano", "datos-curiosos"],
    body: `<p>El cuerpo humano es la máquina más compleja conocida. Aquí 20 datos que probablemente no sabías.</p>
<ol>
<li>El estómago produce una nueva capa de mucosa cada tres a cuatro días para no digerirse a sí mismo.</li>
<li>Los huesos son cinco veces más resistentes que el acero a la misma densidad.</li>
<li>Generas alrededor de 1,5 litros de saliva al día.</li>
<li>El corazón late más de 100.000 veces al día.</li>
<li>Tienes 60.000 km de vasos sanguíneos.</li>
<li>El cerebro consume el 20% de la energía del cuerpo.</li>
<li>Parpadeas el equivalente a 30 días seguidos al año.</li>
<li>El esmalte dental es la sustancia más dura de tu cuerpo.</li>
<li>El intestino delgado mide hasta 7 metros.</li>
<li>Producimos un litro de moco al día… y casi todo lo tragamos.</li>
<li>El ADN extendido medirá 16 mil millones de kilómetros.</li>
<li>El olfato puede distinguir más de 1 billón de olores.</li>
<li>Las uñas crecen más rápido en la mano dominante.</li>
<li>El cuerpo emite luz, aunque mil veces más débil de lo que ojo capta.</li>
<li>Los pulmones tienen una superficie similar a una cancha de tenis.</li>
<li>Tu lengua tiene huella única, como las huellas dactilares.</li>
<li>El bazo guarda glóbulos rojos de reserva.</li>
<li>El estornudo viaja hasta 160 km/h.</li>
<li>Tus oídos crecen toda la vida.</li>
<li>La piel se renueva cada 28 días aproximadamente.</li>
</ol>`,
  },
  {
    title: "Lo que nadie te dijo sobre el café: 7 efectos reales en tu cuerpo",
    excerpt:
      "Sí, te despierta, pero también cambia tu metabolismo, tu sueño y hasta tu microbioma. Aquí lo dice la ciencia.",
    category: "Curiosidades",
    cover:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
    tags: ["cafe", "salud", "ciencia"],
    body: `<p>Más de 2 mil millones de tazas se consumen al día en el mundo. Pero, ¿qué hace realmente en tu cuerpo?</p>
<h2>1. Acelera el metabolismo</h2><p>Hasta un 11% en personas sanas, según estudios.</p>
<h2>2. Mejora el rendimiento físico</h2><p>La cafeína aumenta la adrenalina, ideal antes de entrenar.</p>
<h2>3. Protege el hígado</h2><p>Reduce el riesgo de cirrosis en quienes beben de 3 a 4 tazas diarias.</p>
<h2>4. Mejora el ánimo</h2><p>Bloquea la adenosina, asociada con el cansancio.</p>
<h2>5. Pero también disminuye la calidad del sueño</h2><p>Incluso 6 horas antes de dormir.</p>
<h2>6. Cambia tu microbioma</h2><p>El café promueve bacterias intestinales asociadas a una buena digestión.</p>
<h2>7. Es fuente de antioxidantes</h2><p>En muchas dietas, es la principal.</p>
<blockquote>Consejo: si tomas más de 4 tazas, intenta cambiar la última por descafeinado.</blockquote>`,
  },
  {
    title: "Los 7 jugadores ecuatorianos más prometedores del 2026",
    excerpt: "La nueva camada que viene pisando fuerte en LigaPro y en Europa. ¿Quién será el próximo Caicedo?",
    category: "Deportes",
    cover:
      "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1200&q=80",
    tags: ["futbol", "ligapro", "la-tri", "ecuador"],
    body: `<p>Ecuador es una fábrica de talento. Estos son los nombres que tienes que apuntar para el próximo año.</p>
<h2>1. Kendry Páez</h2><p>El "messi ecuatoriano" ya juega en Europa y suma minutos con La Tri.</p>
<h2>2. Allen Obando</h2><p>Goleador de Barcelona SC, llamó la atención de varios scouts europeos.</p>
<h2>3. Justin Cuero</h2><p>Mediocampista creativo, pieza importante de la Sub-20.</p>
<h2>4. Anthony Valencia</h2><p>Hermano de Enner, busca su propio camino con buenas actuaciones en LigaPro.</p>
<h2>5. Óscar Zambrano</h2><p>Defensor de proyección internacional.</p>
<h2>6. Bryan Carabalí</h2><p>Velocidad y desborde por las bandas.</p>
<h2>7. Patrik Mercado</h2><p>Joven extremo con confianza en Independiente del Valle.</p>`,
  },
  {
    title: "Estas son las series más vistas en Netflix Ecuador esta semana",
    excerpt: "Hay un drama coreano que arrasa, una serie ecuatoriana que sorprende y un reality que nadie esperaba.",
    category: "Entretenimiento",
    cover:
      "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=1200&q=80",
    tags: ["netflix", "series", "streaming"],
    body: `<p>Netflix publica cada semana el ranking de lo más visto en Ecuador. Aquí el top de esta semana:</p>
<ol>
<li><strong>Squid Game: Temporada 3</strong> — la fiebre coreana sigue.</li>
<li><strong>La casa de los famosos LATAM</strong> — el reality del momento.</li>
<li><strong>El secreto del río</strong> — drama mexicano viral.</li>
<li><strong>Round 6: El desafío</strong> — adaptación real del show.</li>
<li><strong>Yo, la peor</strong> — producción ecuatoriana inspirada en hechos reales.</li>
</ol>
<p>¿Cuál estás viendo tú?</p>`,
  },
  {
    title: "ChatGPT vs Gemini vs Claude: ¿cuál es mejor en 2026?",
    excerpt: "Probamos los tres asistentes con las mismas tareas y los resultados sorprenden. Spoiler: cada uno gana en algo.",
    category: "Tecnología",
    cover:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
    tags: ["ia", "chatgpt", "gemini", "claude"],
    body: `<p>El 2026 trae la pelea de IAs más reñida hasta ahora. Esto es lo que encontramos en pruebas reales.</p>
<h2>Velocidad</h2><p>Gemini gana en respuesta corta, ChatGPT en investigación profunda.</p>
<h2>Programar</h2><p>Claude lidera por amplio margen en código complejo.</p>
<h2>Crear imágenes</h2><p>ChatGPT (con DALL·E) sigue siendo el más versátil.</p>
<h2>Precio</h2><p>Los tres tienen plan gratuito utilizable. El pago ronda los 20 USD/mes.</p>
<h2>¿Cuál usar?</h2><p>Si vas a programar: Claude. Si vas a investigar: ChatGPT. Si vas a integrar con Google: Gemini.</p>`,
  },
  {
    title: "El insólito hallazgo de una familia que excavaba su patio en Manabí",
    excerpt: "Pensaron que era basura vieja, pero al limpiar el objeto se dieron cuenta de que podía cambiarles la vida.",
    category: "Ecuador",
    cover:
      "https://images.unsplash.com/photo-1530210124550-912dc1381cb8?auto=format&fit=crop&w=1200&q=80",
    tags: ["manabi", "arqueologia", "noticias"],
    body: `<p>Lo que comenzó como un proyecto familiar para construir una piscina terminó en una visita del Instituto Nacional de Patrimonio Cultural.</p>
<p>La familia González, en Portoviejo, encontró cerámica precolombina presuntamente de la cultura Manteño-Huancavilca. Tras dar parte a las autoridades, especialistas confirmaron el valor histórico del hallazgo.</p>
<h2>¿Y ahora qué?</h2>
<p>El patrimonio arqueológico es propiedad del Estado. La familia recibió reconocimiento por reportarlo y el sitio será estudiado por arqueólogos.</p>`,
  },
  {
    title: "El país más feliz del mundo en 2026 y por qué no es Suiza",
    excerpt: "El World Happiness Report acaba de actualizar el ranking y el ganador sorprendió a todos.",
    category: "Mundo",
    cover:
      "https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=1200&q=80",
    tags: ["mundo", "felicidad", "ranking"],
    body: `<p>Por séptimo año consecutivo, <strong>Finlandia</strong> lidera el ranking. Pero las posiciones siguientes traen movimientos importantes.</p>
<h2>Top 10 países más felices 2026</h2>
<ol>
<li>Finlandia</li>
<li>Dinamarca</li>
<li>Islandia</li>
<li>Suecia</li>
<li>Israel</li>
<li>Países Bajos</li>
<li>Noruega</li>
<li>Luxemburgo</li>
<li>Suiza</li>
<li>Australia</li>
</ol>
<h2>¿Y América Latina?</h2>
<p>Costa Rica encabeza la región en el puesto 12 global. México se ubica en el 25 y Ecuador en el 56.</p>`,
  },
  {
    title: "5 hábitos diarios que destruyen tu batería sin que te des cuenta",
    excerpt: "Probablemente haces al menos 3 de estos. Quita una y tu celular durará 30% más.",
    category: "Tecnología",
    cover:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80",
    tags: ["bateria", "trucos", "celular"],
    body: `<p>Tu celular pierde autonomía con el tiempo, sí, pero también por culpa de cosas que haces tú.</p>
<ol>
<li><strong>Cargar al 100% siempre:</strong> el ideal es entre 20% y 80%.</li>
<li><strong>Brillo automático apagado:</strong> consume entre 15% y 20% más energía.</li>
<li><strong>Apps en segundo plano:</strong> redes sociales que actualizan ubicación.</li>
<li><strong>Wifi y Bluetooth todo el día:</strong> drenan batería incluso desconectados.</li>
<li><strong>Cargador genérico de mala calidad:</strong> daña la batería a largo plazo.</li>
</ol>`,
  },
  {
    title: "Top 10 películas más esperadas para 2026 (con tráileres)",
    excerpt: "Vuelven Avatar, Mission Impossible y hay una secuela que nadie pidió pero todos veremos.",
    category: "Entretenimiento",
    cover:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80",
    tags: ["cine", "peliculas", "estrenos"],
    body: `<p>El cine vuelve con todo. Estas son las películas que prometen reventar la taquilla.</p>
<ol>
<li>Avatar 3: Fire and Ash</li>
<li>Mission: Impossible — Final Reckoning</li>
<li>Fantastic Four: First Steps</li>
<li>Superman</li>
<li>Wicked: For Good</li>
<li>Zootopia 2</li>
<li>How to Train Your Dragon (Live action)</li>
<li>Jurassic World: Rebirth</li>
<li>Minecraft Movie</li>
<li>Tron: Ares</li>
</ol>`,
  },
  {
    title: "Lo que cuesta vivir en Quito en 2026: gastos reales mes a mes",
    excerpt: "Renta, comida, transporte, internet… los números reales de un profesional que vive solo.",
    category: "Ecuador",
    cover:
      "https://images.unsplash.com/photo-1573599852326-2d4da0bbe613?auto=format&fit=crop&w=1200&q=80",
    tags: ["quito", "economia", "vida"],
    body: `<p>Vivir solo en Quito en 2026 es más caro de lo que muchos creen. Aquí el desglose.</p>
<h2>Renta</h2><p>Departamento de 1 habitación en zona céntrica: $450–$650.</p>
<h2>Comida</h2><p>Si cocinas: $180. Si comes fuera todos los días: $400+.</p>
<h2>Transporte</h2><p>Trole + Metro mensual: $35. Gasolina si tienes carro: $120.</p>
<h2>Internet + celular</h2><p>$45 entre los dos.</p>
<h2>Servicios básicos</h2><p>Agua, luz, gas: $40.</p>
<h2>Total mínimo</h2><p>Alrededor de $750 mensuales viviendo modestamente.</p>`,
  },
];

type MemeSeed = { caption: string; seed: string; author: string };
type TextSeed = { type: "CONFESSION" | "NOTE"; title?: string; body: string; author: string };

const memes: MemeSeed[] = [
  { caption: "Cuando dije que estudiaría todo el fin de semana", seed: "meme-study", author: "ElCrack" },
  { caption: "Yo esperando que baje el precio del pasaje", seed: "meme-bus", author: "Quiteño123" },
  { caption: "Mi cuenta bancaria después de fin de mes", seed: "meme-bank", author: "Anónimo" },
  { caption: "POV: tu mamá te manda al chino a las 11pm", seed: "meme-store", author: "Guayaco" },
  { caption: "Cuando el profe dice 'esto va en el examen'", seed: "meme-exam", author: "Estudiante" },
  { caption: "El lunes mirándome a los ojos", seed: "meme-monday", author: "OficinistaEC" },
  { caption: "Yo fingiendo que entendí la reunión", seed: "meme-meeting", author: "TeleTrabajo" },
  { caption: "Cuando encuentras $5 en el pantalón viejo", seed: "meme-money", author: "Afortunado" },
];

const texts: TextSeed[] = [
  {
    type: "CONFESSION",
    title: "Nunca le dije que fui yo",
    body: "En el cole rompí el vidrio de la dirección con un pelotazo y dejé que culparan a otro curso. Hasta hoy nadie sabe que fui yo. Me arrepiento, pero ya pasaron 8 años.",
    author: "Anónimo",
  },
  {
    type: "CONFESSION",
    title: "Mi jefe cree que soy productivo",
    body: "Llevo dos años trabajando desde casa y la verdad es que termino todo en 3 horas. El resto del día veo series con el laptop abierto por si suena Teams. Nadie se ha dado cuenta.",
    author: "Anónimo",
  },
  {
    type: "CONFESSION",
    body: "Le dije a mi novia que me encanta la comida que cocina. La verdad es que como antes de llegar a su casa para poder fingir.",
    author: "ElNovio",
  },
  {
    type: "CONFESSION",
    title: "Gasté los ahorros familiares en cripto",
    body: "Invertí los ahorros que mi familia juntaba para un viaje. Subió, bajó, y al final recuperé justo lo mismo. Nadie supo nunca lo cerca que estuvimos del desastre.",
    author: "Anónimo",
  },
  {
    type: "CONFESSION",
    body: "Sigo guardando los mensajes de mi ex de hace 4 años. No para volver, solo para acordarme de que sí fui feliz alguna vez.",
    author: "Anónimo",
  },
  {
    type: "NOTE",
    title: "Los pulpos tienen tres corazones",
    body: "Dos bombean sangre a las branquias y uno al resto del cuerpo. Además, su sangre es azul porque usa cobre en vez de hierro para transportar oxígeno.",
    author: "DatoCurioso",
  },
  {
    type: "NOTE",
    title: "La miel nunca se daña",
    body: "Se han encontrado tarros de miel de más de 3.000 años en tumbas egipcias y seguían siendo comestibles. Su bajísima humedad y acidez impiden que las bacterias sobrevivan.",
    author: "AbejaReina",
  },
  {
    type: "NOTE",
    title: "Ecuador tiene la capital más cercana al sol… casi",
    body: "Por la altura de Quito (2.850 m) y por estar en la mitad del mundo, el punto del Chimborazo es el lugar de la Tierra más lejano del centro del planeta y el más cercano al espacio.",
    author: "OrgulloEC",
  },
  {
    type: "NOTE",
    title: "Un rayo es más caliente que el sol",
    body: "La temperatura de un rayo puede alcanzar los 30.000 °C, cinco veces la temperatura de la superficie del sol (unos 5.500 °C).",
    author: "TormentaData",
  },
  {
    type: "NOTE",
    title: "Las bananas son ligeramente radiactivas",
    body: "Contienen potasio-40, un isótopo radiactivo natural. Tan común es que existe la 'dosis equivalente de banana' para explicar la radiación de forma sencilla.",
    author: "CienciaPop",
  },
];

const sampleComments = [
  "JAJAJA me pasó igual 😂",
  "Esto es demasiado real",
  "No puede ser, me sentí atacado",
  "El mejor post del día sin duda",
  "Gracias por compartir, no lo sabía 👏",
  "Me hiciste el día con esto",
  "Uff, qué fuerte 😮",
  "Real, demasiado real",
];

const voterTokens = Array.from({ length: 25 }, (_, i) => `seed-voter-${i + 1}`);
const reactionEmojis = ["😂", "❤️", "😮", "🔥", "😢"];
const commenters = ["Pedro", "Maria", "Anónimo", "Juancho", "Sofi", "ElPana", "Vale"];

async function main() {
  console.log("Cleaning previous data...");
  await prisma.commentVote.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.reaction.deleteMany();
  await prisma.vote.deleteMany();
  await prisma.postTag.deleteMany();
  await prisma.post.deleteMany();
  await prisma.articleTag.deleteMany();
  await prisma.article.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();

  console.log("Creating categories...");
  const catMap = new Map<string, string>();
  for (const c of categories) {
    const created = await prisma.category.create({
      data: { ...c, slug: toSlug(c.name) },
    });
    catMap.set(c.name, created.id);
  }

  console.log("Creating articles + tags...");
  for (const a of articles) {
    const categoryId = catMap.get(a.category);
    if (!categoryId) throw new Error(`Category not found: ${a.category}`);

    const article = await prisma.article.create({
      data: {
        slug: toSlug(a.title),
        title: a.title,
        excerpt: a.excerpt,
        content: a.body,
        coverImage: a.cover,
        coverImageAlt: a.title,
        published: true,
        publishedAt: new Date(),
        featured: a.featured ?? false,
        readingMinutes: Math.max(2, Math.round(a.body.length / 1000)),
        categoryId,
        metaTitle: a.title,
        metaDescription: a.excerpt,
      },
    });

    for (const tagName of a.tags) {
      const tagSlug = toSlug(tagName);
      const tag = await prisma.tag.upsert({
        where: { slug: tagSlug },
        update: {},
        create: { slug: tagSlug, name: tagName },
      });
      await prisma.articleTag.create({
        data: { articleId: article.id, tagId: tag.id },
      });
    }
  }

  console.log("Creating community posts (memes, confessions, notes)...");

  // helper para sembrar votos, reacciones y comentarios en un post
  async function seedEngagement(postId: string, intensity: number) {
    const upvoters = voterTokens.slice(0, intensity);
    let score = 0;
    for (const t of upvoters) {
      const value = Math.random() < 0.85 ? 1 : -1;
      score += value;
      await prisma.vote.create({ data: { postId, voterToken: t, value } });
    }
    const reactors = voterTokens.slice(0, Math.ceil(intensity / 2));
    for (const t of reactors) {
      const emoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
      await prisma.reaction.upsert({
        where: { postId_voterToken_emoji: { postId, voterToken: t, emoji } },
        update: {},
        create: { postId, voterToken: t, emoji },
      });
    }
    const nComments = Math.floor(Math.random() * 4);
    let commentCount = 0;
    for (let i = 0; i < nComments; i++) {
      commentCount++;
      await prisma.comment.create({
        data: {
          postId,
          authorName: commenters[Math.floor(Math.random() * commenters.length)],
          authorToken: `seed-commenter-${i}`,
          body: sampleComments[Math.floor(Math.random() * sampleComments.length)],
        },
      });
    }
    await prisma.post.update({ where: { id: postId }, data: { score, commentCount } });
  }

  let order = 0;
  for (const m of memes) {
    const post = await prisma.post.create({
      data: {
        type: "MEME",
        slug: `${toSlug(m.caption).slice(0, 40)}-m${order++}`,
        title: m.caption,
        imageUrl: `https://picsum.photos/seed/${m.seed}/600/600`,
        imageWidth: 600,
        imageHeight: 600,
        authorName: m.author,
        authorToken: `seed-author-${order}`,
      },
    });
    await seedEngagement(post.id, 5 + Math.floor(Math.random() * 18));
  }

  for (const t of texts) {
    const post = await prisma.post.create({
      data: {
        type: t.type,
        slug: `${toSlug(t.title || t.body).slice(0, 40)}-t${order++}`,
        title: t.title ?? null,
        body: t.body,
        authorName: t.author,
        authorToken: `seed-author-${order}`,
      },
    });
    await seedEngagement(post.id, 5 + Math.floor(Math.random() * 18));
  }

  const count = await prisma.article.count();
  const postCount = await prisma.post.count();
  console.log(
    `Done. ${count} articles + ${postCount} community posts seeded across ${categories.length} categories.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
