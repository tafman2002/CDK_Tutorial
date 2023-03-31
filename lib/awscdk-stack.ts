import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import {IpAddresses} from "aws-cdk-lib/aws-ec2";
export class AwscdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    // Create a new VPC
    const vpc = new ec2.Vpc(this, 'Sample Vpc', {
      ipAddresses: IpAddresses.cidr('10.0.0.0/16'),
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    // Create a security group for the VPC
    const securityGroup = new ec2.SecurityGroup(this, 'MySecurityGroup', {
      vpc,
    });
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'allow SSH access from anywhere');

    // Create an Amazon Linux 2 AMI
    const amazonLinuxAmi = new ec2.AmazonLinuxImage({
      generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
    });

    // Create an EC2 instance within the public subnet
    const ec2Instance = new ec2.Instance(this, 'MyEC2Instance', {
      vpc,
      instanceType: new ec2.InstanceType('t2.micro'),
      machineImage: amazonLinuxAmi,
      securityGroup,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
    });

    // Output VPC ID
    new cdk.CfnOutput(this, 'VPC-ID', {
      value: vpc.vpcId,
      description: 'The VPC ID',
    });

    // Output Amazon Linux AMI ID
    new cdk.CfnOutput(this, 'AmazonLinuxAmiId', {
      value: amazonLinuxAmi.getImage(this).imageId,
      description: 'The Amazon Linux AMI ID used for the EC2 instance',
    });
  }
}
