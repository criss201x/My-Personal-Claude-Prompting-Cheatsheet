FROM oven/bun:1

WORKDIR /app

COPY api/package.json ./

RUN bun install --production

COPY api/ .

# Fuente de verdad única: datos de seed vienen del frontend
COPY mi-app/src/data/prompts.js ./seed-data.js

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun -e "const r = await fetch('http://localhost:3001/health'); if (!r.ok) process.exit(1)"

EXPOSE 3001

CMD ["bun", "run", "index.js"]
