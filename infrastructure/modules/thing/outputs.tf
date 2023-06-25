output "thing_name" {
  description = "Unique identifier of the AWS IoT Thing"
  value       = aws_iot_thing.thing.name
}

output "private_key" {
  description = "RSA private key in PEM format"
  value       = tls_private_key.key.private_key_pem
  sensitive   = true
}

output "cert" {
  description = "PEM encoded certificate"
  value       = aws_iot_certificate.cert.certificate_pem
}
