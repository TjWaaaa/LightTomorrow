resource "aws_cloudformation_stack" "network" {
  name = "detector-model-stack"
  template_url = "detectorModel.json"
}
