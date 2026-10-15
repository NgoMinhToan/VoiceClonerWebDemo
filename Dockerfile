# Production Dockerfile for VoiceClonerWebDemo static web client
FROM nginx:alpine

# Copy static frontend files to nginx root
COPY . /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
