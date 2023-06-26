resource "aws_iot_topic_rule" "lighLevelRule01" {
  name        = "lightLevelRule01"
  description = "rule for forwarding lightlevels to thing_actuator_light_workplace_1"
  enabled     = true
  sql         = "SELECT *, 'thing_actuator_light_workplace_1' as detectorModelKey FROM 'topic/sensor/thing_sensor_light_outside'"
  sql_version = "2016-03-23"
  depends_on  = [aws_cloudformation_stack.detector-model-stack]

  iot_events {
    input_name = "lightSensor"
    role_arn   = aws_iam_role.eventsRole.arn
  }

  error_action {
    republish {
      role_arn = aws_iam_role.eventsRole.arn
      topic    = "topic/error"
    }
  }
}

resource "aws_iot_topic_rule" "lighLevelRule02" {
  name        = "lightLevelRule02"
  description = "rule for forwarding lightlevels to thing_actuator_light_workplace_2"
  enabled     = true
  sql         = "SELECT *, 'thing_actuator_light_workplace_2' as detectorModelKey FROM 'topic/sensor/thing_sensor_light_outside'"
  sql_version = "2016-03-23"
  depends_on  = [aws_cloudformation_stack.detector-model-stack]

  iot_events {
    input_name = "lightSensor"
    role_arn   = aws_iam_role.eventsRole.arn
  }

  error_action {
    republish {
      role_arn = aws_iam_role.eventsRole.arn
      topic    = "topic/error"
    }
  }
}

resource "aws_iot_topic_rule" "proximityRule01" {
  name        = "proximityRule01"
  description = "rule for forwarding proximity to thing_actuator_light_workplace_1"
  enabled     = true
  sql         = "SELECT *, 'thing_actuator_light_workplace_1' as detectorModelKey FROM 'topic/sensor/thing_sensor_proximity_workplace_1'"
  sql_version = "2016-03-23"
  depends_on  = [aws_cloudformation_stack.detector-model-stack]

  iot_events {
    input_name = "proximitySensor"
    role_arn   = aws_iam_role.eventsRole.arn
  }

  error_action {
    republish {
      role_arn = aws_iam_role.eventsRole.arn
      topic    = "topic/error"
    }
  }
}

resource "aws_iot_topic_rule" "proximityRule02" {
  name        = "proximityRule02"
  description = "rule for forwarding proximity to thing_actuator_light_workplace_2"
  enabled     = true
  sql         = "SELECT *, 'thing_actuator_light_workplace_2' as detectorModelKey FROM 'topic/sensor/thing_sensor_proximity_workplace_2'"
  sql_version = "2016-03-23"
  depends_on  = [aws_cloudformation_stack.detector-model-stack]

  iot_events {
    input_name = "proximitySensor"
    role_arn   = aws_iam_role.eventsRole.arn
  }

  error_action {
    republish {
      role_arn = aws_iam_role.eventsRole.arn
      topic    = "topic/error"
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
