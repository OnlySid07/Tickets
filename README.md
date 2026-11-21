# Impresor de tickets

Aplicación Vite para escribir e imprimir dedicatorias, mensajes, números o tickets simples en una impresora térmica de 80 mm o 58 mm.

No usa backend, no usa QZ Tray y no necesita ningún servicio local. La página se puede desplegar en Vercel porque la impresión ocurre en el navegador del usuario, contra la impresora instalada en su propia PC.

## Desarrollo

El proyecto usa **pnpm 12**. El campo `packageManager` ya está configurado en `package.json`.

```bash
pnpm install
pnpm dev
```

Si PowerShell bloquea `pnpm.ps1`, usa `pnpm.cmd`:

```bash
pnpm.cmd install
pnpm.cmd dev
```

Abre la URL que muestra Vite, normalmente `http://localhost:5173`.

## Producción

```bash
pnpm build
pnpm preview
```

El resultado queda en `dist/`.

## Desplegar en Vercel

1. Sube el proyecto a un repositorio.
2. Importa el repositorio en Vercel.
3. Vercel detecta Vite y pnpm por el `pnpm-lock.yaml`:
   - Build command: `pnpm build`
   - Output directory: `dist`
4. Despliega.

También puedes usar la CLI:

```bash
pnpm dlx vercel
```

## Cómo imprimir

1. Abre la aplicación en el PC donde está conectada la impresora.
2. Escribe el título, el mensaje y, si quieres, el número y el pie de página.
3. Revisa la vista previa.
4. Pulsa **Imprimir ticket**.
5. En el diálogo de impresión elige **EPSON TM-H6000IV**.
6. Configura:
   - Márgenes: **Ninguno**
   - Escala: **100 %**
   - Encabezados y pies de página: **desactivados**
7. Imprime.

El navegador no permite elegir la impresora desde la página por seguridad. La elección se hace en el diálogo de Windows. Si la Epson está configurada como predeterminada, aparecerá seleccionada por defecto o será la primera opción.

## Requisito importante

La impresora debe estar instalada en Windows como **cola de impresión**, no solo como puerto. Es decir, debe aparecer en **Configuración → Bluetooth y dispositivos → Impresoras y escáneres**, con su driver y su puerto USB.

Si solo aparece en la pestaña **Puertos**, pide a IT que cree la cola con el driver **Epson Advanced Printer Driver** sobre el puerto correspondiente (`USB001`, `ESDPRT001`, etc.). Sin cola de Windows, ningún navegador puede imprimir en ella.

## Notas

- El contador de folios se guarda en `localStorage` del navegador. El contenido del ticket no se guarda.
- El ancho de 80 mm usa 72 mm de área imprimible; el de 58 mm usa 48 mm.
- El tamaño “Muy grande” es útil para imprimir números o avisos cortos.
- La longitud de la página se calcula automáticamente según el contenido para no desperdiciar papel.
- `Ctrl + Enter` también imprime.
- El navegador no envía comandos ESC/POS. El corte, el cajón de dinero y el origen de papel se configuran en el driver de Epson, no en la página.
- Si el driver de Epson ignora el tamaño personalizado, configura el papel como rollo de 80 mm en las preferencias de impresión y vuelve a probar.
- Si IT necesita impresión silenciosa, puede evaluar la política `SilentPrintingEnabled` de Chrome/Edge, pero para un entorno bancario es preferible mantener el diálogo de confirmación.
