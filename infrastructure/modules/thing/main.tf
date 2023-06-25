resource "aws_iot_thing" "thing" {
  name            = "thing_${var.name}"
  thing_type_name = var.thing_type.name
}

resource "tls_private_key" "key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "tls_cert_request" "csr" {
  private_key_pem = tls_private_key.key.private_key_pem
  subject {
    organization = "Light Tomorrow"
    country      = "DE"
  }
}

resource "aws_iot_certificate" "cert" {
  csr    = tls_cert_request.csr.cert_request_pem
  active = true
}

resource "aws_iot_policy_attachment" "policy_attachment" {
  policy = var.policy.name
  target = aws_iot_certificate.cert.arn
}

resource "aws_iot_thing_principal_attachment" "principal_attachment" {
  principal = aws_iot_certificate.cert.arn
  thing     = aws_iot_thing.thing.name
}
