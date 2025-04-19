#!/bin/bash

CERT_DIR="certs"
mkdir -p $CERT_DIR

# Génération d'un certificat auto-signé
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout $CERT_DIR/nginx-selfsigned.key \
  -out $CERT_DIR/nginx-selfsigned.crt \
  -subj "/C=FR/ST=Paris/L=Paris/O=42/CN=localhost"

echo "Certificats SSL générés avec succès dans $CERT_DIR"