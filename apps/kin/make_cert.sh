mkdir -p certs
openssl genrsa -out ./certs/localhost-key.pem 2048
openssl req -new -x509 -sha256 -days 365 -key ./certs/localhost-key.pem -out ./certs/localhost-cert.pem -nodes -subj '/CN=dev.dobry.me'
echo "0.0.0.0 dev.dobry.me" | sudo tee -a /etc/hosts
