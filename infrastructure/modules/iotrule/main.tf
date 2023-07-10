resource "aws_iot_topic_rule" "lightlevel_rule" {
  name        = "light_level_rule${var.detector_key}"
  description = "rule for forwarding lightlevels to ${var.detector_key}"
  enabled     = true
  sql         = "SELECT *, '${var.detector_key}' as workplace FROM 'topic/sensor/thing_sensor_light_outside'"
  sql_version = "2016-03-23"

  iot_events {
    input_name = "light_sensor"
    role_arn   = var.iam_role.arn
  }

  error_action {
    republish {
      role_arn = var.iam_role.arn
      topic    = "topic/error"
    }
  }
}
