# CONTRIBUTING.md

## Bienvenido al rediseño de la web de XauenDevs

Si estás aquí es porque te interesa participar en el rediseño de la web, asi que aquí encontrarás un poco el paso a paso para poder colaborar y saber como hacerlo de la mejor manera posible. Recuerda que es un proyecto realizado con Astro, asi que es una magnifica forma de empezar con esta tecnología y también aportando PR's a la comunidad.

### Como empezar 🚀

1. **Astro JS**: Es cierto que puede ser un poco frustrante el tener que enfrentarse a una nueva tecnología por primera ver pero aqui [la documentación oficial de Astro](https://docs.astro.build) para que te sea más fácil esta aventura.

2. **Configura tu entorno de desarrollo**: Nosotros estamos trabajando con npm, así que es lo que vamos a recomendar y con lo que vamos a trabajar.

### Cómo contribuir 🛠

#### 1. Configura tu entorno

- **Fork el repositorio**: Haz un "fork" del proyecto a tu cuenta de GitHub para tener tu propia copia. Para hacer esto, haz clic en el botón "Fork" en la parte superior derecha de la página del repositorio en GitHub. Esto creará una copia del repositorio en tu cuenta de GitHub.

- **Clona tu fork**: Después de hacer un fork, clona el repositorio a tu máquina local. Para hacerlo, copia la URL de tu fork haciendo clic en el botón verde "Code" y luego ejecuta `git clone <URL del fork>` en tu terminal.

- **Añade el repositorio original como remoto**: Para mantener tu fork actualizado con los cambios del repositorio original, agrega el repositorio original como un remoto. Puedes hacerlo ejecutando `git remote add upstream <URL del repositorio original>`.

- **Instala las dependencias**: Navega hasta el directorio del proyecto clonado y ejecuta `npm install` para instalar todas las dependencias necesarias.

#### 2. Trabaja en tus cambios

- **Sincroniza el fork**: Puedes hacerlo desde `github.com/tu-usuario/tu-repo-de-la-web` y haciendo click en `Sync fork`. También puedes hacerlo desde la terminal `gh repo sync -b main` o `git switch main && git fetch upstream && git merge upstream/main`. Más información en la [documentación oficial de Github](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork)
- **Crea una nueva rama**: Antes de empezar a trabajar en tus cambios, crea una nueva rama utilizando `git switch -c nombre-de-tu-rama`.
- **Desarrolla tus cambios**: Implementa tus cambios o mejoras en tu rama local. Asegúrate de seguir las prácticas y estándares de código del proyecto.
- **Prueba tus cambios**: Ejecuta `npm run dev` para iniciar el servidor de desarrollo de Astro y revisa tus cambios en el navegador.

#### 3. Envía tus cambios

- **Commit de tus cambios**: Una vez estés satisfecho con tus cambios, haz commit de ellos con un mensaje claro y descriptivo.
- **Push a tu fork**: Haz push de tu rama con los cambios a tu fork en GitHub utilizando `git push origin nombre-de-tu-rama`.
- **Crea un Pull Request (PR)**: En GitHub, ve a tu fork de la web y haz clic en "Pull request" para iniciar uno. Asegúrate de describir claramente qué cambios has realizado y por qué son necesarios o útiles para el proyecto.

### Buenas prácticas 🌟

- **Revisa los issues abiertos** antes de abrir una PR, si crees que puedes solucionarlo y no hay ninguna otra PR ya abierta, usa `#numero-de-la-issue` en tu commit para que se añada a la issue. No está demás dejar algún comentario para que se sepa que PR está siendo usada para la issue.
- **Revisa los PRs abiertos** para asegurarte de que no estás trabajando en algo que ya está en progreso. Siempre puedes ayudar en PRs ya abiertas, aportando cambios, comentarios, revisiones, etc..
- **Mantén tus commits limpios y descriptivos**.
- **Sigue las convenciones de código del proyecto**.
- **Actualiza tu rama con frecuencia** para mantenerla al día con la rama principal del proyecto.
- **Participa en las discusiones** de tu PR si hay comentarios o sugerencias.

### ¿Necesitas ayuda? 🆘

Si tienes alguna pregunta o necesitas ayuda, no dudes en abrir un "issue" en el repositorio. Este fichero CONTRIBUTING.md está basado en el que hay en [la web de La Velada 4](https://github.com/midudev/la-velada-web-oficial/blob/main/CONTRIBUTING.md)

¡Gracias por contribuir!

`Hecho en Jaén con 💚`
