# Solicitud de datos para la agenda

Dos archivos CSV para pedir en Excel lo que falta de la agenda y de los
ponentes, y dos comandos para pasarlos al sitio sin editar JSON a mano.

```
npm run csv:generar     # crea/actualiza agenda.csv y ponentes.csv desde el sitio
npm run csv:importar    # carga los CSV llenos de vuelta al sitio
npm run csv:importar -- --dry   # muestra qué cambiaría, sin escribir nada
```

## Cómo se usa

1. `npm run csv:generar` — deja `agenda.csv` y `ponentes.csv` con **todo lo que
   ya hay**, y la primera columna (`QUE_FALTA`) dice qué le falta a cada fila.
2. Se envían los dos archivos a quien tiene la información.
3. Regresan llenos → se dejan en esta misma carpeta, con el mismo nombre.
4. `npm run csv:importar` — actualiza `src/data/agenda.json` y
   `src/data/speakers.json`. Imprime todo lo que cambió.
5. `npm run build` para verificar, y commit.

## Reglas al llenar los CSV

- **No tocar las columnas `id_sesion` ni `id_ponente`** de las filas que ya
  vienen llenas: son las que amarran cada fila con el sitio.
- **Para agregar algo nuevo** (una charla o un ponente que no estaba), se
  agrega una fila al final y se deja el id **vacío**: el id se genera solo.
  Los CSV ya traen filas en blanco listas para eso.
- Una celda vacía significa «no lo cambies», no «bórralo». Para vaciar un dato
  hay que editar el JSON a mano.
- `QUE_FALTA` es informativa: se ignora al importar.
- El importador **nunca borra** sesiones ni ponentes. Quitar algo se hace a
  mano en el JSON.

### agenda.csv

| Columna | Qué va |
|---|---|
| `tipo` | `charla` o `plenaria` (plenaria = registro, keynote, almuerzo, cierre: sale como banner de ancho completo) |
| `hora_inicio` / `hora_fin` | formato `HH:MM` |
| `salon` | el **nombre** del salón. Dos salones combinados: `Salón 1 + Salón 2` |
| `ponente` | como se quiere que aparezca en la tarjeta |
| `organizacion` | empresa del ponente. Si se deja vacía, se toma la de `ponentes.csv` |
| `track` | el **nombre** del track |

Salones y tracks válidos los imprime `npm run csv:generar` al final.

### ponentes.csv

| Columna | Qué va |
|---|---|
| `nombre` | nombre completo |
| `cargo` | puesto (ej. `Solutions Architect`) |
| `organizacion` | empresa |
| `pais` | nombre del país, define la banderita de la tarjeta |
| `linkedin` | URL completa |
| `foto` | nombre del archivo, ej. `ada-lovelace.webp` |

La foto **no viaja en el CSV**: se envía aparte y se deja en
`public/images/speakers/`. Si el archivo todavía no está, el importador avisa y
la tarjeta sale con las iniciales del ponente — no se rompe nada.

## Cómo se enlaza una charla con su ponente

Es lo que le pone foto y bandera a la tarjeta de la agenda. El importador lo
resuelve así:

1. Si la fila trae `id_ponente`, usa ese.
2. Si no, busca en `ponentes.csv` un nombre **idéntico** (ignorando acentos y
   mayúsculas) al de la columna `ponente`.
3. Si no lo encuentra, avisa y la tarjeta queda con iniciales, sin bandera.

Por eso conviene escribir el nombre igual en los dos archivos.

## Si Excel muestra todo en una sola columna

Los CSV se generan separados por comas y con BOM UTF-8 (que es lo que Excel
necesita para los acentos). Si aun así queda todo en la columna A: **Datos →
Texto en columnas → Delimitado → Coma**. Google Sheets los abre bien de una vez.

Al guardar desde Excel hay que mantener el formato **CSV UTF-8**. Si Excel
guarda con `;` como separador, el importador igual lo detecta.
