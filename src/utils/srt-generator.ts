export function generateSRT(script: string): string {
  // Divide el script en oraciones y asigna tiempos
  const lines = script.split('. ').filter(l => l.trim() !== '');
  let srt = '';
  let start = 0;
  const duracionFrase = 3; // segundos por línea
  lines.forEach((line, index) => {
    const end = start + duracionFrase;
    srt += `${index + 1}\n00:00:${start.toString().padStart(2, '0')},000 --> 00:00:${end.toString().padStart(2, '0')},000\n${line.trim()}\n\n`;
    start = end;
  });
  return srt;
}
