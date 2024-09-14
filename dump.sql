PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS Pivos
(
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT,
    socialImage TEXT,
    image       TEXT,
    description TEXT,
    date        TIMESTAMP,
    location    TEXT DEFAULT "Cuatro Gatos Coworking" NOT NULL
);
INSERT INTO Pivos VALUES(1,'Accesibilidad web, GIT y NodeJS','i-pivo-and-code.png','i-pivo-and-code.png','Primera edición de #pivoandcode donde Antonio Molina nos hablará sobre HTML5 y CSS, Daniel Redondo hará una breve introducción a Git y por último Alberto Tejero creará una pequeña integración continua con hook de git y pm2.','2018-03-18 18:00:00','Cuatro Gatos Coworking');
INSERT INTO Pivos VALUES(2,'Tratamientos de datos meteorológicos con python','ii-pivo-and-code.png','ii-pivo-and-code.png','Primera edición de #pivoandcode donde Antonio Molina nos hablará sobre HTML5 y CSS, Daniel Redondo hará una breve introducción a Git y por último Alberto Tejero creará una pequeña integración continua con hook de git y pm2.','2018-04-16 17:00:00','Cuatro Gatos Coworking');
INSERT INTO Pivos VALUES(3,'Hotdog or Not Hotdog','iii-pivo-and-code.png','iii-pivo-and-code.png','Daremos una introducción amena al Machine Learning y veremos como hacer un clasificador de «Salchicha o No Salchicha» desde cero utilizando redes neuronales.','2018-05-20 17:00:00','Cuatro Gatos Coworking');
INSERT INTO Pivos VALUES(4,'Kafka + Mensajería','iv-pivo-and-code.jpeg','iv-pivo-and-code.jpeg','En un momento en el que todo el mundo habla sobre microservicios, se hace especialmente importante que éstos puedan funcionar de forma autónoma con las mínimas dependencias con otros sistemas externos','2018-07-28 17:00:00','Cuatro Gatos Coworking');
INSERT INTO Pivos VALUES(5,'WordPress: El Framework desconocido','v-pivo-and-code.jpeg','v-pivo-and-code.jpeg','El CMS mñas usado, WordPress, oculta un gran pr tras su sencillo manejo por parte de cualquier usuario. En la charla veremos como los programadores podemos utilizar esta herramienta para crear proyectos complejos con ejemplos prácticos y reales.','2018-11-05 18:00:00','Cuatro Gatos Coworking');
INSERT INTO Pivos VALUES(6,'Ganar dinero en internet es posible','vi-pivo-and-code.jpeg','vi-pivo-and-code.jpeg','Hablaremos de SEO (Posicionamiento en buscadores) una de las profesiones que más han emergido en los últimos años. Veremos casos reales de cómo se gana dinero en Internet con proyectos propios y trabajando para empresas. También veremos los primeros pasos a dar si queremos adentrarnos en el mundo de ganar dinero online de verdad, sin productos milagro ni engaños.','2018-12-09 18:00:00','Cuatro Gatos Coworking');
INSERT INTO Pivos VALUES(7,'Productividad y organización','vii-pivo-and-code.jpeg','vii-pivo-and-code.jpeg','En esta edición trataremos sobre como organizar nuestras tareas y proyectos para ser más eficientes en nuestros proyectos digitales. Mostrando Apps y una metodologia de uso para las mismas. Os enseñaremos como aprender a reducir el estrés y los olvidos, ayudándote a concentrarte en completar tareas, no en tratar de recordarlas.','2019-03-01 18:00:00','Cuatro Gatos Coworking');
INSERT INTO Pivos VALUES(8,'Iníciate en Ruby on Rails','viii-pivo-and-code.jpeg','viii-pivo-and-code.jpeg','Charla orientada a desarrolladores con experiencia en otros lenguajes/frameworks que quieran familiarizarse con Ruby on Rails. Te ayudamos a conocer este exitoso framework para que, con un poco de práctica, no tengas que volver a rechazar una oferta o proyecto de Ruby on Rails.','2019-03-08 18:00:00','Cuatro Gatos Coworking');
INSERT INTO Pivos VALUES(9,'Kata de refactoriación de código','ix-pivo-and-code.jpeg','ix-pivo-and-code.jpeg','Aprovechando la visita de Codium a Dapda nos brindarán la oportunidad de realizar una kata con ellos en la #pivoandcode9. Para esta kata será necesario que cada asistente acuda con su portátil. Una kata es un ejercicio sobre un código existente para aplicar refactoring, tests o patrones buscando así la excelencia en el código y la mantenibilidad.','2019-04-05 17:00:00','Cuatro Gatos Coworking');
INSERT INTO Pivos VALUES(10,'Microservicios con Kotlin','x-pivo-and-code.jpeg','x-pivo-and-code.jpeg','Aunque Kotlin es un lenguaje que no es del todo nuevo, Google ha hecho que repunte su popularidad, pero en este evento queremos demostrar que Kotlin no es un lenguaje sólo para Android. Vamos a usar Kotlin en el lado del servidor y jugar con algunos framework para hacer microservicios. Algunos también añaden el prefijo micro y hablan de microframeworks, vamos a jugar con todo esto y ver que los lenguajes no se cierran a un solo propósito.','2019-04-19 17:00:00','Cuatro Gatos Coworking');
INSERT INTO Pivos VALUES(11,'Realtime & isomorphic apps','xi-pivo-and-code.jpeg','xi-pivo-and-code.jpeg',replace('Jonathan Izquierdo y Jose Carlos Liébana nos hablarán sobre como construir una app utilizando el mismo lenguaje tanto en backend, utilizando NestJS(framework de NodeJS), como para la parte de frontend, con Angular. Todo esto unido con GraphQL para la comunicación entre ellos.\nTambién será una buena oportunidad para aquellos que buscan una nueva opción en Jaén para trabajar en una gran empresa, ya que están buscando desarrolladores y product owners.','\n',char(10)),'2019-05-26 17:00:00','Cuatro Gatos Coworking');
INSERT INTO Pivos VALUES(12,'Inteligencia Artificial: la evolución de las máquinas','xii-pivo-and-code.png','xii-pivo-and-code.png','Que es, de donde viene, por donde empezar, como funciona, nos dominará skynet? Si alguna vez te han inquietado estas preguntas en relación a la inteligencia artificial esta es tu charla! Haremos un viaje por la historia de esta ciencia, alguna demo interesante y sobre todo matemáticas.. Bueno eso mejor para otra charla… os espero!!','2019-10-27 18:00:00','Cuatro Gatos Coworking');
INSERT INTO Pivos VALUES(13,'Django, framework para desarrollo web en python','xiii-pivo-and-code.png','xiii-pivo-and-code.png',replace('Django: framework para desarrollo web en python\nDjango facilita la creación de mejores aplicaciones Web de forma más rápida y con menos código.','\n',char(10)),'2019-11-25 18:00:00','Cuatro Gatos Coworking');
INSERT INTO Pivos VALUES(14,'Construir microservicios en el mundo real','xiv-pivo-and-code.jpeg','xiv-pivo-and-code.jpeg','¿Cansado de teoría que no hay forma de aterrizarla en el código? ¿No te paran de vender que con tener una API REST ya tienes un microservicio? En esta charla se mostrarán casos de uso y problemas de la vida real a la hora de crear microservicios y como solventarlos.','2019-12-15 18:00:00','Cuatro Gatos Coworking');
INSERT INTO Pivos VALUES(15,'Flutter: Un SDK para gobernarlos a todos','xv-pivo-and-code.png','xv-pivo-and-code.png','Durante la charla se hablará sobre Flutter, el SDK de moda. Flutter es el nuevo framework mobile de Google para crear interfaces nativas de alta calidad en iOS y Android en un tiempo récord. Pero los planes de los de Mountain View tienen planes más ambiciosos para su nueva herramienta. Hablaremos de todo ello, y veremos los pros y cons que han surgido al implementar Flutter en un proyecto empresarial real.','2020-01-13 18:00:00','Cuatro Gatos Coworking');
INSERT INTO Pivos VALUES(16,'Cómo empezar con AWS sin arruinarte en el intento','xvi-pivo-and-code.png','xvi-pivo-and-code.png','¿Por qué usar la nube? Todo el mundo habla de ello, pero ¿qué ventajas me puede proporcionar usarla? Se hará una breve introducción a AWS y como empezar a usar los servicios básicos de forma gratuita. Veremos como interactuar con el panel de AWS, levantar una máquina y ver la monitorización. El objetivo es usar AWS cuando tengamos cosas que probar y que no nos suene a chino cuando alguien nos hable del apasionante mundo del cloud computing.','2020-02-24 18:00:00','Cuatro Gatos Coworking');
INSERT INTO Pivos VALUES(17,'Ruta de la Isla de Java a la de Kotlin','xvii-pivo-and-code.png','xvii-pivo-and-code.png',replace('Cuando Jetbrains introdujo Kotlin y más aun cuando Google anunció que éste sería el primer lenguaje para aplicaciones de Android, tuvo un gran impacto en la comunidad, donde muchas empresas y desarrolladores empezaron su expedición a la Isla de Kotlin.\nEn esta charla se mostrará un fantástico viaje en el que partiremos de código en Java y lo iremos transformando a Kotlin enseñando las ventajas y el potencial que este lenguaje nos brinda día a día.','\n',char(10)),'2020-03-21 18:00:00','Cuatro Gatos Coworking');
INSERT INTO Pivos VALUES(18,'SEO Local, cómo ponerte en el centro de tu ciudad','i-pivo-code-and-house.png','i-pivo-code-and-house.png',replace('Que vamos a ver con Carlos García…\n¿Qué es el SEO local? Cuales son la principales diferencias entre el SEO tradicional. Cómo podemos trabajar el SEO local. Cómo usar Google My Business para nuestra estrategia de SEO local. Ronda de preguntas y dudas.','\n',char(10)),'2020-04-26 17:00:00','Cuatro Gatos Coworking');
INSERT INTO Pivos VALUES(19,'Machine Learning','xviii-pivo-and-code.jpeg','xviii-pivo-and-code.jpeg','Antonio Paredes, un cientifico loco y amante de las guitarras nos va a hacer una pequeña introducción a este mundo del Machine Learning.','2020-05-24 17:00:00','Cuatro Gatos Coworking');
INSERT INTO Pivos VALUES(20,'La Fluttertulia Labs','xix-pivo-and-code.jpg','xix-pivo-and-code.jpg','Introducción a Arquitectura CLEAN con Flutter. Teoría, práctica y herramientas que nos hacen la vida más fácil. Buscando el equilibrio entre performance y quality.','2023-02-17 18:30:00','Cuatro Gatos Coworking');
INSERT INTO Pivos VALUES(21,'Como complicarte la vida haciendo un blog con Next.js y Github','xix-pivo-and-code.jpg','xix-pivo-and-code.jpg','Podríamos hacer un blog con wordpress? Si. Pero también podemos complicarnos un poco la vida y utilizar Github como "CMS Headless", teniendo nuestro front hecho con Next.js 🤯. Alberto Tejero, desarrollador frontend en Bravent, nos va a contar como podemos construir nuestro blog totalmente GRATIS utilizando Github y Nextjs.','2023-03-24 18:30:00','Cuatro Gatos Coworking');
INSERT INTO Pivos VALUES(22,'Intercambio de información en el IoT','xxi-pivo-and-code.jpg','xxi-pivo-and-code.jpg','En la próxima Pivo&Code Pedro Ruiz, desarrollador en Innovasur, realizará una breve introducción a las tecnologías para el intercambio de mensajes entre dispositivos inteligentes. Para finalizar tendremos un taller en el que utilizaremos fiware para enviar y recibir información','2023-04-21 19:00:00','Cuatro Gatos Coworking');
INSERT INTO Pivos VALUES(23,'Descubriendo SvelteKit','xxii-pivo-and-code.jpg','xxii-pivo-and-code.jpg','En esta nueva edición de PivoAndCode traemos un taller con el que descubriremos como usar SvelteKit, un framework de JavaScript para crear aplicaciones web, de una manera muy fácil y sencilla, Flavio Oria (Desarrollador en Creatio Energy System) nos guiará para realizar un pequeño CRUD con el que gestionar el registro de empleados que tenemos en una empresa.','2023-05-19 19:00:00','Cuatro Gatos Coworking');
INSERT INTO Pivos VALUES(24,'Graph Databases con Neo4j','xxiii-pivo-and-code.jpg','xxiii-pivo-and-code.jpg',replace('¡Atención a todos los amantes de la tecnología! Únete a nosotros en una charla nuestras Pivo&Code. Descubre el emocionante mundo de las bases de datos de grafos con Neo4j de la mano de Pedro Díez, Senior Software Engineer en AttackIQ.\nAprenderás cómo utilizar Neo4j para organizar y explorar datos de una manera visual e innovadora. Pedro compartirá ejemplos prácticos y consejos para modelar información en nodos y relaciones, realizar consultas en lenguaje Cypher y visualizar los resultados en gráficos intuitivos.\nYa seas estudiante, programador o simplemente alguien curioso, esta charla es perfecta para ti. ¡No te pierdas la oportunidad de descubrir una forma emocionante de trabajar con los datos!\nÚnete a nosotros en PivoAndCode: XXIII y prepárate para una charla llena de conocimientos prácticos. ¡Te esperamos para explorar juntos el poder de las bases de datos de grafos con Neo4j!','\n',char(10)),'2023-06-09 19:00:00','Cuatro Gatos Coworking');
INSERT INTO Pivos VALUES(25,'OSINT osant, cada día te busco más','xxiv-pivo-and-code.webp','xxiv-pivo-and-code.webp',replace('¿Te has preguntado cómo los detectives cibernéticos encuentran información en línea? 🤓💻 ¡Es hora de descubrirlo! Únete a nuestra charla sobre Inteligencia de Fuentes Abiertas (OSINT) de una manera juvenil y fresca.\nAdrían Estévez, SOC Analyst en Innovasur es nuestro próximo charlante y en esta emocionante sesión, aprenderás las herramientas básicas y trucos que necesitas para convertirte en un maestro de la investigación en línea 🧐💡. No importa si eres nuevo en este mundo o si ya tienes experiencia, ¡seguro encontrarás algo nuevo que te sorprenderá! 🚀\nLa web está llena de secretos digitales esperando ser desvelados, y nosotros te mostraremos cómo hacerlo de manera efectiva y divertida. 🌐🔍\nAsí que, ¿estás listo para embarcarte en este apasionante viaje de descubrimiento digital? No te lo pierdas y únete a nosotros en "OSINT osant, cada día te busco más". ¡Te prometemos que cada día te enamorarás más de la OSINT! 💘💻','\n',char(10)),'2023-09-22 19:00:00','Cuatro Gatos Coworking');
INSERT INTO Pivos VALUES(26,'De 0 a héroe con MLOps','xxv-pivo-and-code.webp','xxv-pivo-and-code.webp',replace('Esta charla propone un recorrido metódico por el pipeline de MLOps, abordando desde las fases iniciales de tratamiento y etiquetado de datos hasta la implementación y monitorización de modelos de Machine Learning (ML) en entornos de producción. La primera parte de la charla se enfocará en las etapas de preprocesamiento de datos y desarrollo de modelos en un entorno de laboratorio, poniendo énfasis en las mejores prácticas y retos comunes.\n\nPosteriormente, la conversación se desplazará hacia aspectos cruciales como el control de versiones de modelos, exportación y validación, destacando la importancia de un formato interoperable. Finalmente, se discutirá la integración continua del modelo validado en el entorno de producción, resaltando las estrategias para un mantenimiento efectivo y un monitoreo proactivo del rendimiento del modelo en aplicaciones en vivo. La charla buscará proporcionar un panorama claro y conciso de los MLOps, equipando a los asistentes con conocimientos aplicables para optimizar tus propios flujos de trabajo de ML.','\n',char(10)),'2023-10-27 19:00:00','Cuatro Gatos Coworking');
INSERT INTO Pivos VALUES(27,'NBomber, haz pruebas de carga a un sistema','xxvi-pivo-and-code.jpeg','xxvi-pivo-and-code.jpeg','🚀 ¡Prepárate para un viaje emocionante con NBomber! 🛠️💣 Únete a Cesar Diaz, nuestro próximo charlante y .NET Technical Lead en Bravent, el 24 de noviembre a las 17:00.Descubre cómo hacer pruebas de carga a un sistema y ¡desata el poder de la optimización de rendimiento! 🚀🔥 ¡No te pierdas esta oportunidad de mejorar tus KPIs y llevar tus procesos de CI/CD al siguiente nivel! 📈💻¡Te esperamos con ansias para compartir conocimientos, risas y algunos secretos de rendimiento! 🤓🎉','2023-11-24 19:00:00','Cuatro Gatos Coworking');
INSERT INTO Pivos VALUES(28,'Homelabbing, tu nube en casa para sobrevivir a la edad de la información','xxvii-pivo-and-code.jpeg','xxvii-pivo-and-code.jpeg',replace('🚀 ¡Prepárate para construir tu propia nube en casa! 🌐🛠️\n\n¿Quieres tener tu propio Google Drive privado? ¿Y un servidor de tu videojuego favorito? ¿Tienes un pórtatil antiguo pillando polvo en tu armario y no sabes cómo aprovecharlo?🕹️\n\nAprende a construir y gestionar tu nube personal en casa con Alberto Rodríguez, desarrollador en Innovasur.\n\n¡Veremos como empezar tu nube con hardware básico como Raspberry Pi hasta equipos reutilizados o servidores de segunda mano, y cómo hostear servicios en un servidor virtual gratuito! 🤑💻\n\nExploraremos sistemas operativos y técnicas de almacenamiento para asegurar tus datos 💾\n\nDiseñaremos un stack completo utilizando tecnologías como Proxmox, TrueNAS y Docker. 🐋\n\n¡No te pierdas esta oportunidad de aprender a ser tu propio proveedor de servicios en la nube y llevar tus proyectos a nuevas alturas! 🤓🎉','\n',char(10)),'2024-03-22 19:00:00','Cuatro Gatos Coworking');
INSERT INTO Pivos VALUES(29,'Tras los píxeles, Descifrando el código de la Realidad Virtual y Aumentada','xxviii-pivo-and-code.jpeg','xxviii-pivo-and-code.jpeg',replace('¿Alguna vez has querido ser el Dios de tu propio universo virtual? 🌌 ¡Pues prepárate para aprender a codearlo todo! 💻 En nuestra charla sobre aplicaciones de realidad virtual y aumentada, vamos a sumergirnos en un mundo lleno de posibilidades. 💫 Desde el desarrollo para Apple Vision Pro, Meta Quest hasta Hololens, ¡te mostraremos cómo comenzar en este viaje alucinante! 🚀\n\nRealizaremos algunos ejemplos ¡en directo! sobre las plataformas anteriores. 👾 ¿El objetivo? ¡Conocer cómo se desarrolla y las diferencias entre Realidad Virtual y Realidad Aumentada! 🎮\n\n¿Quieres unirte a la aventura? ¡Pues agarra tus gafas de realidad virtual y vente a la pivo! 🎉 Es importante que nos confirmes la asistencia y si tienes gafas (de RV 🕶️), ¡porque podemos llevar varias para probar juntos esta experiencia alucinante! ¡No te pierdas esta oportunidad épica de aprender y divertirte! 🎉🚀\n\n','\n',char(10)),'2024-04-26 19:00:00','Cuatro Gatos Coworking');
INSERT INTO Pivos VALUES(30,'Diseño UI/UX para Desarrolladores','xxix-pivo-and-code.jpeg','xxix-pivo-and-code.jpeg',replace('¿Estás cansado de que el diseñador gráfico de tu empresa critique tu trabajo como desarrollador? 😫 Seguramente tienen sus razones, pero en nuestra charla "Diseño UI/UX para Desarrolladores", te llevaremos de la mano para que entiendas de qué habla cuando menciona términos como tipografías sans-serif, jerarquía visual, kerning, tracking, interlineado, paleta cromática o sistemas de diseño.\n\nSumérgete en el mundo del Diseño Gráfico, del Diseño de Interfaces de Usuario (UI) y Experiencia de Usuario (UX) con José Cruz, diseñador en Innovasur. 🌟\n\nAprenderás los conceptos básicos del diseño a partir de un proyecto real explicado de principio a fin: el restyling de la marca XauenDevs y su Landing Page. 🚀\n\n¡No te pierdas esta oportunidad de hacer feliz a un diseñador y descubrirás por qué es bueno tenerlo de tu lado! 😄🎉🎨','\n',char(10)),'2024-05-10 19:00:00','Cuatro Gatos Coworking');
INSERT INTO Pivos VALUES(31,'Extreme Programming: el superpoder que necesitas en el desarrollo de software','xxx-pivo-and-code.jpeg','xxx-pivo-and-code.jpeg',replace('¿Te sientes atrapado en el caos del desarrollo de software? 🌪️\n¿Buscas una forma de mejorar la eficiencia y la calidad del software? 🚀\nNo te pierdas ‘Extreme Programming: el super poder que necesitas como software developer’.\n\nEn esta charla, exploraremos cómo Extreme Programming puede ser la solución a estos problemas y te ayudará a navegar por el caos mejorando la calidad de tu trabajo.\n\n🔍 Y para hacerlo aún más emocionante, ¡habrá un regalo sorpresa al final! 🎁\n\n¡No te lo pierdas! 🎉','\n',char(10)),'2024-05-31 19:00:00','Cuatro Gatos Coworking');
CREATE TABLE IF NOT EXISTS Speakers
(
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    name    TEXT,
    image   TEXT
);
INSERT INTO Speakers VALUES(1,'Raúl Moya','raul.png');
INSERT INTO Speakers VALUES(2,'Alberto Tejero',NULL);
INSERT INTO Speakers VALUES(3,'Antonio Cantero',NULL);
INSERT INTO Speakers VALUES(4,'Daniel Redondo',NULL);
INSERT INTO Speakers VALUES(5,'José Cruz','jose-cruz.jpeg');
INSERT INTO Speakers VALUES(6,'Pedro D. Diez',NULL);
INSERT INTO Speakers VALUES(7,'Lorena del Moral',NULL);
INSERT INTO Speakers VALUES(8,'Luis Rovirosa','codium.jpeg');
INSERT INTO Speakers VALUES(9,'César Díaz','cesar-diaz.png');
INSERT INTO Speakers VALUES(10,'Samuel Rocha',NULL);
INSERT INTO Speakers VALUES(11,'Abdallah Abedraba',NULL);
INSERT INTO Speakers VALUES(12,'José Carlos Liébana',NULL);
INSERT INTO Speakers VALUES(13,'Rocio Ortega',NULL);
INSERT INTO Speakers VALUES(14,'Jordi Anguela',NULL);
INSERT INTO Speakers VALUES(15,'Antonio Molina',NULL);
INSERT INTO Speakers VALUES(16,'Carlos Villalon',NULL);
INSERT INTO Speakers VALUES(17,'Antonio Paredes',NULL);
INSERT INTO Speakers VALUES(18,'Jonathan Izquierdo',NULL);
INSERT INTO Speakers VALUES(19,'Francisco Sánchez',NULL);
INSERT INTO Speakers VALUES(20,'Carlos García',NULL);
INSERT INTO Speakers VALUES(21,'Alberto Vara',NULL);
INSERT INTO Speakers VALUES(22,'Alberto Rodríguez','alberto-rodriguez.png');
INSERT INTO Speakers VALUES(23,'Daniel García',NULL);
INSERT INTO Speakers VALUES(24,'Diego Montesinos',NULL);
INSERT INTO Speakers VALUES(25,'Guillermo del Pino',NULL);
INSERT INTO Speakers VALUES(26,'Carlos Barroso','carlos_barroso.webp');
INSERT INTO Speakers VALUES(27,'Juan Isern Ghosn',NULL);
INSERT INTO Speakers VALUES(28,'Adrían Estévez',NULL);
INSERT INTO Speakers VALUES(29,'Pedro Ruiz',NULL);
INSERT INTO Speakers VALUES(31,'Flavio Oria',NULL);
CREATE TABLE IF NOT EXISTS Pivos_Speakers
(
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    pivo_id    INTEGER,
    speaker_id INTEGER,
    foreign key (pivo_id) REFERENCES Pivos (id),
    foreign key (speaker_id) REFERENCES Speakers (id)
);
INSERT INTO Pivos_Speakers VALUES(1,31,1);
INSERT INTO Pivos_Speakers VALUES(3,1,2);
INSERT INTO Pivos_Speakers VALUES(4,25,28);
INSERT INTO Pivos_Speakers VALUES(5,27,9);
INSERT INTO Pivos_Speakers VALUES(6,30,5);
INSERT INTO Pivos_Speakers VALUES(7,20,3);
INSERT INTO Pivos_Speakers VALUES(8,1,4);
INSERT INTO Pivos_Speakers VALUES(9,1,15);
INSERT INTO Pivos_Speakers VALUES(10,2,6);
INSERT INTO Pivos_Speakers VALUES(11,3,11);
INSERT INTO Pivos_Speakers VALUES(12,4,24);
INSERT INTO Pivos_Speakers VALUES(13,5,10);
INSERT INTO Pivos_Speakers VALUES(14,6,25);
INSERT INTO Pivos_Speakers VALUES(15,8,19);
INSERT INTO Pivos_Speakers VALUES(16,7,16);
INSERT INTO Pivos_Speakers VALUES(17,9,8);
INSERT INTO Pivos_Speakers VALUES(18,9,14);
INSERT INTO Pivos_Speakers VALUES(19,10,4);
INSERT INTO Pivos_Speakers VALUES(20,11,18);
INSERT INTO Pivos_Speakers VALUES(21,11,12);
INSERT INTO Pivos_Speakers VALUES(22,12,23);
INSERT INTO Pivos_Speakers VALUES(23,13,6);
INSERT INTO Pivos_Speakers VALUES(24,15,3);
INSERT INTO Pivos_Speakers VALUES(25,14,21);
INSERT INTO Pivos_Speakers VALUES(26,16,7);
INSERT INTO Pivos_Speakers VALUES(27,17,13);
INSERT INTO Pivos_Speakers VALUES(28,18,20);
INSERT INTO Pivos_Speakers VALUES(29,19,17);
INSERT INTO Pivos_Speakers VALUES(30,21,2);
INSERT INTO Pivos_Speakers VALUES(31,22,29);
INSERT INTO Pivos_Speakers VALUES(32,23,31);
INSERT INTO Pivos_Speakers VALUES(33,24,6);
INSERT INTO Pivos_Speakers VALUES(34,26,27);
INSERT INTO Pivos_Speakers VALUES(35,28,22);
INSERT INTO Pivos_Speakers VALUES(36,29,26);
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('Pivos',31);
INSERT INTO sqlite_sequence VALUES('Speakers',31);
INSERT INTO sqlite_sequence VALUES('Pivos_Speakers',36);
COMMIT;
