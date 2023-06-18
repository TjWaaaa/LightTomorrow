

resource "aws_iot_topic_rule" "rule" {
  name        = "lightLevelRule"
  description = "rule for forwarding lightlevels"
  enabled     = true
  sql         = "SELECT * FROM 'topic/sensors'"
  sql_version = "2016-03-23"

  iot_events {
    input_name = "test"
    # message_id = "${newuuid()}"
    role_arn   = aws_iam_role.role.arn

    # target_arn     = aws_sns_topic.mytopic.arn
  }

  error_action {
    iot_events {
      input_name = "test"
    #   message_id = "${newuuid()}"
      role_arn   = aws_iam_role.role.arn

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

resource "aws_iam_role" "role" {
  name               = "exampleRole"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}
