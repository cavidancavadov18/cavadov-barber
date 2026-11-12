FROM python:3.12-slim
WORKDIR /app

COPY backend/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

COPY backend /app/backend
COPY public /app/public
COPY prisma /app/prisma

ENV PYTHONPATH=/app/backend
ENV DATABASE_URL=file:/app/data/prod.db
ENV UPLOAD_DIR=/app/public/media/uploads

RUN mkdir -p /app/data /app/public/media/uploads

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
