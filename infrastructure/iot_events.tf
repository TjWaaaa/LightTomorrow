

resource "aws_iot_topic_rule" "rule" {
  name        = "lightLevelRule"
  description = "rule for forwarding lightlevels"
  enabled     = true
  sql         = "SELECT * FROM 'topic/sensors'"
  sql_version = "2016-03-23"

  iot_events {
    input_name = "test"
    # message_id = "${newuuid()}"
    role_arn = aws_iam_role.role.arn

    # target_arn     = aws_sns_topic.mytopic.arn
  }

  error_action {
    republish {
      role_arn = aws_iam_role.role.arn
      topic    = "topic/error"
    }

  }
}

data "aws_iam_policy_document" "assume_role" {
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

resource "aws_iam_role" "role" {
  name               = "exampleRole"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

resource "aws_iam_role_policy_attachment" "my_policy_attachment" {
  role       = aws_iam_role.role.name
  policy_arn = aws_iam_policy.iot_events_policy.arn
}
