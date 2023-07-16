locals {
  sensors = [
    "proximity_workplace_1", "proximity_workplace_2", "light_outside"
  ]
  actuators = [
    "light_workplace_1", "light_workplace_2"
  ]
}

data "aws_iam_policy_document" "assume_role_policy_cloud_formation" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["iotevents.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_policy" "iot_events_cloud_formation_policy" {
  name = "iot_events_full_access_attachment"

  policy = jsonencode({
    Version = "2012-10-17"
    Principal : {
      "AWS" : "689988310164"
    }
    Statement = [
      {
        Action = [
          "iotevents:*",
          "iot:*"
        ]
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role" "iotevents_access" {
  name               = "iot_events_full_access"
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy_cloud_formation.json
}

resource "aws_iam_role_policy_attachment" "iot_events_full_access_attachment" {
  role       = aws_iam_role.iotevents_access.name
  policy_arn = aws_iam_policy.iot_events_cloud_formation_policy.arn
}

resource "null_resource" "previous" {}

resource "time_sleep" "wait_30_seconds" {
  depends_on = [null_resource.previous]

  create_duration = "30s"
}

resource "aws_cloudformation_stack" "detector-model-stack" {
  name              = "detector-model-stack"
  template_body     = templatefile("${path.module}/detectormodel/LightActuator.json", { role_arn = aws_iam_role.iotevents_access.arn })
  depends_on        = [time_sleep.wait_30_seconds]
  notification_arns = []
}

module "sensors" {
  for_each = toset(local.sensors)
  source   = "./modules/thing"
  name     = "sensor_${each.key}"
  policy   = aws_iot_policy.thing_policy
}

module "actuators" {
  for_each = toset(local.actuators)
  source   = "./modules/thing"
  name     = "actuator_${each.key}"
  policy   = aws_iot_policy.thing_policy
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
  filename = "../packages/root-CA.crt"
  content  = data.http.root_ca.response_body
}

resource "local_file" "sensors_cert_pem" {
  for_each = toset(local.sensors)
  filename = "../packages/${module.sensors[each.key].thing_name}/certificate.pem.crt"
  content  = module.sensors[each.key].cert
}

resource "local_file" "sensors_key_pem" {
  for_each = toset(local.sensors)
  filename = "../packages/${module.sensors[each.key].thing_name}/private.pem.key"
  content  = module.sensors[each.key].private_key
}

resource "local_file" "actuators_cert_pem" {
  for_each = toset(local.actuators)
  filename = "../packages/${module.actuators[each.key].thing_name}/certificate.pem.crt"
  content  = module.actuators[each.key].cert
}

resource "local_file" "actuators_key_pem" {
  for_each = toset(local.actuators)
  filename = "../packages/${module.actuators[each.key].thing_name}/private.pem.key"
  content  = module.actuators[each.key].private_key
}

resource "local_file" "actuators_env" {
  for_each = toset(local.actuators)
  filename = "../packages/${module.actuators[each.key].thing_name}/.env"
  content = templatefile("templates/.env.tftpl", {
    thing_name  = module.actuators[each.key].thing_name
    mqtt_host   = data.aws_iot_endpoint.iot_endpoint.endpoint_address
    mqtt_port   = 8883
    device_type = "LightActuator"
  })
}

resource "local_file" "sensors_env" {
  for_each = toset(local.sensors)
  filename = "../packages/${module.sensors[each.key].thing_name}/.env"
  content = templatefile("templates/.env.tftpl", {
    thing_name  = module.sensors[each.key].thing_name
    mqtt_host   = data.aws_iot_endpoint.iot_endpoint.endpoint_address
    mqtt_port   = 8883
    device_type = can(regex("light", each.key)) ? "LightSensor" : "ProximitySensor"
  })
}
