variable "name" {
  description = "The name of the AWS IoT Thing to be created. This name needs to be unique within your AWS account."
}

variable "policy" {
  description = "The IoT policy to be attached to the AWS IoT Thing. This defines the permissions for the IoT Thing within AWS IoT."
}

variable "thing_type" {
  description = "The IoT Thing type."
}
