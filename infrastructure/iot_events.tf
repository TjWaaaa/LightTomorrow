resource "aws_iot_topic_rule" "lighlevel_rule" {
  name        = "lightlevel_rule"
  description = "rule for forwarding lightlevels to detector model"
  enabled     = true
  sql         = "SELECT *, topic(2) as sensor_id , topic(3) as workplace FROM 'sensor/+/#'"
  sql_version = "2016-03-23"
  depends_on  = [aws_cloudformation_stack.detector-model-stack]

  iot_events {
    input_name = "light_sensor"
    role_arn   = aws_iam_role.eventsRole.arn
  }

  error_action {
    republish {
      role_arn = aws_iam_role.eventsRole.arn
      topic    = "sensor/lightlevel/error"
    }
  }
}

resource "aws_iot_topic_rule" "proximity_rule" {
  name        = "proximity_rule"
  description = "rule for forwarding proximity to detector model"
  enabled     = true
  sql         = "SELECT *, topic(2) as sensor_id, topic(3) as workplace FROM 'sensor/+/#'"
  sql_version = "2016-03-23"
  depends_on  = [aws_cloudformation_stack.detector-model-stack]

  iot_events {
    input_name = "proximity_sensor"
    role_arn   = aws_iam_role.eventsRole.arn
  }

  error_action {
    republish {
      role_arn = aws_iam_role.eventsRole.arn
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

resource "aws_iam_role" "eventsRole" {
  name               = "eventsRole"
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy_document.json
}

resource "aws_iam_role_policy_attachment" "my_policy_attachment" {
  role       = aws_iam_role.eventsRole.name
  policy_arn = aws_iam_policy.iot_events_policy.arn
}
