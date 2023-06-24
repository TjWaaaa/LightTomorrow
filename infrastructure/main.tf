resource "aws_cloudformation_stack" "network" {
  name          = "detector-model-stack"
  template_body = file("LightActuator.json")
}
