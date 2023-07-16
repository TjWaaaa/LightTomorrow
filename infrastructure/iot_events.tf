locals {
  light_rules = ["lightlevel_rule_01", "lightlevel_rule_02"]
}

module "light_rules" {
  for_each     = toset(local.light_rules)
  source       = "./modules/iotrule"
  iam_role     = aws_iam_role.events_role
  detector_key = each.key
  depends_on   = [aws_cloudformation_stack.detector-model-stack]
}

resource "aws_iot_topic_rule" "proximity_rule" {
  name        = "proximity_rule"
  description = "rule for forwarding proximity to detector model"
  enabled     = true
  sql         = "SELECT *, topic(3) as sensor_id, topic(4) as workplace FROM 'topic/sensor/+/#'"
  sql_version = "2016-03-23"
  depends_on  = [aws_cloudformation_stack.detector-model-stack]

  iot_events {
    input_name = "proximity_sensor"
    role_arn   = aws_iam_role.events_role.arn
  }

  error_action {
    republish {
      role_arn = aws_iam_role.events_role.arn
      topic    = "sensor/proximity/error"
    }
  }
}

data "aws_iam_policy_document" "assume_role_policy_document" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["iot.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_policy" "iot_events_policy" {
  name = "iot_events_policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "iotevents:BatchPutMessage",
        ]
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role" "events_role" {
  name               = "events_role"
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy_document.json
}

resource "aws_iam_role_policy_attachment" "my_policy_attachment" {
  role       = aws_iam_role.events_role.name
  policy_arn = aws_iam_policy.iot_events_policy.arn
}
