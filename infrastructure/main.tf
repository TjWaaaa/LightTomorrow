locals {
  sensors = [
    "proximity_workplace_1", "proximity_workplace_2", "lightsensor_outside"
  ]
  actuators = [
    "light_workplace_1", "light_workplace_2"
  ]
}

resource "aws_cloudformation_stack" "network" {
  name          = "detector-model-stack"
  template_body = file("detectormodel/LightActuator.json")
}

resource "aws_iot_thing_type" "sensor" {
  name = "Sensor"

  properties {
    description = "Used for the proximity- and light sensor."
  }
}

resource "aws_iot_thing_type" "actuator" {
  name = "Actuator"

  properties {
    description = "Used for the workplace light actuators."
  }
}

module "sensors" {
  for_each   = toset(local.sensors)
  source     = "./thing"
  name       = "sensor_${each.key}"
  thing_type = aws_iot_thing_type.sensor
  policy     = aws_iot_policy.thing_policy
}

module "actuators" {
  for_each   = toset(local.actuators)
  source     = "./thing"
  name       = "actuator_${each.key}"
  thing_type = aws_iot_thing_type.actuator
  policy     = aws_iot_policy.thing_policy
}

data "aws_iam_policy_document" "thing_policy_doc" {
  statement {
    effect    = "Allow"
    actions   = ["iot:*"]
    resources = ["*"]
  }
}

resource "aws_iot_policy" "thing_policy" {
  name   = "everythingAllowedIot"
  policy = data.aws_iam_policy_document.thing_policy_doc.json
}

data "aws_iot_endpoint" "iot_endpoint" {
  endpoint_type = "iot:Data-ATS"
}

data "http" "root_ca" {
  url = "https://www.amazontrust.com/repository/AmazonRootCA1.pem"
}

resource "local_file" "root_ca" {
  filename = "${path.module}/../gateway/certs/root-CA.crt"
  content  = data.http.root_ca.response_body
}

resource "local_file" "sensors_cert_pem" {
  for_each = toset(local.sensors)
  filename = "../gateway/certs/sensors/${each.key}/certificate.pem.crt"
  content  = module.sensors[each.key].cert
}

resource "local_file" "sensors_key_pem" {
  for_each = toset(local.sensors)
  filename = "../gateway/certs/sensors/${each.key}/private.pem.key"
  content  = module.sensors[each.key].private_key
}

resource "local_file" "actuators_cert_pem" {
  for_each = toset(local.actuators)
  filename = "../gateway/certs/actuators/${each.key}/certificate.pem.crt"
  content  = module.actuators[each.key].cert
}

resource "local_file" "actuators_key_pem" {
  for_each = toset(local.actuators)
  filename = "../gateway/certs/actuators/${each.key}/private.pem.key"
  content  = module.actuators[each.key].private_key
}
