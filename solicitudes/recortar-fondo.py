"""Recorta el fondo de una foto (deja PNG con transparencia), estilo "character hero".

Se usa para las fotos de keynotes: el slide las pinta sobre negro con un glow
detrás, así que la foto tiene que venir sin fondo.

Requiere uv (https://docs.astral.sh/uv/) y descargar el modelo u2net una vez:

    curl -L -o /tmp/u2net.onnx \
      https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net.onnx

    uv run --with onnxruntime --with pillow --with numpy \
      solicitudes/recortar-fondo.py /tmp/u2net.onnx foto.jpg salida.png

Después se pasa a webp (el formato que usa el sitio):

    node -e "require('sharp')('salida.png').webp({quality:90,alphaQuality:100})\
      .toFile('public/images/keynotes/nombre.webp')"
"""

import sys
from collections import deque

import numpy as np
import onnxruntime as ort
from PIL import Image, ImageFilter

SIZE = 800          # lienzo cuadrado, mismo encuadre que trae la foto original
PELO_OSCURO = 30.0  # luminancia de referencia del pelo oscuro

model, src, out = sys.argv[1], sys.argv[2], sys.argv[3]
session = ort.InferenceSession(model, providers=['CPUExecutionProvider'])
input_name = session.get_inputs()[0].name

image = Image.open(src).convert('RGB')
width, height = image.size
rgb = np.asarray(image, dtype=np.float32)
lum = rgb @ np.array([0.299, 0.587, 0.114], np.float32)
chroma = rgb.max(axis=2) - rgb.min(axis=2)

# --- máscara base ---
# u2net espera 320x320 normalizado con la media/desviación de ImageNet
sample = np.asarray(image.resize((320, 320), Image.LANCZOS), dtype=np.float32) / 255.0
sample = sample / max(sample.max(), 1e-6)
sample = (sample - np.array([0.485, 0.456, 0.406], np.float32)) / np.array([0.229, 0.224, 0.225], np.float32)
prediction = session.run(None, {input_name: sample.transpose(2, 0, 1)[None]})[0][0][0]
prediction = (prediction - prediction.min()) / max(prediction.max() - prediction.min(), 1e-6)

mask = Image.fromarray((prediction * 255).astype('uint8'), 'L').resize((width, height), Image.LANCZOS)
contrasted = np.clip((np.asarray(mask, dtype=np.float32) / 255.0 - 0.35) / 0.30, 0, 1)
mask = Image.fromarray((contrasted * 255).astype('uint8'), 'L')
# encoger 1px mata el halo claro que deja el fondo del estudio; el blur suaviza el borde
mask = mask.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.9))
alpha = np.asarray(mask, dtype=np.float32) / 255.0

# --- fondo atrapado dentro del contorno ---
# u2net marca como opaco el fondo que se ve ENTRE los mechones sueltos, y eso
# sale como una mancha gris dentro del pelo. Se busca el fondo inundando desde
# el marco de la foto por píxeles claros y neutros: entra por esos huecos y no
# toca reflejos aislados dentro de la cara (la piel no es neutra).
borde = np.concatenate([rgb[:12].reshape(-1, 3), rgb[-12:].reshape(-1, 3),
                        rgb[:, :12].reshape(-1, 3), rgb[:, -12:].reshape(-1, 3)])
fondo = np.median(borde, axis=0)
fondo_lum = float(fondo @ np.array([0.299, 0.587, 0.114], np.float32))

candidato = (chroma < 20) & (lum > 92)
zona = np.zeros((height, width), bool)
pendientes = deque()
for x in range(width):
    for y in (0, height - 1):
        if candidato[y, x] and not zona[y, x]:
            zona[y, x] = True
            pendientes.append((y, x))
for y in range(height):
    for x in (0, width - 1):
        if candidato[y, x] and not zona[y, x]:
            zona[y, x] = True
            pendientes.append((y, x))
while pendientes:
    y, x = pendientes.popleft()
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        ny, nx = y + dy, x + dx
        if 0 <= ny < height and 0 <= nx < width and candidato[ny, nx] and not zona[ny, nx]:
            zona[ny, nx] = True
            pendientes.append((ny, nx))

zona_suave = np.asarray(
    Image.fromarray((zona * 255).astype('uint8'), 'L').filter(ImageFilter.GaussianBlur(0.8)),
    dtype=np.float32,
) / 255.0

# dentro de esa zona la transparencia real sale de la mezcla pelo/fondo, no de u2net.
# Fuera de ella NO se toca: aplicarlo al contorno de la piel se come la mandíbula.
mezcla = np.clip((fondo_lum - lum) / (fondo_lum - PELO_OSCURO), 0, 1)
alpha = alpha * (1 - zona_suave) + np.minimum(alpha, mezcla) * zona_suave

# quitar el tinte gris que arrastran los píxeles semitransparentes
a = alpha[..., None]
sin_tinte = np.clip(np.where(a > 0.06, (rgb - (1 - a) * fondo) / np.maximum(a, 0.06), rgb), 0, 255)
limpiar = (zona_suave > 0.25) & (alpha > 0.06) & (alpha < 0.985)
color = rgb.copy()
color[limpiar] = sin_tinte[limpiar]

result = Image.fromarray(np.dstack([color, alpha * 255]).astype('uint8'), 'RGBA')
if result.size[0] != SIZE:
    result = result.resize((SIZE, SIZE), Image.LANCZOS)
result.save(out)
print(out, result.size)
